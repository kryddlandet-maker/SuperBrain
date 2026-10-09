import {initPointerButtons} from '../shared/pointer-buttons.js';
import {initMotionPreview} from '../shared/motion-preview.js';
const root = document.querySelector('.samples'), form = document.querySelector('.controls');
let cleanup = () => {}, count = 0;
let motion = initMotionPreview(() => update());
form.hidden = false;
function update() {
 const values = new FormData(form), mode = motion.read();
 for (const button of root.querySelectorAll('.pb-button')) {
  button.style.setProperty('--pb-size', values.get('size') + 'px');
  const base = {side: .75, spot: .35, edge: 1, magnet: .35}[button.dataset.pointerEffect];
  button.style.setProperty('--pb-strength', base * Number(values.get('strength')) / 100);
 }
 document.querySelector('#lag-value').value = values.get('lag') + ' ms';
 document.querySelector('#size-value').value = values.get('size') + ' px';
 document.querySelector('#strength-value').value = values.get('strength') + ' %';
 cleanup();cleanup = initPointerButtons(root, {...mode, lag: values.get('lag')});
}
form.addEventListener('input', update);form.addEventListener('submit', event => event.preventDefault());
for (const button of root.querySelectorAll('button')) button.addEventListener('click', () => {
 document.querySelector('#pointer-status').textContent = `Lokal respons ${++count}: ${button.textContent.trim()}. Ingen uppgift skickas.`;
});
update();
window.addEventListener('pagehide', () => {cleanup();motion.dispose();});
window.addEventListener('pageshow', event => {if (event.persisted) {motion = initMotionPreview(() => update());update();}});
