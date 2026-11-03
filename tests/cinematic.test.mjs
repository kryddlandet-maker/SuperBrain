import test from 'node:test';
import assert from 'node:assert/strict';
import { initCinematicScene, interpolateCinematic } from '../examples/shared/cinematic.js';

function attributes(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getAttribute: name => values.get(name) ?? null,
    setAttribute: (name, value) => values.set(name, String(value)), removeAttribute: name => values.delete(name) };
}
function style(initial = {}) {
  const values = new Map(Object.entries(initial)), priorities = new Map();
  return { values, getPropertyValue: name => values.get(name) || '',
    getPropertyPriority: name => priorities.get(name) || '',
    setProperty(name, value, priority = '') { values.set(name, value); priorities.set(name, priority); },
    removeProperty(name) { values.delete(name); priorities.delete(name); } };
}
function host({ reduced = false, mobile = false, frameCallbacks = true, initialAttributes = {}, motionEnabled = null, intersection = true } = {}) {
  const win = new EventTarget(), doc = new EventTarget(), preference = new EventTarget(), portrait = new EventTarget();
  const video = Object.assign(new EventTarget(), attributes(initialAttributes));
  const raf = new Map(), vfc = new Map(), seekHistory = [], observations = [];
  let sequence = 0, rect = { top: 0, height: 3000 }, currentTime = 0, observer, resizeObserver;
  const section = Object.assign(attributes(), { ownerDocument: doc, getBoundingClientRect: () => rect });
  const layer = { style: style({ color: 'coral', '--cinematic-x': '12' }) };
  doc.hidden = false; preference.matches = reduced; portrait.matches = mobile; win.innerHeight = 1000;
  win.matchMedia = query => query.includes('reduced-motion') ? preference : portrait;
  win.requestAnimationFrame = callback => { raf.set(++sequence, callback); return sequence; };
  win.cancelAnimationFrame = id => raf.delete(id);
  win.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {} disconnect() { this.disconnected = true; }
    visible(value) { this.callback([{ target: section, isIntersecting: value }]); }
  };
  win.ResizeObserver = class {
    constructor() { resizeObserver = this; }
    observe() {} disconnect() { this.disconnected = true; }
  };
  if (!intersection) delete win.IntersectionObserver;
  Object.defineProperty(video, 'currentTime', {
    get: () => currentTime,
    set(value) { currentTime = value; video.seeking = true; seekHistory.push(value); }
  });
  video.seeking = false; video.duration = 10; video.muted = false;
  video.load = () => { video.loads = (video.loads || 0) + 1; video.seeking = false; };
  video.pause = () => { video.paused = true; };
  if (frameCallbacks) {
    video.requestVideoFrameCallback = callback => { vfc.set(++sequence, callback); return sequence; };
    video.cancelVideoFrameCallback = id => vfc.delete(id);
  }
  const controller = initCinematicScene(section, {
    video, src: 'wide.mp4', portraitSrc: 'portrait.mp4', poster: 'wide.webp', portraitPoster: 'portrait.webp',
    layers: [{ element: layer, keyframes: [{ at: 0, x: 0, opacity: 1 }, { at: .8, x: 100, opacity: .5 }, { at: 1, x: 100, opacity: .5 }] }],
    window: win, motionEnabled, onFrame: value => observations.push(value)
  });
  const flush = () => { const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(callback => callback()); };
  const show = time => {
    const first = vfc.entries().next().value;
    if (first) { vfc.delete(first[0]); first[1](0, { mediaTime: time }); }
  };
  const metadata = () => { video.dispatchEvent(new Event('loadedmetadata')); video.dispatchEvent(new Event('loadeddata')); };
  const settle = time => {
    if (time !== undefined) currentTime = time;
    video.seeking = false; video.dispatchEvent(new Event('seeked'));
  };
  const scroll = progress => { rect = { top: -2000 * progress, height: 3000 }; win.dispatchEvent(new Event('scroll')); };
  return { win, doc, preference, portrait, video, section, layer, controller, raf, vfc, seekHistory, observations,
    get observer() { return observer; }, get resizeObserver() { return resizeObserver; }, flush, show, metadata, settle, scroll };
}

