/** Coordinate an authored feature scene without a JavaScript render loop.
 * Each track owns a dedicated inner element. Call dispose() before unmount.
 */
export function initProductScene(root, tracks, {
  window: win = window, duration = 7200, stillAt = .68, autoplay = true,
  button = null, onState = () => {}
} = {}) {
  if(!root || !Array.isArray(tracks) || !tracks.length || !Number.isFinite(duration) || duration < 1000 || !Number.isFinite(stillAt) || stillAt < 0 || stillAt > 1 || tracks.some(t=>!t.element || !Array.isArray(t.keyframes) || t.keyframes.length<2)) {
    throw new Error('A product scene needs inner elements, keyframes, a finite duration and a 0–1 still position');
  }
  const doc=root.ownerDocument, media=win.matchMedia('(prefers-reduced-motion: reduce)');
  const previous=root.getAttribute('data-motion-state');
  const oldButton=button?{text:button.textContent,pressed:button.getAttribute('aria-pressed'),disabled:button.disabled}:null;
  let animations=[],disposed=false,visible=!win.IntersectionObserver,wanted=autoplay,preview=false,state='idle';
  let available=tracks.every(t=>typeof t.element.animate==='function');
  if(available)try {
    for(const track of tracks) {
      const animation=track.element.animate(track.keyframes,{duration,iterations:Infinity,easing:'linear',fill:'both'});
      animations.push(animation);
      animation.pause();animation.currentTime=media.matches?duration*stillAt:0;
    }
  } catch {
    animations.forEach(a=>a.cancel());animations=[];available=false;
  }
  function sync() {
    if(disposed)return;
    state=!available?'unavailable':media.matches&&!preview?'still':!wanted?'paused':doc.hidden?'hidden':!visible?'offscreen':'playing';
    for(const animation of animations) {
      if(state==='playing'){if(animation.playState!=='running')animation.play();}
      else animation.pause();
    }
    root.setAttribute('data-motion-state',state);
    if(button) {
      button.disabled=!available;
      button.textContent=state==='playing'?'Pausa rörelse':'Spela rörelse';
      button.setAttribute('aria-pressed',String(state==='playing'));
    }
    onState(state);
  }
  function play(){if(disposed)return;wanted=true;preview=media.matches;sync();}
  function pause(){if(disposed)return;wanted=false;sync();}
  function toggle(){if(wanted&&(!media.matches||preview))pause();else play();}
  function preference(){
    preview=false;
    if(media.matches)animations.forEach(a=>{a.pause();a.currentTime=duration*stillAt;});
    sync();
  }
  const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{
    visible=entries.some(e=>e.target===root&&e.isIntersecting);sync();
  },{threshold:0}):null;
  observer?.observe(root);
  media.addEventListener('change',preference);
  doc.addEventListener('visibilitychange',sync);
  button?.addEventListener('click',toggle);
  sync();
  return {
    play,pause,
    restart(){if(disposed)return;animations.forEach(a=>{a.currentTime=0;});play();},
    get state(){return state;},
    dispose(){
      if(disposed)return;disposed=true;state='disposed';
      observer?.disconnect();media.removeEventListener('change',preference);
      doc.removeEventListener('visibilitychange',sync);button?.removeEventListener('click',toggle);
      animations.forEach(a=>a.cancel());animations=[];
      if(previous===null)root.removeAttribute('data-motion-state');else root.setAttribute('data-motion-state',previous);
      if(button){button.textContent=oldButton.text;button.disabled=oldButton.disabled;if(oldButton.pressed===null)button.removeAttribute('aria-pressed');else button.setAttribute('aria-pressed',oldButton.pressed);}
    }
  };
}
