import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root} from '../lib/brief.mjs';
import {createServer} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,out=path.join(root,'docs/evidence/collection-motion');
await mkdir(out,{recursive:true});const checks=[],errors=[];let browser;
const check=(name,details)=>checks.push({name,result:'pass',details});
try{
 browser=await chromium.launch({headless:true,channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'});
 for(const width of [1440,390,320])for(const preference of ['reduce','no-preference']){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:preference}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base+'/examples/collection/');const toggle=page.locator('#motion-toggle');
  await toggle.waitFor({state:'visible'});assert.equal(await toggle.getAttribute('aria-pressed'),String(preference!=='reduce'));
  if(preference==='reduce')assert.equal(await page.locator('#light-play').isVisible(),false);
  else await toggle.click();
  await toggle.press('Enter');assert.equal(await toggle.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#motion-preview').isChecked(),false);
  assert.equal(await page.locator('body').getAttribute('data-motion-preview'),'true');
  await page.locator('[data-product-step=connect]').click();assert.equal(await page.locator('[data-product-demo]').getAttribute('data-state'),'connect');
  assert.equal(await page.locator('.task-one').evaluate(el=>getComputedStyle(el).transitionDuration),'0.5s, 0.4s');
  assert(await page.locator('.product-board').evaluate(el=>el.getAnimations().length>0));
  if(width===1440){const owner=page.locator('[data-depth]'),box=await owner.boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.6);await page.waitForFunction(()=>document.querySelector('[data-depth]').style.getPropertyValue('--depth-x')!=='');}
  await page.locator('#light').scrollIntoViewIfNeeded();await page.locator('#light-canvas[data-renderer=webgl]').waitFor({timeout:8000});
  const play=page.locator('#light-play');if(await play.getAttribute('aria-pressed')==='true')await play.click();await play.click();
  assert.equal(await play.getAttribute('aria-pressed'),'true');
  const first=await page.locator('#light-canvas').screenshot();await page.waitForTimeout(180);const second=await page.locator('#light-canvas').screenshot();assert.notDeepEqual(first,second,'Light must actually advance under explicit reduced-motion override');
  await page.waitForFunction(()=>document.querySelector('#light-play').getAttribute('aria-pressed')==='false',{},{timeout:5500});
  check('activate-'+width+'-'+preference,'Native keyboard activation; real product animation, desktop pointer depth and changing GPU frame; light playback ends automatically.');
  await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('[data-depth]').evaluate(el=>el.style.getPropertyValue('--depth-x')),'');
  await page.locator('[data-product-step=finish]').click();assert.equal(await page.locator('[data-product-demo]').getAttribute('data-state'),'finish');
  assert.equal(await page.locator('.product-board').evaluate(el=>el.getAnimations().length),0);
  assert.equal(await page.locator('.task-one').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.locator('[data-filter=object]').click();assert.equal(await page.locator('[data-category]:visible').count(),2);
  await page.locator('#light-comparison').fill('85');assert.equal(await page.locator('[data-compare] output').textContent(),'85%');
  await page.locator('[data-color=ink]').click();assert.equal(await page.locator('.shop-lamp').getAttribute('data-color'),'ink');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check('pause-'+width+'-'+preference,'Pause clears active effects; product, filtering, comparison and color still work; no page overflow.');
  await page.locator('[data-filter=all]').click();await toggle.click();await page.locator('#motion-preview').check();assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  await toggle.click();assert.equal(await page.locator('#motion-preview').isChecked(),false);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await toggle.getAttribute('aria-pressed'),'true');
  await page.locator('#motion-preview').check();await page.locator('#motion-preview').uncheck();assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  await page.locator('#motion-toggle').screenshot({path:path.join(out,'control-'+width+'-'+preference+'.png')});
  await page.getByRole('link',{name:'Se motivet på en egen undersida ↗'}).click();await page.goBack();await page.locator('#motion-toggle').waitFor({state:'visible'});
  assert(await page.locator('#motion-toggle').isEnabled());check('preferences-history-'+width+'-'+preference,'Stationary precedence, live system preference and native back navigation remain consistent.');
  await context.close();
 }
 const touch=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),touchPage=await touch.newPage();
 await touchPage.goto(base+'/examples/collection/');await touchPage.locator('#motion-toggle').tap();assert.equal(await touchPage.locator('#motion-toggle').getAttribute('aria-pressed'),'true');await touchPage.locator('#motion-toggle').tap();assert.equal(await touchPage.locator('#motion-toggle').getAttribute('aria-pressed'),'false');await touch.close();check('touch','Emulated touch activates and pauses the page control.');
 const nojs=await browser.newContext({javaScriptEnabled:false}),staticPage=await nojs.newPage();await staticPage.goto(base+'/examples/collection/');assert.equal(await staticPage.locator('#motion-toggle').isVisible(),false);assert(await staticPage.locator('h1').isVisible());await nojs.close();check('no-js','Static content remains available and inactive controls remain hidden.');
 assert.deepEqual(errors,[]);await writeFile(path.join(out,'browser.json'),JSON.stringify({schema:1,browser:await browser.version(),checks,errors,scope:'Local Windows headless Edge. Live in-app browser review is recorded separately; no physical-device or cross-engine certification.'},null,2)+'\n');
 console.log(JSON.stringify({checks:checks.length,errors:errors.length}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
