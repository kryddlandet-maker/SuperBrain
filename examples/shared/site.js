import {initEffects} from './effects.js';
import {initMotionPreview} from './motion-preview.js';
let motion=initMotionPreview(()=>refresh());
const refresh=()=>{activeCleanup();activeCleanup=initEffects(document,motion.read());};
// Pagehide includes back/forward-cache entry. Pageshow restores listeners.
let activeCleanup=()=>{};
refresh();
const controls=document.querySelector('[data-motion-controls]');
if(controls){controls.hidden=false;controls.addEventListener('input',refresh);}
window.addEventListener('pagehide',()=>{activeCleanup();motion.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted){motion=initMotionPreview(()=>refresh());refresh();}});
