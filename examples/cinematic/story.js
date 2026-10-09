import {initScrollTimeline} from '../shared/scroll-timeline.js';
const section=document.querySelector('#story'),preview=document.querySelector('#story-preview'),status=document.querySelector('#story-state');let timeline;
function initialize(){if(timeline)return;timeline=initScrollTimeline(section,[
 {element:document.querySelector('#story-object'),keyframes:[{at:0,x:-70,y:30,rotateY:-25,scale:.8,clip:15,radius:28},{at:.4,x:30,y:-10,rotateY:30,scale:1.18,clip:0,radius:8},{at:1,x:0,y:30,rotateY:320,scale:.8,clip:0,radius:38}]},
 {element:document.querySelector('#story-layer'),keyframes:[{at:0,y:80,scale:.8,rotateZ:-15},{at:1,y:-80,scale:1.3,rotateZ:90}]}
],{allowPreview:()=>preview.checked,onProgress:(p,state)=>{status.textContent=state.static?'Stilla läge: minskad rörelse är aktiv.':'Scrollförlopp '+Math.round(p*100)+' %';}});}
initialize();preview.addEventListener('change',()=>timeline?.refresh());window.addEventListener('pagehide',()=>{timeline?.dispose();timeline=null;});window.addEventListener('pageshow',initialize);
const stateButton=document.querySelector('#state-button');stateButton.addEventListener('click',()=>{const active=stateButton.getAttribute('aria-pressed')!=='true';stateButton.setAttribute('aria-pressed',String(active));stateButton.style.borderRadius=active?'30px':'4px';stateButton.textContent=active?'Visa grundform':'Visa rund form';document.querySelector('#state-result').textContent=active?'Den runda formen är vald.':'Grundformen är vald.';});
const media=matchMedia('(prefers-reduced-motion:reduce)');function updateStateMotion(){stateButton.style.transition=media.matches?'none':'border-radius 320ms';}media.addEventListener('change',updateStateMotion);updateStateMotion();
