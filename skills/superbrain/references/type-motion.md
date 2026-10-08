# Typography in motion

Use when type is a visual subject. Establish type roles, Swedish glyph support, measure and mobile line breaks first; refer to typography-layout.md. Type can be expressive without becoming a puzzle to read.

## Select a scale of motion

- Line reveal: preserve normal text in HTML; animate short lines with modest vertical translation. The collection uses `[data-arrive]` containing `[data-line]` spans. Natural readable text stays present before JS. Do not hide a whole paragraph waiting for initialization.
- Word emphasis: keep most words stable; animate a meaningful phrase once. Long scroll-dependent letter sequences may make reading unnecessarily slow.
- Variable type: change weight, width or optical-size only if that licensed font actually exposes the axis. Test line reflow; prefer the normal font-weight/font-stretch properties when they express the intended change.
- Split text: for many lines or responsive re-splitting, use a maintained tool such as GSAP SplitText; resplit after fonts and size changes and revert on teardown. Preserve a complete accessible reading label and hide decorative fragments only when a faithful accessible equivalent exists. Links inside text need their own semantics.
- Marquee/scramble: suitable for brief decorative brand moments. Keep the real text available; provide pause for sustained motion and do not use fake loading or gibberish as the only navigation label.

Motion rhythm should relate to hierarchy: a headline may establish the beat, its supporting copy can remain still. Avoid applying stagger to every sentence and forcing the visitor to wait repeatedly. Replaying entry animations after every tiny scroll can feel noisy. Compare with a still version.

The included line study uses finite Web Animations initiated near the viewport and a static reduced-motion version. It does not implement arbitrary responsive line splitting or variable-font assets.

References: [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/), [font variation settings](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings). The Codrops typography study informed the research; its actual scroll behavior was not fully verified in this browser session.
