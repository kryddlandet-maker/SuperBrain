# Small reusable interaction studies

Use `examples/shared/inspiration-effects.js` with the CSS and meaningful HTML of `/examples/advanced-studio/`. The initializer does not impose a visual theme. `initInspirationEffects(root)` owns only attributes, split wrappers, CSS variables and animations it creates; call `dispose()` on unmount. `setPaused(true/false)` provides a labelled local pause control.

`data-sb-effect` selects `expand`, `arrival`, `rail`, `color`, `spotlight`, `tilt`, `sheen`, `floating-image`, `split`, `rotate`, `count`, `columns`, `marquee` or `flow`. These are original small primitives, complementing the existing magnet, pointer-light, shader and view-transition modules.

- Scroll primitives expose bounded `--sb-progress` or rail `--sb-shift`; CSS supplies the actual composition. The rail's desktop sticky choreography uses a tall section, `[data-sb-stage]` and `[data-sb-track]`. Keep its mobile/reduced-motion version natively scrollable and keyboard focusable. Avoid trapping normal vertical scroll.
- Pointer primitives expose `--sb-x`, `--sb-y`, `--sb-rx`, `--sb-ry` and `--sb-hover`; use them only for decorative layers. Coarse pointers retain the full task. Floating previews belong in `[data-sb-floating]` and must not obscure required link labels.
- Split a dedicated plain-text element by words, or set `data-split="chars"`. Its accessible label retains the full sentence. Rotators use `[data-sb-word]` alternatives and hold each word for at least 1500ms. Keep essential claims outside rotating decorative alternatives.
- Counters use a finite `data-target` and render their final value with reduced motion. Never present invented client statistics. Columns use `[data-sb-column]`; marquees use `[data-sb-track]`; flowing SVG paths use an authored dash pattern. Repeated visual content needs `aria-hidden` to avoid duplicate reading.

Automatic loops pause offscreen, while the document is hidden, under reduced motion, on pointer hover or keyboard focus, and through the explicit pause control. Layout and useful content remain without JavaScript. Test the actual appearance at desktop/mobile widths and dispose/reinitialize once; a module unit check does not certify visual quality.
