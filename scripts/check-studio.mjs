import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from './serve.mjs';
import {loadStudioCatalog} from '../lib/studio-catalog.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const out=path.resolve(process.argv[2]||'artifacts/studio-inspiration');await mkdir(out,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port,catalog=await loadStudioCatalog(),checks=[],errors=[];
const pass=(name,evidence)=>{checks.push({name,evidence});console.log('PASS '+name);};
const ready=page=>page.waitForFunction(()=>document.querySelectorAll('.study-card').length>0&&document.querySelector('#study-grid').getAttribute('aria-busy')==='false');
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.studioCopied=text;}}});});
  await page.goto(base);await ready(page);assert.equal(await page.locator('.study-card').count(),catalog.items.length);
  await page.waitForFunction(()=>[...document.querySelectorAll('.study-card img')].slice(0,6).every(img=>img.complete&&img.naturalWidth>0));assert(await noOverflow(page));
  await page.locator('.study-card img').evaluateAll(images=>Promise.all(images.slice(0,6).map(img=>img.decode())));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:path.join(out,'desktop.png')});pass('catalog-and-previews','All catalog entries render; actual local preview images load and the desktop has no overflow.');
  await page.locator('[data-category=buttons]').click();assert.equal(await page.locator('.study-card').count(),catalog.items.filter(item=>item.category==='buttons').length);assert(new URL(page.url()).searchParams.get('category')==='buttons');
  await page.locator('#studio-search').fill('fyllning fran vanster');assert.equal(await page.locator('.study-card').count(),1);assert.equal(await page.locator('.study-card').getAttribute('data-study-id'),'fill-left');
  await page.locator('#studio-search').fill('hittas-inte-xyz');assert(await page.locator('#empty-state').isVisible());await page.locator('#empty-reset').click();assert.equal(await page.locator('.study-card').count(),catalog.items.length);
  pass('search-filter-reset','Category and accent-insensitive Swedish search combine correctly; zero results offers a working reset.');
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.locator('[data-category=buttons]').click();assert.equal(await page.evaluate(()=>scrollY),0);
  await page.locator('[data-study-id=fill-left] .study-trigger').click();await page.locator('[data-viewport=mobile]').click();
  await page.waitForFunction(()=>{const frame=document.querySelector('#live-preview iframe'),button=frame?.contentDocument?.querySelector('#fill-left button');if(!button)return false;const r=button.getBoundingClientRect();return r.top>=0&&r.bottom<=frame.contentWindow.innerHeight;});await page.locator('#close-dialog').click();await page.locator('[data-view=all]:visible').click();
  pass('navigation-position-and-responsive-target','Category changes return to the result beginning, and the selected effect remains in view after a mobile preview reflow.');
  await page.locator('[data-study-id=workflow-scene] .study-trigger').click();assert(await page.locator('#study-dialog').isVisible());
  await page.waitForFunction(()=>document.querySelector('#live-preview iframe')?.contentDocument?.querySelector('#workflow'));
  await page.locator('[data-viewport=mobile]').click();await page.waitForFunction(()=>Math.round(document.querySelector('#live-preview iframe').getBoundingClientRect().width)===390);
  await page.locator('#dialog-save').click();assert.equal(await page.locator('#dialog-save').getAttribute('aria-pressed'),'true');await page.screenshot({path:path.join(out,'live-preview.png')});
  await page.keyboard.press('Escape');assert(!(await page.locator('#study-dialog').isVisible()));assert.equal(await page.locator('#live-preview iframe').count(),0);
  await page.locator('[data-view=saved]:visible').click();assert.equal(await page.locator('.study-card').count(),1);await page.reload();await ready(page);assert.equal(await page.locator('.study-card').getAttribute('data-study-id'),'workflow-scene');
  await page.locator('#copy-ideas').click();assert.match(await page.evaluate(()=>window.studioCopied),/\/examples\/product-motion\/#workflow/);
  pass('live-preview-and-saved-board','A real study loads in one iframe, mobile sizing works, Escape releases it, and saved choices survive reload and reach the copy action. Clipboard content is captured locally during this check.');
  await page.locator('#saved-brief').click();await page.locator('#inspiration-selection').waitFor({state:'visible'});assert(await page.locator('input[name=techniques][value=scenes]').isChecked());
  await page.locator('[name=name]').fill('Mitt inspirationsbygge');await page.locator('[name=goal]').fill('Visa ett verkligt arbetsflöde');await page.locator('[name=direction]').fill('Ljust och precist, med tydlig typografi.');
  await page.locator('#brief-form button[type=submit]').click();await page.locator('#result').waitFor({state:'visible'});
  const brief=await page.locator('#brief-output').inputValue();assert.match(brief,/Mitt inspirationsbygge/);assert.match(brief,/\/examples\/product-motion\/#workflow/);assert.match(brief,/Ljust och precist/);assert.match(brief,/product-motion/);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;assert.equal(await readFile(await download.path(),'utf8'),brief);
  await page.locator('#inspiration-selection button').click();assert(!(await page.locator('#inspiration-selection').isVisible()));assert(!(await page.locator('input[name=techniques][value=scenes]').isChecked()));
  pass('inspiration-to-real-brief','Saved study references and suggested techniques reach the real brief API and downloaded Markdown while preserving authored direction. Removing untouched suggestions clears them.');
  await page.goto(base+'/?category=scroll&q=film');await ready(page);const expected=catalog.items.filter(item=>item.category==='scroll'&&/film/i.test(item.title+' '+item.description+' '+item.keywords.join(' ')));assert.equal(await page.locator('.study-card').count(),expected.length);
  await page.locator('.study-trigger').first().click();await page.goBack();await page.waitForFunction(()=>!document.querySelector('#study-dialog').open);assert(new URL(page.url()).searchParams.get('category')==='scroll');
  pass('deep-links-and-back','Shared filter URLs reproduce their result set and browser Back closes a preview while preserving the category.');
  await context.close();
  for(const width of[768,390,320]){
    const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await ready(p);assert(await noOverflow(p));
    if(width<760){await p.locator('#mobile-category').selectOption('product');assert.equal(await p.locator('.study-card').count(),catalog.items.filter(item=>item.category==='product').length);await p.locator('.study-trigger').first().click();assert(await p.locator('#study-dialog').isVisible());assert(await noOverflow(p));await p.locator('#close-dialog').click();await p.locator('#mobile-category').selectOption('all');}
    await p.screenshot({path:path.join(out,'width-'+width+'.png')});pass('responsive-'+width,'Readable category navigation, cards and preview controls fit this viewport under reduced motion.');await ctx.close();
  }
  {
    const ctx=await browser.newContext(),p=await ctx.newPage();await p.route('**/api/studio',route=>route.fulfill({status:503,body:'Unavailable'}));await p.goto(base);await p.locator('#load-error').waitFor({state:'visible'});await p.unroute('**/api/studio');await p.locator('#retry-load').click();await ready(p);pass('failed-catalog-retry','An unavailable catalog displays a useful error and retry recovers the real library.');await ctx.close();
  }
  {
    const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),p=await ctx.newPage();await p.goto(base);assert(await p.locator('.fallback-links a[href="/examples/buttons/"]').isVisible());await p.locator('.fallback-links a[href="/examples/buttons/"]').click();assert(p.url().includes('/examples/buttons/'));pass('no-javascript-navigation','Native fallback links reach real studies when JavaScript is disabled.');await ctx.close();
  }
  assert.deepEqual(errors,[]);await writeFile(path.join(out,'verification.json'),JSON.stringify({checks,browserErrors:errors,limits:['Chrome desktop and mobile emulation; no physical-device run.','Static thumbnails are genuine sampled frames; live behavior is available in the selected original study.']},null,2)+'\n');console.log('Verified '+checks.length+' studio groups.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
