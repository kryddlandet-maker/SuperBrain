const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
const defaults={x:0,y:0,rotateY:0,rotateZ:0,scale:1,opacity:1,clip:0,radius:0};
export function interpolateTrack(frames,progress){
 if(!Array.isArray(frames)||frames.length<2||frames.some((f,i)=>!Number.isFinite(f.at)||f.at<0||f.at>1||i&&f.at<=frames[i-1].at||Object.entries(f).some(([key,value])=>key!=='at'&&(!(key in defaults)||!Number.isFinite(value)))))throw new Error('Track needs ordered finite keyframes');
 const p=clamp(progress),left=frames.filter(f=>f.at<=p).at(-1)||frames[0],right=frames.find(f=>f.at>p)||frames.at(-1),fraction=right.at===left.at?0:clamp((p-left.at)/(right.at-left.at));
 return Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,(left[key]??fallback)+((right[key]??fallback)-(left[key]??fallback))*fraction]));
}
export function initScrollTimeline(section,tracks,{window:win=window,allowPreview=()=>false,onProgress=()=>{}}={}){
 if(!section||!tracks.length)throw new Error('Timeline needs a section and dedicated inner tracks');
 tracks.forEach(t=>interpolateTrack(t.keyframes,0));const media=win.matchMedia('(prefers-reduced-motion:reduce)'),doc=section.ownerDocument;let frame=0,disposed=false;const originals=tracks.map(t=>t.element.getAttribute('style')),originalReady=section.hasAttribute('data-timeline-ready');section.toggleAttribute('data-timeline-ready',true);
 const enabled=()=>!media.matches||allowPreview();
 function paint(){
 frame=0;if(disposed||doc.hidden)return;
 const rect=section.getBoundingClientRect(),distance=Math.max(1,rect.height-win.innerHeight),progress=enabled()?clamp(-rect.top/distance):0;
 section.toggleAttribute('data-timeline-static',!enabled());
 tracks.forEach(t=>{const state=enabled()?interpolateTrack(t.keyframes,progress):defaults;for(const [key,value]of Object.entries(state))t.element.style.setProperty('--story-'+key,String(value));});
 onProgress(progress,{static:!enabled()});
 }
 function request(){if(!disposed&&!doc.hidden&&!frame)frame=win.requestAnimationFrame(paint);}
 function preference(){if(frame)win.cancelAnimationFrame(frame);frame=0;paint();}
 function visibility(){if(doc.hidden){if(frame)win.cancelAnimationFrame(frame);frame=0;}else request();}
 const resize=typeof win.ResizeObserver==='function'?new win.ResizeObserver(request):null;resize?.observe(section);
 win.addEventListener('scroll',request,{passive:true});win.addEventListener('resize',request);media.addEventListener('change',preference);doc.addEventListener('visibilitychange',visibility);paint();
 return {refresh:preference,dispose(){if(disposed)return;disposed=true;if(frame)win.cancelAnimationFrame(frame);frame=0;resize?.disconnect();win.removeEventListener('scroll',request);win.removeEventListener('resize',request);media.removeEventListener('change',preference);doc.removeEventListener('visibilitychange',visibility);section.removeAttribute('data-timeline-static');section.toggleAttribute('data-timeline-ready',originalReady);tracks.forEach((t,i)=>{if(originals[i]===null)t.element.removeAttribute('style');else t.element.setAttribute('style',originals[i]);});}};
}
