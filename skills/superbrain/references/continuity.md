# A clean site can flow across sections

Semantic sections create structure for readers and assistive technology. Visual boundaries are a separate design decision. Keep headings and landmarks even when adjacent content shares a single atmosphere.

Ways to connect scenes:
- Carry the same base surface, grid or light field across adjacent sections.
- Fade a localized accent before the next reading zone instead of cutting the whole viewport to another color.
- Continue a line, image edge or product motif across a boundary.
- Change density and scale while holding type rhythm and alignment.
- Let image and text overlap within a planned grid without sacrificing reading order.

Use a visible separation when it aids comprehension: pricing, forms, legal information and distinct tasks often benefit from it. 'Blend everything' is not a reason to remove hierarchy.

Avoid assigning every section a fixed viewport height. Let content determine most heights. Large gaps should create purposeful pacing rather than empty scrolling. Check seams in a full-page view and in a mid-section viewport, not only the hero.

Across routes, keep navigation and brand anchors stable. A short crossfade or shared thumbnail can create continuity without theatrics. For same-origin document navigation, progressive enhancement can use:

```css
@view-transition { navigation: auto; }
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: 180ms;
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none !important; }
  ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

Unsupported browsers still navigate normally. Same-document routers need their own integration and focus/scroll restoration. Shared transition names must be unique in each rendered view. Do not intercept all links merely to animate them; preserve modified clicks, downloads, external destinations and browser history.
