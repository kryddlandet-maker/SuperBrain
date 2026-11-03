import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {planDesign} from '../lib/design-engine.mjs';
import {generateDesignSystem} from '../lib/design-system.mjs';
import {validateBrief,compileBrief} from '../lib/brief.mjs';
import {wantsCinematicMotion} from '../lib/cinematic-plan.mjs';
import {saveProject,loadProject} from '../lib/project-store.mjs';
import {install} from '../scripts/install.mjs';

const base={name:'Actual product',type:'technology',goal:'Understand the supplied product'};
test('cinematic routing selects a film contract only for an explicit family or film-hero request',()=>{
  for(const type of ['technology','salon','construction','crm']){
    const ordinary=generateDesignSystem({...base,type,motion:'quiet'});
    assert.equal(ordinary.plan.cinematicMotion,null);
    assert(!ordinary.plan.routing.references.includes('cinematic-media'));
    assert(!Object.keys(ordinary.files).some(file=>file.includes('cinematic-')));
  }
  for(const direction of ['A cinematic hero for the product','En filmisk hero','En filmisk scrollsajt för en ljusskulptur','En scrollfilm över produkten','Scrollstyrd video som öppning','A scroll-driven film with readable captions']){
    const result=generateDesignSystem({...base,direction});
    assert.equal(result.plan.cinematicMotion.pattern,'scroll-film');
    assert.equal(result.plan.cinematicMotion.playback,'scroll');
    assert(result.plan.routing.references.includes('cinematic-media'));
    assert.equal(result.plan.productMotion,null);
  }
  assert(wantsCinematicMotion({...base,techniques:['cinematic']}));
  assert(!wantsCinematicMotion({...base,goal:'A product demo for video editing'}));
  assert.throws(()=>validateBrief({...base,techniques:['cinematic','cinematic']}),/duplicate/);
});

test('quiet cinematic scenes keep a still-first policy and quick edits preserve the existing system',async()=>{
  for(const change of [{motion:'quiet'},{preferences:{motionIntensity:1}}]){
    const result=generateDesignSystem({...base,techniques:['cinematic'],...change});
    assert.equal(result.plan.cinematicMotion.playback,'static-first');
    assert.equal(result.plan.cinematicMotion.accessibility.staticFirst,true);
  }
  const edit=generateDesignSystem({...base,task:'Justera färgen på cinematic hero',techniques:['cinematic']});
  assert.equal(edit.plan.mode,'quick-edit');assert.equal(edit.plan.cinematicMotion,null);
  assert.equal(edit.tokens,null);assert.equal(Object.keys(edit.files).length,1);
  assert(!edit.plan.routing.references.includes('cinematic-media'));
  const compiled=await compileBrief({...base,direction:'En scrollvideo visar produkten'});
  assert(compiled.includes('<!-- cinematic-media -->'));
  const ordinary=await compileBrief({...base,motion:'quiet'});
  assert(!ordinary.includes('<!-- cinematic-media -->'));
});

test('film outputs preserve media dependencies, unset spending and decoded-time typography in project memory',async()=>{
  const generated=generateDesignSystem({...base,techniques:['cinematic']});
  const scene=JSON.parse(generated.files['design-system/motion/cinematic-scene.json']);
  const production=JSON.parse(generated.files['design-system/motion/cinematic-production.json']);
  assert.equal(scene.typography.driver,'presented-media-time');
  assert.deepEqual(scene.storyboard.map(c=>c.at),[0,.35,.72,1]);
  assert.equal(scene.storyboard.every(c=>c.copy===null),true);
  assert.equal(production.assets.wide.source,null);assert.equal(production.assets.portrait.source,null);
  assert.deepEqual(production.generation,{provider:null,models:null,approvedBudget:null,currency:null,actualSpend:null,approval:null});
  assert(production.dependencies.some(d=>d.to.includes('portrait treatment')&&d.to.includes('typography cues')));
  assert.equal(scene.acceptance.some(check=>check.check==='forward-reverse-jump'),true);
  assert.equal(JSON.parse(generated.files['.ai/project/superbrain/project.json']).cinematicMotion.pattern,'scroll-film');
  const target=await mkdtemp(path.join(tmpdir(),'superbrain-cinematic-plan-'));
  try{
    await writeFile(path.join(target,'app.js'),'Keep working customer code');
    await saveProject(target,generated.files);await saveProject(target,generated.files);
    assert.deepEqual((await loadProject(target)).cinematicMotion,scene);
    assert.equal(await readFile(path.join(target,'app.js'),'utf8'),'Keep working customer code');
    const file=path.join(target,'design-system/motion/cinematic-production.json');
    await writeFile(file,'Owner production decisions');
    await assert.rejects(saveProject(target,generated.files),/Locally edited/);
    assert.equal(await readFile(file,'utf8'),'Owner production decisions');
  }finally{await rm(target,{recursive:true,force:true});}
});

test('standalone installation retains the cinematic planner and selectively loaded guide',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'superbrain-cinematic-install-'));
  try{
    await install(target);
    const {generateDesignSystem:generate}=await import(pathToFileURL(path.join(target,'.superbrain/lib/design-system.mjs')).href);
    const result=generate({...base,techniques:['cinematic']});
    assert.equal(result.plan.cinematicMotion.typography.driver,'presented-media-time');
    assert((await readFile(path.join(target,'.agents/skills/superbrain/references/cinematic-media.md'),'utf8')).length>1000);
  }finally{await rm(target,{recursive:true,force:true});}
});
