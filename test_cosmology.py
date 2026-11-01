"""Physical and numerical checks for the expanding-universe module."""
import json
import math
from pathlib import Path
import shutil
import subprocess
import unittest
import numpy as np
from scipy.integrate import solve_ivp
from cosmology import PRESETS,parameters,simulate,sample


class CosmologyTests(unittest.TestCase):
    def test_exact_single_component_solutions_and_light_paths(self):
        a0=.2
        for name in ['matter','radiation','vacuum','empty']:
            run=simulate(**PRESETS[name])
            for t in np.linspace(0,run['end'],23):
                s=sample(run,float(t))
                if name=='matter':
                    a=(a0**1.5+1.5*t)**(2/3);chi=2*(math.sqrt(a)-math.sqrt(a0))
                elif name=='radiation': a=math.sqrt(a0*a0+2*t);chi=a-a0
                elif name=='vacuum': a=a0*math.exp(t);chi=(1-math.exp(-t))/a0
                else: a=a0+t;chi=math.log(a/a0)
                np.testing.assert_allclose([s['a'],s['chi']],[a,chi],rtol=2e-8,atol=2e-9)

    def test_linear_growth_closed_forms(self):
        # Growing mode delta=1, delta'=H at the start; closed forms follow from delta''+2H delta'=(3/2)(m/a^3)delta.
        a0=.2
        for name in ['matter','radiation','vacuum','empty']:
            run=simulate(**PRESETS[name])
            for t in np.linspace(0,run['end'],23):
                s=sample(run,float(t));a=s['a']
                if name=='matter': delta=a/a0;rate=1
                elif name=='radiation': delta=1+math.log(a/a0);rate=1/delta
                elif name=='vacuum': delta=1+(1-math.exp(-2*t))/2;rate=math.exp(-2*t)/delta
                else: delta=2-a0/a;rate=a0/(a*delta)
                np.testing.assert_allclose([s['growth'],s['growthRate']],[delta,rate],rtol=2e-8,atol=2e-9)

    def test_growth_rate_against_linder_fit(self):
        # f = dln(delta)/dln(a) tracks Omega_m(a)^0.55 to about a percent in flat matter+Lambda (Linder 2005).
        run=simulate(m=.3,r=0,l=.7)
        checked=0
        for t in np.linspace(0,run['end'],60):
            s=sample(run,float(t))
            if .4<s['a']<1.1:
                self.assertAlmostEqual(s['growthRate'],s['fractions'][0]**.55,delta=.012);checked+=1
        self.assertGreater(checked,5)
        late=sample(run,run['end']);self.assertLess(late['growthRate'],.15,'Lambda should suppress growth')
        turn=simulate(**PRESETS['closed'])['turns'][0]
        self.assertIsNone(sample(simulate(**PRESETS['closed']),turn['t'])['growthRate'])

    def test_closed_solution_through_turnaround(self):
        run=simulate(**PRESETS['closed'])
        eta0=math.acos(1-run['p']['aStart']); offset=eta0-math.sin(eta0)
        for eta in np.linspace(eta0,5.9,41):
            s=sample(run,float(eta-math.sin(eta)-offset))
            a=1-math.cos(eta)
            np.testing.assert_allclose([s['a'],s['v'],s['chi']],[a,math.sin(eta)/a,eta-eta0],rtol=5e-8,atol=2e-8)
        self.assertEqual(len(run['turns']),1)
        self.assertAlmostEqual(run['turns'][0]['a'],2,places=7)
        self.assertAlmostEqual(run['turns'][0]['t'],math.pi-offset,places=7)
        self.assertLess(sample(run,run['end'])['v'],0)

    def test_mixed_solution_against_independent_integrator(self):
        for values in [dict(m=.3,r=.0001,l=.6999),dict(m=1.2,r=.4,l=.05),dict(m=.2,r=.5,l=.7)]:
            run=simulate(**values);m,r,l=values.values();k=1-m-r-l
            def rhs(t,y):
                a,v,chi,d,dd=y
                return [v,-r/a**3-m/(2*a**2)+l*a,1/a,dd,-2*v/a*dd+1.5*m/a**3*d]
            v0=math.sqrt(r/.2**2+m/.2+k+l*.2**2)
            ref=solve_ivp(rhs,[0,run['end']],[.2,v0,0,1,v0/.2],method='DOP853',rtol=2e-12,atol=2e-13,dense_output=True)
            self.assertTrue(ref.success)
            for t in np.linspace(0,run['end'],25):
                s=sample(run,float(t))
                np.testing.assert_allclose([s['a'],s['v'],s['chi'],s['growth']],ref.sol(t)[:4],rtol=1e-7,atol=2e-8)

    def test_friedmann_constraint_across_parameter_corners(self):
        for m in [0,.3,2]:
            for r in [0,.0001,1]:
                for l in [0,.6999,1]:
                    run=simulate(m=m,r=r,l=l)
                    self.assertLess(run['maxResidual'],1e-7,(m,r,l,run['maxResidual']))

    def test_density_scaling_photon_energy_and_temperature(self):
        run=simulate(m=.6,r=.2,l=.2)
        for t in np.linspace(0,run['end'],25):
            s=sample(run,float(t));a=s['a'];rho=s['density']
            self.assertAlmostEqual(rho['matter']*a**3,.6)
            self.assertAlmostEqual(rho['radiation']*a**4,.2)
            self.assertEqual(rho['vacuum'],.2)
            self.assertAlmostEqual(sum(s['fractions']),1)
            self.assertAlmostEqual(s['photonEnergy']*s['wavelength'],1)
            self.assertAlmostEqual(s['temperature']*a,.2)
        empty=sample(simulate(**PRESETS['empty']),1)
        self.assertEqual(empty['fractions'],[0,0,0]);self.assertIsNone(empty['temperature'])

    def test_end_conditions_and_monotonic_light_path(self):
        for name,values in PRESETS.items():
            run=simulate(**values)
            self.assertTrue(all(a['t']<b['t'] and a['y'][2]<b['y'][2] for a,b in zip(run['rows'],run['rows'][1:])))
            target=.05 if name=='closed' else 3
            self.assertAlmostEqual(sample(run,run['end'])['a'],target,places=10)
        short=simulate(tMax=.01);self.assertAlmostEqual(short['end'],.01)

    def test_invalid_parameters(self):
        for args in [dict(m=-1),dict(r=float('nan')),dict(aStart=0),dict(tMax=0),dict(aMax=.1),dict(m=2,r=0,l=0,aStart=2.1)]:
            with self.assertRaises(ValueError): parameters(**args)
        run=simulate()
        with self.assertRaises(ValueError): sample(run,run['end']+1)

    @unittest.skipUnless(shutil.which('node'),'Node.js optional for cross-language check')
    def test_javascript_python_parity(self):
        script="const m=require('./cosmology.js');console.log(JSON.stringify(Object.entries(m.presets).map(([name,p])=>{const r=m.simulate(p);return {name,end:r.end,states:[0,.25,.5,.75,1].map(f=>m.sample(r,r.end*f))}})));"
        results=json.loads(subprocess.check_output(['node','-e',script],cwd=Path(__file__).parent))
        for case in results:
            run=simulate(**PRESETS[case['name']]);self.assertAlmostEqual(run['end'],case['end'],places=8)
            for f,actual in zip([0,.25,.5,.75,1],case['states']):
                expected=sample(run,run['end']*f)
                for key in ['a','v','chi','H','photonEnergy','wavelength','growth']:
                    self.assertAlmostEqual(expected[key],actual[key],places=8)


if __name__=='__main__':unittest.main(verbosity=2)
