/* Rectangular potential barrier stationary transmission, hbar=1. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.BarrierTheory=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function transmission(E,V,a,m=1){
 if(![E,V,a,m].every(Number.isFinite)||E<=0||V<0||a<0||m<=0)throw RangeError('Require E,m>0 and V,a>=0');
 if(V===0||a===0)return 1;
 if(Math.abs(E-V)<=1e-12*Math.max(1,E,V))return 1/(1+m*V*a*a/2);
 const q=Math.sqrt(2*m*Math.abs(E-V))*a;
 if(E>V){const f=V*V/(4*E*(E-V));return 1/(1+f*Math.sin(q)**2);}
 const f=V*V/(4*E*(V-E));
 // overflow-safe formula for thick barriers
 if(q>350)return 0;
 return 1/(1+f*Math.sinh(q)**2);
}
function gaussianAveragedTransmission(k0,sigma0,V,a,m=1){
 if(![k0,sigma0].every(Number.isFinite)||sigma0<=0||k0<=0)throw RangeError('Positive central wave number and width required');
 // Initial Gaussian wavefunction psi~exp(-x²/(4sigma²)+ik0*x),
 // so probability distribution in k is exp(-2sigma²(k-k0)²).
 // Incident right-moving component only, renormalized over k>0.
 const sk=1/(2*sigma0),lo=Math.max(0,k0-8*sk),hi=k0+8*sk,N=1600,dk=(hi-lo)/N;
 let numerator=0,denominator=0;
 for(let j=0;j<=N;j++){const k=lo+j*dk,w=Math.exp(-.5*((k-k0)/sk)**2)*(j===0||j===N?1:j%2?4:2);denominator+=w;numerator+=w*(k===0?0:transmission(k*k/(2*m),V,a,m));}
 return numerator/denominator;
}
return {transmission,gaussianAveragedTransmission};
});
