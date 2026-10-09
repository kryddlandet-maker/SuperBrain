// Local product regression. Run on the connected Windows host; evidence is scoped.
import {createRequire} from 'node:module';
import {readdir,mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root} from '../lib/brief.mjs';
import {createServer} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,checks=[],errors=[];
const evidence=path.join(root,'docs/evidence');await mkdir(evidence,{recursive:true});
const check=(name,details)=>checks.push({name,result:'pass',details});
function observe(page){page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});}
async function routes(dir){const result=[];for(const ent of await readdir(path.join(root,dir),{withFileTypes:true})){if(ent.isDirectory())result.push(...await routes(dir+'/'+ent.name));else if(ent.name==='index.html')result.push('/'+dir+'/');}return result;}
const urls=['/',...await routes('examples')];
const sample=async el=>el.evaluate(e=>{const s=getComputedStyle(e,'::before');return {opacity:+s.opacity,left:parseFloat(s.left),top:parseFloat(s.top)};});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'})});
 for(const [width,motion] of [[1440,'no-preference'],[768,'no-preference'],[390,'reduce'],[632,'reduce'],[320,'no-preference']]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion});const page=await context.newPage();observe(page);
  for(const url of urls){const response=await page.goto(base+url);assert.equal(response.status(),200,url);await page.locator('main').waitFor();
   const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('main *,header *,footer *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(el).position!=='absolute').slice(0,8).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,40),right:el.getBoundingClientRect().right}))}));
   assert(overflow.scroll<=width+1,url+' overflow '+JSON.stringify(overflow));
   assert.equal(await page.locator('main .eyebrow,main .kicker,main .row-number,main .index').count(),0,url+' decorative labels');
   assert.equal(await page.locator('h1').count(),1,url+' primary heading');
  }
  check('all-routes-'+width+'-'+motion,{routes:urls.length,scope:'Direct loading, primary heading, no horizontal page overflow, no decorative numbered/eyebrow headings'});await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();observe(page);
 await page.goto(base+'/');await page.locator('[name=name]').fill('Lokal teststudio');await page.selectOption('[name=type]','salon');await page.selectOption('[name=motion]','quiet');
 await page.locator('[name=goal]').fill('Förstå tjänsterna och hitta nästa steg');await page.locator('[name=techniques]').selectOption('buttons');
 await page.locator('[type=submit]').click();await page.locator('#result').waitFor({state:'visible'});
 const brief=await page.locator('#brief-output').inputValue();assert.match(brief,/Lokal teststudio/);assert.match(brief,/button-interactions/);assert.match(brief,/decorative 01\/02\/03/);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
 assert.equal((await readFile(await download.path(),'utf8')).replace(/\r\n/g,'\n'),brief.replace(/\r\n/g,'\n'));check('brief-export','Actual local form submission compiles selected knowledge; downloaded Markdown matches output with normalized line endings; no external submission');
 await page.goto(base+'/examples/atlas/');await page.locator('.atlas-controls').waitFor({state:'visible'});
 await page.locator('#technique-search').fill('ljus');assert((await page.locator('.technique:visible').count())>0);assert((await page.locator('.technique:visible').count())<54);
 await page.locator('#technique-search').fill('zzzz-no-match');assert.equal(await page.locator('.technique:visible').count(),0);
 await page.locator('#technique-search').fill('');assert.equal(await page.locator('.technique:visible').count(),54);check('atlas-search','Search, zero-results and clearing restore the correct cards');
 await page.goto(base+'/examples/library/');await page.waitForFunction(()=>document.querySelector('#status').textContent==='86 träffar.');
 await page.selectOption('[name=state]','TESTED');await page.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='4 träffar.');
 await page.selectOption('[name=state]','PRODUCTION-READY');await page.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='0 träffar.');
 check('library-maturity','Four scoped TESTED records; no fabricated production-ready results');
 await page.goto(base+'/examples/collection/');await page.locator('[data-product-step=connect]').click();assert.equal(await page.locator('[data-product-demo]').getAttribute('data-state'),'connect');
 await page.locator('[data-product-step=finish]').click();assert.equal(await page.locator('[data-product-demo]').getAttribute('data-state'),'finish');
 assert.match(await page.locator('[data-product-demo] [role=status]').textContent(),/Landa/);
 await page.locator('#light-comparison').fill('85');await page.locator('#light-comparison').dispatchEvent('input');assert.equal(await page.locator('[data-compare] output').textContent(),'85%');
 for(const [filter,count] of [['object',2],['space',2],['all',4]]){await page.locator('[data-filter='+filter+']').click();assert.equal(await page.locator('[data-category]:visible').count(),count);}
 await page.locator('[data-color=ink]').click();assert.equal(await page.locator('.shop-lamp').getAttribute('data-color'),'ink');assert.match(await page.locator('#color-status').textContent(),/Bläck/);
 await page.locator('.product-rail').focus();for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert((await page.locator('.product-rail').evaluate(el=>el.scrollLeft))>0);
 check('collection-actions','Product steps, comparison slider, rapid reversible gallery filters, lamp color and horizontal keyboard scroll change real state');
 await page.locator('#light').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 const renderer=await page.locator('#light-canvas').getAttribute('data-renderer');
 if(renderer==='webgl'){await page.locator('#light-play').click();assert.equal(await page.locator('#light-play').getAttribute('aria-pressed'),'true');await page.locator('#light-play').click();assert.equal(await page.locator('#light-play').getAttribute('aria-pressed'),'false');}
 check('light-renderer',{renderer:renderer||'static-fallback',scope:renderer==='webgl'?'GPU frame drawn; play/pause works':'Supported static fallback remains visible; GPU execution not certified'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-product-step=plan]').click();assert.equal(await page.locator('[data-product-demo]').getAttribute('data-state'),'plan');
 await page.locator('#motion-preview').check();await page.locator('[data-filter=object]').click();assert.equal(await page.locator('[data-category]:visible').count(),2);
 check('collection-reduced','Product actions and filters remain available with reduced motion and stationary preview');
 for(const width of [1440,632,390]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/examples/effects/');await page.locator('[data-motion-status]').waitFor();
  const scene=page.locator('[data-scroll-scene]');await scene.scrollIntoViewIfNeeded();assert.equal(await scene.getAttribute('data-motion'),'static');
  assert.equal(await scene.evaluate(el=>getComputedStyle(el.querySelector('.scene-orbit')).transform),'none');
  await page.locator('[data-preview-motion]').check();await page.locator('[href="#scene"]').click();
  const geometry=await scene.evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight,view:innerHeight}));
  const read=()=>scene.evaluate(el=>({p:+el.style.getPropertyValue('--scene-progress'),state:el.dataset.sceneState,transform:getComputedStyle(el.querySelector('.scene-orbit')).transform}));
  const move=async fraction=>{await page.evaluate(y=>window.scrollTo(0,y),geometry.top-geometry.view*.15+fraction*(geometry.height-geometry.view*.85));await page.waitForTimeout(100);return read();};
  const start=await move(0),middle=await move(.5),end=await move(1),reverse=await move(.15);
  assert(start.p<.02&&middle.p>.45&&middle.p<.55&&end.p>.98&&reverse.p>.1&&reverse.p<.2);
  assert.notEqual(middle.transform,start.transform);assert.equal(end.state,'resolve');assert.equal(reverse.state,'gather');
  if(width===632){await move(0);await page.screenshot({path:path.join(evidence,'scroll-narrow-preview.png')});}
  await page.locator('[data-still-motion]').check();await scene.scrollIntoViewIfNeeded();assert.equal(await scene.getAttribute('data-motion'),'static');
  check('scroll-'+width,{scope:'Real scroll events: start/middle/end/reverse; reduced-motion static default, explicit page preview, stationary precedence',start,middle,end,reverse});
 }
 await page.goto(base+'/examples/technology/');const light=page.locator('.hero .light-button');await page.mouse.move(2,2);assert.equal((await sample(light)).opacity,0);
 await page.locator('[data-preview-motion]').check();await light.scrollIntoViewIfNeeded();const box=await light.boundingBox();
 await page.mouse.move(box.x+20,box.y+10);await page.waitForTimeout(100);const left=await sample(light);
 await page.mouse.move(box.x+box.width-20,box.y+box.height-5);await page.waitForTimeout(100);const right=await sample(light);
 assert(left.opacity>.9&&right.left>left.left+box.width/3&&right.top===left.top);
 await page.mouse.move(2,2);await page.waitForTimeout(250);assert.equal((await sample(light)).opacity,0);
 assert.equal(await page.locator('.hero .kicker').count(),0);assert.equal(await page.locator('.row-number').count(),0);
 await light.click();assert.match(page.url(),/technology\/product\/$/);await page.goBack();await page.locator('[data-motion-controls]').waitFor({state:'visible'});await page.goForward();assert.match(page.url(),/technology\/product\/$/);
 check('orbit','No rest light; horizontal following with fixed y; fades after leave; cleaned headings; actual product navigation and back/forward');
 await page.goto(base+'/examples/effects/');await page.locator('[data-tone=precise]').click();assert.equal(await page.locator('body').getAttribute('data-tone'),'precise');
 await page.locator('[data-demo-action]').first().click();assert.match(await page.locator('#action-status').textContent(),/1 gång/);
 await page.locator('.project-card').click();assert.match(page.url(),/effects\/project\/$/);await page.goBack();
 const before=Number((await page.locator('#action-status').textContent()).match(/aktiverad (\d+)/)?.[1]||0);
 await page.locator('[data-demo-action]').first().click();assert.equal(Number((await page.locator('#action-status').textContent()).match(/aktiverad (\d+)/)[1]),before+1);
 check('effects-actions','Tone controls, exactly one activation, image detail route and back navigation without duplicated listeners');
 assert.deepEqual(errors,[]);check('runtime-errors','No missing resources, uncaught page exceptions or browser console errors');
 const report={date:new Date().toISOString(),browser:await browser.version(),host:process.env.COMPUTERNAME,scope:'Local Windows Edge automation. All document routes at five viewport/preference combinations plus functional journeys. Emulation does not certify physical devices, Firefox/WebKit, screen readers or production.',routes:urls,checks,errors};
 await writeFile(path.join(evidence,'product-browser.json'),JSON.stringify(report,null,2)+'\n');console.log('Passed '+checks.length+' product checks across '+urls.length+' routes.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
