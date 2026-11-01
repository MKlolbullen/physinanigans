/* Free 1D Gaussian packet; units hbar = 1. No external dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.Wavepacket=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function check(p){for(const k of ['x0','sigma0','k0','mass','time'])if(!Number.isFinite(p[k]))throw new RangeError('Invalid '+k);if(p.sigma0<=0||p.mass<=0||p.time<0)throw new RangeError('sigma0, mass must be positive; time nonnegative');}
  function moments(p){check(p);const u=p.time/(2*p.mass*p.sigma0*p.sigma0);return {center:p.x0+p.k0*p.time/p.mass,sigma:p.sigma0*Math.hypot(1,u),u,velocity:p.k0/p.mass,momentum:p.k0};}
  function evaluate(x,p){if(!Number.isFinite(x))throw new RangeError('Invalid x');const q=moments(p),d=x-q.center;const density=Math.exp(-d*d/(2*q.sigma*q.sigma))/(Math.sqrt(2*Math.PI)*q.sigma);const phase=p.k0*(x-p.x0)-p.k0*p.k0*p.time/(2*p.mass)+d*d*q.u/(4*p.sigma0*p.sigma0*(1+q.u*q.u))-Math.atan(q.u)/2;return {density,phase,real:Math.sqrt(density)*Math.cos(phase),imag:Math.sqrt(density)*Math.sin(phase)};}
  return {moments,evaluate};
});
