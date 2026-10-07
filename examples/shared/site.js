import {initEffects} from './effects.js';
const cleanup=initEffects();
// Pagehide includes back/forward-cache entry. Pageshow restores listeners.
let activeCleanup=cleanup;
window.addEventListener('pagehide',()=>activeCleanup());
window.addEventListener('pageshow',event=>{if(event.persisted)activeCleanup=initEffects();});
