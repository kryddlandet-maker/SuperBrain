import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:{channel:'msedge'})});
const checks=[],errors=[];
try {
 for(const mode of ['default','no-preference','reduce']){
  const context=await browser.newContext(mode==='default'?{}:{reducedMotion:mode}),page=await context.newPage();page.on('pageerror',e=>errors.push({mode,url:page.url(),name:e.name,message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({mode,message:m.text()});});page.on('response',r=>{if(r.status()>=400)errors.push({mode,url:r.url(),status:r.status()});});
  for(const [family,slugs] of [['technology',['product','approach','contact']],['salon',['services','team','booking']],['construction',['services','projects','contact']]]){
   const home=base+'/examples/'+family+'/';await page.goto(home);
   for(const slug of slugs){const target=home+slug+'/';await page.locator('.navigation a[href="/examples/'+family+'/'+slug+'/"]').click();await page.locator('h1').waitFor();assert.equal(page.url(),target);await page.goBack();await page.locator('.navigation').waitFor();assert.equal(page.url(),home);}
   checks.push({mode,family,result:'pass',detail:'All three native undersides and back navigation, primary heading and no runtime errors'});
  }
  await page.goto(base+'/examples/pointer-buttons/');await page.getByRole('link',{name:'Orbit',exact:true}).click();await page.locator('.hero').waitFor();assert.equal(page.url(),base+'/examples/technology/');await page.goBack();await page.locator('.controls').waitFor();assert.equal(page.url(),base+'/examples/pointer-buttons/');
  await page.goto(base+'/examples/effects/');await page.locator('.project-card').click();await page.locator('.detail-image').waitFor();assert.equal(page.url(),base+'/examples/effects/project/');await page.goBack();await page.locator('.project-card').waitFor();assert.equal(page.url(),base+'/examples/effects/');
  checks.push({mode,family:'pointer-lab-and-project',result:'pass',detail:'Actual native cross-document and image-detail links, back navigation; skipped transitions do not become unhandled rejections'});
  await context.close();console.log('PASS navigation '+mode);
 }
 assert.deepEqual(errors,[]);
 const report={date:new Date().toISOString(),browser:await browser.version(),scope:'Local Edge native document navigation in default, explicit no-preference and reduce modes. Does not certify other browser engines or production.',checks,errors};await writeFile(new URL('../docs/evidence/navigation-browser.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log('Passed '+checks.length+' navigation checks.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
