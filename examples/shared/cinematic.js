/** SuperBrain's optional scroll-film runtime. No autoplay or scroll interception.
 * Author each layer against decoded media time; call dispose() before unmount.
 */
const limit = value => Math.max(0, Math.min(1, value));
const neutral = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };

function validateFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 2 || frames.some((frame, i) =>
    !frame || !Number.isFinite(frame.at) || frame.at < 0 || frame.at > 1 ||
    i > 0 && frame.at <= frames[i - 1].at ||
    Object.entries(frame).some(([key, value]) => key !== 'at' &&
      (!Object.hasOwn(neutral, key) || !Number.isFinite(value) || key === 'scale' && value <= 0 || key === 'opacity' && (value < 0 || value > 1)))
  )) throw new Error('Cinematic layers require ordered finite 0–1 keyframes');
}

export function interpolateCinematic(frames, progress) {
  validateFrames(frames);
  if (!Number.isFinite(progress)) throw new Error('Cinematic progress must be finite');
  const at = limit(progress);
  const before = frames.findLast(frame => frame.at <= at) || frames[0];
  const after = frames.find(frame => frame.at > at) || frames.at(-1);
  const fraction = before === after ? 0 : limit((at - before.at) / (after.at - before.at));
  return Object.fromEntries(Object.entries(neutral).map(([key, fallback]) => {
    const start = before[key] ?? fallback, end = after[key] ?? fallback;
    return [key, start + (end - start) * fraction];
  }));
}

