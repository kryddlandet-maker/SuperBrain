# Interactive effects cookbook

Reusable vanilla examples live in `examples/shared/effects.js` and `effects.css` in the source repo, copied under `.superbrain/examples/shared` by the installer. Import `initEffects(root)` once per mounted surface; call the returned cleanup function on teardown. They deliberately use no framework dependency.

## Pointer reveal

Layer decorative product fragments above a stable background, apply a circular mask, and move its coordinates relative to the owning surface. Keep the readable message outside the masked layer. Activate on fine hover pointers, fade out on leave, and show a purposeful static composition on coarse pointers. Reduced motion disables tracking.

The demo uses a bounded spotlight mask rather than a full-screen shader. For fluid trails, refraction or particle reactions use Canvas/WebGL after checking the benefit and performance. Do not call a CSS mask a faithful reproduction of Huly's internal implementation.

## A light bubble inside a button

Keep the semantic link/button fixed. Move a clipped pseudo-element using local pointer coordinates; put text above it. Keyboard focus receives a stationary glow and a visible outline. Essential feedback does not depend on hover. Recompute bounds after resize/scroll and reset tracking on leave.

## Bubble scenes

Animate an inner transform layer of a rounded viewport. The bubble mask and the card's layout remain stable. A bubble may show a product state, orbital diagram, image detail or video. Hover can alter depth, focus can highlight the same subject, touch can use an explicit action. Decorative autoplay finishes quickly in the included demo.

## Magnetic controls

If used, move only the visual child over a stable hit area, by a small bounded amount. Preserve the pointer's predictable target, focus outline and mobile fallback. Do not apply magnetism automatically to every CTA.

## Scroll and reveal

Keep content visible in HTML by default. Progressively attach an observer or a timeline after initialization. Avoid 'opacity: 0' in base CSS for essential content. Reading sections can share a quiet background even when one visual element continues through them. Pinned scenes require a useful reason, a clear exit and an appropriate mobile version.

Tune the supplied code to the target brand; it is a technique library, not the design itself. Profile paint and input behavior before expanding the spotlight over a large page.

## Four extended recipes (v1.1)

The source demonstration is `/examples/effects/`, with a real detail route at `/examples/effects/project/`. See `docs/EFFECTS.md` for markup and integration.

1. Advanced reveal: `data-pointer data-follow="soft"` owns a decorative `.reveal-art` layer. Tune `--reveal-radius`; use `data-follow="direct"` for precision. Exponential, elapsed-time smoothing converges and stops its frame loop. Never mask essential content.
2. Refined buttons: add `data-pointer data-light-button` to a semantic button/link, a `.button-content` child and an aria-hidden `.button-ripple`. The click wave uses Web Animations, including centered keyboard activation. The hit area remains stationary.
3. Continuous scene: add `data-scroll-scene` and style a single object from `--scene-progress` (0..1). `initEffects` initializes it once. IntersectionObserver limits work to nearby scenes; ordinary scroll drives a reversible transform. Load scene.css after the page stylesheet. On narrow screens, a compact sticky stage continues to respond to normal scroll; content stays in document flow. Reduced motion defaults to a static composition. An explicit page-local demo preview can enable motion; stationary preview takes precedence.
4. Shared image: assign one unique `view-transition-name` to the image in both full documents, load the shared stylesheet in each and use ordinary same-origin links. Cross-document `@view-transition` progressively enhances navigation. Retain useful instant navigation when unsupported; suppress transitions for reduced motion. Do not assign the same name to multiple visible images.

Choose an effect because it fits the design. These recipes add expressive options, not mandatory decoration on every business website.
