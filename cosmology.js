/* FLRW cosmology in dimensionless cosmic time u=H_ref(t-t_start). */
const TunnelCosmology = (() => {
  const presets={
    mixed:{m:.3,r:.0001,l:.6999},matter:{m:1,r:0,l:0},radiation:{m:0,r:1,l:0},
    closed:{m:2,r:0,l:0},vacuum:{m:0,r:0,l:1},empty:{m:0,r:0,l:0}
  };
  function parameters(input={}) {
    const p={m:.3,r:.0001,l:.6999,aStart:.2,aMin:.05,aMax:3,tMax:8,tolerance:1e-11,maxStep:.025,...input};
    if(!['m','r','l','aStart','aMin','aMax','tMax','tolerance','maxStep'].every(k=>Number.isFinite(p[k])))throw new RangeError('Parameters must be finite.');
    if(Math.min(p.m,p.r,p.l)<0||p.aMin<=0||p.aStart<=p.aMin||p.aMax<=p.aStart||p.tMax<=0||p.tolerance<=0||p.maxStep<=0)throw new RangeError('Invalid cosmology parameters.');
    p.k=1-p.m-p.r-p.l;
    if(friedmann(p.aStart,p)<=0)throw new RangeError('No initially expanding solution at this starting scale.');
    return p;
  }
  function friedmann(a,p){return p.r/(a*a)+p.m/a+p.k+p.l*a*a;}
  function derivative(y,p){const [a,v]=y;return [v,-p.r/(a*a*a)-p.m/(2*a*a)+p.l*a,1/a];}
  function rk4(y,h,p){
    const k1=derivative(y,p),k2=derivative(y.map((v,i)=>v+h*k1[i]/2),p);
    const k3=derivative(y.map((v,i)=>v+h*k2[i]/2),p),k4=derivative(y.map((v,i)=>v+h*k3[i]),p);
    return y.map((v,i)=>v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
  }
  function advance(y,h,p){
    const full=rk4(y,h,p),half=rk4(rk4(y,h/2,p),h/2,p);
    return half.map((v,i)=>v+(v-full[i])/15);
  }
  function boundary(y,h,p,index,target){
    let lo=0,hi=h;const start=y[index]-target;
    for(let i=0;i<45;i++){const mid=(lo+hi)/2;if((advance(y,mid,p)[index]-target)*start>0)lo=mid;else hi=mid;}
    const dt=(lo+hi)/2;return {dt,y:advance(y,dt,p)};
  }
  function simulate(input={}){
    const p=parameters(input);let t=0,y=[p.aStart,Math.sqrt(friedmann(p.aStart,p)),0],h=.001;
    const rows=[{t,y:y.slice()}],turns=[];let reason='time limit',maxResidual=0;
    for(let n=0;n<200000&&t<p.tMax;n++){
      h=Math.min(h,p.maxStep,p.tMax-t,.08*y[0]/Math.max(Math.abs(y[1]),.1));
      if(h<1e-12)throw Error('Step became too small.');
      const full=rk4(y,h,p),half=rk4(rk4(y,h/2,p),h/2,p);
      const err=Math.max(...half.map((v,i)=>Math.abs(v-full[i])/(15*p.tolerance*(1+Math.max(Math.abs(v),Math.abs(y[i]))))));
      if(!half.every(Number.isFinite)||half[0]<=0)throw Error('Integrator left the valid scale range.');
      if(err>1){h*=Math.max(.15,.85*Math.pow(err,-.2));continue;}
      if(y[1]>0&&half[1]<0){const turn=boundary(y,h,p,1,0);turns.push({t:t+turn.dt,a:turn.y[0]});}
      let next=half.map((v,i)=>v+(v-full[i])/15),dt=h,stop=false;
      if(half[0]>=p.aMax||half[0]<=p.aMin){
        const target=half[0]>=p.aMax?p.aMax:p.aMin,hit=boundary(y,h,p,0,target);
        next=hit.y;dt=hit.dt;stop=true;reason=target===p.aMax?'upper scale limit':'lower scale limit';
      }
      t+=dt;y=next;rows.push({t,y:y.slice()});
      const norm=p.r/(y[0]*y[0])+p.m/y[0]+Math.abs(p.k)+p.l*y[0]*y[0];
      maxResidual=Math.max(maxResidual,Math.abs(y[1]*y[1]-friedmann(y[0],p))/Math.max(norm,1e-30));
      if(stop||p.tMax-t<1e-12)break;
      h*=err===0?2:Math.min(2,Math.max(.5,.9*Math.pow(err,-.2)));
      if(n===199999)throw Error('Integration budget exceeded.');
    }
    return {p,rows,turns,reason,maxResidual,end:t};
  }
  function sample(run,t){
    if(!Number.isFinite(t)||t<0||t>run.end+1e-10)throw new RangeError('Time outside computed history.');
    t=Math.min(run.end,t);const rows=run.rows;let lo=0,hi=rows.length-1;
    while(lo+1<hi){const mid=(lo+hi)>>1;if(rows[mid].t<=t)lo=mid;else hi=mid;}
    const y=advance(rows[lo].y,t-rows[lo].t,run.p),[a,v,chi]=y,p=run.p;
    const matter=p.m/a**3,radiation=p.r/a**4,vacuum=p.l,total=matter+radiation+vacuum;
    return {t,a,v,chi,H:v/a,acceleration:derivative(y,p)[1],wavelength:a/p.aStart,
      photonEnergy:p.aStart/a,temperature:p.r>0?p.aStart/a:null,
      density:{matter,radiation,vacuum},fractions:total>0?[matter/total,radiation/total,vacuum/total]:[0,0,0],
      comovingVolumeMass:matter*a**3,curvature:p.k};
  }
  return {presets,parameters,friedmann,derivative,simulate,sample};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TunnelCosmology;
