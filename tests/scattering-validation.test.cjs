const {test}=require('node:test');
const assert=require('node:assert/strict');
const S=require('../schrodinger.js');
function config(n,dt,extra={}){return {n,xmin:-30,xmax:30,mass:1,dt,x0:-10,sigma0:1.5,k0:1.5,potentialType:'free',...extra};}
function analyticDensity(x,t,p){const center=p.x0+p.k0*t/p.mass,u=t/(2*p.mass*p.sigma0*p.sigma0),sigma=p.sigma0*Math.hypot(1,u);return Math.exp(-((x-center)/sigma)**2/2)/(Math.sqrt(2*Math.PI)*sigma);}
function l1Error(q,p){let sum=0;for(let i=0;i<q.x.length;i++)sum+=Math.abs(q.density[i]-analyticDensity(q.x[i],q.t,p))*q.dx;return sum;}
test('free evolution converges toward continuum Gaussian density under spatial/time refinement',()=>{
  const coarse=config(301,.02),fine=config(601,.005);
  const a=S.create(coarse),b=S.create(fine);a.step(150);b.step(600);
  const ec=l1Error(a.snapshot(),coarse),ef=l1Error(b.snapshot(),fine);
  assert.ok(ef<ec,`fine L1 ${ef} should be below coarse ${ec}`);
  assert.ok(ef<.03,`fine L1 ${ef}`);
});
test('complex absorber reduces live probability but conserves norm plus accounted sink',()=>{
  const p=S.create(config(301,.03,{x0:18,k0:2,absorber:true,absorbFraction:.2,absorbStrength:1.2}));
  p.step(300);const q=p.snapshot();
  assert.ok(q.norm<.995,`norm should decrease, got ${q.norm}`);
  assert.ok(q.absorbedRight>0,'right sink should account for loss');
  assert.ok(Math.abs(q.budget-1)<5e-7,`probability budget ${q.budget}`);
});
test('without absorber Crank–Nicolson remains norm preserving',()=>{
 const p=S.create(config(301,.02,{absorber:false}));p.step(250);
 assert.ok(Math.abs(p.snapshot().norm-1)<1e-8);
 assert.equal(p.snapshot().absorbed,0);
});
test('invalid absorber configuration is rejected',()=>{
 assert.throws(()=>S.create(config(101,.02,{absorbFraction:.5,absorber:true})),RangeError);
 assert.throws(()=>S.create(config(101,.02,{absorbStrength:-1,absorber:true})),RangeError);
});
