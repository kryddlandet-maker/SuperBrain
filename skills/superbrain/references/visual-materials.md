# Visual materials and depth

Use for atmospheric scenes, image surfaces and continuity. Render a material with a deliberate light direction, subject and crop. Grain, gloss and haze should agree with the other imagery. Do not use blurred blobs as a substitute for art direction.

## Material recipes

| Intent | Candidate | Craft decision |
| --- | --- | --- |
| Luminous tech | Layered radial gradients or a procedural shader | Keep the brightest line away from reading text; continue its color into later media |
| Warm editorial | Tinted photography, fine grain, restrained shadow | Texture should survive at reading size without competing with letters |
| Glass-like UI | Semi-transparent surface plus backdrop-filter | Inspect over every background; retain an opaque fallback and readable text |
| Tangible objects | CSS perspective/transform layers or real 3D | One coherent light source; avoid exaggerated tilt on functional controls |
| Revealing imagery | Clip-path, mask-image, displacement | Keep the recognizable subject intact; reveal should settle before reading begins |
| Blended sections | Shared background, continued motif, overlapping media | Make semantic boundaries clear through heading and spacing, not mandatory color slabs |

The local collection uses `initCreative` for bounded pointer depth on `[data-depth]`, with an inner `.depth-visual`. It keeps the owner stable, batches updates, resets on scroll/resize/leave and turns depth off for coarse input/reduced motion. The stylesheet also uses a static mobile composition.

`initAtmosphere(canvas,button)` in `examples/shared/atmosphere.js` is an original WebGL light-field study. CSS remains beneath it; GPU failure leaves a useful static background. It redraws on demand and optionally runs a finite four-second sequence. The light is procedural, not an image-distortion, fluid-simulation or 3D implementation. Tune colors, beam position and brightness in the fragment source for the target brand. Do not label it a recreation of Huly's rendering internals.

Layer motion owners separately: outer layout positioning, middle perspective/parallax, inner hover/animation. Two systems writing the same transform will fight. Tiny scroll parallax should have clear bounds and a static touch version. Full-screen blur and SVG filters can repaint large areas; profile before expanding them.

Source mechanics: [CSS clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path), [SVG displacement](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap), [animation rendering cost](https://web.dev/articles/animations-guide). These establish capabilities, not aesthetic quality.
