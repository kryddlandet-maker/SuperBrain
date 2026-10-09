# Reuse the button studies

The canonical integration contract is skills/superbrain/references/button-interactions.md in the source, or .agents/skills/superbrain/references/button-interactions.md after installation.

Load examples/shared/buttons.css. Use a native button with class="sb-button", a span containing its label, type="button", and data-fill="left", "bottom" or "top". Fills need no JavaScript.

For the horizontal light use data-horizontal-glow, data-pointer and data-follow="soft". Import initEffects from examples/shared/effects.js, initialize a scoped container once and call cleanup on disposal. Tune CSS variables on each button. The lab's source in lab.js shows configuration and stationary preview.

Keep the independent focus indicator, touch press state and reduced-motion rules. Verify real palette contrast and action behavior after reuse. These decorative studies do not implement a submission backend.
