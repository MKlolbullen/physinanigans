const {test}=require('node:test'),assert=require('node:assert/strict');
const {summarize}=require('../scripts/tunnelling-convergence.cjs');
function row(dx,dt,T,interaction=0.001,budget=1){return {energy:1.5,width:2,dx,dt,numericT:T,interaction,budget,analyticPacketSpectrumT:.25};}
test('groups and sorts refinements',()=>{const s=summarize([row(.1,.01,.24),row(.3,.03,.20),row(.2,.02,.23)])[0];assert.equal(s.refinements,3);assert.equal(s.bestNumericT,.24);assert.equal(s.refinement.length,2);});
test('does not call a single resolution converged',()=>{assert.equal(summarize([row(.1,.01,.2)])[0].status,'INSUFFICIENT_REFINEMENT');});
test('unresolved probability near barrier invalidates classification',()=>{assert.equal(summarize([row(.3,.03,.2),row(.1,.01,.21,.1)])[0].status,'UNRESOLVED_PACKET_OR_BUDGET');});
test('mass budget failure invalidates classification',()=>{assert.equal(summarize([row(.3,.03,.2),row(.1,.01,.21,.001,.9)])[0].status,'UNRESOLVED_PACKET_OR_BUDGET');});
test('large refinement disagreement is flagged',()=>{assert.equal(summarize([row(.3,.03,.2),row(.1,.01,.4)])[0].status,'NOT_CONVERGED');});
test('small refinement difference is only provisional',()=>{assert.equal(summarize([row(.3,.03,.2),row(.1,.01,.205)])[0].status,'PROVISIONAL');});
test('invalid values are rejected',()=>{assert.throws(()=>summarize([row(NaN,.01,.2)]),TypeError);});
