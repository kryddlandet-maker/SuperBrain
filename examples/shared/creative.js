const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function depthCoordinates(x,y,rect,max=6){return {x:clamp((x-rect.left)/Math.max(1,rect.width)*2-1,-1,1)*max,y:clamp((y-rect.top)/Math.max(1,rect.height)*2-1,-1,1)*max};}
export function comparisonValue(value){const n=Number(value);return Number.isFinite(n)?clamp(n,0,100):50;}
export function initCreative(root=document,options={}){
 for(const el of root.querySelectorAll('[data-needs-js]'))el.hidden=false;
 const disposers=[],animations=new Set();const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const listen=(el,name,fn,options)=>{el.addEventListener(name,fn,options);disposers.push(()=>el.removeEventListener(name,fn,options));};
 const animate=(el,frames,animationOptions)=>{if(options.reducedMotion||reduced.matches||document.hidden||!el.animate)return;const a=el.animate(frames,animationOptions);animations.add(a);a.finished?.then(()=>animations.delete(a),()=>animations.delete(a));return a;};
 const stop=()=>{animations.forEach(a=>a.cancel());animations.clear();};
 listen(reduced,'change',()=>{if(reduced.matches)stop();});listen(document,'visibilitychange',()=>{if(document.hidden)stop();});
 for(const el of root.querySelectorAll('[data-depth]')){
  let frame=0,point;const reset=()=>{if(frame)cancelAnimationFrame(frame);frame=0;point=null;el.style.removeProperty('--depth-x');el.style.removeProperty('--depth-y');};
  listen(el,'pointermove',e=>{if(options.reducedMotion||!fine.matches||reduced.matches||e.pointerType==='touch')return;point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(!point)return;const p=depthCoordinates(point.x,point.y,el.getBoundingClientRect());el.style.setProperty('--depth-x',p.x+'deg');el.style.setProperty('--depth-y',-p.y+'deg');});});
  for(const name of ['pointerleave','pointercancel'])listen(el,name,reset);listen(window,'resize',reset);listen(window,'scroll',reset,{passive:true,capture:true});listen(reduced,'change',reset);listen(fine,'change',reset);listen(document,'visibilitychange',()=>{if(document.hidden)reset();});disposers.push(reset);
 }
 for(const el of root.querySelectorAll('[data-compare]')){
  const range=el.querySelector('input[type=range]'),output=el.querySelector('output');if(!range)continue;range.disabled=false;
  const update=()=>{const value=comparisonValue(range.value);el.style.setProperty('--comparison',value+'%');if(output)output.textContent=value+'%';range.setAttribute('aria-valuetext',value+' procent av den ljusa illustrationen');};update();listen(range,'input',update);
 }
 for(const el of root.querySelectorAll('[data-product-demo]')){
  const options=[...el.querySelectorAll('[data-product-step]')],board=el.querySelector('.product-board'),status=el.querySelector('[role=status]');
  for(const button of options)listen(button,'click',()=>{const step=button.dataset.productStep;el.setAttribute('data-state',step);options.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(status)status.textContent=button.dataset.description;animate(board,[{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});});
 }
 for(const el of root.querySelectorAll('[data-filter-gallery]')){
  const buttons=[...el.querySelectorAll('[data-filter]')],cards=[...el.querySelectorAll('[data-category]')];
  let moving=[];
  for(const button of buttons)listen(button,'click',()=>{
   moving.forEach(a=>a?.cancel());moving=[];
   const before=new Map(cards.filter(c=>!c.hidden).map(c=>[c,c.getBoundingClientRect()]));
   cards.forEach(c=>{c.hidden=button.dataset.filter!=='all'&&c.dataset.category!==button.dataset.filter;});
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   for(const c of cards.filter(c=>!c.hidden)){const last=c.getBoundingClientRect(),first=before.get(c);if(first)moving.push(animate(c,[{transform:`translate(${clamp(first.left-last.left,-48,48)}px,${clamp(first.top-last.top,-48,48)}px)`},{transform:'translate(0,0)'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'}));else moving.push(animate(c,[{opacity:.3},{opacity:1}],{duration:250}));}
   const status=el.querySelector('[role=status]');if(status)status.textContent=cards.filter(c=>!c.hidden).length+' studier visas.';
  });
 }
 const reveals=[...root.querySelectorAll('[data-arrive]')];
 let observer;
 if(typeof IntersectionObserver==='function'){
  observer=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)if(isIntersecting){observer.unobserve(target);const parts=[...target.querySelectorAll('[data-line]')];if(parts.length)parts.forEach((part,i)=>animate(part,[{transform:'translateY(35%)',opacity:.4},{transform:'translateY(0)',opacity:1}],{duration:600,delay:i*75,easing:'cubic-bezier(.22,1,.36,1)'}));else if(target.matches('[data-draw]'))animate(target,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1100,easing:'ease-in-out'});else animate(target,[{clipPath:'inset(0 0 85% 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:750,easing:'cubic-bezier(.22,1,.36,1)'});}}, {threshold:.2});
  reveals.forEach(el=>observer.observe(el));disposers.push(()=>observer.disconnect());
 }
 let disposed=false;return()=>{if(disposed)return;disposed=true;stop();disposers.reverse().forEach(fn=>fn());};
}
