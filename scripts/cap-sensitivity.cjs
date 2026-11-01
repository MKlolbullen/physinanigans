#!/usr/bin/env node
/* Independent sensitivity sweep of strength and boundary-strip fraction.
   Expensive on purpose; run with Node 20+ on demand. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {create}=require('../schrodinger.js');
const {gaussianAveragedTransmission}=require('../barrier-theory.js');
const {summarize}=require('./cap-sensitivity-core.cjs');
const args=process.argv.slice(2),quick=args.includes('--quick'),oi=args.indexOf('--output');
if(args.includes('--help')){console.log('node scripts/cap-sensitivity.cjs [--quick] [--output report.json]');process.exit(0);}
if(oi>=0&&(!args[oi+1]||args[oi+1].startsWith('--')))throw Error('Missing output filename');
const strengths=quick?[.6,1.4]:[.5,1,2],fractions=quick?[.10,.18]:[.10,.15,.20];
const config={n:quick?301:501,xmin:-45,xmax:45,mass:1,dt:quick?.04:.025,x0:-20,sigma0:3,k0:Math.sqrt(5),height:3,width:1.5,potentialType:'barrier',absorber:true};
const times=2*(Math.abs(config.x0)+config.width/2+3*config.sigma0)/config.k0;
const steps=Math.ceil(times/config.dt);
const rows=[];
for(const strength of strengths)for(const fraction of fractions){
 const s=create({...config,absorbStrength:strength,absorbFraction:fraction});
 for(let i=0;i<steps;i+=20)s.step(Math.min(20,steps-i));
 const p=s.snapshot(),numericT=p.right+p.absorbedRight;
 const row={strength,fraction,numericT,interaction:p.interaction,budget:p.budget,
   absorbedLeft:p.absorbedLeft,absorbedRight:p.absorbedRight,
   expectedPacketT:gaussianAveragedTransmission(config.k0,config.sigma0,config.height,config.width,config.mass)};
 rows.push(row);
 console.log(JSON.stringify(row));
}
const summary=summarize(rows);console.log('CAP sensitivity summary:',JSON.stringify(summary));
if(oi>=0){const file=args[oi+1];fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify({config,time:steps*config.dt,rows,summary},null,2)+'\n');}
if(summary.status==='UNRESOLVED')process.exitCode=2;
