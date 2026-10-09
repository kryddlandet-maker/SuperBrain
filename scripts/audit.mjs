import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {captureDOM} from '../lib/visual-audit.mjs';
import {auditSnapshot,creativeReview,refinementPlan} from '../lib/critique.mjs';
import {planDesign} from '../lib/design-engine.mjs';
export async function auditURL(url,out,{brief={name:'Review',type:'other',goal:'Verify the actual visitor task'},widths=[1440,768,390],interactions=[],checkLinks=true}={}){
 const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))throw new Error('Audit requires an HTTP(S) URL');
 const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
 await mkdir(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'})});
 const snapshots=[],audits=[],errors=[],states=[],linkChecks=[],checkedLinks=new Set();
 try{for(const width of widths)for(const motion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion}),page=await context.newPage();
 page.on('pageerror',e=>errors.push({url,viewport:width,message:e.message}));
 const response=await page.goto(url,{waitUntil:'networkidle'});if(!response?.ok())throw new Error('Page load failed: '+response?.status());
 await page.evaluate(()=>document.fonts.ready);
 const snapshot=await page.evaluate(captureDOM);const artifact='render-'+width+'-'+motion+'.png';
 await page.screenshot({path:path.join(out,artifact),fullPage:true});snapshot.artifact=artifact;snapshots.push(snapshot);const measured=auditSnapshot(snapshot);audits.push(measured);
 if(checkLinks)for(const href of snapshot.links){
 const target=new URL(href);target.hash='';if(target.origin!==parsed.origin||target.search||/logout|signout|delete|unsubscribe|remove|checkout/i.test(target.pathname)){if(!checkedLinks.has(target.href))linkChecks.push({url:target.href,status:'unverified',reason:'External, query or potentially state-changing destination requires explicit authorized review.'});checkedLinks.add(target.href);continue;}
 if(checkedLinks.has(target.href)||checkedLinks.size>=40)continue;checkedLinks.add(target.href);
 try{const linkResponse=await context.request.head(target.href);const status=linkResponse.status();linkChecks.push({url:target.href,status});if(status>=400&&![405,501].includes(status))measured.findings.push({rule:'link-load',severity:'P1',selector:'a[href="'+href+'"]',observation:'Same-origin destination returned HTTP '+status+' to HEAD; confirm its actual navigation before correction.',fix:'Inspect and correct the native destination or document access requirements.',url:snapshot.url,viewport:snapshot.viewport});else if([405,501].includes(status))measured.unverified.push({criterion:'link-load',url:target.href,reason:'Server does not support HEAD; exercise native navigation.'});}catch(error){linkChecks.push({url:target.href,status:'unverified',reason:error.message});}
 }
 for(const action of interactions){const locator=page.locator(action.selector);if(action.kind==='hover')await locator.hover();else if(action.kind==='click')await locator.click();else if(action.kind==='fill')await locator.fill(action.value);else if(action.kind==='press')await locator.press(action.value);else throw new Error('Unknown interaction kind');if(action.expect)await page.getByText(action.expect,{exact:false}).waitFor();const stateArtifact='state-'+width+'-'+motion+'-'+states.length+'.png';await page.screenshot({path:path.join(out,stateArtifact),fullPage:true});states.push({width,motion,action,artifact:stateArtifact});}
 // Verify the actual focus path without activating controls.
 const focus=[];for(let i=0;i<5;i++){await page.keyboard.press('Tab');focus.push(await page.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.textContent?.trim().slice(0,80),outline:getComputedStyle(document.activeElement).outlineStyle,shadow:getComputedStyle(document.activeElement).boxShadow})));}
 states.push({width,motion,kind:'keyboard-focus',focus});await context.close();
 }}finally{await browser.close();}
 const review=creativeReview(planDesign(brief),snapshots),result={schema:1,url,snapshots,audits,states,errors,linkChecks,creative:review,refinement:refinementPlan(audits,review),limitations:['Optional Playwright and a compatible browser are required.','Real submission/booking actions run only when explicitly supplied as authorized interaction fixtures.','Other engines and physical devices are not certified.']};
 await writeFile(path.join(out,'audit.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [url,out,briefFile]=process.argv.slice(2);if(!url||!out)throw new Error('Usage: node scripts/audit.mjs URL evidence-directory [brief.json]');
 const result=await auditURL(url,out,briefFile?{brief:JSON.parse(await readFile(briefFile,'utf8'))}:{});
 console.log(JSON.stringify({snapshots:result.snapshots.length,findings:result.audits.reduce((n,a)=>n+a.findings.length,0),errors:result.errors,creative:result.creative.status,out},null,2));if(result.errors.length||result.audits.some(a=>a.findings.some(f=>f.severity==='P1')))process.exitCode=1;
}
