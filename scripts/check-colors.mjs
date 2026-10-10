
import {createRequire} from 'node:module';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';import assert from 'node:assert/strict';
import {root} from '../lib/brief.mjs';import {createServer} from './serve.mjs';
import {colorFamilies} from '../lib/color-direction.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/studio/engine/';
const checks=[],errors=[],out=path.join(root,'docs/evidence/colors');await mkdir(out,{recursive:true});let browser;
const rgb=hex=>'rgb('+[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)).join(', ')+')';
try{
 browser=await chromium.launch({headless:true,channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'});
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  const generate=async()=>{await page.getByRole('button',{name:'Skapa förslag',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Förslaget är klart'));};
  const downloadJSON=async id=>{const promise=page.waitForEvent('download');await page.locator(id).click();const download=await promise;return JSON.parse(await readFile(await download.path(),'utf8'));};
  for(const family of colorFamilies)for(const theme of ['light','dark']){
   await page.locator('select[name=paletteFamily]').selectOption(family.id);await page.locator('select[name=theme]').selectOption(theme);await generate();
   const tokens=await downloadJSON('#download-file');
   assert.equal(tokens.tokens.color.background,family[theme][0]);assert.equal(tokens.tokens.color.accent,family[theme][2]);
   assert.equal(await page.frameLocator('#design-preview').locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),rgb(family[theme][0]));
   const brief=await downloadJSON('#download-brief');assert.equal(brief.paletteFamily,family.id);assert.equal(brief.theme,theme);
  }
  checks.push({name:'families-'+width,result:'pass',details:colorFamilies.length+' families in both themes: actual iframe colors and downloaded tokens/brief agree.'});
  await page.locator('select[name=paletteFamily]').selectOption('green');await page.locator('select[name=theme]').selectOption('dark');
  await page.locator('input[name=paletteBackground]').fill('#fff5f8');await page.locator('input[name=paletteInk]').fill('#402030');await page.locator('input[name=accent]').fill('#932345');await generate();
  const custom=await downloadJSON('#download-file');assert.equal(custom.tokens.color.background,'#fff5f8');assert.equal(custom.tokens.color.ink,'#402030');assert.equal(custom.tokens.color.accent,'#932345');
  assert.equal(await page.frameLocator('#design-preview').locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),rgb('#fff5f8'));
  assert.deepEqual((await downloadJSON('#download-brief')).artDirection.palette,['#fff5f8','#402030','#932345']);
  checks.push({name:'brand-precedence-'+width,result:'pass',details:'Full brand palette outranks conflicting dark/green choices in rendering and exports.'});
  const previous=await page.locator('#file-output').textContent();await page.locator('input[name=paletteInk]').fill('');await page.getByRole('button',{name:'Skapa förslag',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#design-status').textContent.startsWith('Kunde inte'));assert.equal(await page.locator('#file-output').textContent(),previous);
  assert.equal((await downloadJSON('#download-file')).tokens.color.background,'#fff5f8');
  await page.locator('input[name=paletteInk]').fill('#402030');await page.locator('select[name=mode]').selectOption('quick-edit');await page.locator('input[name=task]').fill('Justera hover på knappen');await generate();
  assert.equal(await page.locator('#file-choice option').count(),1);assert.match(await page.locator('#decision-output').textContent(),/Preserve the existing system/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('select[name=paletteFamily]').focus();await page.keyboard.press('ArrowUp');assert.equal(await page.locator('select[name=paletteFamily]').inputValue(),colorFamilies.at(-2).id);
  assert(await page.locator('select[name=paletteFamily]').evaluate(el=>getComputedStyle(el).outlineStyle!=='none'));
  checks.push({name:'errors-scope-keyboard-'+width,result:'pass',details:'Incomplete palette keeps prior paired export; quick edit creates no replacement tokens; native keyboard and no horizontal overflow.'});
  await page.locator('select[name=mode]').selectOption('design-build');await page.locator('input[name=paletteBackground]').fill('');await page.locator('input[name=paletteInk]').fill('');await page.locator('input[name=accent]').fill('');
  await page.locator('select[name=paletteFamily]').selectOption('blue');await page.locator('select[name=theme]').selectOption('light');await generate();
  await page.locator('#design-form').screenshot({path:path.join(out,'controls-'+width+'.png')});await page.locator('#design-preview').screenshot({path:path.join(out,'blue-'+width+'.png')});await context.close();
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
 await writeFile(path.join(out,'browser.json'),JSON.stringify({schema:1,date:'2026-10-10',browser:await browser.version(),checks,errors,scope:'Local headless Edge; color controls and real exports at three widths.',limits:['Existing project/demo styles are intentionally unchanged.','Physical devices and whole-product desktop review are not certified.']},null,2)+'\n');
 console.log(JSON.stringify({checks:checks.length,errors:errors.length,report:'docs/evidence/colors/browser.json'}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
