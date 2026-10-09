import {initEffects} from '../shared/effects.js';
import {initMotionPreview} from '../shared/motion-preview.js';
let cleanup=()=>{};
let motion=initMotionPreview(()=>refresh());
const refresh=()=>{cleanup();cleanup=initEffects(document,motion.read());};
refresh();
const controls=document.querySelector('.lab-controls');
controls.hidden=false;
const motionControls=document.querySelector('[data-motion-controls]');
motionControls.hidden=false;
motionControls.addEventListener('input',refresh);
for(const button of controls.querySelectorAll('[data-tone]')) {
  button.addEventListener('click',()=>{
    document.body.setAttribute('data-tone',button.dataset.tone);
    for(const option of controls.querySelectorAll('[data-tone]'))option.setAttribute('aria-pressed',String(option===button));
    document.querySelector('.reveal-stage').setAttribute('data-follow',button.dataset.tone==='elegant'?'soft':'direct');
    refresh();
  });
}
let presses=0;
for(const button of document.querySelectorAll('[data-demo-action]'))button.addEventListener('click',()=>{
  document.querySelector('#action-status').textContent=`Respons aktiverad ${++presses} ${presses===1?'gång':'gånger'}. Det här är en lokal effekt, inget skickas.`;
});
window.addEventListener('pagehide',()=>{cleanup();motion.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted){motion=initMotionPreview(()=>refresh());refresh();}});
