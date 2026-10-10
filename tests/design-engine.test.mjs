import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
import {planDesign} from '../lib/design-engine.mjs';
import {generateDesignSystem,flattenTokens,contrast} from '../lib/design-system.mjs';
import {saveProject,loadProject} from '../lib/project-store.mjs';
import {businessTypes,validateBrief} from '../lib/project-schema.mjs';
import {skillIndex,searchSkills} from '../lib/skill-router.mjs';
import {root,compileBrief} from '../lib/brief.mjs';
const base={name:'Actual project',type:'salon',goal:'Choose a verified service'};
test('business decisions remain distinct, explicit choices win and all optional dials influence generated contracts',()=>{
 const identities=new Set(businessTypes.map(type=>planDesign({...base,type}).direction.identity));assert.equal(identities.size,businessTypes.length);
 const quiet=planDesign({...base,motion:'quiet',preferences:{motionIntensity:9}});assert.equal(quiet.preferences.motionIntensity,2);
 const custom=generateDesignSystem({...base,direction:'My supplied direction',theme:'dark',accent:'#bbbb00',pages:['/','/booking'],pageExceptions:{'/booking':{purpose:'Real booking',density:8}}});assert.equal(custom.plan.direction.identity,'My supplied direction');assert.equal(custom.tokens.color.accent,'#bbbb00');assert(contrast(custom.tokens.color.accent,custom.tokens.color['on-accent'])>=4.5);assert(Object.values(custom.files).some(s=>s.includes('--sb-page-gap: 16px')));
 const low=generateDesignSystem({...base,preferences:{creativeFreedom:1,visualComplexity:1,contentDensity:1,expressiveness:1}}),high=generateDesignSystem({...base,preferences:{creativeFreedom:9,visualComplexity:9,contentDensity:9,expressiveness:9}});assert.notEqual(low.plan.direction.composition,high.plan.direction.composition);assert.notEqual(low.tokens.shadow.raised,high.tokens.shadow.raised);assert.notEqual(low.tokens.space[5],high.tokens.space[5]);assert.notEqual(low.tokens.type.h1,high.tokens.type.h1);
});
test('quick edits keep scope and avoid new design systems or specialist chapters',async()=>{
 const quick={...base,task:'Justera hover på knappen'};const result=generateDesignSystem(quick);assert.equal(result.plan.mode,'quick-edit');assert.equal(result.tokens,null);assert.deepEqual(result.plan.direction.palette,[]);assert.equal(result.plan.decisions[0].area,'scope');assert(result.plan.routing.references.includes('button-interactions'));assert(!result.plan.routing.references.includes('art-direction'));assert(!result.plan.routing.references.includes('advanced-graphics'));assert.equal(Object.keys(result.files).length,1);
 const text=await compileBrief(quick);assert(!text.includes('# Art direction with freedom'));assert(text.includes('Preserve the existing system'));
 const build=planDesign({...base,type:'technology',motion:'immersive',techniques:['graphics','buttons']});assert.equal(build.mode,'creative-engineering');assert(build.routing.references.includes('motion-lifecycle'));assert(build.routing.references.includes('advanced-graphics'));
});
test('tokens JSON and CSS agree for all business profiles and semantic pairs pass contrast',()=>{
 for(const type of businessTypes){const result=generateDesignSystem({...base,type}),stored=JSON.parse(result.files['design-system/tokens.json']);assert.deepEqual(stored.tokens,result.tokens);for(const [key,value]of flattenTokens(result.tokens))assert(result.files['design-system/tokens.css'].includes('--sb-'+key+': '+value+';'));assert(result.contrast.body>=4.5);assert(result.contrast.action>=4.5);assert(result.contrast.muted>=4.5);}
});
test('project memory persists without overwriting facts, unrelated code or local edits',async()=>{
 const target=await mkdtemp(path.join(os.tmpdir(),'superbrain-project-'));
 try{await writeFile(path.join(target,'app.js'),'Keep real code');const result=generateDesignSystem(base);await saveProject(target,result.files);assert.equal((await loadProject(target)).facts.name,base.name);await saveProject(target,result.files);assert.equal(await readFile(path.join(target,'app.js'),'utf8'),'Keep real code');await writeFile(path.join(target,'design-system/MASTER.md'),'User direction');await assert.rejects(saveProject(target,generateDesignSystem({...base,accent:'#abcdef'}).files),/Locally edited/);assert.equal(await readFile(path.join(target,'design-system/MASTER.md'),'utf8'),'User direction');assert.equal(JSON.parse(await readFile(path.join(target,'design-system/tokens.json'),'utf8')).tokens.color.accent,result.tokens.color.accent);
 }finally{await rm(target,{recursive:true,force:true});}
 const unmanaged=await mkdtemp(path.join(os.tmpdir(),'superbrain-unmanaged-'));
 try{await mkdir(path.join(unmanaged,'design-system'));await writeFile(path.join(unmanaged,'design-system/tokens.css'),'User CSS');await assert.rejects(saveProject(unmanaged,generateDesignSystem(base).files),/Unmanaged/);await assert.rejects(readFile(path.join(unmanaged,'.ai/project/superbrain/project.json')),/ENOENT/);}finally{await rm(unmanaged,{recursive:true,force:true});}
});
test('unsafe routes, invalid preferences, unknown exceptions and token injection are rejected',()=>{
 for(const change of [{pages:['/../private']},{pages:['/'],pageExceptions:{'/new':{density:5}}},{preferences:{contentDensity:NaN}},{preferences:{madeUp:4}},{accent:'#fff;}'},{mode:'anything'}])assert.throws(()=>validateBrief({...base,...change}));
});
test('skill index has real chapters, resolvable dependencies and conjunctive search',async()=>{
 for(const entry of skillIndex){assert((await readFile(path.join(root,entry.path),'utf8')).length>100);assert(entry.dependencies.every(id=>skillIndex.some(s=>s.id===id)));}assert(searchSkills('button').some(s=>s.id==='button-interactions'));assert.equal(searchSkills('nonexistent-specialist').length,0);
});

