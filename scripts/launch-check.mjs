import {mkdir,writeFile,lstat,readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const execute=promisify(execFile);
export async function checkLaunch(origin,output,{routes=['/'],lighthouse=false,cli=process.env.SUPERBRAIN_LIGHTHOUSE}={}){
  const base=new URL(origin);if(base.username||base.password||base.pathname!=='/'||base.search||base.hash||base.protocol!=='https:'&&!(base.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(base.hostname)))throw new Error('Choose an HTTPS origin or an explicit local test server');
  if(!Array.isArray(routes)||!routes.length||routes.length>30||routes.some(route=>typeof route!=='string'||!/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(route)))throw new Error('Use up to 30 explicit local routes');
  const target=path.resolve(output);try{await lstat(target);throw new Error('Launch report output already exists');}catch(error){if(error.code!=='ENOENT')throw error;}
  const report={schema:1,origin:base.origin,createdAt:new Date().toISOString(),pages:[],crawl:[],lighthouse:[],limits:['Observed HTTP responses and optional lab scores do not establish Google indexing, real-user performance or functioning customer forms.']};
  async function get(route){
    try{const response=await fetch(new URL(route,base),{redirect:'manual',signal:AbortSignal.timeout(15000)}),reader=response.body?.getReader();let text='',size=0;
      if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2*1024*1024){await reader.cancel();throw new Error('Response exceeds the 2 MiB audit limit');}text+=new TextDecoder().decode(value,{stream:true});}
      return {route,status:response.status,location:response.headers.get('location'),headerNoindex:/\bnoindex\b/i.test(response.headers.get('x-robots-tag')||''),text};
    }catch(error){return {route,status:null,error:error.message,text:''};}
  }
  for(const route of [...new Set(routes)]){const {text,...result}=await get(route);report.pages.push({...result,title:text.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||null,metaNoindex:/<meta\b(?=[^>]*\bname\s*=\s*["'](?:robots|googlebot)["'])(?=[^>]*\bcontent\s*=\s*["'][^"']*\bnoindex\b)[^>]*>/i.test(text),canonical:text.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*\bhref\s*=\s*["']([^"']+)/i)?.[1]||null});}
  for(const route of ['/robots.txt','/sitemap.xml']){const {text,...result}=await get(route);report.crawl.push({...result,disallowsAll:route==='/robots.txt'&&/^Disallow:\s*\/\s*$/im.test(text),hasSitemap:route==='/robots.txt'&&/^Sitemap:\s*https?:/im.test(text),hasURLs:route==='/sitemap.xml'&&/<loc>https?:\/\//.test(text)});}
  await mkdir(target,{recursive:false});
  if(lighthouse&&cli){for(const formFactor of ['desktop','mobile']){
    try{const file=path.join(target,'lighthouse-'+formFactor+'.json'),args=[path.resolve(cli),base.href,'--output=json','--output-path='+file,'--chrome-flags=--headless --no-sandbox','--quiet',...(formFactor==='desktop'?['--preset=desktop']:[])];await execute(process.execPath,args,{windowsHide:true,maxBuffer:1024*1024,timeout:180000});const result=JSON.parse(await readFile(file,'utf8'));report.lighthouse.push({formFactor,status:'executed',version:result.lighthouseVersion,url:result.finalDisplayedUrl||result.finalUrl,scores:Object.fromEntries(Object.entries(result.categories).map(([id,category])=>[id,category.score])),report:path.basename(file)});}catch(error){report.lighthouse.push({formFactor,status:'failed',reason:error.message.slice(0,1200)});}
  }}else report.lighthouse.push({status:'not-run',reason:lighthouse?'Set SUPERBRAIN_LIGHTHOUSE to an installed Lighthouse CLI JS entry.':'Lighthouse was not requested.'});
  report.httpPassed=report.pages.every(page=>page.status===200&&!page.headerNoindex&&!page.metaNoindex)&&report.crawl.every(page=>page.status===200&&!page.disallowsAll);
  await writeFile(path.join(target,'launch-check.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const args=process.argv.slice(2);if(args.length===1&&args[0]==='--help')console.log('Usage: node scripts/launch-check.mjs <https-origin> <new-report-folder> [--lighthouse]\nSet SUPERBRAIN_LIGHTHOUSE to an installed Lighthouse CLI JS entry for real desktop/mobile lab reports.');else if(args.length<2||args.length>3||args.length===3&&args[2]!=='--lighthouse')throw new Error('Use --help for launch audit arguments');else checkLaunch(args[0],args[1],{lighthouse:args[2]==='--lighthouse'}).then(report=>{console.log(JSON.stringify(report,null,2));if(!report.httpPassed)process.exitCode=1;}).catch(error=>{console.error(error.message);process.exitCode=1;});}
