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
