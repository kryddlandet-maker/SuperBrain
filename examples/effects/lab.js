import {initEffects} from '../shared/effects.js';
let cleanup=initEffects();
const controls=document.querySelector('.lab-controls');
controls.hidden=false;
for(const button of controls.querySelectorAll('[data-tone]')) {
  button.addEventListener('click',()=>{
    document.body.setAttribute('data-tone',button.dataset.tone);
    for(const option of controls.querySelectorAll('[data-tone]'))option.setAttribute('aria-pressed',String(option===button));
    document.querySelector('.reveal-stage').setAttribute('data-follow',button.dataset.tone==='elegant'?'soft':'direct');
    cleanup();cleanup=initEffects();
  });
}
let presses=0;
for(const button of document.querySelectorAll('[data-demo-action]'))button.addEventListener('click',()=>{
  document.querySelector('#action-status').textContent=`Respons aktiverad ${++presses} ${presses===1?'gång':'gånger'}. Det här är en lokal effekt, inget skickas.`;
});
window.addEventListener('pagehide',()=>cleanup());
window.addEventListener('pageshow',event=>{if(event.persisted)cleanup=initEffects();});
