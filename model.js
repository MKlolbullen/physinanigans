/* Tunnel model v0.1. Exact two-qubit effective dynamics in local proper time. */
const TunnelPhysics = (() => {
  function clockRate(mode = 'local', amount = 0) {
    if (!Number.isFinite(amount) || amount < 0 || amount >= 1) throw new RangeError('Clock parameter must be in [0,1).');
    if (mode === 'local') return 1;
    if (mode === 'sr') return Math.sqrt(1 - amount * amount);
    if (mode === 'gr') return Math.sqrt(1 - amount);
    throw new RangeError('Unknown clock mode.');
  }
  function state(t, J = 1, gamma = 0, initial = 'excited', rate = 1) {
    if (![t,J,gamma,rate].every(Number.isFinite) || t<0 || J<0 || gamma<0 || rate<=0 || rate>1) throw new RangeError('Invalid dynamics parameter.');
    if (!['excited','bell','mixture'].includes(initial)) throw new RangeError('Unknown initial state.');
    const tau=t*rate, a=gamma/2, z0=initial==='excited'?1:0, x0=initial==='bell'?1:0;
    let z=z0, y=0;
    if (J>0) {
      const d=4*J*J-a*a;
      let ec, es;
      if (Math.abs(d)*tau*tau < 1e-10) {
        // Series at the critically damped point. Stable also for tau=0.
        const e=Math.exp(-a*tau), q=d*tau*tau;
        ec=e*(1-q/2+q*q/24);
        es=e*tau*(1-q/6+q*q/120);
      } else if (d>0) {
        const w=Math.sqrt(d), e=Math.exp(-a*tau);
        ec=e*Math.cos(w*tau); es=e*Math.sin(w*tau)/w;
      } else {
        const k=Math.sqrt(-d);
        // Avoid cosh overflow and cancellation in -a+k.
        const slow=Math.exp((-4*J*J/(a+k))*tau), fast=Math.exp((-a-k)*tau);
        ec=(slow+fast)/2; es=(slow-fast)/(2*k);
      }
      z=(ec+a*es)*z0; y=-2*J*es*z0;
    }
    const x=x0*Math.exp(-gamma*tau), pA=(1+z)/2, pB=(1-z)/2;
    return {t,tau,J,gamma,initial,rate,x,y,z,pA,pB,concurrence:Math.hypot(x,y),purity:(1+x*x+y*y+z*z)/2,
      // Complex entries as [real, imaginary], basis |10>, |01>.
      rho:[[[pA,0],[x/2,-y/2]],[[x/2,y/2],[pB,0]]],
      sites:{A:[-0.5,0,0],B:[0.5,0,0]},spatial_units:'site separation d',zzCorrelation:-1};
  }
  return {state,clockRate};
})();
if (typeof module !== 'undefined' && module.exports) module.exports=TunnelPhysics;
