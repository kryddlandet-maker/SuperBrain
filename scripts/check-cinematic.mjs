import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from './serve.mjs';

const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const out=path.resolve(process.argv[2]||'artifacts/cinematic-media');await mkdir(out,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port,checks=[],errors=[];
const check=(name,evidence)=>{checks.push({name,evidence});console.log('PASS '+name);};
const navigate=async(page,progress)=>{
  await page.evaluate(p=>{const s=document.querySelector('#film');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p);},progress);
  await page.waitForFunction(p=>{const s=window.cinematicDemo?.getState();return s&&s.duration>0&&Math.abs(s.mediaProgress-p)<.035;},progress,{timeout:15000});
};
const pixels=page=>page.locator('video').evaluate(video=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=40;canvas.getContext('2d').drawImage(video,0,0,64,40);return canvas.toDataURL();});
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  for(const [width,height]of [[1440,900],[390,844],[320,667]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/examples/cinematic-media/');
    await page.waitForFunction(()=>window.cinematicDemo);
    await navigate(page,0);const first=await pixels(page);
    await navigate(page,.6);const middle=await pixels(page);assert.notEqual(first,middle);
    const midTime=await page.locator('#film').getAttribute('data-cinematic-time');assert(Number(midTime)>2);
    const transform=await page.locator('.film-copy').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(transform,'none');
    const cueY=await page.locator('.film-copy').evaluate(el=>Number(el.style.getPropertyValue('--cinematic-y')));assert(cueY<-22&&cueY>-36);
    await page.locator('.film-stage').screenshot({path:path.join(out,'film-'+width+'.png')});
    await navigate(page,1);await navigate(page,.25);const back=await page.locator('#film').getAttribute('data-cinematic-time');assert(Math.abs(Number(back)-1)<.15);
    const state=await page.evaluate(()=>window.cinematicDemo.getState());assert.equal(state.variant,width>720?'wide':'portrait');assert(state.source.endsWith(width>720?'demo-wide.mp4':'demo-portrait.mp4'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    check('film-forward-reverse-'+width,'Decoded film pixels change, arbitrary/reverse seek settles at the requested time, a single appropriate source is selected, and no horizontal overflow occurs.');
    if(width===1440){
      await page.setViewportSize({width:390,height:844});await navigate(page,.6);assert.equal(await page.evaluate(()=>window.cinematicDemo.getState().variant),'portrait');
      await page.setViewportSize({width,height});await navigate(page,.25);assert.equal(await page.evaluate(()=>window.cinematicDemo.getState().variant),'wide');assert.equal(await page.locator('video').count(),1);
      check('responsive-source-replacement','A live viewport change selects portrait and then wide again, preserving the requested media position with one video element.');
    }
    await page.locator('[data-motion]').click();assert.equal(await page.locator('#film').getAttribute('data-cinematic-state'),'static');assert.equal(await page.locator('video').getAttribute('src'),null);
    await page.locator('.film-stage').screenshot({path:path.join(out,'still-'+width+'.png')});
    await page.locator('a[href="#after-film"]').click();assert(await page.locator('#after-film').evaluate(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}));
    check('still-and-skip-'+width,'Still control releases the video source and the skip link reaches the following content.');
    await context.close();
  }
  {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),requests=[];
    page.on('request',r=>{if(/\.mp4/.test(r.url()))requests.push(r.url());});await page.goto(base+'/examples/cinematic-media/');
    await page.waitForFunction(()=>window.cinematicDemo?.getState().state==='static');assert.equal(requests.length,0);assert.equal(await page.locator('[data-motion]').getAttribute('aria-pressed'),'false');
    await page.locator('[data-motion]').click();await navigate(page,.5);assert(requests.every(url=>url.includes('portrait')));
    check('reduced-motion-opt-in','Reduced motion starts as a readable still without any film request; local opt-in loads only the portrait film.');await context.close();
  }
  {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage(),requests=[];
    page.on('request',r=>{if(/\.mp4/.test(r.url()))requests.push(r.url());});await page.goto(base+'/examples/cinematic-media/');
    assert(await page.locator('#film-title').isVisible());assert(await page.locator('.fallback img').evaluate(img=>img.complete&&img.naturalWidth>0));assert.equal(requests.length,0);
    check('no-javascript','The poster, semantic heading and native navigation work with no video request.');await context.close();
  }
  {
    const context=await browser.newContext({reducedMotion:'no-preference'}),page=await context.newPage();await page.route('**/*.mp4',route=>route.abort());await page.goto(base+'/examples/cinematic-media/');
    await page.locator('#film').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#film').dataset.cinematicState==='error');assert(await page.locator('#film-title').isVisible());assert(await page.locator('.fallback img').evaluate(img=>img.complete&&img.naturalWidth>0));
    check('failed-media','A failed film request keeps the poster, headline and controls available.');await context.close();
  }
  {
    const context=await browser.newContext({reducedMotion:'no-preference'}),page=await context.newPage();await page.goto(base+'/studio/engine/');await page.locator('[name=cinematicMotion]').check();await page.locator('#design-form button[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#file-choice').textContent.includes('cinematic-scene.json'));
    await page.locator('#file-choice').selectOption('design-system/motion/cinematic-production.json');assert.match(await page.locator('#file-output').textContent(),/portrait|mobile/);
    check('studio-cinematic-brief','The visible studio choice reaches the design API and returns both cinematic scene and production files.');await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile(path.join(out,'verification.json'),JSON.stringify({checks,browserErrors:errors,limitations:['Desktop Chrome emulation; no physical phone or Safari run.','No automatic optical tracking or depth inference.']},null,2)+'\n');
  console.log('Verified '+checks.length+' cinematic browser groups.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
