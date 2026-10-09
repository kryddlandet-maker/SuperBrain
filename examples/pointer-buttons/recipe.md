# Four soft pointer variants

Use this opt-in family without replacing existing `sb-button` or `light-button` integrations. Include `/examples/shared/pointer-buttons.css` and import `initPointerButtons` from the sibling JS module.

```html
<button class="pb-button" data-pointer-effect="side" type="button">
  <span class="pb-face"><span class="pb-label">Explore →</span></span>
</button>
```

Set `data-pointer-effect` to `side`, `spot`, `edge` or `magnet`. Initialize a scoped root: `const dispose = initPointerButtons(root, {lag:120});`. Call `dispose()` before remount/reinitialization. Native activation is retained; this module does not invent a destination. Use a semantic anchor for navigation. `aria-disabled` activation is blocked by this initializer, while native disabled works without JS.

`lag` is the smoothing time constant in milliseconds, clamped to 70–220. The elapsed-time exponential follower approaches the target without overshoot, coalesces events and stops frames when settled. CSS owns the 420ms opacity fade. Changing lag does not modify the old effects.js follower. The four styles intentionally use different palettes and light strengths. Customize `--pb-size`, `--pb-strength`, `--pb-fade`, `--pb-base`, `--pb-ink` on each actual button.

Side light fixes y at 50%; spotlight and edge light follow x/y. Magnetic motion transforms only the inner face, bounded to ±3px x and ±2px y. The outer native target does not move. There is no continuous idle animation. Light is hidden at rest and fades after leave; focus-visible uses centered stationary light plus a separate outline. Touch gets a pressed contour and no tracking. No JavaScript keeps native actions, focus and CSS press feedback. Reduced motion suppresses tracking and transitions. Optional explicit page-local `motionPreview:true` permits the lab preview; `reducedMotion:true` takes precedence. Never change OS settings for a demonstration.

Resize, scroll, visibility, pointer cancellation, preference changes and disposal invalidate/reset tracking. Pagehide/pageshow integration is demonstrated in lab.js. For production, verify text contrast with the actual project palette and maximum light strength, accessibility and paint cost. The radial layer paints a small local surface; it is not promised to be compositor-only.

Huly (https://huly.io/) was visually inspected as a mood reference on 2026-10-09. No source code, brand assets or exact motion timing were copied. Browser verification: docs/evidence/pointer-buttons-browser.json. Evidence is local Edge emulation, not a cross-browser or physical-mobile certification.