test('component references preserve context and persist attributed observations without turning into a new site',()=>{
 const reference={source:'owned-sidebar.png',reviewer:'Recorded local review',scope:'component',target:'.crm-tab[aria-current=page]',observations:['Only the marked tab needs fading dots.'],preserve:['Row height','Icon and text position','Navigation and fixed hit target']};
 const result=generateDesignSystem({...base,references:[reference]});assert.equal(result.plan.mode,'quick-edit');assert.equal(result.tokens,null);assert(result.plan.routing.references.includes('reference-workflow'));assert.equal(result.plan.references[0].target,reference.target);assert(Object.values(result.files)[0].includes('Icon and text position'));assert.throws(()=>planDesign({...base,references:[{...reference,target:''}]}));
});

test('explicit art direction drives actual tokens while rejecting CSS injection',()=>{const result=generateDesignSystem({...base,artDirection:{identity:'Supplied identity',composition:'Supplied layout',displayFont:'Courier New, monospace',bodyFont:'Arial, sans-serif',palette:['#eaf8fb','#1a3452','#325baa']}});assert.equal(result.tokens.type.display,'Courier New, monospace');assert.equal(result.tokens.color.background,'#eaf8fb');assert.equal(result.plan.direction.composition,'Supplied layout');assert.throws(()=>generateDesignSystem({...base,artDirection:{displayFont:'serif; background:url(evil)'}}));});

test('custom palettes retain readable secondary and status text even on midtone backgrounds',()=>{for(const background of ['#eef0f2','#777777','#767676','#818192','#a35533','#777000','#445599','#222244']){const result=generateDesignSystem({...base,artDirection:{palette:[background,'#234c5d','#777777']}});for(const role of ['ink','muted','success','error'])assert(contrast(background,result.tokens.color[role])>=4.5,background+' '+role);assert(result.contrast.action>=4.5);}for(let n=0;n<96;n++){const background='#'+((n*173731+71351)%16777216).toString(16).padStart(6,'0');const result=generateDesignSystem({...base,artDirection:{palette:[background,'#777777','#777777']}});assert(result.contrast.body>=4.5);assert(result.contrast.muted>=4.5);assert(result.contrast.action>=4.5);}});

test('every palette family works across business types and exports readable synchronized tokens',async()=>{
 const {colorFamilies}=await import('../lib/color-direction.mjs');
 for(const family of colorFamilies)for(const theme of ['light','dark'])for(const type of businessTypes){
  const result=generateDesignSystem({...base,type,paletteFamily:family.id,theme});
  assert.equal(result.tokens.color.background,family[theme][0]);
  assert.equal(result.tokens.color.accent,family[theme][2]);
  assert.equal(result.plan.direction.colorSelection.family,family.id);
  assert(result.contrast.body>=4.5);assert(result.contrast.muted>=4.5);assert(result.contrast.action>=4.5);
  assert.deepEqual(JSON.parse(result.files['design-system/tokens.json']).tokens,result.tokens);
  for(const [key,value]of flattenTokens(result.tokens))assert(result.files['design-system/tokens.css'].includes('--sb-'+key+': '+value+';'));
 }
});
test('complete brand colors outrank theme and family, while scoped edits preserve the existing system',()=>{
 const brief={...base,paletteFamily:'green',theme:'dark',artDirection:{palette:['#fff5f8','#402030','#932345']}};
 const result=generateDesignSystem(brief);assert.equal(result.tokens.color.background,'#fff5f8');assert.equal(result.tokens.color.ink,'#402030');assert.equal(result.plan.direction.colorSelection.source,'custom-palette');
 const accent=generateDesignSystem({...brief,accent:'#3548ac'});assert.equal(accent.tokens.color.background,'#fff5f8');assert.equal(accent.tokens.color.accent,'#3548ac');
 const quick=generateDesignSystem({...brief,mode:'quick-edit',task:'Justera hover på knappen'});assert.equal(quick.tokens,null);assert.deepEqual(quick.plan.direction.palette,[]);assert.equal(Object.keys(quick.files).length,1);
});
test('palette choices reject unknown families and CSS injection',()=>{
 for(const paletteFamily of ['unknown','green; background:red'])assert.throws(()=>validateBrief({...base,paletteFamily}));
 assert.throws(()=>validateBrief({...base,artDirection:{palette:['#fff','#000','red; color:red']}}));
});
