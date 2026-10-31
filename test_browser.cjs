/* Functional DOM harness. It deliberately does not claim browser layout testing. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'quantum.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element {
  constructor(tag='div'){this.tag=tag;this.attrs={};this.children=[];this.dataset={};this.events={};this.textContent='';this.value='';this.hidden=false;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  appendChild(n){this.children.push(n);return n;}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(k,fn){this.events[k]=fn;}
}
const ids=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
const root=ids.get('state-tunnel-lab'); let width=736;
root.getBoundingClientRect=()=>({width});
root.querySelector=sel=>{const el=ids.get(sel.slice(1));assert.ok(el,`Missing queried element ${sel}`);return el;};
const defaults={'st-initial':'excited','st-clock':'local','st-coupling':'1','st-noise':'0','st-amount':'0.6','st-time':'0.785'};
for(const [id,value] of Object.entries(defaults))ids.get(id).value=value;
const context={document:{getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag)},Math,Number,JSON,console};
vm.runInNewContext(script,context,{timeout:2000});
const read=()=>JSON.parse(root.dataset.state);
const change=(id,value)=>{const el=ids.get(id);el.value=String(value);el.events.input();};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
close(read().pA,Math.cos(.785)**2);
change('st-initial','bell'); close(read().pA,.5);close(read().concurrence,1);
change('st-initial','mixture');close(read().pA,.5);close(read().concurrence,0);
change('st-initial','bell');change('st-noise',1);change('st-time',2);close(read().concurrence,Math.exp(-2));
change('st-clock','sr');change('st-amount',.6);close(read().tau,1.6);assert.equal(ids.get('st-amount-wrap').hidden,false);
change('st-clock','gr');change('st-amount',.36);close(read().tau,1.6);assert.match(ids.get('st-amount-label').textContent,/Compactness/);
change('st-clock','local');assert.equal(ids.get('st-amount-wrap').hidden,true);
change('st-initial','excited');change('st-coupling',0);close(read().pA,1);
for(const [id,value] of Object.entries(defaults))change(id,value);
const serialize=n=>`<${n.tag} ${Object.entries(n.attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}>${n.textContent.replaceAll('&','&amp;').replaceAll('<','&lt;')}${n.children.map(serialize).join('')}</${n.tag}>`;
const output=process.argv[2];if(output)fs.mkdirSync(output,{recursive:true});
for(width of [320,360,736]){
  change('st-time',.785);
  const svg=ids.get('st-diagram');
  assert.equal(svg.attrs.viewBox,`0 0 ${width} 265`);
  for(const n of svg.children){
    for(const [key,value] of Object.entries(n.attrs)){
      if(['cx','cy','rx','ry','r','x','y','x1','x2','y1','y2','stroke-width'].includes(key))assert.ok(Number.isFinite(+value),`Invalid ${key}: ${value}`);
    }
    if(n.tag==='ellipse'){
      assert.ok(+n.attrs.cx-(+n.attrs.rx)>=0);assert.ok(+n.attrs.cx+(+n.attrs.rx)<=width);
    }
  }
  if(output){
    const palette={'--foreground':'#202727','--border':'#bac4c0','--viz-series-1':'#176fad','--viz-series-2':'#b45b1b','--viz-series-3':'#7258b5'};
    const marks=svg.children.map(serialize).join('').replace(/var\(([^)]+)\)/g,(_,v)=>palette[v]);
    fs.writeFileSync(path.join(output,`tunnel-${width}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="265" viewBox="0 0 ${width} 265"><style>text{font-family:Arial,sans-serif;font-size:12px;fill:#202727}</style><rect width="100%" height="100%" fill="#fcfcfa"/>${marks}</svg>`);
  }
}
assert.ok(!html.includes('/*__MODEL__*/'));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|<script[^>]+src=/.test(html));
console.log('PASS: initial state, all six controls, quantum/readout updates, clock modes, SVG geometry at 320/360/736px, offline content.');
