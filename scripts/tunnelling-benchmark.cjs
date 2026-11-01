#!/usr/bin/env node
/* Reproducible finite-packet scattering benchmark. Run explicitly; not a CI workload.
   Node 20+, no external libraries. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {create}=require('../schrodinger.js');
const {transmission,gaussianAveragedTransmission}=require('../barrier-theory.js');
const args=process.argv.slice(2);
if(args.includes('--help')){console.log('Usage: node scripts/tunnelling-benchmark.cjs [--quick] [--output FILE.json]');process.exit(0);}
const quick=args.includes('--quick'),outIndex=args.indexOf('--output');
if(outIndex>=0&&(!args[outIndex+1]||args[outIndex+1].startsWith('--')))throw Error('Missing --output path');
const output=outIndex>=0?args[outIndex+1]:null;
const configs=quick?[{n:301,dt:.04}]:[{n:301,dt:.04},{n:451,dt:.025},{n:601,dt:.015}];
const energies=quick?[1.5,2.5]:[1.0,1.5,2.5,4];
const widths=quick?[1,2]:[.75,1.5,2.5];
const V=3,m=1,sigma0=3,x0=-20;
function run(E,width,resolution){
 const k0=Math.sqrt(2*m*E);
 const settings={...resolution,xmin:-45,xmax:45,x0,sigma0,k0,mass:m,potentialType:'barrier',height:V,width,absorber:true,absorbFraction:.12,absorbStrength:1.0};
 const sim=create(settings);
 // Incident packet approaches from left; choose a time after scattering but
 // before broadening and CAP reflection can severely compromise estimates.
 const time=2*(Math.abs(x0)+width/2+3*sigma0)/k0;
 const steps=Math.ceil(time/resolution.dt);
 for(let j=0;j<steps;j+=20)sim.step(Math.min(20,steps-j));
 const s=sim.snapshot();
 const transmitted=s.right+s.absorbedRight;
 const reflected=s.left+s.absorbedLeft;
 const remainder=Math.max(0,s.norm-s.right-s.left);
 const estimated=(s.interaction<.015&&Math.abs(s.budget-1)<.002);
 return {energy:E,width,n:resolution.n,dx:s.dx,dt:resolution.dt,time:s.t,
   numericT:transmitted,numericR:reflected,interaction:s.interaction,remainder,
   absorbedLeft:s.absorbedLeft,absorbedRight:s.absorbedRight,budget:s.budget,
   analyticPlaneWaveT:transmission(E,V,width,m),
   analyticPacketSpectrumT:gaussianAveragedTransmission(k0,sigma0,V,width,m),
   separated:estimated,
   absPacketDifference:Math.abs(transmitted-gaussianAveragedTransmission(k0,sigma0,V,width,m))};
}
const results=[];
console.log('E\twidth\tn\tdt\tT_numeric\tT_plane\tT_packet\tinteraction\tbudget\tseparated');
for(const E of energies)for(const width of widths)for(const resolution of configs){
 const row=run(E,width,resolution);results.push(row);
 console.log([E,width,resolution.n,resolution.dt,row.numericT.toFixed(5),
 row.analyticPlaneWaveT.toFixed(5),row.analyticPacketSpectrumT.toFixed(5),
 row.interaction.toFixed(4),row.budget.toFixed(6),row.separated?'yes':'NO'].join('\t'));
}
console.log('E\twidth\tn\tdt\tT_numeric\tT_plane\tT_packet\tinteraction\tbudget\tseparated');
if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({model:'1D finite-difference CN + quartic CAP',hbar:1,m,V,sigma0,x0,results},null,2)+'\n');console.log('Wrote '+output);}
if(results.some(r=>Math.abs(r.budget-1)>.003))process.exitCode=1;
