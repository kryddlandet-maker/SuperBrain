import {initEffects} from '../shared/effects.js';
import {initMotionPreview} from '../shared/motion-preview.js';
const samples=document.querySelector('.samples'),form=document.querySelector('.controls');
let cleanup=()=>{},count=0;
let motion=initMotionPreview(()=>update());
form.hidden=false;
const colors={pine:['#315349','#d2f384'],wine:['#653544','#ffc6d0'],indigo:['#39477a','#c5d5ff']};
function update(){
 const values=new FormData(form);
 const mode=motion.read();
 const [fill,glow]=colors[values.get('color')];
 samples.style.setProperty('--sb-duration',values.get('duration')+'ms');
 // Custom properties are set per button so its default declarations cannot shadow the controls.
 for(const button of samples.querySelectorAll('.sb-button')){
  button.style.setProperty('--sb-duration',values.get('duration')+'ms');
  button.style.setProperty('--sb-easing',values.get('easing'));
  button.style.setProperty('--sb-fill',fill);button.style.setProperty('--sb-glow',glow);
  button.style.setProperty('--sb-glow-size',values.get('size')+'px');
  button.style.setProperty('--sb-intensity',Number(values.get('intensity'))/100);
 }
 document.querySelector('#duration-value').value=values.get('duration')+' ms';
 document.querySelector('#size-value').value=values.get('size')+' px';
 document.querySelector('#intensity-value').value=values.get('intensity')+' %';
 cleanup();cleanup=initEffects(samples,mode);
}
form.addEventListener('input',update);form.addEventListener('submit',event=>event.preventDefault());
update();
for(const button of samples.querySelectorAll('button'))button.addEventListener('click',()=>{document.querySelector('#button-status').textContent=`Lokal respons ${++count}. Ingen uppgift skickas.`;});
window.addEventListener('pagehide',()=>{cleanup();motion.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted){motion=initMotionPreview(()=>update());update();}});
