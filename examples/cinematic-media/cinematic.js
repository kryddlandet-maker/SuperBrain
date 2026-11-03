import {initCinematicScene} from '../shared/cinematic.js';
document.documentElement.classList.add('cinematic-ready');
const section=document.querySelector('#film'),video=section.querySelector('video'),button=section.querySelector('[data-motion]'),status=section.querySelector('[data-status]');
let scene;
function start(){
  scene=initCinematicScene(section,{video,src:new URL('./assets/demo-wide.mp4',import.meta.url).href,portraitSrc:new URL('./assets/demo-portrait.mp4',import.meta.url).href,poster:new URL('./assets/poster-wide.png',import.meta.url).href,portraitPoster:new URL('./assets/poster-portrait.png',import.meta.url).href,layers:[{element:section.querySelector('.film-copy'),keyframes:[{at:0,x:0,y:0,scale:1},{at:.3,x:0,y:-10,scale:1},{at:.7,x:0,y:-34,scale:.96},{at:1,x:0,y:-48,scale:.94}]}],onFrame(state){
    section.style.setProperty('--film-progress',String(state.mediaProgress));
    button.setAttribute('aria-pressed',String(state.motionEnabled));
    button.textContent=state.motionEnabled?'Visa stillbild':'Aktivera rörelse';
    const label=state.state==='error'?'Filmen kunde inte laddas. Stillbilden finns kvar.':state.state==='static'?'Stillbild aktiv':state.state==='loading'?'Laddar film…':'Scrolla för att utforska';
    if(status.textContent!==label)status.textContent=label;
  }});
  window.cinematicDemo=scene;
}
button.addEventListener('click',()=>scene.setMotionEnabled(!scene.getState().motionEnabled));
window.addEventListener('pagehide',()=>scene.dispose());
window.addEventListener('pageshow',event=>{if(event.persisted)start();});
start();
