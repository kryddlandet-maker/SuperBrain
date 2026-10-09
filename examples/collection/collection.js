import {initCreative} from '../shared/creative.js';
import {initAtmosphere} from '../shared/atmosphere.js';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const still=document.querySelector('#motion-preview');
const toggle=document.querySelector('#motion-toggle');
const status=document.querySelector('#collection-motion-status');
let cleanup,motionPreview=false;
const active=()=>!still.checked&&(!preference.matches||motionPreview);
function init(){
 cleanup?.();
 const moving=active();
 document.body.toggleAttribute('data-still',!moving);
 document.body.dataset.motionPreview=String(motionPreview&&!still.checked);
 toggle.setAttribute('aria-pressed',String(moving));
 toggle.textContent=moving?'Pausa rörelse':'Aktivera rörelse';
 status.textContent=moving?'Rörelse är aktiv. Prova pekaren, scrolla och välj produktsteg. Ljusstudien kan spelas i fyra sekunder.':'Stilla visning. Välj Aktivera rörelse för att prova animationerna på den här sidan.';
 const options={reducedMotion:still.checked,motionPreview};
 const stopCreative=initCreative(document,options);
 const stopAtmosphere=initAtmosphere(document.querySelector('#light-canvas'),document.querySelector('#light-play'),document,options);
 cleanup=()=>{stopCreative();stopAtmosphere();};
}
init();
toggle.addEventListener('click',()=>{
 const enable=!active();still.checked=!enable;motionPreview=enable;init();
 if(enable)document.querySelector('#light-play:not([hidden])')?.click();
});
still.addEventListener('change',()=>{if(still.checked)motionPreview=false;init();});
preference.addEventListener('change',init);
for(const button of document.querySelectorAll('[data-color]'))button.addEventListener('click',()=>{document.querySelector('.shop-lamp').dataset.color=button.dataset.color;for(const b of document.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b===button));document.querySelector('#color-status').textContent='Vald färg: '+button.textContent+'. Fiktiv produktstudie utan köpfunktion.';});
window.addEventListener('pagehide',()=>cleanup());
window.addEventListener('pageshow',e=>{if(e.persisted)init();});
