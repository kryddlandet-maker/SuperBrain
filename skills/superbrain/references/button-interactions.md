# Bounded button interactions

Activate when button fills, horizontal light, soft pointer lighting, contour light or bounded magnetic response are requested. Demo: examples/buttons/index.html. Original implementations live in examples/shared/buttons.css and effects.js. The historical .light-button family now uses the same horizontal-only, hidden-at-rest light behavior. It remains a separate palette and ripple recipe.

## Integration

Load buttons.css. The three fill variants need no JavaScript:

```html
<button class="sb-button" data-fill="left" type="button"><span>Explore</span></button>
<button class="sb-button" data-fill="bottom" type="button"><span>Explore</span></button>
<button class="sb-button" data-fill="top" type="button"><span>Explore</span></button>
<button class="sb-button" data-horizontal-glow data-pointer data-follow="soft"
        type="button"><span>Explore</span></button>
```

Import initEffects from effects.js and initialize a scoped container once. Call its returned cleanup before unmount or reinitialization. An optional {reducedMotion:true} suppresses pointer, ripple and scroll decoration. Honor the system preference by default. An explicit user-enabled, page-local demo preview can supply {motionPreview:true}; stationary preview still takes precedence. The shared motion-preview.js reports the active mode without changing system settings.

Customize variables on the actual .sb-button because defaults are declared there: --sb-duration, --sb-easing, --sb-base, --sb-ink, --sb-fill, --sb-glow, --sb-intensity, --sb-glow-size and --sb-focus. Start at 420ms with cubic-bezier(.22,1,.36,1), light opacity .24 and diameter 150px; these are tunable choices, not universal design rules. The demo offers three palettes, 120–900ms duration, 80–240px size and .10–.35 intensity.

Keep content in the span above the pseudo-element and use a semantic anchor when the action navigates. Do not animate target width/height or move the label. Reserve the pseudo-element for one effect owner.

## State behavior

The full-size fill layer translates from outside the button: left along X, bottom upward along Y, top downward along Y. Idle translation is just beyond the edge. Hover, keyboard focus or press resolves to zero translation. Leave reverses from the current value. Interruption must not flash back to the initial frame.

Horizontal light starts at opacity zero, appears during fine-pointer hover and tracks only x. Its y is always 50% of the button. Pointer logic owns cached bounds and coalesced settling; CSS owns the fade. Leave/cancel clears tracking and coordinates, then fades out. Do not show a permanent light at rest. Keyboard focus intentionally shows a stationary centered light and a separate outline.

Touch uses press feedback, never persistent tracking. The initializer adds a decorative data-pressed state from native touch pointer events because :active timing varies across mobile browsers; captured pointerup/cancel, leave, visibility and disposal clear it. It does not cancel scrolling or activation. Reduced motion removes transitions and pointer movement; stationary press feedback, focus and actions still work. The three fills work without JavaScript using native hover/focus/active states; mobile native active timing remains browser-dependent. The light becomes a plain native control when script is unavailable. Forced colors hides decorative layers and keeps a system-color outline. Native disabled controls stay inactive; applications using aria-disabled must also prevent activation.

## Budget and failure checks

Fills animate only a small decorative transform. A radial light changes local paint and needs profiling in the actual composition; do not promise compositor-only execution. Pointer settling schedules no frames after reaching its target. No images, remote fonts, continuous clocks or animation dependency are required.

If light never appears, check fine-pointer capability, live reduced-motion preference and whether initialization ran. If it tracks vertically, another layer is reading --pointer-y; this recipe must not. If colors do not update, set variables on each button instead of a parent with overridden defaults. If focus is clipped, inspect ancestor overflow and retain room for the outline.

Validate desktop, narrow reflow, keyboard Enter/Space, touch, disabled state, no JavaScript, live reduced motion, forced colors and rapid enter/leave. Observe intermediate frames and resolved frames, not only screenshots. Scope evidence is recorded in docs/evidence/buttons-browser.json after the browser check; no real production integration is claimed.

Sources: [MDN transform-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin), [focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible), [pointerleave](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerleave_event), [W3C buttons](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Four additional soft pointer variants

Do not replace working integrations to adopt a different feel. The opt-in family in examples/shared/pointer-buttons.css and pointer-buttons.js is independent of both original button families. Try examples/pointer-buttons/; the full integration recipe is examples/pointer-buttons/recipe.md.

Use a semantic button or anchor with class pb-button, data-pointer-effect="side|spot|edge|magnet", an inner pb-face and pb-label. Initialize once with initPointerButtons(scopedRoot, {lag:120}) and call the returned disposal function before reinitialization/unmount. Set --pb-size and --pb-strength on the actual button. Lag is a bounded 70–220ms elapsed-time smoothing constant; higher values follow more softly. It is not the CSS fade duration. No other button timing changes.

Side uses a diffuse warm horizontal light, spot follows both axes, edge masks the middle to light only the contour, and magnet moves only its decorative inner face by at most 3px x/2px y. The outer hit target stays fixed. All lights hide at rest. Keyboard focus has stationary centered light and a separate outline. Touch has press feedback and no hover loop. Reduced motion and no JavaScript preserve native actions; explicit local motion preview is opt-in and stationary mode takes precedence. Disabled controls hide decoration immediately. Resize, scroll, visibility, cancellation, preference changes and disposal reset the follower, which schedules no frames once settled.

Huly was visually inspected as a warm-light reference on 2026-10-09; the implementation is original, not a code or asset copy. Do not promise an exact reproduction from a screenshot. Local browser evidence is docs/evidence/pointer-buttons-browser.json; verify paint cost and project-specific contrast before production reuse.
