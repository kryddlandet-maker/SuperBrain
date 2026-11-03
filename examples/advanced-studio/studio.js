import {initDepthScene} from '../shared/depth-scene.js';
import {initInspirationEffects} from '../shared/inspiration-effects.js';
import {initCinematicScene} from '../shared/cinematic.js';
import {initFilmSurface} from '../shared/film-surface.js';

const effects=initInspirationEffects(document),depth=initDepthScene(document.querySelector('.depth-frame'));
document.querySelector('#pause-effects').addEventListener('click',event=>{const paused=!effects.getState().paused;effects.setPaused(paused);event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.textContent=paused?'Spela små effekter':'Pausa små effekter';});
document.querySelector('#depth-toggle').addEventListener('click',event=>{depth.setEnabled(true);event.currentTarget.setAttribute('aria-pressed','true');});
document.querySelector('#depth-still').addEventListener('click',()=>{depth.setEnabled(false);document.querySelector('#depth-toggle').setAttribute('aria-pressed','false');});
let film,surface;
try{
  const response=await fetch('./assets/surface-track.json');if(!response.ok)throw new Error('Spårningen kunde inte läsas');const track=await response.json();
  const section=document.querySelector('#surface'),container=document.querySelector('.surface-frame');
  surface=initFilmSurface(document.querySelector('.surface-layer'),{track,container,stillAt:0});
  film=initCinematicScene(section,{video:section.querySelector('video'),src:'./assets/surface.mp4',poster:'./assets/surface-poster.png',stillAt:0,onFrame:state=>{surface.update(state);container.setAttribute('data-surface-state',surface.getState().state);}});
  document.querySelector('#surface-motion').addEventListener('click',event=>{film.setMotionEnabled(true);event.currentTarget.setAttribute('aria-pressed','true');});
  document.querySelector('#surface-still').addEventListener('click',()=>{film.setMotionEnabled(false);document.querySelector('#surface-motion').setAttribute('aria-pressed','false');});
}catch{document.querySelector('#surface-status').textContent='Filmen är inte tillgänglig. Originalbilden och allt innehåll finns kvar.';}
window.advancedStudio={depth,effects,get film(){return film;},get surface(){return surface;},dispose(){film?.dispose();surface?.dispose();depth.dispose();effects.dispose();}};
