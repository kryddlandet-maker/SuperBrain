import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createProduction,addProductionQuote,approveProductionQuote,recordProductionSpend,importProductionAsset,reviewProductionAsset,productionStatus,releaseProduction,createBrandShareImage,createBrandIcon} from '../lib/production-workflow.mjs';

const brand={background:'#17242b',foreground:'#ffffff',accent:'#8ebbb0'};
const spec={name:'Studio Forma',goal:'Show real work and invite enquiries',tier:'focused-budget',budget:{limit:100,currency:'CREDITS'},site:{origin:'https://studio.example',description:'An original studio and its real work.',defaultLanguage:'sv',pages:[{route:'/',language:'sv',translationKey:'home'},{route:'/en/',language:'en',translationKey:'home'}]}};
async function sandbox(){const root=await mkdtemp(path.join(tmpdir(),'superbrain-production-'));return {root,project:path.join(root,'production'),cleanup:()=>rm(root,{recursive:true,force:true})};}
async function init(project){return createProduction(project,structuredClone(spec));}
async function approve(project,id='media',total=60){await addProductionQuote(project,{id,provider:'Authorized test provider',description:'Actual test allowance',total,currency:'CREDITS'});return approveProductionQuote(project,id,{by:'Owner',note:'Explicit quote-specific approval',allowance:total});}
async function images(root){const wide=path.join(root,'wide.png'),portrait=path.join(root,'portrait.png'),evidence=path.join(root,'observations.md');await writeFile(wide,createBrandShareImage('Wide composition',brand));await writeFile(portrait,createBrandIcon('Portrait',brand,512));await writeFile(evidence,'Observed the actual wide and portrait composition and readable text.');return {wide,portrait,evidence};}
async function review(project,id,kind,evidence,verdict='accepted'){return reviewProductionAsset(project,{assetId:id,kind,verdict,by:'Owner',observations:'Observed full playback, joins and reverse seeks in this version.',evidenceFiles:[evidence]});}
async function site(root){const directory=path.join(root,'site');await mkdir(path.join(directory,'en'),{recursive:true});await mkdir(path.join(directory,'assets'));const html=(lang,title,next)=>'<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="A supplied page description"><link rel="stylesheet" href="/assets/site.css"></head><body><main id="main"><h1>'+title+'</h1><a href="'+next+'">Language</a><a href="#main">Top</a><div data-id="repeated"></div><div data-id="repeated"></div></main><script type="module" src="/assets/site.js"></script></body></html>';await writeFile(path.join(directory,'index.html'),html('sv','Forma','/en/'));await writeFile(path.join(directory,'en/index.html'),html('en','Forma English','/'));await writeFile(path.join(directory,'assets/site.css'),'body{color:#17242b;background:#fff}');await writeFile(path.join(directory,'assets/site.js'),'export const ready=true;');await writeFile(path.join(directory,'.env'),'SECRET=preserve');return directory;}

test('release refuses private SuperBrain state accidentally placed inside a public site',async()=>{
  const s=await sandbox();try{await init(s.project);const input=await site(s.root);await writeFile(path.join(input,'production.json'),'{"schema":1}');await assert.rejects(releaseProduction(s.project,input,path.join(s.root,'out')),/Private production/);await rm(path.join(input,'production.json'));await mkdir(path.join(input,'private-inbox'));await writeFile(path.join(input,'private-inbox/config.json'),JSON.stringify({schema:1,secret:'private',admin:null}));await assert.rejects(releaseProduction(s.project,input,path.join(s.root,'out')),/Private inbox/);}finally{await s.cleanup();}
});

test('production ledger enforces actual quote, approval and spend limits without selecting models or spending',async()=>{
  const s=await sandbox();try{
    await init(s.project);await assert.rejects(init(s.project),/Output already exists/);await approve(s.project);
    await addProductionQuote(s.project,{id:'next',provider:'Provider',description:'Another actual quote',total:60,currency:'CREDITS'});
    await assert.rejects(approveProductionQuote(s.project,'next',{by:'Owner',note:'Would exceed total',allowance:60}),/hard project budget/);
    await assert.rejects(recordProductionSpend(s.project,{id:'over',quoteId:'media',amount:61,receipt:'Actual invoice'}),/approved quote allowance/);
    await recordProductionSpend(s.project,{id:'invoice',quoteId:'media',amount:55,receipt:'invoice-001'});
    await assert.rejects(recordProductionSpend(s.project,{id:'invoice',quoteId:'media',amount:1,receipt:'duplicate'}),/already recorded/);
    await assert.rejects(addProductionQuote(s.project,{id:'usd',provider:'Provider',description:'Wrong currency',total:1,currency:'USD'}),/currency/);
    const state=await productionStatus(s.project);assert.deepEqual(state.budget,{limit:100,currency:'CREDITS',approved:60,spent:55,uncommitted:40,remaining:45});assert.equal(state.tier,'focused-budget');assert.equal(state.assets.length,0);
  }finally{await s.cleanup();}
});