test('cinematic cue interpolation is reversible, bounded and rejects malformed motion', () => {
  const frames = [{ at: 0, x: 0, opacity: 1 }, { at: .5, x: 60, scale: 1.2, opacity: .8 }, { at: 1, x: 0 }];
  assert.equal(interpolateCinematic(frames, .25).x, 30);
  assert.equal(interpolateCinematic(frames, .25).scale, 1.1);
  assert.equal(interpolateCinematic(frames, -1).x, 0);
  assert.equal(interpolateCinematic(frames, 2).opacity, 1);
  assert.throws(() => interpolateCinematic([{ at: 0 }, { at: 0 }], .5));
  assert.throws(() => interpolateCinematic([{ at: 0 }, { at: 1, opacity: 4 }], .5));
  assert.throws(() => interpolateCinematic([{ at: 0 }, { at: 1, unsupported: 1 }], .5));
  assert.throws(() => interpolateCinematic(frames, NaN));
});

test('video seeks coalesce to the newest scroll request while text follows presented media time', () => {
  const h = host();
  assert.equal(h.video.getAttribute('src'), null);
  h.observer.visible(true); h.metadata(); h.show(0);
  assert.equal(h.video.getAttribute('src'), 'wide.mp4');
  h.scroll(.4); h.scroll(.5); assert.equal(h.raf.size, 1); h.flush();
  assert.deepEqual(h.seekHistory, [5]);
  assert.equal(h.layer.style.values.get('--cinematic-x'), '0');
  h.show(4); assert.equal(h.controller.getState().mediaTime, 4);
  assert.equal(h.layer.style.values.get('--cinematic-x'), '50');
  h.scroll(.7); h.flush(); h.scroll(.9); h.flush(); assert.deepEqual(h.seekHistory, [5]);
  h.settle(5); assert.deepEqual(h.seekHistory, [5, 9]);
  h.show(9); h.settle(9);
  assert.equal(h.controller.getState().mediaProgress, .9);
  assert.equal(h.section.getAttribute('data-cinematic-time'), '9.0000');
  assert.equal(h.layer.style.values.get('--cinematic-x'), '100');
  assert.equal(h.video.getAttribute('autoplay'), null); assert(h.video.paused);
  assert.equal(h.raf.size, 0);
  h.controller.dispose();
});

test('reduced motion avoids loading until explicit local opt-in, and live preference revokes it', () => {
  const h = host({ reduced: true }); h.observer.visible(true); h.scroll(.8); h.flush();
  assert.equal(h.controller.getState().state, 'static');
  assert.equal(h.video.getAttribute('src'), null); assert.equal(h.video.loads || 0, 0);
  assert.equal(h.video.getAttribute('poster'), 'wide.webp');
  h.controller.setMotionEnabled(true); assert.equal(h.video.getAttribute('src'), 'wide.mp4');
  h.metadata(); h.show(8); h.settle(8);
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.controller.getState().state, 'static'); assert.equal(h.video.getAttribute('src'), null);
  assert.equal(h.vfc.size, 0); assert.equal(h.layer.style.values.get('--cinematic-x'), '0');
  assert.throws(() => h.controller.setMotionEnabled('yes'));
  h.controller.dispose();
});

test('an explicitly quiet scene is static before first paint even without intersection observation', () => {
  const h = host({ motionEnabled: false, intersection: false });
  assert.equal(h.controller.getState().state, 'static');
  assert.equal(h.video.getAttribute('src'), null); assert.equal(h.video.loads || 0, 0);
  assert.equal(h.vfc.size, 0); assert.equal(h.raf.size, 0);
  h.controller.setMotionEnabled(true); assert.equal(h.video.getAttribute('src'), 'wide.mp4');
  h.controller.dispose();
});

test('hidden and offscreen scenes cancel callbacks and do not seek until visible again', () => {
  const h = host(); h.observer.visible(true); h.metadata(); h.show(0);
  h.scroll(.3); assert.equal(h.raf.size, 1);
  h.observer.visible(false); assert.equal(h.raf.size, 0); assert.equal(h.vfc.size, 0);
  h.scroll(.8); h.flush(); assert.equal(h.seekHistory.length, 0);
  assert.equal(h.controller.getState().state, 'offscreen');
  h.observer.visible(true); assert.equal(h.seekHistory.at(-1), 8);
  h.doc.hidden = true; h.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.controller.getState().state, 'hidden'); assert.equal(h.vfc.size, 0);
  h.scroll(.1); assert.equal(h.raf.size, 0); h.settle(8);
  h.doc.hidden = false; h.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.seekHistory.at(-1), 1);
  h.controller.dispose();
});

