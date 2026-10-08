import { initScrollScenes } from './scroll-scenes.js';
// One owner per surface. Framework adapters call cleanup on unmount.
export function initEffects(root = document) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  const listen = (target, name, fn, options) => {
    target.addEventListener(name, fn, options);
    cleanups.push(() => target.removeEventListener(name, fn, options));
  };
  for (const el of root.querySelectorAll('[data-pointer]')) {
    let rect, point, current, lastTime = 0, frame = 0;
    const soft = el.getAttribute?.('data-follow') === 'soft';
    const allowed = () => fine.matches && !reduced.matches;
    const flush = (time = 0) => {
      frame = 0;
      if (!point || !rect || !allowed()) return;
      const target = {x: Math.max(0, Math.min(rect.width, point.x - rect.left)), y: Math.max(0, Math.min(rect.height, point.y - rect.top))};
      if (!current) current = soft ? {x: rect.width * .5, y: rect.height * .5} : target;
      // Time-based interpolation stays consistent on 60Hz and high-refresh screens.
      const delta = lastTime ? Math.min(64, Math.max(1, time - lastTime)) : 16.67;
      const alpha = soft ? 1 - Math.exp(-delta / 65) : 1;
      current.x += (target.x - current.x) * alpha; current.y += (target.y - current.y) * alpha;
      const settled = Math.hypot(target.x - current.x, target.y - current.y) < .2;
      if (settled) current = target;
      el.style.setProperty('--pointer-x', `${current.x}px`);
      el.style.setProperty('--pointer-y', `${current.y}px`);
      lastTime = time;
      if (soft && !settled) frame = requestAnimationFrame(flush);
    };
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; point = null; current = null; lastTime = 0;
      el.removeAttribute('data-tracking');
      el.style.removeProperty('--pointer-x'); el.style.removeProperty('--pointer-y');
    };
    listen(el, 'pointerenter', event => {
      if (!allowed() || event.pointerType === 'touch') return;
      rect = el.getBoundingClientRect();
      el.setAttribute('data-tracking', '');
    });
    listen(el, 'pointermove', event => {
      if (!allowed() || event.pointerType === 'touch') return;
      if (!rect) rect = el.getBoundingClientRect();
      el.setAttribute('data-tracking', '');
      point = {x: event.clientX, y: event.clientY};
      if (!frame) frame = requestAnimationFrame(flush);
    });
    listen(el, 'pointerleave', reset);
    listen(el, 'pointercancel', reset);
    listen(window, 'resize', () => { rect = null; reset(); });
    listen(window, 'scroll', () => { rect = null; reset(); }, {passive: true, capture: true});
    listen(fine, 'change', reset); listen(reduced, 'change', reset);
    listen(document, 'visibilitychange', () => {if(document.hidden) reset();});
    cleanups.push(reset);
  }
  for (const el of root.querySelectorAll('[data-light-button]')) {
    const ripple = el.querySelector('.button-ripple');
    if (!ripple) continue;
    let animation;
    listen(el, 'click', event => {
      animation?.cancel();
      if (reduced.matches || typeof ripple.animate !== 'function') return;
      const box = el.getBoundingClientRect();
      const x = event.detail === 0 ? box.width / 2 : event.clientX - box.left;
      const y = event.detail === 0 ? box.height / 2 : event.clientY - box.top;
      ripple.style.left = `${Math.max(0, Math.min(box.width, x))}px`;
      ripple.style.top = `${Math.max(0, Math.min(box.height, y))}px`;
      animation = ripple.animate([{transform:'translate(-50%, -50%) scale(.1)',opacity:.5},{transform:'translate(-50%, -50%) scale(3)',opacity:0}], {duration:460,easing:'cubic-bezier(.16,1,.3,1)'});
    });
    listen(reduced, 'change', () => {if (reduced.matches) animation?.cancel();});
    listen(document, 'visibilitychange', () => {if(document.hidden) animation?.cancel();});
    cleanups.push(() => animation?.cancel());
  }
  cleanups.push(initScrollScenes(root));
  for (const menu of root.querySelectorAll('[data-menu]')) {
    const button = menu.querySelector('button');
    const close = () => button.setAttribute('aria-expanded', 'false');
    listen(button, 'click', () => button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true')));
    listen(menu, 'keydown', event => {if(event.key === 'Escape'){close();button.focus();}});
    listen(menu, 'focusout', event => {if(!menu.contains(event.relatedTarget))close();});
    listen(document, 'pointerdown', event => {if(!menu.contains(event.target))close();});
    cleanups.push(close);
  }
  let disposed = false;
  return () => { if (!disposed) {disposed = true; cleanups.reverse().forEach(fn => fn());} };
}