test('production requires reviewed wide and portrait previews before generated film and invalidates versioned dependents',async()=>{
  const s=await sandbox();try{
    await init(s.project);await approve(s.project);const image=await images(s.root),film=path.join(s.root,'film.mp4');await writeFile(film,Buffer.from('local film inspected by the injected probe'));
    const probe=async()=>({duration:4,width:1920,height:1080,fps:24});
    const filmInput={id:'hero',kind:'film-wide',origin:'generated',file:film,quoteId:'media',jobReference:'provider-job-123',dependencies:['wide','portrait']};
    await importProductionAsset(s.project,{id:'wide',kind:'preview-wide',origin:'existing',file:image.wide});await importProductionAsset(s.project,{id:'portrait',kind:'preview-portrait',origin:'existing',file:image.portrait});
    await assert.rejects(importProductionAsset(s.project,filmInput,{probe}),/Review both/);await review(s.project,'wide','design',image.evidence);await review(s.project,'portrait','design',image.evidence);
    await importProductionAsset(s.project,filmInput,{probe});await review(s.project,'hero','film',image.evidence);await review(s.project,'hero','join',image.evidence);
    await importProductionAsset(s.project,{id:'poster',kind:'poster',origin:'existing',file:image.wide,dependencies:['hero']});
    // Even an identical pixel source is a new explicit production version.
    await importProductionAsset(s.project,{id:'wide',kind:'preview-wide',origin:'existing',file:image.wide});
    let state=await productionStatus(s.project);assert.deepEqual(new Set(state.staleAssets),new Set(['hero','poster']));assert(!state.assets.find(a=>a.id==='wide').reviews.includes('design'));
    await assert.rejects(review(s.project,'hero','film',image.evidence),/current dependencies/);await assert.rejects(importProductionAsset(s.project,{id:'wide',kind:'preview-wide',origin:'existing',file:image.wide,dependencies:['poster']}),/obsolete source|cycle/);
    const original=await readFile(image.wide);assert(original.equals(createBrandShareImage('Wide composition',brand)));
    const stored=JSON.parse(await readFile(path.join(s.project,'production.json'),'utf8'));await writeFile(path.join(s.project,stored.assets[0].versions[0].path),'user edit');state=await productionStatus(s.project);assert(state.integrityFailures.includes('wide v1'));
  }finally{await s.cleanup();}
});

test('release builds real multilingual pages, metadata, raster brand assets and handover while preserving source and existing output',async()=>{
  const s=await sandbox();try{
    await init(s.project);const source=await site(s.root),before=await readFile(path.join(source,'index.html')),out=path.join(s.root,'release');const result=await releaseProduction(s.project,source,out);
    assert.equal(result.report.status,'local-bundle-verified');assert.equal(result.report.deployment,'not-published');assert.equal(result.report.pages.length,2);assert.equal(result.report.staticChecks.issues.length,0);assert.equal(result.report.brandExports.html,true);assert.equal(result.report.brandExports.pdf,false);
    const html=await readFile(path.join(out,'public/index.html'),'utf8');assert.match(html,/rel="canonical" href="https:\/\/studio.example\/"/);assert.match(html,/hreflang="en" href="https:\/\/studio.example\/en\/"/);assert.equal((html.match(/<title>/g)||[]).length,1);assert.match(html,/apple-touch-icon/);
    const image=await readFile(path.join(out,'public/__superbrain/share.png'));assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);
    for(const size of [32,180,192,512]){const png=await readFile(path.join(out,'public/__superbrain/icon-'+size+'.png'));assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
    const manifest=JSON.parse(await readFile(path.join(out,'public/__superbrain/site.webmanifest'),'utf8'));assert.equal(manifest.icons[1].sizes,'512x512');assert.match(await readFile(path.join(out,'public/sitemap.xml'),'utf8'),/xhtml:link/);assert.match(await readFile(path.join(out,'public/robots.txt'),'utf8'),/https:\/\/studio.example\/sitemap.xml/);
    assert((await readFile(path.join(source,'index.html'))).equals(before));assert.equal(await readFile(path.join(source,'.env'),'utf8'),'SECRET=preserve');assert(!(await readdir(path.join(out,'public'))).includes('.env'));assert.match(await readFile(path.join(out,'delivery/HANDOVER.md'),'utf8'),/Upload only `public\//);
    await assert.rejects(releaseProduction(s.project,source,out),/Output already exists/);assert((await readFile(path.join(source,'index.html'))).equals(before));
  }finally{await s.cleanup();}
});

test('release refuses broken links, missing anchors, obsolete media and unsafe destinations before creating output',async()=>{
  const s=await sandbox();try{
    await init(s.project);const source=await site(s.root);await writeFile(path.join(source,'assets/site.css'),'body{background:url(./missing.png)}');
    await assert.rejects(releaseProduction(s.project,source,path.join(s.root,'broken')),/Missing local destination/);assert(!(await readdir(s.root)).includes('broken'));
    await assert.rejects(releaseProduction(s.project,source,path.join(source,'release')),/outside/);
    await writeFile(path.join(source,'assets/site.css'),'body{}');await writeFile(path.join(source,'index.html'),(await readFile(path.join(source,'index.html'),'utf8')).replace('href="#main"','href="#missing"'));
    await assert.rejects(releaseProduction(s.project,source,path.join(s.root,'anchor')),/Missing local anchor/);
    const bad=path.join(s.root,'pretend.png');await writeFile(bad,'not an image');await assert.rejects(importProductionAsset(s.project,{id:'bad',kind:'preview-wide',origin:'existing',file:bad}),/actual PNG/);
    const before=await readFile(path.join(s.project,'production.json'));await assert.rejects(review(s.project,'unknown','design',bad),/Unknown review asset/);assert((await readFile(path.join(s.project,'production.json'))).equals(before));
  }finally{await s.cleanup();}
});