test('responsive variants load one source at a time and discard obsolete frame callbacks', () => {
  const h = host(); h.observer.visible(true); h.metadata();
  const obsolete = h.vfc.values().next().value;
  h.portrait.matches = true; h.portrait.dispatchEvent(new Event('change'));
  assert.equal(h.video.getAttribute('src'), 'portrait.mp4');
  assert.equal(h.video.getAttribute('poster'), 'portrait.webp');
  assert.equal(h.controller.getState().variant, 'portrait'); assert.equal(h.controller.getState().duration, 0);
  obsolete(0, { mediaTime: 9 }); assert.equal(h.controller.getState().mediaTime, 0);
  assert.equal(h.vfc.size, 1);
  h.metadata(); h.show(0);
  h.controller.setMotionEnabled(false);
  h.portrait.matches = false; h.portrait.dispatchEvent(new Event('change'));
  assert.equal(h.video.getAttribute('src'), null); assert.equal(h.video.getAttribute('poster'), 'wide.webp');
  h.controller.dispose();
});

test('a seek completed offscreen restores synchronized layers even if the paused film presents no new frame', () => {
  const h = host(); h.observer.visible(true); h.metadata(); h.show(0);
  h.scroll(.6); h.flush();
  h.observer.visible(false); h.settle(6);
  assert.equal(h.controller.getState().mediaTime, 0);
  h.observer.visible(true);
  assert.equal(h.controller.getState().mediaTime, 6);
  assert(Math.abs(Number(h.layer.style.values.get('--cinematic-x')) - 75) < 1e-9);
  assert.equal(h.controller.getState().state, 'ready');
  h.controller.dispose();
});

test('metadata arriving while offscreen or hidden is retained so reactivation does not stall loading', () => {
  for (const suspended of ['offscreen', 'hidden']) {
    const h = host(); h.observer.visible(true);
    if (suspended === 'offscreen') h.observer.visible(false);
    else { h.doc.hidden = true; h.doc.dispatchEvent(new Event('visibilitychange')); }
    h.metadata(); assert.equal(h.controller.getState().duration, 10);
    assert.equal(h.seekHistory.length, 0);
    h.scroll(.5); h.flush();
    if (suspended === 'offscreen') h.observer.visible(true);
    else { h.doc.hidden = false; h.doc.dispatchEvent(new Event('visibilitychange')); }
    assert.equal(h.seekHistory.at(-1), 5);
    assert.equal(h.video.loads, 1);
    h.show(5); h.settle(5);
    assert.equal(h.controller.getState().state, 'ready');
    assert.equal(h.controller.getState().mediaTime, 5);
    h.controller.dispose();
  }
});

test('seeked fallback supports browsers without video-frame callbacks and failed media stays static', () => {
  const h = host({ frameCallbacks: false }); h.observer.visible(true); h.metadata();
  h.scroll(.5); h.flush(); assert.equal(h.controller.getState().mediaTime, 0);
  h.settle(5); assert.equal(h.controller.getState().mediaTime, 5);
  assert.equal(h.layer.style.values.get('--cinematic-x'), '62.5');
  h.video.dispatchEvent(new Event('error'));
  assert.equal(h.controller.getState().state, 'error'); assert.equal(h.video.getAttribute('src'), null);
  assert.equal(h.video.getAttribute('poster'), 'wide.webp'); assert.equal(h.layer.style.values.get('--cinematic-x'), '0');
  h.scroll(.8); h.flush(); assert.equal(h.controller.getState().state, 'error');
  h.controller.setMotionEnabled(true); assert.equal(h.video.getAttribute('src'), 'wide.mp4');
  h.controller.dispose();
});

test('disposal cancels owned work and restores attributes and CSS without destroying unrelated styles', () => {
  const h = host({ initialAttributes: { preload: 'none', poster: 'original.webp', muted: '' } });
  h.observer.visible(true); h.metadata(); h.scroll(.5);
  h.layer.style.setProperty('background', 'navy');
  h.controller.dispose(); assert.equal(h.raf.size, 0); assert.equal(h.vfc.size, 0);
  assert(h.observer.disconnected); assert(h.resizeObserver.disconnected);
  assert.equal(h.section.getAttribute('data-cinematic-state'), null);
  assert.equal(h.video.getAttribute('preload'), 'none'); assert.equal(h.video.getAttribute('poster'), 'original.webp');
  assert.equal(h.video.getAttribute('src'), null); assert.equal(h.video.muted, false);
  assert.equal(h.layer.style.values.get('--cinematic-x'), '12');
  assert.equal(h.layer.style.values.get('--cinematic-y'), undefined);
  assert.equal(h.layer.style.values.get('color'), 'coral'); assert.equal(h.layer.style.values.get('background'), 'navy');
  h.win.dispatchEvent(new Event('scroll')); h.preference.dispatchEvent(new Event('change'));
  h.controller.refresh(); h.controller.setMotionEnabled(true); h.controller.dispose();
  assert.equal(h.controller.getState().state, 'disposed'); assert.equal(h.raf.size, 0);
});
