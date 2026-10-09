// Opt-in family. Does not initialize or alter the existing sb-button/light-button effects.
export function initPointerButtons(root, {motionPreview = false, reducedMotion = false, lag = 120} = {}) {
 const fine = matchMedia('(hover: hover) and (pointer: fine)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const listeners = [], resets = [];
 const listen = (el, type, fn, options) => {el.addEventListener(type, fn, options);listeners.push(() => el.removeEventListener(type, fn, options));};
 const disabled = el => el.disabled || el.getAttribute('aria-disabled') === 'true';
 const moving = () => fine.matches && !reducedMotion && (!reduced.matches || motionPreview);
 const tau = Math.max(70, Math.min(220, Number(lag) || 120));
 for (const button of root.querySelectorAll('[data-pointer-effect]')) {
  let frame = 0, last = 0, bounds, x = 50, y = 50, targetX = 50, targetY = 50;
  const paint = () => {
   button.style.setProperty('--pb-x', x + '%');button.style.setProperty('--pb-y', y + '%');
   button.style.setProperty('--pb-dx', ((x - 50) * .06) + 'px');button.style.setProperty('--pb-dy', ((y - 50) * .04) + 'px');
  };
  const reset = () => {
   cancelAnimationFrame(frame);frame = 0;last = 0;bounds = null;
   button.removeAttribute('data-tracking');button.removeAttribute('data-pressed');
  };
  const tick = time => {
   frame = 0;
   if (!moving() || disabled(button) || document.hidden) {reset();return;}
   const alpha = 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / tau);last = time;
   x += (targetX - x) * alpha;y += (targetY - y) * alpha;
   if (Math.hypot(targetX - x, targetY - y) < .08) {x = targetX;y = targetY;paint();last = 0;return;}
   paint();frame = requestAnimationFrame(tick);
  };
  const pointer = event => {
   if (event.pointerType === 'touch' || !moving() || disabled(button) || document.hidden) return;
   if (!button.hasAttribute('data-tracking')) {bounds = button.getBoundingClientRect();x = y = 50;paint();}
   bounds ||= button.getBoundingClientRect();
   targetX = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
   targetY = button.dataset.pointerEffect === 'side' ? 50 : Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
   button.setAttribute('data-tracking', 'true');
   if (!frame) frame = requestAnimationFrame(tick);
  };
  const refresh = () => {reset();button.dataset.pointerMotion = String(moving());};
  resets.push(refresh);refresh();
  listen(button, 'pointermove', pointer);listen(button, 'pointerleave', reset);listen(button, 'pointercancel', reset);
  listen(button, 'focus', reset);
  listen(button, 'pointerdown', event => {if (!disabled(button) && event.pointerType === 'touch') button.setAttribute('data-pressed', 'true');});
  listen(window, 'pointerup', () => button.removeAttribute('data-pressed'), true);
  listen(window, 'pointercancel', reset, true);
  listen(button, 'click', event => {if (disabled(button)) {event.preventDefault();event.stopImmediatePropagation();}}, true);
 }
 const resetAll = () => resets.forEach(reset => reset());
 listen(fine, 'change', resetAll);listen(reduced, 'change', resetAll);
 listen(window, 'resize', resetAll);listen(window, 'scroll', resetAll, true);
 listen(document, 'visibilitychange', resetAll);
 return () => {
  resetAll();listeners.forEach(remove => remove());
  for (const button of root.querySelectorAll('[data-pointer-effect]')) {
   button.removeAttribute('data-pointer-motion');
   for (const key of ['--pb-x','--pb-y','--pb-dx','--pb-dy']) button.style.removeProperty(key);
  }
 };
}
