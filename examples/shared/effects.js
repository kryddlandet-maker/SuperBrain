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
    let rect, point, frame = 0;
    const allowed = () => fine.matches && !reduced.matches;
    const flush = () => {
      frame = 0;
      if (!point || !rect || !allowed()) return;
      el.style.setProperty('--pointer-x', `${Math.max(0, Math.min(rect.width, point.x - rect.left))}px`);
      el.style.setProperty('--pointer-y', `${Math.max(0, Math.min(rect.height, point.y - rect.top))}px`);
    };
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; point = null;
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
