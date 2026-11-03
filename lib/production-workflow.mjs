import {readFile,writeFile,mkdir,readdir,lstat,stat,realpath,rename,rm,open,copyFile,mkdtemp} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {probeMedia} from './cinematic-media.mjs';

const stateName='production.json',idPattern=/^[a-z][a-z0-9-]{0,79}$/;
const kinds=new Set(['preview-wide','preview-portrait','film-wide','film-portrait','poster','tracking','depth','reference','other']);
const reviewKinds=new Set(['design','film','join','checkpoint','source']);
export const productionTiers={
  'full-throttle':'Choose the most capable available models for creative and implementation work, within the actual approved quote.',
  studio:'Use a capable available model for creative decisions and an economical available model for routine implementation; quote both.',
  'focused-budget':'Choose the best feasible combination within the supplied hard allowance; reduce scope or seek a revised quote before exceeding it.'
};
const text=(value,label,max=2000)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error('Invalid '+label);return value.trim();};
const identifier=(value,label='ID')=>{if(typeof value!=='string'||!idPattern.test(value))throw new Error('Invalid '+label);return value;};
const amount=(value,label)=>{if(!Number.isFinite(value)||value<0||value>1e12)throw new Error('Invalid '+label);return value;};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const relative=file=>typeof file==='string'&&!!file&&!path.isAbsolute(file)&&!file.includes('\\')&&!file.split('/').some(part=>!part||part==='.'||part==='..');
const now=()=>new Date().toISOString();
const current=asset=>asset.versions.at(-1);
const latestReview=(state,id,kind)=>state.reviews.filter(r=>r.assetId===id&&r.assetVersion===current(state.assets.find(a=>a.id===id)).version&&r.assetHash===current(state.assets.find(a=>a.id===id)).sha256&&r.kind===kind).at(-1);
const accepted=(state,id,kind)=>latestReview(state,id,kind)?.verdict==='accepted';
const event=(state,action,details)=>state.events.push({at:now(),action,...details});
async function hashFile(file){const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');}
async function ownedPath(root,rel){if(!relative(rel))throw new Error('Unsafe production path');let cursor=root;for(const part of rel.split('/')){cursor=path.join(cursor,part);try{if((await lstat(cursor)).isSymbolicLink())throw new Error('Production path contains a symlink');}catch(error){if(error.code!=='ENOENT')throw error;}}return cursor;}
async function localFile(input){
  if(typeof input!=='string'||!input||input.includes('\0')||/^[a-z][a-z\d+.-]*:/i.test(input)&&!path.isAbsolute(input))throw new Error('Choose a local file');
  const file=path.resolve(input),info=await lstat(file);if(info.isSymbolicLink()||!info.isFile())throw new Error('Input must be a regular local file');return realpath(file);
}
async function assertNewOutput(output){
  const resolved=path.resolve(output);try{await lstat(resolved);throw new Error('Output already exists; preserve it and choose a new folder');}catch(error){if(error.code!=='ENOENT')throw error;}
  const parent=await realpath(path.dirname(resolved));if((await lstat(path.dirname(resolved))).isSymbolicLink())throw new Error('Output parent must not be a symlink');return path.join(parent,path.basename(resolved));
}
async function readState(directory){
  const root=await realpath(path.resolve(directory));if((await lstat(path.resolve(directory))).isSymbolicLink())throw new Error('Production directory must not be a symlink');
  const file=path.join(root,stateName);if((await lstat(file)).isSymbolicLink())throw new Error('Production state must not be a symlink');
  const state=JSON.parse(await readFile(file,'utf8'));
  if(state.schema!==1||!productionTiers[state.tier]||!Array.isArray(state.assets)||!Array.isArray(state.quotes)||!Array.isArray(state.reviews)||!Array.isArray(state.expenses)||!Array.isArray(state.events))throw new Error('Unsupported production state');
  return {root,state};
}
async function persist(root,state){const temporary=path.join(root,'.state-'+randomUUID()+'.json');try{await writeFile(temporary,JSON.stringify(state,null,2)+'\n',{flag:'wx'});await rename(temporary,path.join(root,stateName));}finally{await rm(temporary,{force:true});}}
async function mutate(directory,operation){
  const root=await realpath(path.resolve(directory)),lock=path.join(root,'.production.lock');let handle;
  try{handle=await open(lock,'wx');}catch(error){if(error.code==='EEXIST')throw new Error('Another production operation is running; do not run concurrent updates');throw error;}
  try{const {state}=await readState(root);const result=await operation(root,state);state.updatedAt=now();await persist(root,state);return result;}finally{await handle.close();await rm(lock,{force:true});}
}
function validateSpec(spec){
  if(!spec||typeof spec!=='object'||Array.isArray(spec))throw new Error('Production specification must be an object');
  text(spec.name,'project name',160);text(spec.goal,'project goal',2000);
  if(spec.tier!==undefined&&!productionTiers[spec.tier])throw new Error('Unknown production tier');
  amount(spec.budget?.limit,'budget limit');if(!/^[A-Z]{3,12}$/.test(spec.budget?.currency))throw new Error('Use one explicit currency or CREDITS ledger; no exchange rates are inferred');
  if(spec.site!==undefined&&(!spec.site||typeof spec.site!=='object'||Array.isArray(spec.site)))throw new Error('Invalid site specification');
}
export async function createProduction(output,spec){
  validateSpec(spec);const target=await assertNewOutput(output),createdAt=now();
  const state={schema:1,id:randomUUID(),name:spec.name,goal:spec.goal,tier:spec.tier||'studio',tierGuidance:productionTiers[spec.tier||'studio'],budget:{limit:spec.budget.limit,currency:spec.budget.currency},site:spec.site||{},createdAt,updatedAt:createdAt,quotes:[],expenses:[],assets:[],reviews:[],events:[]};
  await mkdir(target);try{await mkdir(path.join(target,'assets'));await mkdir(path.join(target,'evidence'));await persist(target,state);}catch(error){await rm(target,{recursive:true,force:true});throw error;}
  return {directory:target,state};
}
export async function addProductionQuote(directory,quote){
  identifier(quote.id);text(quote.provider,'provider',160);text(quote.description,'quote description');amount(quote.total,'quote total');
  if(quote.validUntil!==undefined&&!Number.isFinite(Date.parse(quote.validUntil)))throw new Error('Invalid quote expiry');
  return mutate(directory,async(root,state)=>{
    if(state.quotes.some(q=>q.id===quote.id))throw new Error('Quote ID already exists; create a new revision ID');
    if(quote.currency!==state.budget.currency)throw new Error('Quote currency must match the ledger');
    const value={id:quote.id,provider:quote.provider,description:quote.description,total:quote.total,currency:quote.currency,validUntil:quote.validUntil||null,reference:quote.reference?text(quote.reference,'quote reference'):null,createdAt:now(),approval:null};
    state.quotes.push(value);event(state,'quote',{id:quote.id});return value;
  });
}
export async function approveProductionQuote(directory,id,approval){
  identifier(id);text(approval.by,'approver',160);text(approval.note,'approval note');amount(approval.allowance,'approved allowance');
  return mutate(directory,async(root,state)=>{
    const quote=state.quotes.find(q=>q.id===id);if(!quote)throw new Error('Unknown quote');if(quote.approval)throw new Error('Quote is already approved');
    if(quote.validUntil&&Date.parse(quote.validUntil)<=Date.now())throw new Error('Quote expired; obtain a new quote');
    if(approval.allowance<quote.total)throw new Error('Allowance is below the quoted total');
    const committed=state.quotes.reduce((sum,q)=>sum+(q.approval?.allowance||0),0);
    if(committed+approval.allowance>state.budget.limit+1e-8)throw new Error('Approval would exceed the hard project budget');
    quote.approval={by:approval.by,note:approval.note,allowance:approval.allowance,at:now()};event(state,'approval',{quoteId:id});return quote;
  });
}
export async function recordProductionSpend(directory,expense){
  identifier(expense.id);identifier(expense.quoteId);amount(expense.amount,'actual spend');text(expense.receipt,'actual receipt reference');
  return mutate(directory,async(root,state)=>{
    if(state.expenses.some(e=>e.id===expense.id))throw new Error('Expense ID already recorded');
    const quote=state.quotes.find(q=>q.id===expense.quoteId);if(!quote?.approval)throw new Error('Actual spend requires an approved quote');
    const spent=state.expenses.filter(e=>e.quoteId===quote.id).reduce((sum,e)=>sum+e.amount,0);
    if(spent+expense.amount>quote.approval.allowance+1e-8)throw new Error('Spend exceeds the approved quote allowance');
    if(state.expenses.reduce((sum,e)=>sum+e.amount,0)+expense.amount>state.budget.limit+1e-8)throw new Error('Spend exceeds the hard budget');
    const result={id:expense.id,quoteId:expense.quoteId,amount:expense.amount,currency:state.budget.currency,receipt:expense.receipt,at:now()};state.expenses.push(result);event(state,'spend',{id:expense.id});return result;
  });
}
async function inspectAsset(file,kind,options){
  const info=await stat(file);if(info.size<1||info.size>1024*1024*1024)throw new Error('Asset is empty or larger than 1 GiB');
  const extension=path.extname(file).toLowerCase(),head=Buffer.alloc(32),handle=await open(file,'r');let bytesRead;try{({bytesRead}=await handle.read(head,0,32,0));}finally{await handle.close();}
  const png=bytesRead>=24&&head.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=head[0]===255&&head[1]===216&&head[2]===255,webp=head.toString('ascii',0,4)==='RIFF'&&head.toString('ascii',8,12)==='WEBP';
  if(kind.startsWith('film-')){
    if(!['.mp4','.webm','.mov','.m4v'].includes(extension))throw new Error('Film asset must be a supported local film');
    const media=await (options.probe||probeMedia)(file);return {extension,bytes:info.size,media};
  }
  if(['preview-wide','preview-portrait','poster','depth'].includes(kind)){
    if(!png&&!jpg&&!webp)throw new Error('Preview, poster and depth assets need an actual PNG, JPEG or WebP image');
    return {extension:png?'.png':jpg?'.jpg':'.webp',bytes:info.size,...(png?{width:head.readUInt32BE(16),height:head.readUInt32BE(20)}:{})};
  }
  if(kind==='tracking'){const value=JSON.parse(await readFile(file,'utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Tracking asset must be JSON data');return {extension:'.json',bytes:info.size};}
  if(!['.png','.jpg','.jpeg','.webp','.svg','.json','.md','.txt','.html','.pdf'].includes(extension))throw new Error('Unsupported supporting asset type');
  return {extension,bytes:info.size};
}
function staleAssets(state){
  const stale=new Set();let changed=true;
  while(changed){changed=false;for(const asset of state.assets){if(stale.has(asset.id))continue;for(const dependency of current(asset).dependencies){const parent=state.assets.find(a=>a.id===dependency.id);if(!parent||current(parent).version!==dependency.version||current(parent).sha256!==dependency.sha256||stale.has(parent.id)){stale.add(asset.id);changed=true;break;}}}}
  return [...stale];
}
export async function importProductionAsset(directory,input,options={}){
  identifier(input.id);if(!kinds.has(input.kind))throw new Error('Unknown asset kind');if(!['existing','generated'].includes(input.origin))throw new Error('Asset origin must be existing or generated');
  if(input.dependencies!==undefined&&(!Array.isArray(input.dependencies)||new Set(input.dependencies).size!==input.dependencies.length||input.dependencies.includes(input.id)))throw new Error('Dependencies must be unique asset IDs without self-reference');
  const file=await localFile(input.file),metadata=await inspectAsset(file,input.kind,options),sha256=await hashFile(file);
  return mutate(directory,async(root,state)=>{
    const dependencies=(input.dependencies||[]).map(id=>{identifier(id);const asset=state.assets.find(a=>a.id===id);if(!asset)throw new Error('Unknown dependency: '+id);return {id,version:current(asset).version,sha256:current(asset).sha256};});
    const stale=new Set(staleAssets(state));if(dependencies.some(d=>stale.has(d.id)))throw new Error('Asset depends on an obsolete source; refresh the dependency first');
    // Prevent a replacement from creating an indirect dependency cycle.
    const reaches=(id,target,seen=new Set())=>{if(id===target)return true;if(seen.has(id))return false;seen.add(id);const asset=state.assets.find(a=>a.id===id);return !!asset&&current(asset).dependencies.some(d=>reaches(d.id,target,seen));};
    if(dependencies.some(d=>reaches(d.id,input.id)))throw new Error('Asset dependency cycle');
    let quote=null;if(input.origin==='generated'){
      quote=state.quotes.find(q=>q.id===input.quoteId);if(!quote?.approval)throw new Error('Generated assets require a recorded approved provider quote');
      text(input.jobReference,'actual provider job reference');
      if(input.kind.startsWith('film-'))for(const kind of ['preview-wide','preview-portrait']){const preview=dependencies.map(d=>state.assets.find(a=>a.id===d.id)).find(a=>a.kind===kind&&accepted(state,a.id,'design'));if(!preview)throw new Error('Review both wide and portrait design previews before generating film');}
    }
    let asset=state.assets.find(a=>a.id===input.id);if(asset&&asset.kind!==input.kind)throw new Error('An asset ID cannot change kind');
    if(!asset){asset={id:input.id,kind:input.kind,versions:[]};state.assets.push(asset);}
    const version=asset.versions.length+1,relativePath='assets/'+input.id+'-v'+version+'-'+sha256.slice(0,12)+metadata.extension,destination=await ownedPath(root,relativePath);
    await copyFile(file,destination,1);
    const value={version,sha256,path:relativePath,...metadata,origin:input.origin,provider:quote?.provider||null,quoteId:quote?.id||null,jobReference:input.jobReference||null,dependencies,importedAt:now()};asset.versions.push(value);event(state,'asset',{id:input.id,version});return {id:input.id,...value,invalidated:staleAssets(state)};
  });
}
export async function reviewProductionAsset(directory,review){
  identifier(review.assetId);if(!reviewKinds.has(review.kind)||!['accepted','changes-requested'].includes(review.verdict))throw new Error('Invalid review kind or verdict');
  text(review.by,'reviewer',160);text(review.observations,'actual review observations',12000);
  if(!Array.isArray(review.evidenceFiles)||!review.evidenceFiles.length||review.evidenceFiles.length>20)throw new Error('Review needs one or more actual local evidence files');
  const files=await Promise.all(review.evidenceFiles.map(async input=>{const file=await localFile(input),info=await stat(file);if(info.size<1||info.size>32*1024*1024)throw new Error('Evidence file is empty or larger than 32 MiB');return {file,bytes:info.size,sha256:await hashFile(file)};}));
  return mutate(directory,async(root,state)=>{
    const asset=state.assets.find(a=>a.id===review.assetId);if(!asset)throw new Error('Unknown review asset');if(staleAssets(state).includes(asset.id))throw new Error('Review requires a current asset and current dependencies');
    const id=randomUUID(),evidence=[];for(let i=0;i<files.length;i++){const source=files[i],rel='evidence/'+id+'-'+i+path.extname(source.file).slice(0,12);await copyFile(source.file,await ownedPath(root,rel),1);evidence.push({path:rel,sha256:source.sha256,bytes:source.bytes});}
    const value={id,assetId:asset.id,assetVersion:current(asset).version,assetHash:current(asset).sha256,kind:review.kind,verdict:review.verdict,by:review.by,observations:review.observations,evidence,at:now()};state.reviews.push(value);event(state,'review',{id,assetId:asset.id,verdict:review.verdict});return value;
  });
}
export async function productionStatus(directory){
  const {root,state}=await readState(directory),stale=staleAssets(state),integrity=[];
  for(const asset of state.assets)for(const version of asset.versions){if(!relative(version.path)||!version.path.startsWith('assets/'))throw new Error('Unsafe stored asset path');try{const file=await ownedPath(root,version.path);if(await hashFile(file)!==version.sha256)integrity.push(asset.id+' v'+version.version);}catch{integrity.push(asset.id+' v'+version.version);}}
  for(const review of state.reviews)for(const evidence of review.evidence){if(!relative(evidence.path)||!evidence.path.startsWith('evidence/'))throw new Error('Unsafe stored evidence path');try{if(await hashFile(await ownedPath(root,evidence.path))!==evidence.sha256)integrity.push('review '+review.id);}catch{integrity.push('review '+review.id);}}
  const spent=state.expenses.reduce((sum,e)=>sum+e.amount,0),committed=state.quotes.reduce((sum,q)=>sum+(q.approval?.allowance||0),0);
  return {schema:1,name:state.name,tier:state.tier,budget:{...state.budget,approved:committed,spent,uncommitted:state.budget.limit-committed,remaining:state.budget.limit-spent},staleAssets:stale,integrityFailures:[...new Set(integrity)],assets:state.assets.map(asset=>({id:asset.id,kind:asset.kind,version:current(asset).version,sha256:current(asset).sha256,stale:stale.includes(asset.id),reviews:[...reviewKinds].filter(kind=>accepted(state,asset.id,kind))})),external:{generation:'Not submitted by this tool. Use an available authorized provider integration, record its actual quote/job/receipt, then import the downloaded result.',publication:'Not published by this tool. Upload only the release public/ directory using the chosen authorized hosting integration.'}};
}

const staticExtensions=new Set(['.html','.htm','.css','.js','.mjs','.json','.svg','.png','.jpg','.jpeg','.webp','.gif','.avif','.ico','.mp4','.webm','.woff','.woff2','.ttf','.otf','.pdf','.txt','.xml','.webmanifest','.php']);
const ignored=name=>name.startsWith('.')||['node_modules','credentials','credentials.json','auth.json','package-lock.json','package.json'].includes(name)||/\.(?:pem|key|pfx|p12)$/i.test(name);
async function staticFiles(root,rel=''){
  const files=[];for(const entry of await readdir(path.join(root,rel),{withFileTypes:true})){if(ignored(entry.name))continue;const file=rel?rel+'/'+entry.name:entry.name;if(entry.isSymbolicLink())throw new Error('Release sources cannot contain symlinks: '+file);if(entry.isDirectory())files.push(...await staticFiles(root,file));else if(entry.isFile()&&staticExtensions.has(path.extname(file).toLowerCase()))files.push(file);}return files.sort();
}
const routeFor=file=>file==='index.html'?'/':file.endsWith('/index.html')?'/'+file.slice(0,-10):'/'+file;
const entities={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',Aring:'Å',aring:'å',Auml:'Ä',auml:'ä',Ouml:'Ö',ouml:'ö',Eacute:'É',eacute:'é'};
const decoded=value=>String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(entity,name)=>{if(name.startsWith('#')){const code=Number.parseInt(name.slice(name[1]?.toLowerCase()==='x'?2:1),name[1]?.toLowerCase()==='x'?16:10);return code>0&&code<=0x10ffff?String.fromCodePoint(code):entity;}return entities[name]??entity;});
function attr(tag,name){const value=tag.match(new RegExp("(?:^|\\s)"+name+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>`]+))",'i')),result=value?.[1]??value?.[2]??value?.[3]??null;return result===null?null:decoded(result);}
function titleFrom(html){const value=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();return value?decoded(value):null;}
function descriptionFrom(html){for(const [tag]of html.matchAll(/<meta\b[^>]*>/gi))if(attr(tag,'name')?.toLowerCase()==='description')return attr(tag,'content');return null;}
function normalizeOrigin(value){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Release origin must be an HTTPS origin without a path or credentials');return url.origin;}
function language(value){if(typeof value!=='string'||!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value))throw new Error('Each page needs a real language code');return value;}
function brandConfig(state){const brand={background:'#17242b',foreground:'#ffffff',accent:'#8ebbb0',...(state.site.brand||{})};for(const [key,value]of Object.entries(brand))if(!['background','foreground','accent'].includes(key)||!/^#[a-f0-9]{6}$/i.test(value))throw new Error('Brand colors need known names and six-digit hex values');return brand;}
const glyphs={A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','11011','10001'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111']};
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function pngChunk(type,data){const name=Buffer.from(type),body=Buffer.concat([name,data]),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(body));return Buffer.concat([size,body,crc]);}
/** Deterministic original raster brand tile, not a photograph or generated film. */
export function createBrandShareImage(name,brand){
  const width=1200,height=630,channels=3,raw=Buffer.alloc((width*channels+1)*height),color=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const bg=color(brand.background),fg=color(brand.foreground),accent=color(brand.accent),stride=width*channels+1;
  const rect=(x,y,w,h,rgb)=>{for(let yy=Math.max(0,y);yy<Math.min(height,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(width,x+w);xx++){const offset=yy*stride+1+xx*3;raw[offset]=rgb[0];raw[offset+1]=rgb[1];raw[offset+2]=rgb[2];}};
  rect(0,0,width,height,bg);rect(75,80,70,9,accent);rect(950,80,160,470,accent);rect(988,116,84,394,bg);
  const words=String(name).normalize('NFD').replace(/\p{Diacritic}/gu,'').toUpperCase().slice(0,42),lines=[];let line='';for(const word of words.split(/\s+/)){if(line.length+word.length>19){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);
  lines.slice(0,3).forEach((value,row)=>{[...value].slice(0,19).forEach((letter,index)=>{const glyph=glyphs[letter];if(!glyph)return;glyph.forEach((bits,yy)=>[...bits].forEach((bit,xx)=>{if(bit==='1')rect(75+index*42+xx*6,210+row*76+yy*6,6,6,fg);}));});});
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(raw)),pngChunk('IEND',Buffer.alloc(0))]);
}
export function createBrandIcon(name,brand,size=192){
  if(![32,180,192,512].includes(size))throw new Error('Unsupported icon size');
  const stride=size*3+1,raw=Buffer.alloc(stride*size),rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),bg=rgb(brand.background),fg=rgb(brand.foreground),first=String(name).normalize('NFD').replace(/\p{Diacritic}/gu,'').toUpperCase().match(/[A-Z]/)?.[0]||'S',glyph=glyphs[first];
  const cell=Math.floor(size/11),left=Math.floor((size-5*cell)/2),top=Math.floor((size-7*cell)/2);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const gx=Math.floor((x-left)/cell),gy=Math.floor((y-top)/cell),color=gx>=0&&gx<5&&gy>=0&&gy<7&&glyph[gy][gx]==='1'?fg:bg,offset=y*stride+1+x*3;raw[offset]=color[0];raw[offset+1]=color[1];raw[offset+2]=color[2];}
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(raw)),pngChunk('IEND',Buffer.alloc(0))]);
}
async function writeBrandKit(stage,state,brand,render){
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(state.name)+' brand kit</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#f4f4f0;color:#18242a}main{max-width:1200px;margin:auto;padding:72px}h1{font-size:58px;letter-spacing:-2px;margin:0 0 24px}p{line-height:1.7;max-width:760px}h2{font-size:24px;margin:42px 0 18px}.colors{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.color{border:1px solid #d4d7d5;background:white;padding:12px}.color div{height:110px}.color p{margin:12px 0 0;font-size:14px}img{max-width:100%;display:block;border:1px solid #d4d7d5}.note{color:#54625f;font-size:13px}@media print{main{padding:40px}h1{font-size:44px}.colors{break-inside:avoid}}</style></head><body><main><h1>'+escape(state.name)+'</h1><p>'+escape(state.goal)+'</p><h2>Color palette</h2><div class="colors">'+Object.entries(brand).map(([key,value])=>'<div class="color"><div style="background:'+value+'"></div><p>'+escape(key)+' · '+value+'</p></div>').join('')+'</div><h2>Share image</h2><img src="../public/__superbrain/share.png" alt="'+escape(state.name)+' share image" width="1200" height="630"><p class="note">Original fallback assets from the selected name and colors. This kit records the supplied direction; it does not claim a complete bespoke identity or licensed custom typeface. Review with the client and replace with approved supplied branding when available.</p><h2>Delivery</h2><p>Vector favicon, PNG icons at 32, 180, 192 and 512 pixels, Open Graph image at 1200 × 630 pixels, web app manifest, color JSON and CSS tokens. Site routes, languages and verification limits are listed in delivery/HANDOVER.md.</p></main></body></html>';
  const file=path.join(stage,'brand/brand-kit.html');await writeFile(file,html);
  if(!render)return {html:true,png:false,pdf:false,rendering:'Not requested; use renderBrandKit:true with an available Playwright/Chromium installation.'};
  const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
  const browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  try{const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});await page.route('**/*',route=>route.request().url().startsWith('file:')?route.continue():route.abort());await page.goto(pathToFileURL(file).href);await page.locator('img').evaluate(image=>image.decode());await page.screenshot({path:path.join(stage,'brand/brand-kit.png'),fullPage:true});await page.pdf({path:path.join(stage,'brand/brand-kit.pdf'),format:'A4',printBackground:true,margin:{top:'12mm',right:'12mm',bottom:'12mm',left:'12mm'}});return {html:true,png:true,pdf:true,rendering:'Actual local Chromium screenshot and PDF; no external network resources.'};}finally{await browser.close();}
}
function metadataFor(page,origin,allPages,icon,share,name){
  const alternatives=page.translationKey?allPages.filter(p=>p.translationKey===page.translationKey):[];
  return '\n<!-- SuperBrain release metadata -->\n'+[
    '<title>'+escape(page.title)+'</title>',
    '<meta name="description" content="'+escape(page.description)+'">',
    '<link rel="canonical" href="'+escape(origin+page.route)+'">',
    '<link rel="icon" href="'+icon+'" type="image/svg+xml">',
    '<link rel="icon" href="/__superbrain/icon-32.png" sizes="32x32" type="image/png">',
    '<link rel="apple-touch-icon" href="/__superbrain/icon-180.png" sizes="180x180">',
    '<link rel="manifest" href="/__superbrain/site.webmanifest">',
    ...alternatives.map(p=>'<link rel="alternate" hreflang="'+p.language+'" href="'+escape(origin+p.route)+'">'),
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="'+escape(page.title)+'">',
    '<meta property="og:description" content="'+escape(page.description)+'">',
    '<meta property="og:url" content="'+escape(origin+page.route)+'">',
    '<meta property="og:site_name" content="'+escape(name)+'">',
    '<meta property="og:image" content="'+escape(origin+share)+'">',
    '<meta property="og:image:alt" content="'+escape(name)+'">',
    '<meta name="twitter:card" content="summary_large_image">'
  ].join('\n')+'\n';
}
function injectMetadata(html,page,metadata){
  let result=html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*>/gi,tag=>['description','twitter:card'].includes(attr(tag,'name')?.toLowerCase())||attr(tag,'property')?.toLowerCase().startsWith('og:')?'':tag).replace(/<link\b[^>]*>/gi,tag=>['canonical','icon'].includes(attr(tag,'rel')?.toLowerCase())||attr(tag,'rel')?.toLowerCase()==='alternate'&&attr(tag,'hreflang')?'':tag);
  result=result.replace(/<html\b([^>]*)>/i,(tag,attributes)=>'<html'+attributes.replace(/\s+lang\s*=\s*(?:"[^"]*"|'[^']*')/i,'')+' lang="'+page.language+'">');
  return result.replace(/<\/head\s*>/i,metadata+'</head>');
}
function resolvePublicReference(reference,pageRoute,origin){
  if(!reference||/^(?:data:|mailto:|tel:|blob:)/i.test(reference))return null;
  if(/^javascript:/i.test(reference))return {error:'Script URL'};
  let url;try{url=new URL(reference,origin+pageRoute);}catch{return {error:'Invalid URL'};}
  if(url.origin!==origin)return {external:url.href};
  let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return {error:'Invalid URL encoding'};}
  if(pathname.includes('\\')||pathname.includes('\0'))return {error:'Invalid local path'};
  let fragment;try{fragment=decodeURIComponent(url.hash.slice(1));}catch{return {error:'Invalid anchor encoding'};}return {path:pathname,fragment};
}
async function inspectSite(root,files,origin,pages){
  const available=new Set(files),idsFor=html=>[...html.matchAll(/<[a-z][^>]*>/gi)].map(([tag])=>attr(tag,'id')).filter(id=>id!==null),idsByRoute=new Map(pages.map(p=>[p.route,new Set(idsFor(p.html))])),issues=[],external=new Set(),forms=[];
  const targetFile=pathname=>pathname.endsWith('/')?pathname.slice(1)+'index.html':available.has(pathname.slice(1))?pathname.slice(1):pathname.slice(1)+'/index.html';
  function checkReference(reference,route,source){const resolved=resolvePublicReference(reference,route,origin);if(!resolved)return;if(resolved.error){issues.push({file:source,reference,problem:resolved.error});return;}if(resolved.external){external.add(resolved.external);return;}const file=targetFile(resolved.path);if(!available.has(file)){issues.push({file:source,reference,problem:'Missing local destination'});return;}if(resolved.fragment&&/\.html?$/i.test(file)){const ids=idsByRoute.get(routeFor(file));if(ids&&!ids.has(resolved.fragment))issues.push({file:source,reference,problem:'Missing local anchor'});}}
  for(const page of pages){
    const html=page.html;if(!/<main\b/i.test(html))issues.push({file:page.file,problem:'No main landmark'});if([...html.matchAll(/<h1\b/gi)].length!==1)issues.push({file:page.file,problem:'Page needs one primary heading'});if(![...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag])=>attr(tag,'name')?.toLowerCase()==='viewport'))issues.push({file:page.file,problem:'No responsive viewport'});
    const ids=idsFor(html);if(new Set(ids).size!==ids.length)issues.push({file:page.file,problem:'Duplicate element IDs'});
    for(const [tag]of html.matchAll(/<(?:a|link|script|img|source|video|form)\b[^>]*>/gi))for(const name of ['href','src','poster','action']){const reference=attr(tag,name);if(reference!==null){checkReference(reference,page.route,page.file);if(name==='action')forms.push({page:page.route,action:reference,execution:'Not executed; verify real server delivery separately'});}}
  }
  for(const file of files.filter(f=>/\.(?:css|m?js)$/i.test(f))){const source=await readFile(path.join(root,file),'utf8'),route='/'+file;for(const match of source.matchAll(/(?:url\(\s*["']?([^\s)'"#]+)|(?:from\s*|import\s*)["']([^"']+))/g)){const reference=match[1]||match[2];if(reference.startsWith('.')||reference.startsWith('/'))checkReference(reference,route,file);}}
  return {issues,externalReferences:[...external].sort(),forms};
}
/** Build a new deployable static bundle; never modifies source files or publishes. */
export async function releaseProduction(directory,siteDirectory,output,options={}){
  const {state}=await readState(directory),status=await productionStatus(directory);
  if(status.integrityFailures.length)throw new Error('Production asset/evidence integrity check failed');if(status.staleAssets.length)throw new Error('Refresh obsolete production dependencies before release: '+status.staleAssets.join(', '));
  for(const asset of state.assets.filter(a=>a.kind.startsWith('film-')))for(const kind of ['film','join'])if(!accepted(state,asset.id,kind))throw new Error('Release requires current '+kind+' review for '+asset.id);
  const root=await realpath(path.resolve(siteDirectory));if((await lstat(path.resolve(siteDirectory))).isSymbolicLink())throw new Error('Site root must not be a symlink');
  const target=await assertNewOutput(output),rel=path.relative(root,target);if(!rel||!rel.startsWith('..')&&!path.isAbsolute(rel))throw new Error('Release output must be outside the source site');
  const site={...state.site,...options},origin=normalizeOrigin(site.origin),files=await staticFiles(root);if(site.renderBrandKit!==undefined&&typeof site.renderBrandKit!=='boolean')throw new Error('renderBrandKit must be a boolean');if(!files.includes('index.html'))throw new Error('Static site needs a root index.html');if(files.some(f=>f.startsWith('__superbrain/')))throw new Error('Reserved release asset directory already exists');
  for(const file of files.filter(f=>f.endsWith('.json'))){if(path.basename(file)==='production.json')throw new Error('Private production state cannot be exported into a public site');if(path.basename(file)==='config.json'&&(await stat(path.join(root,file))).size<65536){let value;try{value=JSON.parse(await readFile(path.join(root,file),'utf8'));}catch{}if(value?.schema===1&&typeof value.secret==='string'&&Object.hasOwn(value,'admin'))throw new Error('Private inbox configuration cannot be exported into a public site');}}
  const configs=site.pages||[];if(!Array.isArray(configs))throw new Error('Site pages must be an array');const configured=new Map(configs.map(p=>[p.route,p]));if(configured.size!==configs.length)throw new Error('Duplicate configured route');
  const pages=[];for(const file of files.filter(f=>f.endsWith('.html'))){const html=await readFile(path.join(root,file),'utf8'),route=routeFor(file),config=configured.get(route)||{};if(!/<head\b/i.test(html)||!/<\/head\s*>/i.test(html)||!/<html\b/i.test(html))throw new Error('Page needs an actual HTML head and document: '+file);const value={file,route,html,title:text(config.title||titleFrom(html),'page title',300),description:text(config.description||descriptionFrom(html)||site.description,'page description',600),language:language(config.language||attr(html.match(/<html\b[^>]*>/i)[0],'lang')||site.defaultLanguage),translationKey:config.translationKey||null};if(value.translationKey)identifier(value.translationKey,'translation group');pages.push(value);}
  for(const route of configured.keys())if(!pages.some(p=>p.route===route))throw new Error('Configured translation/page route does not exist: '+route);
  for(const page of pages.filter(p=>p.translationKey))if(pages.some(other=>other!==page&&other.translationKey===page.translationKey&&other.language===page.language))throw new Error('Translation group has duplicate language');
  const inspection=await inspectSite(root,files,origin,pages);if(inspection.issues.length)throw new Error('Static release checks failed: '+JSON.stringify(inspection.issues));
  const brand=brandConfig({...state,site}),stage=await mkdtemp(path.join(path.dirname(target),'.superbrain-release-'));
  try{
    const publicRoot=path.join(stage,'public');await mkdir(publicRoot);for(const file of files){await mkdir(path.dirname(path.join(publicRoot,file)),{recursive:true});await copyFile(path.join(root,file),path.join(publicRoot,file));}
    await mkdir(path.join(publicRoot,'__superbrain'));const icon='/__superbrain/favicon.svg',share='/__superbrain/share.png';
    const initials=[...state.name].filter(c=>/[\p{L}\p{N}]/u.test(c)).slice(0,2).join('').toUpperCase();
    const iconText='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="'+brand.background+'"/><text x="32" y="42" fill="'+brand.foreground+'" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="700">'+escape(initials)+'</text></svg>\n';
    await writeFile(path.join(publicRoot,icon.slice(1)),iconText);await writeFile(path.join(publicRoot,share.slice(1)),createBrandShareImage(state.name,brand));
    for(const size of [32,180,192,512])await writeFile(path.join(publicRoot,'__superbrain/icon-'+size+'.png'),createBrandIcon(state.name,brand,size));
    await writeFile(path.join(publicRoot,'__superbrain/site.webmanifest'),JSON.stringify({name:state.name,short_name:state.name.slice(0,30),start_url:'/',display:'browser',background_color:brand.background,theme_color:brand.background,icons:[192,512].map(size=>({src:'/__superbrain/icon-'+size+'.png',sizes:size+'x'+size,type:'image/png'}))},null,2)+'\n');
    for(const page of pages)await writeFile(path.join(publicRoot,page.file),injectMetadata(page.html,page,metadataFor(page,origin,pages,icon,share,state.name)));
    const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+pages.map(page=>'  <url><loc>'+escape(origin+page.route)+'</loc>'+pages.filter(p=>page.translationKey&&p.translationKey===page.translationKey).map(p=>'<xhtml:link rel="alternate" hreflang="'+p.language+'" href="'+escape(origin+p.route)+'"/>').join('')+'</url>').join('\n')+'\n</urlset>\n';
    await writeFile(path.join(publicRoot,'sitemap.xml'),sitemap);await writeFile(path.join(publicRoot,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
    await mkdir(path.join(stage,'delivery'));await mkdir(path.join(stage,'brand'));
    await writeFile(path.join(stage,'brand/brand.json'),JSON.stringify({schema:1,name:state.name,colors:brand,defaultLanguage:site.defaultLanguage||null,icon,shareImage:share,scope:'Original deterministic fallback brand assets. Replace them with reviewed client branding when supplied.'},null,2)+'\n');
    await writeFile(path.join(stage,'brand/tokens.css'),':root{--brand-background:'+brand.background+';--brand-foreground:'+brand.foreground+';--brand-accent:'+brand.accent+'}\n');
    const brandExports=await writeBrandKit(stage,state,brand,!!site.renderBrandKit),publishedFiles=await staticFiles(publicRoot),manifest=[];for(const file of publishedFiles)manifest.push({path:file,sha256:await hashFile(path.join(publicRoot,file)),bytes:(await stat(path.join(publicRoot,file))).size});
    const report={schema:1,createdAt:now(),status:'local-bundle-verified',deployment:'not-published',origin,pages:pages.map(({route,title,description,language,translationKey})=>({route,title,description,language,translationKey})),staticChecks:{passed:true,files:manifest.length,...inspection},brandExports,production:{tier:state.tier,assets:status.assets,budget:status.budget},browserReview:'Not run by this exporter. Run the site in a browser and record responsive, motion, keyboard and real form submission evidence.',lighthouse:'Not run; no Lighthouse score or Google indexing claim is inferred.'};
    await writeFile(path.join(stage,'delivery/launch-report.json'),JSON.stringify(report,null,2)+'\n');await writeFile(path.join(stage,'delivery/files.json'),JSON.stringify({schema:1,files:manifest},null,2)+'\n');
    await writeFile(path.join(stage,'delivery/HANDOVER.md'),'# '+state.name+' — delivery\n\n'+state.goal+'\n\nUpload only `public/` to the chosen static/PHP host. Keep `delivery/` and `brand/` outside the public document root. Nothing has been published by this tool.\n\n## Pages and languages\n'+pages.map(p=>'- '+p.route+' — '+p.language+' — '+p.title).join('\n')+'\n\n## Hosting handoff\nUse an available authorized Hostinger connector, another selected host, or the host file manager/SFTP. Confirm its actual document root, domain, HTTPS and cache behavior. Do not invent API access. Preserve the prior deployment/backup, transfer the complete public tree, then verify every listed URL, real inbox delivery and failure state, metadata, media seeking and responsive navigation on the live host.\n\n## Media and generation\nProvider generation is external. Actual quotes, allowances, job references and spend are recorded in the private production ledger; they are not exported into public/. Keep source media and licenses with the owner. Changing source media requires rebuilding its stale dependents and recording new design, film and join evidence.\n\n## Verification limits\nStatic files, local links, anchors, page structure, metadata and file hashes were checked. Browser behavior, payment/booking services, actual form delivery, SMTP, Lighthouse, deployment and indexing remain separately verifiable. The launch report records these limits.\n');
    await rename(stage,target);return {directory:target,publicDirectory:path.join(target,'public'),report};
  }catch(error){await rm(stage,{recursive:true,force:true});throw error;}
}
