import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright'),out=path.resolve(process.argv[2]||'artifacts/advanced-studio');await mkdir(out,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port,errors=[],checks=[];let browser;
const pass=(name,detail)=>{checks.push({name,detail});console.log('PASS '+name);};
try{
  browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  for(const width of [1440,390,320]){
    const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),page=await ctx.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'/examples/advanced-studio/');await page.waitForFunction(()=>window.advancedStudio?.film);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('#surface-motion').click();
    for(const progress of [.65,.2]){await page.evaluate(at=>{const section=document.querySelector('#surface');scrollTo(0,section.offsetTop+(section.offsetHeight-innerHeight)*at);},progress);await page.waitForFunction(at=>{const s=window.advancedStudio.film.getState();return s.duration>0&&Math.abs(s.mediaProgress-at)<.04;},progress);const state=await page.evaluate(()=>({surface:window.advancedStudio.surface.getState(),film:window.advancedStudio.film.getState(),opacity:getComputedStyle(document.querySelector('.surface-layer')).opacity}));assert.equal(state.surface.state,'tracked');assert.equal(state.surface.at,state.film.mediaProgress);assert.equal(state.opacity,'1');}
    await page.locator('.surface-frame').screenshot({path:path.join(out,'surface-'+width+'.png')});
    await page.locator('#depth').scrollIntoViewIfNeeded();await page.locator('#depth-toggle').click();await page.waitForFunction(()=>['rendered','fallback'].includes(window.advancedStudio.depth.getState().state));const renderer=await page.evaluate(()=>window.advancedStudio.depth.getState().state);
    if(renderer==='rendered'){const box=await page.locator('.depth-frame').boundingBox();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.7);await page.waitForFunction(()=>Math.abs(window.advancedStudio.depth.getState().x)>.2);}
    await page.locator('.depth-frame').screenshot({path:path.join(out,'depth-'+width+'.png')});await page.locator('#depth-still').click();await page.waitForFunction(()=>window.advancedStudio.depth.getState().state==='static');
    await page.locator('#tilt-glare').scrollIntoViewIfNeeded();await page.locator('#tilt-glare').hover();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#tilt-glare')).getPropertyValue('--sb-hover').trim()==='1');
    await page.locator('#word-rotator').scrollIntoViewIfNeeded();const first=await page.locator('[data-sb-word]:visible').textContent();await page.waitForFunction(text=>document.querySelector('[data-sb-word]:not([hidden])').textContent!==text,first,{timeout:7000});
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.advancedStudio.depth.getState().state==='static');assert.equal(await page.locator('#tilt-glare').evaluate(el=>getComputedStyle(el).transform),'none');
    await page.locator('#rail').scrollIntoViewIfNeeded();assert.equal(await page.locator('.rail-track').evaluate(el=>getComputedStyle(el).transform),'none');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.evaluate(()=>window.advancedStudio.dispose());assert.equal(await page.evaluate(()=>window.advancedStudio.effects.getState().disposed),true);assert.equal(await page.locator('[data-sb-ready]').count(),0);
    pass('responsive-motion-'+width,{renderer,scope:'Real film forward/reverse, presented-time surface, depth pointer/static, tilt, timed rotator, reduced motion, no overflow and disposal.'});await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await ctx.newPage(),requests=[];page.on('request',request=>{if(request.url().endsWith('.mp4'))requests.push(request.url());});await page.goto(base+'/examples/advanced-studio/');await page.waitForFunction(()=>window.advancedStudio?.film);assert.equal(requests.length,0);pass('still-first','Reduced motion makes no film request before explicit local opt-in.');await ctx.close();
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}}),p=await noJS.newPage();await p.goto(base+'/examples/advanced-studio/');assert(await p.locator('.surface-fallback').isVisible());assert(await p.locator('[data-depth-photo]').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await noJS.close();pass('no-javascript','Source image, meaningful content, native rail and navigation remain available.');
  assert.deepEqual(errors,[]);await writeFile(path.join(out,'verification.json'),JSON.stringify({checks,errors,limits:['Chrome emulated widths; no physical-phone or Safari execution.','Original planar synthetic film and procedural source image; not proof for all customer footage.']},null,2)+'\n');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
