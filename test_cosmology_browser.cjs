/* Functional DOM checks; rendered SVG previews are optional. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'expansion.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element{
  constructor(tag='div'){this.tag=tag;this.attrs={};this.children=[];this.dataset={};this.events={};this.style={};this.value='';this.textContent='';this.hidden=false;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  appendChild(n){this.children.push(n);return n;}
  replaceChildren(...nodes){this.children=nodes;this.textContent='';}
  addEventListener(k,fn){this.events[k]=fn;}
}
const ids=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
const root=ids.get('expanding-tunnel-lab');let width=736;
root.getBoundingClientRect=()=>({width});root.querySelector=sel=>{const e=ids.get(sel.slice(1));assert.ok(e,`Missing ${sel}`);return e;};
const defaults={'ct-preset':'mixed','ct-matter':'.3','ct-radiation':'.0001','ct-lambda':'.6999','ct-time':'500'};
for(const [id,v] of Object.entries(defaults))ids.get(id).value=v;
vm.runInNewContext(script,{document:{getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag)},console,Math,Number,JSON},{timeout:5000});
const change=(id,v)=>{const e=ids.get(id);e.value=String(v);e.events.input();assert.equal(ids.get('ct-error').hidden,true,ids.get('ct-error').textContent);};
const state=()=>JSON.parse(root.dataset.state),stats=()=>ids.get('ct-stats').children.map(c=>c.textContent).join(' | ');
assert.ok(state().a>.2);assert.ok(state().photonEnergy<1);
for(const name of ['mixed','matter','radiation','closed','vacuum','empty']){
  change('ct-preset',name);change('ct-time',0);assert.ok(Math.abs(state().a-.2)<1e-12);
  change('ct-time',1000);assert.ok(Math.abs(state().a-(name==='closed'?.05:3))<1e-8);
  if(name==='closed'){assert.ok(state().v<0);assert.match(ids.get('ct-phase').textContent,/Contracting/);assert.ok(state().photonEnergy>1);}
  if(name==='empty')assert.match(ids.get('ct-legend').textContent,/Empty/);
  if(name==='matter'){assert.ok(Math.abs(state().growth-15)<1e-7);assert.ok(Math.abs(state().growthRate-1)<1e-7);}
  assert.match(stats(),/Overdensity growth ×/);
}
change('ct-preset','closed');change('ct-time',0);assert.match(stats(),/Growth rate f = 1\.000/);
change('ct-preset','mixed');change('ct-matter',.5);assert.equal(ids.get('ct-preset').value,'custom');
change('ct-radiation',.2);change('ct-lambda',.3);assert.ok(Math.abs(state().curvature)<1e-12);
const serialize=n=>`<${n.tag} ${Object.entries(n.attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}>${n.textContent.replaceAll('&','&amp;').replaceAll('<','&lt;')}${n.children.map(serialize).join('')}</${n.tag}>`;
const out=process.argv[2];if(out)fs.mkdirSync(out,{recursive:true});
for(const name of ['mixed','closed'])for(width of [320,736]){
  change('ct-preset',name);change('ct-time',name==='closed'?700:500);
  const svg=ids.get('ct-diagram');assert.equal(svg.attrs.viewBox,`0 0 ${width} 340`);
  for(const n of svg.children){
    for(const key of ['cx','cy','rx','ry','r','x','y','x1','x2','y1','y2','stroke-width'])if(key in n.attrs)assert.ok(Number.isFinite(+n.attrs[key]));
    if(n.tag==='ellipse'){assert.ok(+n.attrs.cx-(+n.attrs.rx)>=0);assert.ok(+n.attrs.cx+(+n.attrs.rx)<=width);}
    if(n.tag==='path')assert.ok(!/NaN|Infinity/.test(n.attrs.d));
  }
  if(out){const palette={'--foreground':'#202727','--border':'#bac4c0','--viz-series-1':'#176fad','--viz-series-2':'#b45b1b','--viz-series-3':'#7258b5'};
    const marks=svg.children.map(serialize).join('').replace(/var\(([^)]+)\)/g,(_,v)=>palette[v]);
    fs.writeFileSync(path.join(out,`cosmo-${name}-${width}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="340" viewBox="0 0 ${width} 340"><style>text{font-family:Arial,sans-serif;font-size:12px;fill:#202727}</style><rect width="100%" height="100%" fill="#fcfcfa"/>${marks}</svg>`);
  }
}
assert.ok(!html.includes('/*__COSMOLOGY__*/'));assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|<script[^>]+src=/.test(html));
console.log('PASS: six cosmology presets, ingredient and time controls, contraction, photon energy, empty composition, SVG bounds at 320/736px, offline content.');
