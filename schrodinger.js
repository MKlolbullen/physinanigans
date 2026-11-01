/* 1D time-dependent Schrödinger equation, hbar=1. Dirichlet boundaries; optional complex absorbing potential.
   Crank-Nicolson + complex Thomas tridiagonal solve, time-independent real V(x). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.Schrodinger1D=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const C=(r=0,i=0)=>[r,i],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
function div(a,b){const d=b[0]*b[0]+b[1]*b[1];if(d<1e-28)throw Error('Singular tridiagonal system');return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];}
function potential(x,type,height=2,width=2){if(!['free','barrier','well','double-barrier'].includes(type)||!Number.isFinite(height)||height<0||!Number.isFinite(width)||width<=0)throw RangeError('Invalid potential');
if(type==='free')return 0;if(type==='barrier')return Math.abs(x)<width/2?height:0;if(type==='well')return Math.abs(x)<width/2?-height:0;
return Math.abs(Math.abs(x)-width)<0.5?height:0;}
function create(opts={}){
 const {n=401,xmin=-30,xmax=30,mass=1,dt=.02,x0=-12,sigma0=1.5,k0=2,potentialType='free',height=3,width=2,absorber=false,absorbFraction=0.18,absorbStrength=1.2}=opts;
 if(!Number.isInteger(n)||n<5||n>2001||![xmin,xmax,mass,dt,x0,sigma0,k0,height,width].every(Number.isFinite)||xmax<=xmin||mass<=0||dt<=0||dt>.25||sigma0<=0||typeof absorber!=='boolean'||!Number.isFinite(absorbFraction)||absorbFraction<=0||absorbFraction>=.4||!Number.isFinite(absorbStrength)||absorbStrength<0)throw RangeError('Invalid grid/packet parameters');
 const dx=(xmax-xmin)/(n-1),x=Array.from({length:n},(_,i)=>xmin+i*dx),V=x.map(z=>potential(z,potentialType,height,width));
 let re=x.map(z=>Math.exp(-(z-x0)**2/(4*sigma0*sigma0))*Math.cos(k0*(z-x0)));
 let im=x.map(z=>Math.exp(-(z-x0)**2/(4*sigma0*sigma0))*Math.sin(k0*(z-x0)));re[0]=re[n-1]=im[0]=im[n-1]=0;
 let norm=Math.sqrt(dx*re.reduce((s,z,i)=>s+z*z+im[i]*im[i],0));if(norm<1e-20)throw RangeError('Initial packet is outside computational domain');re=re.map(v=>v/norm);im=im.map(v=>v/norm);
 const depth=(xmax-xmin)*absorbFraction;
 const W=x.map(z=>{if(!absorber)return 0;const d=Math.min(z-xmin,xmax-z);const q=Math.max(0,(depth-d)/depth);return absorbStrength*q*q*q*q;});
 let absorbedLeft=0,absorbedRight=0;
 let t=0;const off=-1/(2*mass*dx*dx),kin=1/(mass*dx*dx),m=n-2;
 function step(count=1){if(!Number.isInteger(count)||count<0||count>10000)throw RangeError('Invalid steps');
 for(let s=0;s<count;s++){
  const oldNorm=absorber?dx*re.reduce((sum,v,i)=>sum+v*v+im[i]*im[i],0):0;
  const oldWeightLeft=absorber?re.reduce((sum,v,i)=>sum+(x[i]<0?W[i]*(v*v+im[i]*im[i]):0),0):0;
  const oldWeightRight=absorber?re.reduce((sum,v,i)=>sum+(x[i]>=0?W[i]*(v*v+im[i]*im[i]):0),0):0;
  const upper=C(0,dt*off/2),lower=upper,diag=Array.from({length:m},(_,j)=>C(1+dt*W[j+1]/2,dt*(kin+V[j+1])/2));
  const rhs=new Array(m);
  for(let j=0;j<m;j++){const i=j+1,h=kin+V[i];let z=C((1-dt*W[i]/2)*re[i]+dt*h*im[i]/2,(1-dt*W[i]/2)*im[i]-dt*h*re[i]/2);
    if(i>1){z=add(z,C(dt*off*im[i-1]/2,-dt*off*re[i-1]/2));}
    if(i<n-2){z=add(z,C(dt*off*im[i+1]/2,-dt*off*re[i+1]/2));}rhs[j]=z;
  }
  const cp=new Array(m),dp=new Array(m);cp[0]=div(upper,diag[0]);dp[0]=div(rhs[0],diag[0]);
  for(let j=1;j<m;j++){const denominator=sub(diag[j],mul(lower,cp[j-1]));cp[j]=j<m-1?div(upper,denominator):C();dp[j]=div(sub(rhs[j],mul(lower,dp[j-1])),denominator);}
  const next=new Array(m);next[m-1]=dp[m-1];for(let j=m-2;j>=0;j--)next[j]=sub(dp[j],mul(cp[j],next[j+1]));
  for(let j=0;j<m;j++){re[j+1]=next[j][0];im[j+1]=next[j][1];}
  if(absorber){
    const newNorm=dx*re.reduce((sum,v,i)=>sum+v*v+im[i]*im[i],0);
    const weightLeft=oldWeightLeft+re.reduce((sum,v,i)=>sum+(x[i]<0?W[i]*(v*v+im[i]*im[i]):0),0);
    const weightRight=oldWeightRight+re.reduce((sum,v,i)=>sum+(x[i]>=0?W[i]*(v*v+im[i]*im[i]):0),0);
    const loss=Math.max(0,oldNorm-newNorm),weights=weightLeft+weightRight;
    if(weights>0){absorbedLeft+=loss*weightLeft/weights;absorbedRight+=loss*weightRight/weights;}
  }
  t+=dt;
 }return snapshot();}
 function snapshot(){let total=0,mean=0,left=0,right=0,interaction=0;const density=re.map((a,i)=>a*a+im[i]*im[i]);for(let i=0;i<n;i++){const w=density[i]*dx;total+=w;mean+=x[i]*w;if(x[i]<-width/2)left+=w;if(x[i]>width/2)right+=w;if(Math.abs(x[i])<=width/2+2*sigma0)interaction+=w;}return {x:[...x],re:[...re],im:[...im],density,t,norm:total,mean:mean/total,left,right,interaction,absorbedLeft,absorbedRight,absorbed:absorbedLeft+absorbedRight,budget:total+absorbedLeft+absorbedRight,reflectanceEstimate:left+absorbedLeft,transmittanceEstimate:right+absorbedRight,absorber,W:[...W],V:[...V],dx};}
 return {step,snapshot,settings:{n,xmin,xmax,mass,dt,x0,sigma0,k0,potentialType,height,width,absorber,absorbFraction,absorbStrength}};
}
return {create,potential};
});
