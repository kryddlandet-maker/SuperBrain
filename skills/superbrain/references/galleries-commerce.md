# Galleries, portfolios and commerce

Use for visual work, salons, restaurants, architecture and shops. Crop around the subject, vary scale with purpose, and carry a consistent material/lighting treatment. A good gallery is also a way to understand the work, not just a hover-effect stage.

## Useful interactions

| Visitor task | Technique | Preserve |
| --- | --- | --- |
| Browse projects | Filtered grid with FLIP or framework layout animation | Clear pressed selection, visible count and ordinary links to details |
| Compare outcomes | Two-image overlay with native range input | Keyboard/touch control, matching viewpoint and honest captions |
| Inspect detail | Native dialog/lightbox or real route | Escape/close, sensible focus return, alt text, deep links where useful |
| Explore a collection | Native horizontal rail with proximity scroll snap | Vertical scroll, visible continuation, focus and touch operation |
| Select a variant | Labeled swatches with explicit selected state | True SKU/price/stock update when connected to real commerce |
| Discover a project | Mild zoom/mask, optional distortion | Stable caption and click target, static focus/touch behavior |

`initCreative` supports `[data-filter-gallery]`, `[data-filter]` buttons and `[data-category]` cards. It measures before/after positions, animates surviving cards using transforms and fades incoming ones; previous animations are canceled before another selection. This small demo is not a full sorting/reordering engine. For complex React layouts consider Motion's layout system and avoid maintaining a second owner for the same transforms.

`[data-compare]` uses a native range and `--comparison`. The included images are two color treatments of the same original illustration; never call them a real business before/after. Actual comparisons need matching crop/viewpoint and verified outcomes. Do not turn price or stock into an arbitrary counter animation.

A rail is a normal scroll region with scroll-snap-type: x proximity, not scroll hijacking. Provide labeled buttons when a target device or input needs easier stepping. A product preview needs meaningful still imagery even if 3D fails. Checkout, booking, carts and variant stock require real application logic; the collection has no purchase functionality.

Sources: [Motion layout animations](https://motion.dev/docs/react-layout-animations), [scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type), [native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [model-viewer](https://modelviewer.dev/).
