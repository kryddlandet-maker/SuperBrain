import test from 'node:test';
import assert from 'node:assert/strict';
import {initEffects} from '../examples/shared/effects.js';
import {initScrollScenes, sceneProgress} from '../examples/shared/scroll-scenes.js';

class Target{
 listeners=new Map();styleValues=new Map();attributes=new Map();
 style={setProperty:(k,v)=>this.styleValues.set(k,v),removeProperty:k=>this.styleValues.delete(k)};
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
 fire(name,event={}){for(const fn of this.listeners.get(name)||[])fn(event);}
 setAttribute(name,value){this.attributes.set(name,value);}removeAttribute(name){this.attributes.delete(name);}
 getAttribute(name){return this.attributes.get(name);}
 getBoundingClientRect(){return {left:100,top:50,width:300,height:200};}
}
test('pointer effects coalesce input, use local coordinates and reset for motion preference and disposal',()=>{
 const windowTarget=new Target(),doc=new Target(),el=new Target(),fine=new Target(),reduced=new Target();fine.matches=true;reduced.matches=false;
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const frames=new Map();let id=0;
 globalThis.window=windowTarget;globalThis.document=doc;globalThis.matchMedia=query=>query.includes('reduced')?reduced:fine;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 const root={querySelectorAll:selector=>selector==='[data-pointer]'?[el]:[]};
 try{
  const dispose=initEffects(root);el.fire('pointerenter',{pointerType:'mouse'});el.fire('pointermove',{clientX:120,clientY:80});el.fire('pointermove',{clientX:190,clientY:160});assert.equal(frames.size,1);
  const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());assert.equal(el.styleValues.get('--pointer-x'),'90px');assert.equal(el.styleValues.get('--pointer-y'),'110px');
  reduced.matches=true;reduced.fire('change');assert.equal(el.attributes.has('data-tracking'),false);assert.equal(el.styleValues.size,0);
  el.fire('pointermove',{clientX:200,clientY:200});assert.equal(frames.size,0);
  reduced.matches=false;el.fire('pointermove',{clientX:200,clientY:200});assert.equal(frames.size,1);dispose();dispose();assert.equal(frames.size,0);
  el.fire('pointermove',{clientX:200,clientY:200});assert.equal(frames.size,0);
 }finally{Object.assign(globalThis,old);}
});

test('soft reveal converges, clamps to the surface and stops requesting frames',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const el=new Target(),fine=new Target(),reduced=new Target();fine.matches=true;reduced.matches=false;el.setAttribute('data-follow','soft');
 const frames=new Map();let id=0;globalThis.window=new Target();globalThis.document=new Target();globalThis.matchMedia=q=>q.includes('reduced')?reduced:fine;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 try{
  const dispose=initEffects({querySelectorAll:s=>s==='[data-pointer]'?[el]:[]});el.fire('pointermove',{clientX:900,clientY:-100});
  let time=16;const tick=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));time+=16;};tick();
  assert(parseFloat(el.styleValues.get('--pointer-x'))>150);assert(parseFloat(el.styleValues.get('--pointer-x'))<300);
  for(let count=0;frames.size&&count<100;count++)tick();
  assert.equal(frames.size,0);assert.equal(el.styleValues.get('--pointer-x'),'300px');assert.equal(el.styleValues.get('--pointer-y'),'0px');
  el.fire('pointerleave');assert.equal(el.styleValues.size,0);dispose();
 }finally{Object.assign(globalThis,old);}
});

test('button activation is centered for keyboards and respects reduced motion and cleanup',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};
 const el=new Target(),ripple=new Target(),media=new Target();media.matches=false;let played=0,canceled=0;
 ripple.animate=()=>{played++;return {cancel:()=>canceled++};};el.querySelector=()=>ripple;
 globalThis.window=new Target();globalThis.document=new Target();globalThis.matchMedia=()=>media;
 try{const dispose=initEffects({querySelectorAll:s=>s==='[data-light-button]'?[el]:[]});
  el.fire('click',{detail:0});assert.equal(ripple.style.left,'150px');assert.equal(ripple.style.top,'100px');assert.equal(played,1);
  el.fire('click',{detail:1,clientX:130,clientY:70});assert.equal(ripple.style.left,'30px');assert.equal(canceled,1);
  media.matches=true;media.fire('change');el.fire('click',{detail:0});assert.equal(played,2);dispose();
  const count=played;el.fire('click',{detail:0});assert.equal(played,count);
 }finally{Object.assign(globalThis,old);}
});

test('scroll scene is reversible, dynamic on narrow views, static with reduced motion, idle offscreen and disposable',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,IntersectionObserver:globalThis.IntersectionObserver};
 const win=new Target(),doc=new Target(),scene=new Target(),wide=new Target(),reduced=new Target();win.innerHeight=1000;wide.matches=true;reduced.matches=false;
 let top=150,observerCallback,disconnected=false,id=0;const frames=new Map();scene.getBoundingClientRect=()=>({top,height:3000});
 globalThis.window=win;globalThis.document=doc;globalThis.matchMedia=q=>q.includes('reduced')?reduced:wide;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 globalThis.IntersectionObserver=class{constructor(cb){observerCallback=cb;}observe(){}disconnect(){disconnected=true;}};
 const tick=()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());};
 try{const dispose=initScrollScenes({querySelectorAll:()=>[scene]});assert.equal(frames.size,0);
  observerCallback([{target:scene,isIntersecting:true}]);tick();assert.equal(scene.styleValues.get('--scene-progress'),'0');
  top=-2000;win.fire('scroll');tick();assert.equal(scene.styleValues.get('--scene-progress'),'1');assert.equal(scene.getAttribute('data-scene-state'),'resolve');
  top=150;win.fire('scroll');tick();assert.equal(scene.styleValues.get('--scene-progress'),'0');
  reduced.matches=true;reduced.fire('change');tick();assert.equal(scene.styleValues.get('--scene-progress'),'0.5');
  reduced.matches=false;wide.matches=false;win.fire('resize');tick();assert.equal(scene.styleValues.get('--scene-progress'),'0');
  dispose();const previewDispose=initScrollScenes({querySelectorAll:()=>[scene]},{motionPreview:true});reduced.matches=true;observerCallback([{target:scene,isIntersecting:true}]);tick();assert.equal(scene.styleValues.get('--scene-progress'),'0');previewDispose();
  const stillDispose=initScrollScenes({querySelectorAll:()=>[scene]},{motionPreview:true,reducedMotion:true});observerCallback([{target:scene,isIntersecting:true}]);tick();assert.equal(scene.styleValues.get('--scene-progress'),'0.5');stillDispose();
  observerCallback([{target:scene,isIntersecting:false}]);win.fire('scroll');assert.equal(frames.size,0);
  dispose();assert(disconnected);assert.equal(scene.styleValues.size,0);assert.equal(sceneProgress(150,3000,1000),0);assert.equal(sceneProgress(-2000,3000,1000),1);
 }finally{Object.assign(globalThis,old);}
});
test('coarse pointers leave all decorative tracking inactive',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};
 const el=new Target(),media=new Target();media.matches=false;
 globalThis.window=new Target();globalThis.document=new Target();globalThis.matchMedia=()=>media;
 try{const dispose=initEffects({querySelectorAll:s=>s==='[data-pointer]'?[el]:[]});el.fire('pointerenter',{pointerType:'touch'});el.fire('pointermove',{pointerType:'touch',clientX:200,clientY:100});assert.equal(el.attributes.size,0);assert.equal(el.styleValues.size,0);dispose();}
 finally{Object.assign(globalThis,old);}
});
