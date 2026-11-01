const {test}=require('node:test'),assert=require('node:assert/strict');
const {summarize}=require('../scripts/cap-sensitivity-core.cjs');
const sample=(strength,fraction,numericT,interaction=.001,budget=1)=>({strength,fraction,numericT,interaction,budget});
test('small spread in a 2D parameter sweep is provisional, not confirmed',()=>{const r=summarize([sample(.5,.1,.2),sample(.5,.2,.201),sample(1,.1,.204),sample(1,.2,.203)]);assert.equal(r.status,'PROVISIONAL_CAP_STABILITY');assert.ok(r.transmissionSpread<.005);});
test('CAP-sensitive results are rejected',()=>{assert.equal(summarize([sample(.5,.1,.2),sample(.5,.2,.3),sample(1,.1,.25),sample(1,.2,.24)]).status,'BOUNDARY_SENSITIVE');});
test('unresolved interactions override apparent stability',()=>{assert.equal(summarize([sample(.5,.1,.2,.1),sample(.5,.2,.201),sample(1,.1,.204),sample(1,.2,.203)]).status,'UNRESOLVED');});
test('budget error overrides apparent stability',()=>{assert.equal(summarize([sample(.5,.1,.2,.001,.97),sample(.5,.2,.201),sample(1,.1,.204),sample(1,.2,.203)]).status,'UNRESOLVED');});
test('one-dimensional variation is insufficient',()=>{assert.equal(summarize([sample(.5,.1,.2),sample(1,.1,.201)]).status,'INSUFFICIENT_SENSITIVITY');});
test('invalid samples fail closed',()=>{assert.throws(()=>summarize([]),TypeError);assert.throws(()=>summarize([sample(.5,NaN,.2)]),TypeError);});
