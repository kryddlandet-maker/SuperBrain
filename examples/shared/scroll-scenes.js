export const clamp01 = value => Math.max(0, Math.min(1, value));
export function sceneProgress(top, height, viewport) {
  // A reading zone begins before the visual starts transforming.
  return clamp01((viewport * .15 - top) / Math.max(1, height - viewport * .85));
}

export function initScrollScenes(root = document) {
  const scenes = [...root.querySelectorAll('[data-scroll-scene]')];
  if (!scenes.length) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 760px)');
  const active = new Set();
  const cleanups = [];
  let frame = 0, disposed = false;
  const listen = (el, name, fn, options) => {
    el.addEventListener(name, fn, options); cleanups.push(() => el.removeEventListener(name, fn, options));
  };
  function update() {
    frame = 0;
    if (disposed || document.hidden) return;
    for (const scene of active) {
      const rect = scene.getBoundingClientRect();
      const progress = reduced.matches || !wide.matches ? .5 : sceneProgress(rect.top, rect.height, window.innerHeight);
      scene.style.setProperty('--scene-progress', String(progress));
      scene.setAttribute('data-scene-state', progress < 1/3 ? 'gather' : progress < 2/3 ? 'connect' : 'resolve');
    }
  }
  function schedule() {if (!disposed && !document.hidden && active.size && !frame) frame = requestAnimationFrame(update);}
  let observer;
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {if(entry.isIntersecting)active.add(entry.target);else active.delete(entry.target);}
      if (!active.size && frame) {cancelAnimationFrame(frame);frame=0;}
      schedule();
    }, {rootMargin:'100px'});
    scenes.forEach(scene => observer.observe(scene));
  } else scenes.forEach(scene => active.add(scene));
  listen(window, 'scroll', schedule, {passive:true}); listen(window, 'resize', schedule);
  listen(reduced, 'change', schedule); listen(wide, 'change', schedule);
  listen(document, 'visibilitychange', () => {if(document.hidden && frame){cancelAnimationFrame(frame);frame=0;}else schedule();});
  // Set a useful static state before the first observation and on no-JS CSS fallback.
  scenes.forEach(scene => scene.style.setProperty('--scene-progress', '.5'));
  schedule();
  return () => {
    if(disposed)return;disposed=true;observer?.disconnect();if(frame)cancelAnimationFrame(frame);
    cleanups.forEach(fn=>fn());scenes.forEach(scene=>{scene.style.removeProperty('--scene-progress');scene.removeAttribute('data-scene-state');});
  };
}
