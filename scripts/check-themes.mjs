import {createRequire} from 'node:module';
import {writeFile,mkdir,readFile} from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {root} from '../lib/brief.mjs';import {createServer} from './serve.mjs';import {designThemes} from '../lib/design-themes.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/studio/engine/';
const out=path.join(root,'docs/evidence/themes');await mkdir(out,{recursive:true});const checks=[],errors=[];let browser;
try{
 browser=await chromium.launch({headless:true,channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'});
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.evaluate(()=>{window.downloadClicks=[];document.addEventListener('click',e=>window.downloadClicks.push({id:e.target.id,tag:e.target.tagName,download:e.target.download||'',href:e.target.tagName==='A'?e.target.getAttribute('href'):''}),true);});
  const generate=async()=>{await page.getByRole('button',{name:'Skapa förslag',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));};
  const tokens=async()=>JSON.parse(await page.locator('#file-output').textContent()).tokens;
  const downloadJSON=async id=>{const promise=page.waitForEvent('download',{timeout:10000});await page.locator(id).scrollIntoViewIfNeeded();await page.locator(id).focus();await page.keyboard.press('Enter');try{const file=await promise;return JSON.parse(await readFile(await file.path(),'utf8'));}catch(error){await page.screenshot({path:path.join(out,'download-failure-'+width+'.png')});throw Error(error.message+' UI '+JSON.stringify(await page.evaluate(()=>({clicks:window.downloadClicks,status:document.querySelector('#design-status').textContent,choice:document.querySelector('#file-choice').value,focus:document.hasFocus(),errors:document.querySelector('#preview-note').textContent}))));}};
  for(const theme of designThemes){
   console.log(width+' '+theme.id);await page.locator('select[name=designTheme]').selectOption(theme.id);await generate();const t=await tokens();
   const frame=page.frameLocator('#design-preview');assert.equal(await frame.locator('.sb-button').evaluate(el=>getComputedStyle(el).borderTopLeftRadius),t.radius.control);
   assert.equal(await frame.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily.replace(/["']/g,'')),t.type.display.replace(/["']/g,''));
   assert.equal(await frame.locator('.sb-layout').getAttribute('data-layout'),theme.layout);
   assert.equal(await frame.locator('.sb-card').evaluate(el=>getComputedStyle(el).borderTopWidth),t.appearance.borderWidth);
   assert(await frame.locator('body').evaluate(el=>el.scrollWidth<=innerWidth+1),theme.id+' iframe overflow '+width);
   if([1440,390].includes(width)&&['editorial','brutalist','playful','futuristic'].includes(theme.id))await page.locator('#design-preview').screenshot({path:path.join(out,theme.id+'-'+width+'.png')});
  }
  assert.deepEqual((await downloadJSON('#download-file')).tokens,await tokens());
  const bundle=await downloadJSON('#download-bundle');assert.deepEqual(JSON.parse(bundle['design-system/tokens.json']).tokens,await tokens());
  checks.push({name:'rendered-themes-'+width,result:'pass',details:'All 12 expressions: computed type/radius/border and actual layout agree with export JSON; real token and bundle downloads agree; no iframe overflow.'});
  await page.locator('select[name=designTheme]').selectOption('');await page.locator('input[name=designVariation]').fill('');
  await page.locator('#new-variation').click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));assert.equal(await page.locator('input[name=designVariation]').inputValue(),'0');const first=await tokens();
  await page.locator('#new-variation').click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));assert.equal(await page.locator('input[name=designVariation]').inputValue(),'1');const second=await tokens();assert.notDeepEqual(first,second);
  await generate();assert.deepEqual(await tokens(),second);
  assert.equal((await downloadJSON('#download-brief')).designVariation,1);
  checks.push({name:'variation-roundtrip-'+width,result:'pass',details:'New variation advances and changes actual tokens; saved numeric variation reproduces identical output and downloads in brief.'});
  await page.locator('select[name=designTheme]').selectOption('playful');await page.locator('input[name=paletteBackground]').fill('#fff5f8');await page.locator('input[name=paletteInk]').fill('#402030');await page.locator('input[name=accent]').fill('#932345');
  await page.locator('#new-variation').click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));const brand=await tokens();assert.equal(brand.color.background,'#fff5f8');assert.equal(brand.color.accent,'#932345');assert.equal(brand.radius.control,'24px');
  await page.locator('select[name=mode]').selectOption('quick-edit');await page.locator('input[name=task]').fill('Justera hover på knappen');await generate();const previous=await page.locator('#file-output').textContent(),variation=await page.locator('input[name=designVariation]').inputValue();
  await page.locator('#new-variation').click();assert.equal(await page.locator('input[name=designVariation]').inputValue(),variation);assert.equal(await page.locator('#file-output').textContent(),previous);assert.match(await page.locator('#design-status').textContent(),/Behåll den befintliga/);
  await page.locator('select[name=mode]').selectOption('design-build');await page.locator('input[name=designVariation]').fill('9999');await page.locator('#new-variation').click();assert.equal(await page.locator('input[name=designVariation]').inputValue(),'9999');assert.match(await page.locator('#design-status').textContent(),/Variationsgränsen/);
  await page.locator('select[name=designTheme]').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');assert.equal(await page.locator('select[name=designTheme]').inputValue(),'editorial');assert(await page.locator('select[name=designTheme]').evaluate(el=>getComputedStyle(el).outlineStyle!=='none'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  checks.push({name:'brand-scope-boundaries-'+width,result:'pass',details:'Explicit brand/theme survives variation; quick-edit refuses restyling; upper bound reports honestly; native theme keyboard and page overflow checked.'});await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage();await page.goto(url);await page.locator('#new-variation').tap();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));assert.equal(await page.locator('input[name=designVariation]').inputValue(),'0');await context.close();checks.push({name:'touch-variation',result:'pass',details:'Emulated touch activates new variation under reduced motion.'});
 assert.equal(errors.length,0,JSON.stringify(errors));
 await writeFile(path.join(out,'browser.json'),JSON.stringify({schema:1,date:'2026-10-10',browser:await browser.version(),checks,errors,scope:'Local headless Edge. Selectable themes, generated tokens and explicit variation controls.',limits:['Studies are not complete websites or uniqueness guarantees.','Initial headless theme-suite mouse dispatch did not produce the expected button click event. Final theme checks use native keyboard token/bundle/brief downloads; separate color and engine suites verify pointer downloads.','System font stacks are fallbacks; font licensing/loading, physical devices and whole-product desktop review are not certified.']},null,2)+'\n');console.log(JSON.stringify({checks:checks.length,errors:errors.length}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
