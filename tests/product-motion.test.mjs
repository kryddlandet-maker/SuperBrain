import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {initProductScene} from '../examples/shared/product-motion.js';
import {generateDesignSystem} from '../lib/design-system.mjs';
import {compileBrief} from '../lib/brief.mjs';
import {install} from '../scripts/install.mjs';

function host({reduced=false,supported=true,autoplay=true}={}) {
  const doc=new EventTarget(),media=new EventTarget(),button=new EventTarget(),attrs=new Map();
  doc.hidden=false;media.matches=reduced;button.textContent='Play';button.disabled=false;
  button.getAttribute=k=>attrs.get('button-'+k)??null;
  button.setAttribute=(k,v)=>attrs.set('button-'+k,v);
  button.removeAttribute=k=>attrs.delete('button-'+k);
  const root={ownerDocument:doc,getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)};
  const animations=[];let observer;
  const win={matchMedia:()=>media,IntersectionObserver:class {
    constructor(callback){this.callback=callback;observer=this;this.disconnected=false;}
    observe(){}
    disconnect(){this.disconnected=true;}
    visible(value){this.callback([{target:root,isIntersecting:value}]);}
  }};
  const tracks=Array.from({length:2},()=>({element:supported?{animate(){
    const a={playState:'running',currentTime:null,cancelled:false,play(){this.playState='running';},pause(){this.playState='paused';},cancel(){this.cancelled=true;this.playState='idle';}};
    animations.push(a);return a;
  }}:{},keyframes:[{opacity:0},{opacity:1}]}));
  const controller=initProductScene(root,tracks,{window:win,button,autoplay});
  return {controller,animations,observer,doc,media,button,root,tracks,win,attrs};
}
test('product tracks share time, pause offscreen/hidden, and retain manual pause on return',()=>{
  const h=host();assert.equal(h.controller.state,'offscreen');assert(h.animations.every(a=>a.playState==='paused'&&a.currentTime===0));
  h.observer.visible(true);assert.equal(h.controller.state,'playing');assert(h.animations.every(a=>a.playState==='running'));
  h.animations.forEach(a=>a.currentTime=1234);h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(h.controller.state,'hidden');assert(h.animations.every(a=>a.currentTime===1234&&a.playState==='paused'));
  h.doc.hidden=false;h.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(h.controller.state,'playing');
  h.button.dispatchEvent(new Event('click'));assert.equal(h.controller.state,'paused');h.observer.visible(false);h.observer.visible(true);assert.equal(h.controller.state,'paused');
  h.controller.restart();assert.equal(h.controller.state,'playing');assert(h.animations.every(a=>a.currentTime===0));h.controller.dispose();
});
test('reduced motion starts still, local playback is explicit, and live changes revoke that override',()=>{
  const h=host({reduced:true});h.observer.visible(true);assert.equal(h.controller.state,'still');assert(h.animations.every(a=>a.currentTime===7200*.68&&a.playState==='paused'));
  h.button.dispatchEvent(new Event('click'));assert.equal(h.controller.state,'playing');
  h.media.matches=false;h.media.dispatchEvent(new Event('change'));assert.equal(h.controller.state,'playing');
  h.media.matches=true;h.media.dispatchEvent(new Event('change'));assert.equal(h.controller.state,'still');
  h.controller.dispose();assert(h.observer.disconnected);assert(h.animations.every(a=>a.cancelled));assert.equal(h.root.getAttribute('data-motion-state'),null);assert.equal(h.button.textContent,'Play');
  h.button.dispatchEvent(new Event('click'));h.media.dispatchEvent(new Event('change'));h.doc.dispatchEvent(new Event('visibilitychange'));h.controller.restart();assert.equal(h.controller.state,'disposed');h.controller.dispose();
});
test('manual scenes do not auto-play, missing WAAPI keeps a still, and partial initialization is cancelled',()=>{
  const manual=host({autoplay:false});manual.observer.visible(true);assert.equal(manual.controller.state,'paused');manual.controller.play();assert.equal(manual.controller.state,'playing');manual.controller.dispose();
  const missing=host({supported:false});missing.observer.visible(true);assert.equal(missing.controller.state,'unavailable');assert(missing.button.disabled);missing.controller.dispose();
  const h=host();h.controller.dispose();let cancelled=false;
  h.tracks[0].element.animate=()=>({pause(){},cancel(){cancelled=true;}});h.tracks[1].element.animate=()=>{throw new Error('unsupported track');};
  const failed=initProductScene(h.root,h.tracks,{window:h.win});assert(cancelled);assert.equal(failed.state,'unavailable');failed.dispose();
  for(const change of [{duration:Infinity},{stillAt:2},{duration:0}])assert.throws(()=>initProductScene(h.root,h.tracks,{window:h.win,...change}));
});
const brief={name:'Planner',type:'technology',goal:'Explain the actual planning task'};
test('short scene requests route selectively and persist usable contracts without changing quiet or scoped work',async()=>{
  const defaultPlan=generateDesignSystem(brief);assert.equal(defaultPlan.plan.productMotion,null);assert(!defaultPlan.plan.routing.references.includes('product-motion'));
  for(const direction of ['Aktiva animationer i rörliga rutor','Animated product cards with a task transfer']){
    const result=generateDesignSystem({...brief,direction});assert(result.plan.routing.references.includes('product-motion'));assert.equal(result.plan.productMotion.playback,'visible-auto');
    assert.equal(JSON.parse(result.files['design-system/motion/product-scene.json']).pattern,'workflow');
    assert.equal(JSON.parse(result.files['.ai/project/superbrain/project.json']).productMotion.pattern,'workflow');
  }
  const quiet=generateDesignSystem({...brief,techniques:['scenes'],motion:'quiet'});assert.equal(quiet.plan.productMotion.playback,'manual');
  assert.equal(generateDesignSystem({...brief,techniques:['scenes'],preferences:{motionIntensity:1}}).plan.productMotion.playback,'manual');
  const quick=generateDesignSystem({...brief,task:'Justera produktanimationen med ikoner'});assert.equal(quick.plan.mode,'quick-edit');assert.equal(quick.tokens,null);assert.equal(quick.plan.productMotion.pattern,'orbit');assert.equal(Object.keys(quick.files).length,1);assert(!quick.plan.routing.references.includes('art-direction'));
  const text=await compileBrief({...brief,goal:'A product demo for video editing'});assert(text.includes('# Animated product demonstrations'));assert(text.includes('"pattern": "timeline"'));
});
test('standalone consumers receive the scene planner, guide and reusable runtime',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'superbrain-product-motion-'));
  try {
    await install(target);
    const {generateDesignSystem:generate}=await import(pathToFileURL(path.join(target,'.superbrain/lib/design-system.mjs')).href);
    assert.equal(generate({...brief,techniques:['scenes']}).plan.productMotion.pattern,'workflow');
    assert((await readFile(path.join(target,'.agents/skills/superbrain/references/product-motion.md'),'utf8')).includes('visible-auto'));
    const {initProductScene:init}=await import(pathToFileURL(path.join(target,'.superbrain/examples/shared/product-motion.js')).href);assert.equal(typeof init,'function');
    for(const file of ['index.html','motion.css','motion.js'])assert((await readFile(path.join(target,'.superbrain/examples/product-motion',file),'utf8')).length>100);
  }finally{await rm(target,{recursive:true,force:true});}
});
