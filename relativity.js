/* 1+1 Minkowski coordinates: T=ct/L, X=x/L. The other two spatial axes are suppressed. */
const TunnelRelativity = (() => {
  function gamma(beta) {
    if (!Number.isFinite(beta) || Math.abs(beta)>=1) throw new RangeError('|v/c| must be below one.');
    return 1/Math.sqrt(1-beta*beta);
  }
  function transform(T,X,beta) {
    if (![T,X].every(Number.isFinite)) throw new RangeError('Coordinates must be finite.');
    const g=gamma(beta);
    return {T:g*(T-beta*X),X:g*(X-beta*T)};
  }
  function sliceT(X,Tprime,beta) { return beta*X+Tprime/gamma(beta); }
  function interval(T,X) {return -T*T+X*X;}
  return {gamma,transform,sliceT,interval};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TunnelRelativity;
