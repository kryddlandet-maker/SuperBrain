import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from './serve.mjs';

const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const out=path.resolve(process.argv[2]||'artifacts/product-motion');
await mkdir(out,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port,checks=[],errors=[];
const check=(name,details)=>{checks.push({name,result:'pass',details});console.log('PASS '+name);};
const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
const states=locator=>locator.evaluate(el=>el.getAnimations({subtree:true}).map(a=>({time:a.currentTime,state:a.playState})));
const seek=(locator,time)=>locator.evaluate((el,t)=>el.getAnimations({subtree:true}).forEach(a=>a.currentTime=t),time);
let browser;
try {
  browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),page=await context.newPage();watch(page);
    await page.goto(base+'/examples/product-motion/');
    assert.equal(await page.locator('[data-product-scene]').count(),3);
    for(const [id,moving] of [['workflow','.moving-task'],['orbit','.camera'],['timeline','.playhead']]){
      const root=page.locator('#'+id);await root.scrollIntoViewIfNeeded();
      await page.waitForFunction(id=>document.getElementById(id).dataset.motionState==='playing',id);
      await root.locator('[data-restart]').click();
      const before=await root.locator(moving).evaluate(el=>getComputedStyle(el).transform);
      await page.waitForFunction(id=>document.getElementById(id).getAnimations({subtree:true})[0].currentTime>3000,id);
      const middle=await root.locator(moving).evaluate(el=>getComputedStyle(el).transform);assert.notEqual(middle,before);
      const elapsed=await states(root);assert(elapsed.every(a=>a.state==='running'));assert(Math.max(...elapsed.map(a=>a.time))-Math.min(...elapsed.map(a=>a.time))<35);
      await page.waitForFunction(id=>document.getElementById(id).getAnimations({subtree:true})[0].currentTime>7300,id);
      assert.equal(await root.locator(moving).evaluate(el=>getComputedStyle(el).transform),before);
      await root.locator('[data-play]').click();
      await page.waitForFunction(id=>document.getElementById(id).getAnimations({subtree:true}).every(a=>a.playState==='paused'),id);
      await root.evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.ready)));
      const paused=await states(root);await page.waitForTimeout(180);assert.deepEqual(await states(root),paused);
      await seek(root,0);const start=await root.locator(moving).evaluate(el=>getComputedStyle(el).transform);
      await seek(root,7199);const end=await root.locator(moving).evaluate(el=>getComputedStyle(el).transform);assert.equal(end,start);
      await seek(root,id==='timeline'?5760:4896);
      if(width===1440)await root.locator('.visual').screenshot({path:path.join(out,id+'-result.png')});
      check(id+'-motion-'+width,'Observed a complete autonomous cycle with intermediate pixel movement and reset, synchronized native tracks, pause freezing, and matching loop endpoints. Result screenshot is a separate deliberately sampled frame.');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(out,width===1440?'desktop.png':'mobile.png'),fullPage:true});
    check('composition-'+width,'All three scene frames, headings and playback controls render without horizontal page overflow.');
    if(width===390){
      const root=page.locator('#workflow');await root.scrollIntoViewIfNeeded();await root.locator('[data-play]').click();
      await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='playing');
      await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='offscreen');
      await root.evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.ready)));
      const paused=await states(root);await page.waitForTimeout(180);assert.deepEqual(await states(root),paused);
      await root.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='playing');
      await root.locator('[data-play]').click();await page.locator('footer').scrollIntoViewIfNeeded();await root.scrollIntoViewIfNeeded();assert.equal(await root.getAttribute('data-motion-state'),'paused');
      await root.locator('[data-play]').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='playing');
      check('visibility-pause-and-keyboard','Offscreen native animation times freeze; return resumes intended playback; manual pause survives return; Space activates the native control.');
    }
    await context.close();
  }
  for(const width of [320,768,1024]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});watch(page);await page.goto(base+'/examples/product-motion/');
    await page.waitForFunction(()=>[...document.querySelectorAll('[data-product-scene]')].every(el=>el.dataset.motionState==='still'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    for(const button of await page.locator('[data-play]').all()){assert((await button.boundingBox()).height>=44);assert(await button.isEnabled());}
    if(width===320)await page.screenshot({path:path.join(out,'compact-still.png'),fullPage:true});
    check('reflow-and-still-'+width,'Meaningful reduced-motion stills, no horizontal page overflow, enabled playback controls with >=44px height.');await page.close();
  }
  {
    const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});watch(page);await page.goto(base+'/examples/product-motion/');
    const root=page.locator('#workflow');await root.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='still');
    assert((await states(root)).every(a=>a.state==='paused'));
    await root.locator('[data-play]').click();await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='playing');
    await page.evaluate(()=>{window.motionChanges=[];matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>window.motionChanges.push(e.matches));});
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>window.motionChanges.at(-1)===false);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#workflow').dataset.motionState==='still');
    check('live-preference-and-local-play','Reduced motion starts stationary; explicit scene-local play works; a live preference change restores the still.');
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await page.waitForFunction(()=>document.getAnimations().length===13);
    assert((await page.locator('[data-product-scene]').evaluateAll(els=>els.map(el=>el.getAnimations({subtree:true}).length))).every((n,i)=>n===[3,6,4][i]));
    await page.getByRole('link',{name:'Skapa en brief',exact:true}).click();await page.goBack();await page.waitForFunction(()=>document.getAnimations().length===13);
    check('disposal-restoration-and-history','Synthetic page transition events cancel all tracks and restore exactly one set; real link/back navigation also restores the page without duplicate tracks.');await page.close();
  }
  {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),page=await context.newPage();await page.goto(base+'/examples/product-motion/');
    assert.equal(await page.locator('figure').count(),3);assert.equal(await page.locator('[data-play]:disabled').count(),3);assert(await page.getByText('En uppgift. Nästa steg.',{exact:true}).isVisible());
    await page.getByRole('link',{name:'Skapa en brief',exact:true}).click();assert(page.url().endsWith('/studio/engine/'));
    check('no-javascript','Original still compositions and descriptions remain; playback is disabled honestly; native navigation works.');await context.close();
    const noAPI=await browser.newContext();await noAPI.addInitScript(()=>{Element.prototype.animate=undefined;});const fallback=await noAPI.newPage();watch(fallback);await fallback.goto(base+'/examples/product-motion/');
    await fallback.waitForFunction(()=>document.querySelectorAll('[data-motion-state=unavailable]').length===3);assert.equal(await fallback.locator('[data-play]:disabled').count(),3);
    check('missing-waapi','Missing animation support preserves the composed HTML/CSS still without runtime errors.');await noAPI.close();
  }
  {
    const page=await browser.newPage({viewport:{width:390,height:900}});watch(page);await page.goto(base+'/studio/engine/');
    await page.locator('input[name=productMotion]').check();await page.getByRole('button',{name:'Skapa förslag',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));
    await page.locator('#file-choice').selectOption('design-system/motion/product-scene.json');assert.equal(JSON.parse(await page.locator('#file-output').textContent()).playback,'visible-auto');
    const pending=page.waitForEvent('download');await page.locator('#download-brief').click();const download=await pending;assert.deepEqual(JSON.parse(await readFile(await download.path(),'utf8')).techniques,['scenes']);
    await page.goto(base+'/');await page.locator('input[name=name]').fill('Product motion browser check');await page.locator('input[name=goal]').fill('Explain a real product');await page.locator('select[name=techniques]').selectOption('scenes');await page.getByRole('button',{name:'Skapa projektbrief'}).click();
    await page.waitForFunction(()=>document.querySelector('#brief-output').value.includes('# Animated product demonstrations'));
    check('studio-and-brief-exports','Both existing interfaces select the new family; the engine exports a real scene contract and the downloaded brief preserves the selection.');await page.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(path.join(out,'browser.json'),JSON.stringify({schema:1,date:new Date().toISOString(),browser:await browser.version(),platform:process.platform,checks,errors,scope:'Local Chromium and emulated viewports. Native WAAPI timing and rendered movement, controls, lifecycle, fallbacks and both brief forms.',limits:['This local suite does not inspect external reference sites.','Tab-hidden gating is unit-tested; native OS background-tab switching and physical devices are not certified.','Synthetic lifecycle dispatch is labelled separately from real link/back navigation.','No video/Rive/Lottie integration, whole-site WCAG certification or controlled model comparison was performed.']},null,2)+'\n');
  console.log(JSON.stringify({checks:checks.length,errors:errors.length,out}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
