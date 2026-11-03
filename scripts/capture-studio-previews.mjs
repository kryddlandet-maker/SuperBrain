import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {root} from '../lib/brief.mjs';
import {createServer} from './serve.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const within=(base,file)=>{const rel=path.relative(base,file);return !!rel&&!rel.startsWith('..')&&!path.isAbsolute(rel);};
const viewport={width:1100,height:750};
const version=2;
const profileFor=item=>['/examples/buttons/','/examples/pointer-buttons/'].some(route=>item.preview.route.startsWith(route))?{viewport:{width:520,height:650},deviceScaleFactor:1.5}:item.preview.route.startsWith('/examples/product-motion/')?{viewport:{width:720,height:650},deviceScaleFactor:1}:{viewport,deviceScaleFactor:1};

function routeFile(route){
  if(typeof route!=='string'||!/^\/(?:examples|studio)\/[a-zA-Z0-9/_-]*(?:#[a-zA-Z0-9_-]+)?$/.test(route))throw new Error('Preview must use an explicit local examples/studio route: '+route);
  const pathname=route.split('#')[0];
  return path.join(root,pathname,pathname.endsWith('/')?'index.html':'');
}

async function sourceFingerprint(item){
  const seen=new Map();
  async function visit(file){
    const resolved=path.resolve(file);if(!within(root,resolved)||seen.has(resolved))return;
    const bytes=await readFile(resolved);seen.set(resolved,hash(bytes));
    if(!/\.(?:html|css|m?js)$/.test(resolved))return;
    const text=bytes.toString('utf8'),references=[];
    if(resolved.endsWith('.html')){
      for(const tag of text.matchAll(/<(?:script|link|img|source|video)\b[^>]*>/gi))for(const attribute of tag[0].matchAll(/(?:src|href|poster)=["']([^"']+)["']/g))references.push(attribute[1]);
    }
    for(const match of text.matchAll(/(?:from\s*|import\s*|new URL\(\s*)["']([^"']+)["']/g))references.push(match[1]);
    for(const match of text.matchAll(/url\(\s*["']?([^\s)'"#]+)["']?\s*\)/g))references.push(match[1]);
    for(const reference of references){
      if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)||!reference.startsWith('.')&&!reference.startsWith('/'))continue;
      const dependency=reference.startsWith('/')?path.join(root,reference.split(/[?#]/)[0]):path.resolve(path.dirname(resolved),reference.split(/[?#]/)[0]);
      if(!within(root,dependency))continue;
      try{if((await stat(dependency)).isFile())await visit(dependency);}catch(error){if(error.code!=='ENOENT')throw error;}
    }
  }
  await visit(routeFile(item.preview.route));
  // Dynamic library/atlas content is read from these data files by the local API.
  if(['/examples/library/','/examples/atlas/'].some(prefix=>item.preview.route.startsWith(prefix)))for(const file of ['data/discovery.json','data/techniques.json'])await visit(path.join(root,file));
  return hash(JSON.stringify({version,profile:profileFor(item),...(profileFor(item).deviceScaleFactor>1?{controlCrop:2}:{}),...(item.interaction==='hover'?{hoverSample:2}:{}),item,sources:[...seen].map(([file,digest])=>({file:path.relative(root,file).replaceAll('\\','/'),sha256:digest})).sort((a,b)=>a.file.localeCompare(b.file))}));
}

async function cropAround(locator,page,profile){
  const view=profile.viewport,maxHeight=Math.min(view.height,750/profile.deviceScaleFactor);
  const box=await locator.boundingBox();if(!box||box.width<1||box.height<1)throw new Error('Preview target has no rendered area');
  const width=Math.min(view.width,Math.max(640/profile.deviceScaleFactor,box.width+64)),height=Math.min(maxHeight,Math.max(400/profile.deviceScaleFactor,box.height+48));
  const x=Math.max(0,Math.min(view.width-width,box.x+box.width/2-width/2));
  const y=Math.max(0,Math.min(view.height-height,box.y+Math.min(box.height,view.height)/2-height/2));
  return page.screenshot({type:'png',clip:{x,y,width,height}});
}

export async function captureStudioPreviews({only=[]}={}){
  const catalog=JSON.parse(await readFile(path.join(root,'data/studio-catalog.json'),'utf8'));
  if(!Array.isArray(catalog.items))throw new Error('Studio catalog must contain items');
  const directory=path.join(root,'studio/previews'),manifestPath=path.join(directory,'manifest.json');
  await mkdir(directory,{recursive:true});let previous={schema:1,previews:[]};
  try{previous=JSON.parse(await readFile(manifestPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(previous.schema!==1||!Array.isArray(previous.previews))throw new Error('Unrecognized preview provenance; preserve it before recapturing');
  const records=new Map(previous.previews.map(record=>[record.id,record]));
  const selected=catalog.items.filter(item=>!only.length||only.includes(item.id));
  if(!selected.length||only.some(id=>!selected.some(item=>item.id===id)))throw new Error('Unknown or empty preview selection');
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
    for(const item of selected){
      if(!item.preview||item.preview.thumbnail!=='/studio/previews/'+item.id+'.png')throw new Error('Unexpected preview path for '+item.id);
      const output=path.join(directory,item.id+'.png'),fingerprint=await sourceFingerprint(item),old=records.get(item.id);
      let currentHash=null;try{currentHash=hash(await readFile(output));}catch(error){if(error.code!=='ENOENT')throw error;}
      if(currentHash&&(!old||old.sha256!==currentHash))throw new Error('Refusing to overwrite unmanaged or locally changed preview: '+item.id);
      if(currentHash&&old.sourceFingerprint===fingerprint){console.log('UNCHANGED '+item.id);continue;}
      const profile=profileFor(item),context=await browser.newContext({...profile,reducedMotion:'no-preference'});
      const page=await context.newPage(),errors=[],blocked=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.route('**/*',route=>{
        const url=new URL(route.request().url());
        if(url.origin===base||['data:','blob:'].includes(url.protocol))return route.continue();
        blocked.push(url.origin);return route.abort();
      });
      try{
        const response=await page.goto(base+item.preview.route,{waitUntil:'networkidle'});
        if(!response?.ok())throw new Error('Preview route failed for '+item.id+': '+response?.status());
        const target=page.locator(item.preview.selector).first();await target.waitFor({state:'visible'});await target.scrollIntoViewIfNeeded();
        await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(image=>!image.complete).map(image=>new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});})));});
        const actions=[];
        if(item.preview.route.startsWith('/examples/cinematic-media/')){
          await page.evaluate(()=>{const section=document.querySelector('#film');scrollTo(0,section.offsetTop+(section.offsetHeight-innerHeight)*.6);});
          await page.waitForFunction(()=>window.cinematicDemo?.getState().mediaProgress>.55);actions.push('Native scroll to 60% of film');
        }else if(item.interaction==='hover'){
          const isControl=await target.evaluate(element=>element.matches('button,a,[data-pointer-effect]'));
          const control=!isControl&&['buttons','pointer'].includes(item.category)?target.locator('button').first():target;
          const hovered=await control.count()?control:target;
          await hovered.hover();actions.push('Pointer hover inside actual '+(isControl?'control':'preview target'));
        }
        await page.waitForTimeout(item.interaction==='hover'?40:600);
        const sampled=await target.evaluate(element=>{
          const animations=element.getAnimations({subtree:true}).filter(animation=>Number.isFinite(animation.effect?.getComputedTiming().duration)&&animation.effect.getComputedTiming().duration>0);
          for(const animation of animations){animation.pause();animation.currentTime=animation.effect.getComputedTiming().duration*.58;}
          return animations.length;
        });
        if(sampled)actions.push('Sampled '+sampled+' authored native animations at 58%');
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        if(errors.length)throw new Error('Browser error in '+item.id+': '+errors.join('; '));
        const bytes=await cropAround(target,page,profile);await writeFile(output,bytes);
        records.set(item.id,{id:item.id,route:item.preview.route,selector:item.preview.selector,file:item.preview.thumbnail,sourceFingerprint:fingerprint,sha256:hash(bytes),bytes:bytes.length,capturedAt:new Date().toISOString(),...profile,actions,blockedExternalOrigins:[...new Set(blocked)],scope:'A real local browser frame for browsing inspiration; not a motion-quality certification.'});
        await writeFile(manifestPath,JSON.stringify({schema:1,generator:'scripts/capture-studio-previews.mjs',previews:[...records.values()].sort((a,b)=>a.id.localeCompare(b.id))},null,2)+'\n');
        console.log('CAPTURED '+item.id+' ('+bytes.length+' bytes)');
      }finally{await context.close();}
    }
    return {directory,previews:[...records.values()]};
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2);
  if(args.length===1&&args[0]==='--help')console.log('Usage: node scripts/capture-studio-previews.mjs [--only item-id,item-id]\nCaptures local catalog demos with Playwright; unchanged sources are reused and edited previews are protected.');
  else if(args.length&&!(args.length===2&&args[0]==='--only'))throw new Error('Unknown preview capture options');
  else await captureStudioPreviews({only:args[0]==='--only'?args[1].split(','):[]});
}
