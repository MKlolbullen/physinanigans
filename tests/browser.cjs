/* Real Chromium checks on local files; no development server or account session. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..'),out=path.join(root,'test-results');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:1000},hasTouch:true});
  const page=await context.newPage(),errors=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  const go=async name=>page.goto(pathToFileURL(path.join(root,name+'.html')).href);
  const state=async id=>JSON.parse(await page.locator('#'+id).getAttribute('data-state'));
  async function dragIn(selector,fx,fy,tx,ty){await page.locator(selector).scrollIntoViewIfNeeded();const b=await page.locator(selector).boundingBox();await page.mouse.move(b.x+b.width*fx,b.y+b.height*fy);await page.mouse.down();await page.mouse.move(b.x+b.width*tx,b.y+b.height*ty,{steps:8});await page.mouse.up();}
  for(const width of [1280,360]) {
   await page.setViewportSize({width,height:1000});
   for(const name of ['index','quantum','expansion','relativity','guide']) {
    await go(name);
    assert.equal(await page.locator('main').count(),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: page overflow at ${width}`);
    const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('#')&&!document.querySelector(h)));
    assert.deepEqual(broken,[]);
    const files=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('#')&&!/^[a-z]+:/i.test(h)));
    for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),`${name}: broken link ${file}`);
    for(const count of await page.locator('tbody tr').evaluateAll(rows=>rows.map(r=>r.cells.length)))assert.equal(count,3,'table must have three populated columns');
    if(name==='guide') {
     assert.equal(await page.locator('math').count(),8);
     const rect=await page.locator('math').first().boundingBox();assert.ok(rect.height>20&&rect.width>100,'MathML has no rendered size');
     await page.locator('.tex-source summary').first().click();assert.match(await page.locator('.tex-source pre').first().innerText(),/\\mathcal U_t/);
    }
    if(name==='index'||name==='relativity')await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
   }
   await go('quantum');await dragIn('#st-diagram',.2,.5,.8,.5);
   const q=await state('state-tunnel-lab');assert.ok(q.t>6&&q.t<8,`quantum drag t=${q.t} at ${width}`);assert.ok(Math.abs(q.pA-Math.cos(q.t)**2)<1e-12);
   await page.locator('#st-time').focus();await page.keyboard.press('Home');assert.equal((await state('state-tunnel-lab')).t,0);
   await page.keyboard.press('ArrowRight');assert.ok((await state('state-tunnel-lab')).t>0);
   await page.locator('#st-initial').selectOption('bell');assert.ok(Math.abs((await state('state-tunnel-lab')).concurrence-1)<1e-12);
   await page.locator('#st-initial').selectOption('mixture');assert.equal((await state('state-tunnel-lab')).concurrence,0);
   await go('expansion');await page.locator('#ct-preset').selectOption('closed');await dragIn('#ct-diagram',.2,.3,.99,.3);
   const c=await state('expanding-tunnel-lab');assert.ok(c.v<0);assert.ok(c.photonEnergy>1);
   await page.locator('#ct-time').focus();await page.keyboard.press('Home');assert.ok(Math.abs((await state('expanding-tunnel-lab')).a-.2)<1e-12);
   await go('relativity');await page.locator('#sr-diagram').scrollIntoViewIfNeeded();const h=await page.locator('[data-drag="speed"]').boundingBox();const s=await page.locator('#sr-diagram').boundingBox();
   await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(s.x+s.width*.5,s.y+s.height*80/520,{steps:8});await page.mouse.up();
   assert.ok(Math.abs((await state('sr-diagram')).beta)<.015);
   const th=await page.locator('[data-drag="time"]').boundingBox();await page.mouse.move(th.x+th.width/2,th.y+th.height/2);await page.mouse.down();await page.mouse.move(s.x+s.width*.5,s.y+s.height*170/520,{steps:8});await page.mouse.up();
   assert.ok(Math.abs((await state('sr-diagram')).Tprime-1)<.02);
   await page.locator('#sr-beta').focus();await page.keyboard.press('End');assert.equal((await state('sr-diagram')).beta,.9);
  }
  // A real touch sequence on a phone-size viewport, through Chromium's input pipeline.
  await go('quantum');await page.locator('#st-diagram').scrollIntoViewIfNeeded();
  const b=await page.locator('#st-diagram').boundingBox(),cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width*.2,y:b.y+b.height*.5}]});
  for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width*(.2+i*.1),y:b.y+b.height*.5}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok((await state('state-tunnel-lab')).t>6,'touch drag did not scrub');
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  console.log('PASS: five pages at 1280/360px, MathML, local links, real mouse/touch/keyboard controls, no page errors or network requests.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
