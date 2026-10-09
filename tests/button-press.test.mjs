import test from 'node:test';
import assert from 'node:assert/strict';
import {initEffects} from '../examples/shared/effects.js';

class Target {
 listeners=new Map();attributes=new Map();
 addEventListener(n,f){if(!this.listeners.has(n))this.listeners.set(n,new Set());this.listeners.get(n).add(f);}
 removeEventListener(n,f){this.listeners.get(n)?.delete(f);}
 fire(n,e={}){for(const f of this.listeners.get(n)||[])f(e);}
 setAttribute(n,v){this.attributes.set(n,v);}
 removeAttribute(n){this.attributes.delete(n);}
 getAttribute(n){return this.attributes.has(n)?this.attributes.get(n):null;}
}
test('touch press clears on cancellation, hidden state and disposal without changing native activation',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};
 const win=new Target(),doc=new Target(),el=new Target(),media=new Target();media.matches=false;
 globalThis.window=win;globalThis.document=doc;globalThis.matchMedia=()=>media;
 try{
  const dispose=initEffects({querySelectorAll:s=>s==='[data-fill], [data-horizontal-glow]'?[el]:[]});
  el.fire('pointerdown',{pointerType:'mouse'});assert.equal(el.getAttribute('data-pressed'),null);
  el.fire('pointerdown',{pointerType:'touch'});assert.equal(el.getAttribute('data-pressed'),'');
  win.fire('pointercancel');assert.equal(el.getAttribute('data-pressed'),null);
  el.disabled=true;el.fire('pointerdown',{pointerType:'touch'});assert.equal(el.getAttribute('data-pressed'),null);
  el.disabled=false;el.fire('pointerdown',{pointerType:'touch'});doc.hidden=true;doc.fire('visibilitychange');assert.equal(el.getAttribute('data-pressed'),null);
  el.fire('pointerdown',{pointerType:'touch'});dispose();assert.equal(el.getAttribute('data-pressed'),null);
  el.fire('pointerdown',{pointerType:'touch'});assert.equal(el.getAttribute('data-pressed'),null);
 }finally{Object.assign(globalThis,old);}
});