export function initCinematicScene(section, {
  video = section?.querySelector('video'), src, portraitSrc = null,
  poster = video?.getAttribute('poster') || null, portraitPoster = null,
  layers = [], window: win = window, onFrame = () => {},
  portraitQuery = '(max-width: 720px)', stillAt = 0, motionEnabled = null
} = {}) {
  if (!section?.ownerDocument || !video || typeof src !== 'string' || !src.trim() ||
      portraitSrc !== null && (typeof portraitSrc !== 'string' || !portraitSrc.trim()) ||
      !Array.isArray(layers) || !Number.isFinite(stillAt) || stillAt < 0 || stillAt > 1 ||
      typeof onFrame !== 'function' || motionEnabled !== null && typeof motionEnabled !== 'boolean') throw new Error('Cinematic scenes require a section, video, source and valid options');
  for (const layer of layers) {
    if (!layer.element?.style) throw new Error('Cinematic layers need dedicated styled elements');
    validateFrames(layer.keyframes);
  }
  const doc = section.ownerDocument;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = win.matchMedia(portraitQuery);
  const attributes = ['data-cinematic-state', 'data-cinematic-time', 'data-cinematic-progress', 'data-cinematic-variant'];
  const sectionBefore = attributes.map(name => [name, section.getAttribute(name)]);
  const videoAttributes = ['src', 'poster', 'preload', 'muted', 'playsinline', 'autoplay'];
  const videoBefore = videoAttributes.map(name => [name, video.getAttribute(name)]);
  const wasMuted = video.muted;
  const properties = Object.keys(neutral).map(key => '--cinematic-' + key);
  const layerBefore = layers.map(({ element }) => properties.map(name => [name,
    element.style.getPropertyValue(name), element.style.getPropertyPriority(name)]));
  const hasFrameCallback = typeof video.requestVideoFrameCallback === 'function' && typeof video.cancelVideoFrameCallback === 'function';
  let disposed = false, visible = !win.IntersectionObserver, override = motionEnabled;
  let source = null, variant = 'wide', loaded = false, failed = false;
  let duration = 0, scrollProgress = 0, mediaTime = 0, state = 'static';
  let deferredTime = null;
  let pendingFrame = 0, videoFrame = 0, busy = false, generation = 0;
  const enabled = () => override === null ? !reduced.matches : override;
  const active = () => !disposed && enabled() && visible && !doc.hidden && !failed;
  const snapshot = () => ({ state: disposed ? 'disposed' : state, variant, scrollProgress,
    mediaTime, mediaProgress: duration > 0 ? limit(mediaTime / duration) : stillAt,
    motionEnabled: enabled(), source, duration });

  function mark(next) {
    state = next;
    section.setAttribute('data-cinematic-state', state);
    section.setAttribute('data-cinematic-variant', variant);
  }
  function paint(progress, time) {
    for (const { element, keyframes } of layers) {
      const values = interpolateCinematic(keyframes, progress);
      for (const [key, value] of Object.entries(values)) element.style.setProperty('--cinematic-' + key, String(value));
    }
    section.setAttribute('data-cinematic-time', time.toFixed(4));
    section.setAttribute('data-cinematic-progress', progress.toFixed(6));
    onFrame(snapshot());
  }
  function present(time) {
    if (!active() || !loaded || !Number.isFinite(time)) return;
    mediaTime = Math.max(0, Math.min(duration, time));
    paint(duration ? limit(mediaTime / duration) : 0, mediaTime);
  }
  function stopCallbacks() {
    if (pendingFrame) win.cancelAnimationFrame(pendingFrame);
    if (videoFrame) video.cancelVideoFrameCallback(videoFrame);
    pendingFrame = 0; videoFrame = 0;
  }
  function armFrame() {
    if (!hasFrameCallback || videoFrame || !active()) return;
    const currentGeneration = generation;
    const id = video.requestVideoFrameCallback((_now, metadata) => {
      if (disposed || currentGeneration !== generation || videoFrame !== id || !active()) return;
      videoFrame = 0;
      present(metadata.mediaTime);
      // Only a pending seek needs another presented-frame notification.
      if (busy || Math.abs(video.currentTime - mediaTime) > .025) armFrame();
    });
    videoFrame = id;
  }
  function clearSource() {
    generation++; stopCallbacks(); busy = false; loaded = false; duration = 0; mediaTime = 0; deferredTime = null;
    if (source !== null || video.getAttribute('src') !== null) {
      video.pause(); video.removeAttribute('src'); video.load(); source = null;
    }
  }
  function measure() {
    const rect = section.getBoundingClientRect();
    scrollProgress = limit(-rect.top / Math.max(1, rect.height - win.innerHeight));
  }
  function chooseVariant() {
    const next = portrait.matches && portraitSrc ? 'portrait' : 'wide';
    if (next !== variant) { clearSource(); failed = false; variant = next; }
    const image = variant === 'portrait' ? portraitPoster || poster : poster;
    if (image) video.setAttribute('poster', image); else video.removeAttribute('poster');
  }
  function seek() {
    if (!active() || !loaded) return;
    const target = Math.min(scrollProgress * duration, Math.max(0, duration - .001));
    if (busy || video.seeking) { mark('seeking'); return; }
    if (Math.abs(video.currentTime - target) <= .001) { mark('ready'); return; }
    busy = true; mark('seeking'); armFrame();
    try { video.currentTime = target; }
    catch { failure(); }
  }
  function sync() {
    if (disposed) return;
    chooseVariant(); measure();
    if (!enabled()) {
      clearSource(); mark('static'); paint(stillAt, 0); return;
    }
    if (doc.hidden || !visible) {
      stopCallbacks(); video.pause(); mark(doc.hidden ? 'hidden' : 'offscreen'); return;
    }
    if (failed) { mark('error'); return; }
    if (source === null) {
      source = variant === 'portrait' ? portraitSrc : src;
      video.muted = true; video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
      video.removeAttribute('autoplay'); video.setAttribute('preload', 'auto'); video.pause();
      mark('loading'); armFrame(); video.setAttribute('src', source); video.load(); return;
    }
    if (loaded) {
      // A seek may finish while the tab/scene is suspended. A paused video need
      // not present another frame on return, so retain its completed seek time.
      if (deferredTime !== null) { present(deferredTime); deferredTime = null; }
      armFrame(); seek();
    } else mark('loading');
  }
  function request() {
    if (disposed || pendingFrame || doc.hidden) return;
    pendingFrame = win.requestAnimationFrame(() => { pendingFrame = 0; sync(); });
  }
  function metadata() {
    if (disposed || source === null) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) { failure(); return; }
    duration = video.duration; loaded = true; seek();
  }
  function decoded() {
    if (disposed || source === null) return;
    if (!loaded) metadata();
    if (!active()) { if (loaded && Number.isFinite(video.currentTime)) deferredTime = video.currentTime; return; }
    if (!hasFrameCallback) present(video.currentTime);
    seek();
  }
  function settled() {
    busy = false;
    if (source === null) return;
    if (!active()) { if (loaded && Number.isFinite(video.currentTime)) deferredTime = video.currentTime; return; }
    if (!hasFrameCallback) present(video.currentTime);
    seek();
  }
  function failure() {
    if (disposed || source === null) return;
    clearSource(); failed = true; mark('error'); paint(stillAt, 0);
  }
  function preference() {
    // A newly enabled system preference cancels a previous local motion opt-in.
    if (reduced.matches && override === true) override = null;
    sync();
  }
  const observer = win.IntersectionObserver ? new win.IntersectionObserver(entries => {
    const entry = entries.find(item => item.target === section);
    if (entry) { visible = entry.isIntersecting; sync(); }
  }) : null;
  const resizeObserver = win.ResizeObserver ? new win.ResizeObserver(request) : null;
  observer?.observe(section); resizeObserver?.observe(section);
  const listeners = [
    [win, 'scroll', request, { passive: true }], [win, 'resize', request],
    [doc, 'visibilitychange', sync], [reduced, 'change', preference],
    [portrait, 'change', sync], [video, 'loadedmetadata', metadata],
    [video, 'loadeddata', decoded], [video, 'seeked', settled], [video, 'error', failure]
  ];
  for (const [target, event, handler, options] of listeners) target.addEventListener(event, handler, options);
  sync();
  return {
    refresh: sync,
    setMotionEnabled(value) {
      if (typeof value !== 'boolean') throw new Error('Motion enabled must be a boolean');
      if (!disposed) { override = value; if (value) failed = false; sync(); }
    },
    getState: snapshot,
    dispose() {
      if (disposed) return;
      disposed = true; generation++; stopCallbacks(); video.pause();
      observer?.disconnect(); resizeObserver?.disconnect();
      for (const [target, event, handler, options] of listeners) target.removeEventListener(event, handler, options);
      const restore = (element, records) => {
        for (const [name, value] of records) {
          if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
        }
      };
      restore(section, sectionBefore); restore(video, videoBefore); video.muted = wasMuted;
      for (const [i, layer] of layers.entries()) {
        for (const [name, value, priority] of layerBefore[i]) {
          if (value) layer.element.style.setProperty(name, value, priority); else layer.element.style.removeProperty(name);
        }
      }
      if (source !== null) video.load();
    }
  };
}
