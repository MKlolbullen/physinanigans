/* Independently testable sensitivity diagnostics for a complex absorbing potential. */
'use strict';
function summarize(rows,{maxSpread=.025,maxInteraction=.02,maxBudgetError=.003}={}){
 if(!Array.isArray(rows)||!rows.length)throw new TypeError('Nonempty rows required');
 for(const r of rows){
   if(![r.strength,r.fraction,r.numericT,r.interaction,r.budget].every(Number.isFinite))throw new TypeError('Non-finite sample');
   if(r.strength<0||r.fraction<=0||r.fraction>=.4||r.numericT<0||r.numericT>1.001)throw new RangeError('Invalid parameter or probability');
 }
 const ts=rows.map(x=>x.numericT),lo=Math.min(...ts),hi=Math.max(...ts),spread=hi-lo;
 const maxInteractionObserved=Math.max(...rows.map(x=>x.interaction));
 const maxBudgetErrorObserved=Math.max(...rows.map(x=>Math.abs(x.budget-1)));
 const distinctStrengths=new Set(rows.map(x=>x.strength)).size,distinctFractions=new Set(rows.map(x=>x.fraction)).size;
 const status=maxInteractionObserved>maxInteraction||maxBudgetErrorObserved>maxBudgetError?'UNRESOLVED':
   distinctStrengths<2||distinctFractions<2?'INSUFFICIENT_SENSITIVITY':
   spread>maxSpread?'BOUNDARY_SENSITIVE':'PROVISIONAL_CAP_STABILITY';
 return {status,samples:rows.length,distinctStrengths,distinctFractions,minT:lo,maxT:hi,transmissionSpread:spread,maxInteraction:maxInteractionObserved,maxBudgetError:maxBudgetErrorObserved,
  note:'CAP stability is necessary but not sufficient: verify grid refinement, finite packet spectrum, pre-absorption separation and absence of wall echoes.'};
}
module.exports={summarize};
