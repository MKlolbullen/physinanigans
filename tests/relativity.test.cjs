const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../relativity.js');
const near=(a,b,tol=1e-12)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('Lorentz boosts preserve intervals and invert, including lightlike events',()=>{
  for(const b of [-.9,-.6,0,.6,.9])for(const [T,X] of [[1,1],[1,-1],[2,.4],[.4,2],[-.3,.8]]) {
    const q=R.transform(T,X,b),p=R.transform(q.T,q.X,-b);
    near(R.interval(q.T,q.X),R.interval(T,X));near(p.T,T);near(p.X,X);
  }
});
test('every point of a moving-frame time slice has the same transformed time',()=>{
  for(const b of [-.8,0,.6])for(const t of [-1,0,1])for(const x of [-2,0,2])near(R.transform(R.sliceT(x,t,b),x,b).T,t);
});
test('moving clock, simultaneous events and known boost example',()=>{
  near(R.gamma(.6),1.25);
  near(R.transform(1,.6,.6).T,.8);
  near(R.transform(0,-1,.6).T,.75);near(R.transform(0,1,.6).T,-.75);
});
test('invalid boosts are rejected',()=>{for(const b of [-1,1,2,NaN,Infinity])assert.throws(()=>R.gamma(b),RangeError);});
