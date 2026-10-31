"""Independent full-density-matrix checks. Requires numpy and scipy."""
import json
import math
from pathlib import Path
import shutil
import subprocess
import unittest
import numpy as np
from scipy.linalg import expm
from model import state, clock_rate


I = np.eye(2, dtype=complex)
X = np.array([[0,1],[1,0]], dtype=complex)
Y = np.array([[0,-1j],[1j,0]], dtype=complex)
Z = np.diag([1,-1]).astype(complex)
ZA, ZB = np.kron(Z,I), np.kron(I,Z)
SUBSPACE = [2,1]  # In conventional |00>, |01>, |10>, |11> ordering.


def density(s):
    rho=np.zeros((4,4),dtype=complex)
    rho[np.ix_(SUBSPACE,SUBSPACE)]=s['rho']
    return rho


def reference(t,J,gamma,initial,rate=1):
    """Exponentiate the full 16x16 GKSL generator, independent of analytic formula."""
    H=J/2*(np.kron(X,X)+np.kron(Y,Y))
    def derivative(rho):
        return -1j*(H@rho-rho@H)+gamma/4*(ZA@rho@ZA+ZB@rho@ZB-2*rho)
    columns=[]
    for i in range(16):
        unit=np.zeros(16,dtype=complex); unit[i]=1
        columns.append(derivative(unit.reshape(4,4)).reshape(16))
    generator=np.column_stack(columns)
    start=density(state(0,J,gamma,initial))
    return (expm(t*rate*generator)@start.reshape(16)).reshape(4,4)


class PhysicsTests(unittest.TestCase):
    def test_against_full_master_equation(self):
        # Undamped, underdamped, critical, overdamped, uncoupled, near-critical.
        for J,gamma in [(1,0),(1,.4),(.5,2),(.1,4),(0,1),(.5,2+1e-10)]:
            for initial in ['excited','bell','mixture']:
                for t in [0,.3,2,8]:
                    with self.subTest(J=J,gamma=gamma,initial=initial,t=t):
                        np.testing.assert_allclose(density(state(t,J,gamma,initial)),reference(t,J,gamma,initial),atol=2e-12)

    def test_probability_positivity_and_excitation_conservation(self):
        for J in [0,1e-8,.15,1,2]:
            for gamma in [0,.2,2,4]:
                for initial in ['excited','bell','mixture']:
                    for t in np.linspace(0,8,41):
                        s=state(float(t),J,gamma,initial); rho=density(s)
                        self.assertAlmostEqual(float(np.trace(rho).real),1)
                        np.testing.assert_allclose(rho,rho.conj().T,atol=1e-14)
                        self.assertGreaterEqual(float(np.linalg.eigvalsh(rho).min()),-2e-13)
                        self.assertAlmostEqual(float(np.trace(rho@(np.eye(4)-(ZA+ZB)/2)).real),1)
                        self.assertTrue(-1e-13 <= s['concurrence'] <= 1+1e-13)

    def test_known_coherent_evolution(self):
        for t in [0,.1,math.pi/4,math.pi/2,8]:
            s=state(t)
            self.assertAlmostEqual(s['pA'],math.cos(t)**2)
            self.assertAlmostEqual(s['concurrence'],abs(math.sin(2*t)))
            self.assertAlmostEqual(s['purity'],1)
        self.assertAlmostEqual(state(math.pi/4)['concurrence'],1)

    def test_same_probabilities_different_entanglement(self):
        entangled,mixed=state(0,initial='bell'),state(0,initial='mixture')
        self.assertEqual(entangled['pA'],mixed['pA'])
        self.assertEqual(entangled['pB'],mixed['pB'])
        self.assertEqual(entangled['concurrence'],1)
        self.assertEqual(mixed['concurrence'],0)
        self.assertAlmostEqual(state(3,gamma=.5,initial='bell')['concurrence'],math.exp(-1.5))

    def test_concurrence_against_partial_transpose(self):
        # In this single-excitation family, concurrence = twice negativity.
        for initial in ['excited','bell','mixture']:
            for t in [0,.5,1.2,3]:
                s=state(t,.8,.3,initial)
                partial=density(s).reshape(2,2,2,2).transpose(0,3,2,1).reshape(4,4)
                negativity=-np.linalg.eigvalsh(partial).clip(max=0).sum()
                self.assertAlmostEqual(s['concurrence'],2*float(negativity))

    def test_local_operation_cannot_change_remote_marginal(self):
        rho=density(state(.7))
        unitary=np.kron(expm(-.37j*X),I)
        transformed=unitary@rho@unitary.conj().T
        def marginal_b(r): return np.trace(r.reshape(2,2,2,2),axis1=0,axis2=2)
        np.testing.assert_allclose(marginal_b(rho),marginal_b(transformed),atol=1e-14)

    def test_clocks(self):
        self.assertAlmostEqual(clock_rate('sr',.6),.8)
        self.assertAlmostEqual(clock_rate('gr',.36),.8)
        for mode,amount in [('local',0),('sr',.8),('gr',.8)]:
            rate=clock_rate(mode,amount)
            np.testing.assert_allclose(state(2,rate=rate)['rho'],state(2*rate)['rho'])

    def test_late_overdamped_solution_stays_finite(self):
        s=state(10000,J=.01,gamma=4)
        self.assertTrue(all(math.isfinite(s[k]) for k in ['pA','pB','concurrence','purity']))

    def test_invalid_inputs(self):
        for kwargs in [dict(t=-1),dict(t=1,gamma=-1),dict(t=1,rate=0),dict(t=1,J=float('nan')),dict(t=1,initial='no')]:
            with self.assertRaises(ValueError): state(**kwargs)
        with self.assertRaises(ValueError): clock_rate('sr',1)

    @unittest.skipUnless(shutil.which('node'), 'Node.js optional for browser-engine parity')
    def test_javascript_python_parity(self):
        cases=[[t,J,g,init,clock_rate(mode,a)] for t in [0,.4,8] for J,g in [(0,0),(.5,2),(.1,4),(1,0)] for init in ['excited','bell','mixture'] for mode,a in [('local',0),('sr',.6),('gr',.8)]]
        script="const m=require('./model.js');let x='';process.stdin.on('data',d=>x+=d);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(x).map(c=>m.state(...c)))));"
        raw=subprocess.check_output(['node','-e',script],input=json.dumps(cases).encode(),cwd=Path(__file__).parent)
        for case,result in zip(cases,json.loads(raw)):
            expected=state(*case)
            for key in ['tau','pA','pB','x','y','z','concurrence','purity']:
                self.assertAlmostEqual(result[key],expected[key],places=12)


if __name__ == '__main__': unittest.main(verbosity=2)
