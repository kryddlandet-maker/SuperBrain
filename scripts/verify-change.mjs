import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateChangeSpec,captureChange,compareChange} from '../lib/change-proof.mjs';
export async function recordChange(url,spec,output){
 validateChangeSpec(spec);const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw new Error('Choose an HTTP(S) preview URL');
 const target=path.resolve(output);try{await lstat(target);throw new Error('Capture output already exists');}catch(error){if(error.code!=='ENOENT')throw error;}
 const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright'),browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'msedge'})});
 try{const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});const response=await page.goto(url);if(!response?.ok())throw new Error('Page load failed: '+response?.status());await page.evaluate(()=>document.fonts.ready);await page.locator(spec.target).waitFor();const snapshot=await page.evaluate(captureChange,spec);await mkdir(target,{recursive:true});await page.screenshot({path:path.join(target,'page.png'),fullPage:true});await writeFile(path.join(target,'snapshot.json'),JSON.stringify(snapshot,null,2)+'\n');return snapshot;}finally{await browser.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const [mode,a,b,c]=process.argv.slice(2);if(mode==='capture'&&a&&b&&c)recordChange(a,JSON.parse(await readFile(b,'utf8')),c).then(()=>console.log('Captured real browser state.')).catch(e=>{console.error(e.message);process.exitCode=1;});else if(mode==='compare'&&a&&b&&!c){const report=compareChange(JSON.parse(await readFile(a,'utf8')),JSON.parse(await readFile(b,'utf8')));console.log(JSON.stringify(report,null,2));if(report.issues.length)process.exitCode=1;}else throw new Error('Usage: verify-change.mjs capture URL spec.json new-folder | compare before/snapshot.json after/snapshot.json');}
