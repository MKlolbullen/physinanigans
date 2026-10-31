// Build-time LaTeX -> accessible native MathML. No browser network requests or JS library.
const fs=require('node:fs'),path=require('node:path'),katex=require('katex');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const root=path.join(__dirname,'..');let count=0;
for(const name of ['index.html','quantum.html','expansion.html','relativity.html','guide.html']) {
  const file=path.join(root,name);
  const result=fs.readFileSync(file,'utf8').replace(/\\\[([\s\S]*?)\\\]/g,(_,tex)=>{
    count++;
    const rendered=katex.renderToString(tex.trim(),{displayMode:true,output:'mathml',throwOnError:true,trust:false,strict:'error'});
    return '<div class="math-block">'+rendered+'<details class="tex-source"><summary>LaTeX source</summary><pre><code>'+escape(tex.trim())+'</code></pre></details></div>';
  });
  fs.writeFileSync(file,result);
}
console.log(`Rendered ${count} LaTeX equations as native MathML.`);
