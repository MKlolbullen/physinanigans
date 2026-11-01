const {test}=require('node:test'),assert=require('node:assert/strict');const W=require('../wavepacket.js');
test('normalized center and initial spread',()=>{const m=W.moments({x0:-3,sigma0:1,k0:1.2,mass:1.5,time:0});assert.equal(m.center,-3);assert.equal(m.sigma,1);});
test('group velocity and spreading',()=>{const m=W.moments({x0:-3,sigma0:1,k0:1.2,mass:1.5,time:10});assert.ok(Math.abs(m.center-5)<1e-12);assert.ok(m.sigma>1);});
test('real and imaginary amplitude reconstruct density',()=>{const p={x0:0,sigma0:1.3,k0:2,mass:2,time:3};const z=W.evaluate(.5,p);assert.ok(Math.abs(z.real*z.real+z.imag*z.imag-z.density)<1e-12);});
test('bad parameters are rejected',()=>assert.throws(()=>W.evaluate(0,{x0:0,sigma0:0,k0:0,mass:1,time:0}),RangeError));
