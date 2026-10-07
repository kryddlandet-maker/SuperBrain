import test from 'node:test';
import assert from 'node:assert/strict';
import {initEffects} from '../examples/shared/effects.js';

class Target{
 listeners=new Map();styleValues=new Map();attributes=new Map();
 style={setProperty:(k,v)=>this.styleValues.set(k,v),removeProperty:k=>this.styleValues.delete(k)};
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
 fire(name,event={}){for(const fn of this.listeners.get(name)||[])fn(event);}
 setAttribute(name,value){this.attributes.set(name,value);}removeAttribute(name){this.attributes.delete(name);}
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
test('coarse pointers leave all decorative tracking inactive',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};
 const el=new Target(),media=new Target();media.matches=false;
 globalThis.window=new Target();globalThis.document=new Target();globalThis.matchMedia=()=>media;
 try{const dispose=initEffects({querySelectorAll:s=>s==='[data-pointer]'?[el]:[]});el.fire('pointerenter',{pointerType:'touch'});el.fire('pointermove',{pointerType:'touch',clientX:200,clientY:100});assert.equal(el.attributes.size,0);assert.equal(el.styleValues.size,0);dispose();}
 finally{Object.assign(globalThis,old);}
});
