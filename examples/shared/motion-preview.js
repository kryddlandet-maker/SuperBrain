// Explicit, page-local demonstration override. Never changes OS/browser settings.
export function initMotionPreview(onChange = () => {}) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const preview = document.querySelector('[data-preview-motion]');
  const still = document.querySelector('[data-still-motion]');
  const status = document.querySelector('[data-motion-status]');
  const english = document.documentElement.lang === 'en';
  function read() {
    const reducedMotion = Boolean(still?.checked);
    const motionPreview = Boolean(preview?.checked) && !reducedMotion;
    document.body.dataset.motionPreview = String(motionPreview);
    document.body.dataset.still = String(reducedMotion);
    if (status) status.textContent = reducedMotion
      ? (english ? 'Stationary preview. Actions remain available.' : 'Stilla förhandsvisning. Knapparna går fortfarande att använda.')
      : motionPreview
        ? (english ? 'Motion preview enabled for this page. System settings are unchanged.' : 'Rörelse förhandsvisas på den här sidan. Systeminställningen är oförändrad.')
        : preference.matches
          ? (english ? 'Reduced motion is active. Enable Preview motion to inspect the animation.' : 'Minskad rörelse är aktiv i din webbläsare. Välj Förhandsvisa rörelse för att studera animationen.')
          : (english ? 'Motion follows your system preference.' : 'Rörelsen följer din systeminställning.');
    return {motionPreview, reducedMotion};
  }
  const change = () => onChange(read());
  preference.addEventListener('change', change);
  return {read, dispose: () => preference.removeEventListener('change', change)};
}
