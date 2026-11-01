/* Postprocess a tunnelling energy/width sweep. Pure and independently testable. */
'use strict';
function summarize(rows,{interactionTolerance=.015,budgetTolerance=.002,refinementTolerance=.03}={}){
 if(!Array.isArray(rows))throw TypeError('rows required');
 const groups=new Map();
 for(const row of rows){
  if(![row.energy,row.width,row.dx,row.dt,row.numericT,row.interaction,row.budget,row.analyticPacketSpectrumT].every(Number.isFinite))throw TypeError('non-finite benchmark datum');
  const key=JSON.stringify([row.energy,row.width]);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(row);
 }
 return [...groups.entries()].map(([key,values])=>{
  const [energy,width]=JSON.parse(key);
  const sorted=[...values].sort((a,b)=>b.dx-a.dx||b.dt-a.dt);
  const fine=sorted[sorted.length-1];
  const valid=sorted.every(x=>x.interaction<=interactionTolerance&&Math.abs(x.budget-1)<=budgetTolerance);
  const refinement=sorted.slice(1).map((v,i)=>({coarseDx:sorted[i].dx,fineDx:v.dx,coarseDt:sorted[i].dt,fineDt:v.dt,absoluteDifference:Math.abs(v.numericT-sorted[i].numericT)}));
  const finalDifference=refinement.length?refinement[refinement.length-1].absoluteDifference:null;
  return {energy,width,refinements:sorted.length,packetTheory:fine.analyticPacketSpectrumT,
   bestNumericT:fine.numericT,absoluteTheoryDifference:Math.abs(fine.numericT-fine.analyticPacketSpectrumT),
   interaction:fine.interaction,budget:fine.budget,refinement,
   finalRefinementDifference:finalDifference,
   status:!valid?'UNRESOLVED_PACKET_OR_BUDGET':sorted.length<2?'INSUFFICIENT_REFINEMENT':finalDifference>refinementTolerance?'NOT_CONVERGED':'PROVISIONAL',
   warning:'PROVISIONAL does not demonstrate CAP independence, barrier discretization convergence or asymptotic transmission.'};
 });
}
module.exports={summarize};
