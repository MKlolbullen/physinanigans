'use strict';
/* A conservative diagnostic, NOT a statistical confidence interval. */
function analyze({space,time,absorbers,reference,interactionTolerance=.02,budgetTolerance=.003,variationTolerance=.03}){
 for(const [name,rows] of Object.entries({space,time,absorbers})){
  if(!Array.isArray(rows)||rows.length<2)throw new RangeError(name+' requires at least two samples');
  for(const r of rows)if(![r.numericT,r.interaction,r.budget].every(Number.isFinite)||r.numericT<0||r.numericT>1.001)throw new RangeError(name+' has invalid data');
 }
 if(!Number.isFinite(reference)||reference<0||reference>1)throw new RangeError('invalid reference');
 const spread=rows=>Math.max(...rows.map(r=>r.numericT))-Math.min(...rows.map(r=>r.numericT));
 const spaceSpread=spread(space),timeSpread=spread(time),absorberSpread=spread(absorbers);
 const all=[...space,...time,...absorbers],maxInteraction=Math.max(...all.map(x=>x.interaction));
 const maxBudgetDeviation=Math.max(...all.map(x=>Math.abs(x.budget-1)));
 const representative=space[space.length-1].numericT;
 const deviationFromPacketTheory=Math.abs(representative-reference);
 const status=maxInteraction>interactionTolerance||maxBudgetDeviation>budgetTolerance?'UNRESOLVED_SCATTERING':
   Math.max(spaceSpread,timeSpread,absorberSpread)>variationTolerance?'NUMERICALLY_SENSITIVE':'PROVISIONAL';
 return {status,representative,packetTheory:reference,deviationFromPacketTheory,
  spaceSpread,timeSpread,absorberSpread,maxInteraction,maxBudgetDeviation,
  conservativeVariationEnvelope:Math.max(spaceSpread,timeSpread,absorberSpread),
  warning:'Spreads are deterministic sensitivity diagnostics, not independent random errors, confidence intervals, a certified bound, or an asymptotic convergence order.'};
}
module.exports={analyze};
