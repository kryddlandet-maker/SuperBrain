/** Original small primitives. CSS owns their appearance; one disposable controller owns their state. */
export function initInspirationEffects(root=document,{window:win=window}={}){
  const doc=root.ownerDocument||root,reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),wide=win.matchMedia('(min-width: 760px)'),coarse=win.matchMedia('(pointer: coarse)');
  const elements=[...root.querySelectorAll('[data-sb-effect]')],restore=[],listeners=[],animations=[],observers=[];let frame=0,timer=0,disposed=false,paused=false;
  const remember=(el,name)=>{const before=el.getAttribute(name);restore.push(()=>before===null?el.removeAttribute(name):el.setAttribute(name,before));};
  const css=(el,name,value)=>{if(!restore.some(item=>item.element===el&&item.property===name)){const before=el.style.getPropertyValue(name),priority=el.style.getPropertyPriority(name),undo=()=>before?el.style.setProperty(name,before,priority):el.style.removeProperty(name);undo.element=el;undo.property=name;restore.push(undo);}el.style.setProperty(name,String(value));};
  const listen=(el,name,fn,options)=>{el.addEventListener(name,fn,options);listeners.push(()=>el.removeEventListener(name,fn,options));};
  const clamp=value=>Math.min(1,Math.max(0,value));
  const active=()=>!disposed&&!paused&&!doc.hidden&&!reduced.matches;
  for(const el of elements){
    remember(el,'data-sb-ready');remember(el,'data-sb-visible');el.setAttribute('data-sb-ready','true');el.setAttribute('data-sb-visible','true');
    const kind=el.dataset.sbEffect;
    if(['spotlight','tilt','sheen'].includes(kind)){
      const move=event=>{if(!active()||coarse.matches)return;const rect=el.getBoundingClientRect(),x=clamp((event.clientX-rect.left)/rect.width),y=clamp((event.clientY-rect.top)/rect.height);css(el,'--sb-x',x*100+'%');css(el,'--sb-y',y*100+'%');css(el,'--sb-rx',(y-.5)*-10+'deg');css(el,'--sb-ry',(x-.5)*10+'deg');css(el,'--sb-hover',1);};
      const reset=()=>{css(el,'--sb-hover',0);css(el,'--sb-rx','0deg');css(el,'--sb-ry','0deg');};listen(el,'pointermove',move);listen(el,'pointerleave',reset);listen(el,'blur',reset,true);
    }
    if(kind==='floating-image'){
      const image=el.querySelector('[data-sb-floating]');if(image){remember(image,'hidden');image.hidden=true;listen(el,'pointermove',event=>{if(!active()||coarse.matches)return;const rect=el.getBoundingClientRect();css(image,'--sb-x',Math.min(rect.width-140,Math.max(0,event.clientX-rect.left))+'px');css(image,'--sb-y',Math.max(0,event.clientY-rect.top-60)+'px');image.hidden=false;});listen(el,'pointerleave',()=>image.hidden=true);listen(el,'focusin',()=>{css(image,'--sb-x','50%');css(image,'--sb-y','0px');image.hidden=false;});listen(el,'focusout',()=>image.hidden=true);}
    }
    if(kind==='split'){
      const text=el.textContent,nodes=[...el.childNodes];restore.push(()=>el.replaceChildren(...nodes));remember(el,'aria-label');el.setAttribute('aria-label',text);el.replaceChildren(...(el.dataset.split==='chars'?[...text]:text.split(/(\s+)/)).map((word,index)=>{const span=doc.createElement('span');span.textContent=word;span.setAttribute('aria-hidden','true');span.style.setProperty('--sb-order',index);return span;}));
    }
    if(kind==='count'){const initial=el.textContent;restore.push(()=>el.textContent=initial);}
    if(kind==='rotate'){
      const words=[...el.querySelectorAll('[data-sb-word]')];words.forEach((word,index)=>{remember(word,'hidden');word.hidden=index!==0;});let index=0,last=0;
      const duration=Math.max(1500,Number(el.dataset.interval)||2400);const tick=time=>{if(time-last>=duration){words[index].hidden=true;index=(index+1)%words.length;words[index].hidden=false;last=time;}return !disposed;};if(words.length>1)animations.push({tick,duration,element:el,stop:()=>{words.forEach((word,i)=>word.hidden=i!==0);}});
    }
    if(['marquee','columns','flow'].includes(kind)&&el.animate){
      const targets=kind==='columns'?[...el.querySelectorAll('[data-sb-column]')]:[el.querySelector('[data-sb-track]')||el];
      targets.forEach((target,index)=>{const animation=target.animate(kind==='flow'?[{strokeDashoffset:0},{strokeDashoffset:-100}]:kind==='columns'?[{transform:'translateY('+(index%2?'-25%':'0%')+')'},{transform:'translateY('+(index%2?'0%':'-25%')+')'}]:[{transform:'translateX(0)'},{transform:'translateX(-50%)'}],{duration:kind==='flow'?5000:22000,iterations:Infinity,easing:'linear'});animation.pause();animations.push({animation,element:el});});
      listen(el,'pointerenter',()=>{el.dataset.sbHover='true';refresh();});listen(el,'pointerleave',()=>{delete el.dataset.sbHover;refresh();});listen(el,'focusin',()=>{el.dataset.sbHover='true';refresh();});listen(el,'focusout',()=>{delete el.dataset.sbHover;refresh();});restore.push(()=>delete el.dataset.sbHover);
    }
  }
  function refresh(){
    if(timer){win.clearTimeout(timer);timer=0;}
    for(const entry of animations)if(entry.animation){if(active()&&entry.element.dataset.sbVisible==='true'&&entry.element.dataset.sbHover!=='true')entry.animation.play();else entry.animation.pause();}
    if(!active())for(const el of elements){css(el,'--sb-hover',0);css(el,'--sb-rx','0deg');css(el,'--sb-ry','0deg');if(el.dataset.sbEffect==='floating-image'){const img=el.querySelector('[data-sb-floating]');if(img)img.hidden=true;}}
    schedule();
  }
  function paint(time){
    frame=0;if(disposed)return;
    for(const el of elements){
      const rect=el.getBoundingClientRect(),kind=el.dataset.sbEffect,progress=active()?clamp((win.innerHeight*.82-rect.top)/(Math.max(1,rect.height+win.innerHeight*.4))):1;
      if(['expand','arrival','color','split','count'].includes(kind))css(el,'--sb-progress',progress);
      if(kind==='rail'){const track=el.querySelector('[data-sb-track]'),stage=el.querySelector('[data-sb-stage]');if(track&&stage)css(el,'--sb-shift',active()&&wide.matches?-clamp(-rect.top/Math.max(1,rect.height-win.innerHeight)) * Math.max(0,track.scrollWidth-stage.clientWidth)+'px':'0px');}
      if(kind==='count'){const end=Number(el.dataset.target);if(Number.isFinite(end))el.textContent=Math.round(end*progress).toLocaleString('sv');}
    }
    if(active()){let delay=Infinity;for(const entry of animations)if(entry.tick&&entry.element.dataset.sbVisible==='true'){entry.tick(time);delay=Math.min(delay,entry.duration);}if(Number.isFinite(delay))timer=win.setTimeout(schedule,delay);}
  }
  function schedule(){if(!frame&&!disposed)frame=win.requestAnimationFrame(paint);}
  if(win.IntersectionObserver){const observer=new win.IntersectionObserver(entries=>{for(const entry of entries)entry.target.setAttribute('data-sb-visible',String(entry.isIntersecting));refresh();});for(const el of elements)observer.observe(el);observers.push(observer);}
  listen(win,'scroll',schedule,{passive:true});listen(win,'resize',refresh);listen(doc,'visibilitychange',refresh);listen(reduced,'change',refresh);listen(wide,'change',refresh);listen(coarse,'change',refresh);refresh();
  return {setPaused(value){paused=!!value;refresh();},getState:()=>({paused,reduced:reduced.matches,disposed}),dispose(){if(disposed)return;disposed=true;if(frame)win.cancelAnimationFrame(frame);if(timer)win.clearTimeout(timer);for(const observer of observers)observer.disconnect();for(const remove of listeners)remove();for(const entry of animations){entry.animation?.cancel();entry.stop?.();}for(const undo of restore.reverse())undo();}};
}
