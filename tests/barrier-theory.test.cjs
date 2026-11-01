const {test}=require('node:test'),assert=require('node:assert/strict');
const {transmission:T,gaussianAveragedTransmission:G}=require('../barrier-theory.js');
function near(x,y,tol=1e-10){assert.ok(Math.abs(x-y)<tol,`${x} != ${y}`);}
test('no barrier means unit transmission',()=>{near(T(.5,0,3),1);near(T(.5,4,0),1);});
test('threshold E=V uses continuous limiting expression',()=>{const E=3,w=2,m=1;near(T(E,E,w,m),1/(1+m*E*w*w/2));near(T(E*(1-1e-7),E,w),T(E,E,w),2e-6);near(T(E*(1+1e-7),E,w),T(E,E,w),2e-6);});
test('sub-barrier transmission decreases with increasing width',()=>{assert.ok(T(1,3,3)<T(1,3,2));assert.ok(T(1,3,2)<T(1,3,1));});
test('high energy transmission tends toward unity',()=>{assert.ok(T(10000,3,2)>.999999);});
test('thick barriers remain finite and bounded',()=>{const x=T(.3,5,400);assert.ok(Number.isFinite(x)&&x>=0&&x<=1);});
test('finite wavepacket spectrum average is bounded',()=>{const x=G(2,3,3,2);assert.ok(x>=0&&x<=1);});
test('narrow energy spread approaches plane-wave limit',()=>{const k=2,E=k*k/2;near(G(k,30,3,1),T(E,3,1),.005);});
test('reject invalid inputs',()=>{assert.throws(()=>T(-1,3,2),RangeError);assert.throws(()=>T(1,3,-1),RangeError);assert.throws(()=>G(0,1,3,2),RangeError);});
