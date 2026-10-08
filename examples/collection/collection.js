import {initCreative} from '../shared/creative.js';
import {initAtmosphere} from '../shared/atmosphere.js';
let cleanup;const preview=document.querySelector('#motion-preview');
const init=()=>{const stopCreative=initCreative(document,{reducedMotion:preview.checked});const stopAtmosphere=initAtmosphere(document.querySelector('#light-canvas'),document.querySelector('#light-play'),document,{reducedMotion:preview.checked});cleanup=()=>{stopCreative();stopAtmosphere();};};init();
preview.addEventListener('change',()=>{document.body.toggleAttribute('data-still',preview.checked);cleanup();init();});
for(const button of document.querySelectorAll('[data-color]'))button.addEventListener('click',()=>{document.querySelector('.shop-lamp').dataset.color=button.dataset.color;for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b===button));document.querySelector('#color-status').textContent='Vald färg: '+button.textContent+'. Fiktiv produktstudie utan köpfunktion.';});
window.addEventListener('pagehide',()=>cleanup());window.addEventListener('pageshow',e=>{if(e.persisted)init();});
