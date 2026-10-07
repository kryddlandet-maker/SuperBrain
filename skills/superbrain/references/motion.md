# Motion as interaction and continuity

Choose behavior from the brief, not from an intensity quota. A pointer-controlled lighting system, a product timeline and a useful form transition have different needs.

For a simple effect, note trigger, resting/active states, touch/keyboard treatment and reduced-motion alternative. For a connected scene also sketch anchor ownership, start/end states, progress, asset needs and how it reverses. These notes can live beside the code; no long mandatory planning sequence is needed.

| Need | Useful technology |
| --- | --- |
| Hover/focus, simple entrance | CSS transitions/keyframes |
| Imperative timeline with cleanup | Web Animations API |
| React layout/presence | Motion |
| Coordinated scroll scenes, FLIP | GSAP / ScrollTrigger / Flip |
| Document/state continuity | View Transitions |
| Particle field, liquid distortion, actual 3D | Canvas / WebGL / Three.js |

Use existing libraries when they fit. Combining tools is reasonable when they own different responsibilities; avoid redundant engines for the same effect. Check current documentation and licenses when adding dependencies.

Prefer transform/opacity for frequent motion, and measure masks, gradients, blur and large painted fields. A CSS-only cursor gradient can still be expensive. Cache geometry on entry/resize rather than reading layout on every pointer event. Use a single queued frame per moving target. Cancel listeners, observers and frames on teardown.

Keep transform ownership explicit: layout wrapper outside, animated object inside, or composed CSS variables. Pause ambient work offscreen and when the page is hidden. Shorten finite decorative sequences or provide pause controls for long-running ones. Preserve all meaning in static/reduced versions.

Watch normal motion, fast input, reverse scrolling, re-entry, resizing, direct route load and back/forward. Check that assets remain sharp and controls do not move away from the user's finger. A screenshot cannot verify these behaviors.
