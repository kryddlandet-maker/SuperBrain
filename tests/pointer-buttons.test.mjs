import test from 'node:test';
import assert from 'node:assert/strict';
import {initPointerButtons} from '../examples/shared/pointer-buttons.js';
class Target {
 listeners=new Map();attrs=new Map();dataset={};values=new Map();
 style={setProperty:(k,v)=>this.values.set(k,v),removeProperty:k=>this.values.delete(k)};
 addEventListener(k,f){if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(f);}
 removeEventListener(k,f){this.listeners.get(k)?.delete(f);}
 fire(k,e={}){for(const f of this.listeners.get(k)||[])f(e);}
 setAttribute(k,v){this.attrs.set(k,v);}removeAttribute(k){this.attrs.delete(k);}getAttribute(k){return this.attrs.get(k);}hasAttribute(k){return this.attrs.has(k);}
 getBoundingClientRect(){return {left:100,top:50,width:200,height:100};}
}
test('new pointer family stops on visibility/preferences/scroll, coalesces input and cleans all listeners',()=>{
 const keys=['window','document','matchMedia','requestAnimationFrame','cancelAnimationFrame'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const win=new Target(),doc=new Target(),fine=new Target(),reduced=new Target(),side=new Target(),spot=new Target();fine.matches=true;reduced.matches=false;side.dataset.pointerEffect='side';spot.dataset.pointerEffect='spot';
 let id=0,time=0;const frames=new Map();globalThis.window=win;globalThis.document=doc;globalThis.matchMedia=q=>q.includes('reduced')?reduced:fine;globalThis.requestAnimationFrame=f=>{frames.set(++id,f);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 const root={querySelectorAll:()=>[side,spot]},move={clientX:280,clientY:135,pointerType:'mouse'};
 const tick=()=>{time+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(time));};
 try {
  const dispose=initPointerButtons(root);side.fire('pointermove',move);side.fire('pointermove',move);spot.fire('pointermove',move);assert.equal(frames.size,2);tick();
  assert.equal(side.values.get('--pb-y'),'50%');assert(parseFloat(spot.values.get('--pb-y'))>50);
  doc.hidden=true;doc.fire('visibilitychange');assert.equal(frames.size,0);assert.equal(side.hasAttribute('data-tracking'),false);
  side.fire('pointermove',move);assert.equal(frames.size,0);doc.hidden=false;side.fire('pointermove',move);assert.equal(frames.size,1);
  win.fire('scroll');assert.equal(frames.size,0);side.fire('pointermove',move);reduced.matches=true;reduced.fire('change');assert.equal(frames.size,0);assert.equal(side.dataset.pointerMotion,'false');
  side.fire('pointermove',move);assert.equal(frames.size,0);reduced.matches=false;reduced.fire('change');side.fire('pointermove',move);
  for(let i=0;frames.size&&i<120;i++)tick();assert.equal(frames.size,0);assert.equal(side.values.get('--pb-x'),'90%');
  fine.matches=false;fine.fire('change');side.fire('pointermove',move);assert.equal(frames.size,0);dispose();
  for(const el of [win,doc,fine,reduced,side,spot])assert.equal([...el.listeners.values()].reduce((n,s)=>n+s.size,0),0);
  assert.equal(side.values.size,0);side.fire('pointermove',move);assert.equal(frames.size,0);
 } finally {Object.assign(globalThis,old);}
});
