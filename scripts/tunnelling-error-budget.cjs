#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {create}=require('../schrodinger.js');
const {gaussianAveragedTransmission}=require('../barrier-theory.js');
const {analyze}=require('./tunnelling-error-budget-core.cjs');
const args=process.argv.slice(2),oi=args.indexOf('--output'),quick=args.includes('--quick');
if(args.includes('--help')){console.log('node scripts/tunnelling-error-budget.cjs [--quick] [--output path.json]');process.exit(0);}
if(oi>=0&&(!args[oi+1]||args[oi+1].startsWith('--')))throw Error('Missing output path');
const base={xmin:-45,xmax:45,x0:-20,sigma0:3,k0:Math.sqrt(5),mass:1,
 potentialType:'barrier',height:3,width:1.5,absorber:true,n:quick?301:601,dt:quick?.04:.02,
 absorbStrength:1,absorbFraction:.15};
const duration=2*(Math.abs(base.x0)+base.width/2+3*base.sigma0)/base.k0;
function evaluate(overrides){
 const p={...base,...overrides},s=create(p),steps=Math.ceil(duration/p.dt);
 for(let i=0;i<steps;i+=20)s.step(Math.min(20,steps-i));
 const q=s.snapshot();
 return {n:p.n,dx:q.dx,dt:p.dt,strength:p.absorbStrength,fraction:p.absorbFraction,
   numericT:q.right+q.absorbedRight,interaction:q.interaction,budget:q.budget,
   absorbedLeft:q.absorbedLeft,absorbedRight:q.absorbedRight,time:q.t};
}
const space=(quick?[201,301]:[401,601,801]).map(n=>evaluate({n}));
const time=(quick?[.06,.04]:[.04,.02,.01]).map(dt=>evaluate({dt}));
const absorbers=[];
for(const strength of (quick?[.6,1.4]:[.6,1,1.4]))
 for(const fraction of (quick?[.12,.18]:[.12,.15,.18]))
  absorbers.push(evaluate({absorbStrength:strength,absorbFraction:fraction}));
const reference=gaussianAveragedTransmission(base.k0,base.sigma0,base.height,base.width,base.mass);
const summary=analyze({space,time,absorbers,reference});
const report={model:'CN finite packet, quartic complex absorbing potential',units:'hbar=1',base,duration,space,time,absorbers,summary};
console.log(JSON.stringify(summary,null,2));
if(oi>=0){const output=args[oi+1];fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('Wrote '+output);}
if(summary.status==='UNRESOLVED_SCATTERING')process.exitCode=2;
