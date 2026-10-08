# Advanced graphics without losing the website

Use when shaders, actual 3D, particle fields, authored interactive graphics or media sequences contribute to the intended direction. Keep semantic navigation, text and controls in DOM; a canvas is not a substitute for the whole accessible website.

## Choose the medium

| Desired visual | Starting implementation | Necessary input |
| --- | --- | --- |
| Light field / mesh-like gradient | CSS gradients or a fragment shader | Art direction, color and compositional placement |
| Image refraction / liquid reveal | WebGL shader sampling textures | Licensed images, dimension/CORS handling, static image fallback |
| Interactive 3D product | model-viewer or Three.js | Optimized licensed glTF/GLB, environment, poster and controls |
| Bespoke 3D hero | Three.js/OGL plus shaders | Geometry, materials, camera and lighting design |
| Particles / cursor trail | Canvas2D or GPU particles | Bounded count, lifetime and input response |
| Fluid field | GPU simulation/render targets | Measured performance, solver tuning, pointer and static alternatives |
| Authored interaction | Rive state machine | A valid authored .riv asset and supported runtime features |
| Authored vector sequence | Lottie | Suitable export, supported features and a meaningful poster |
| Scroll video / frame sequence | Media seeking or decoded image sequence | Export budget, seeking behavior, preload strategy and still frame |

The local `atmosphere.js` implements only the procedural light-field row. It has an original vertex/fragment pair, a bounded drawing buffer (at most roughly 900k pixels), on-demand pointer updates, a four-second optional play action, visibility/viewport stop, teardown and CSS fallback on failure/context loss. It is not a fluid solver or a full 3D component. It was added to make the design decision testable, not to impose WebGL on all sites.

## Integration details that change outcomes

Size canvases from CSS dimensions, correct aspect ratio, cap pixel density and drawing-buffer area. Resize only when dimensions change. Stop offscreen and in hidden documents. Dispose buffers, textures, programs and listeners. Context restoration requires recreating GPU resources; the included study chooses a static fallback until remount instead. Test context failure and the fallback separately.

Keep multiple motion systems from owning the same property. If implementing fluid/image displacement, keep the underlying image visible until rendering is ready and handle texture loading failures. For product 3D retain vertical touch scrolling and explain controls. Ship the still view when a scene cannot initialize.

A large simulation, blurry background or postprocessing chain can be attractive and still be wrong for the visitor or device. Measure paint, frame behavior, input responsiveness and loading in the actual project. Do not claim the word GPU proves an effect is cheap.

Primary sources: [MDN WebGL tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context), [Three.js responsive rendering](https://threejs.org/manual/pages/responsive.html), [model-viewer](https://modelviewer.dev/), [Rive runtime feature support](https://github.com/rive-app/rive-docs/blob/main/feature-support.mdx), [Lottie web](https://github.com/airbnb/lottie-web). [Codrops' original image-shader tutorial](https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/) explains a texture-reveal technique; treat its older code as a concept and verify current APIs before reuse.
