# Product stories and diagrams

Use for SaaS, applications, complex services and explanatory features. Start with a true product task: input, action, visible consequence. Prefer a small legible scene that communicates one relationship to a montage of unrelated UI cards.

## Build a believable scene

Use real authorized product UI when available; otherwise identify the concept as a fictional demonstration. Preserve stable anchors (window, column headings, subject) while selected elements change. Match type density and motion amplitude to the frame's actual size. Do not fabricate chat conversations, customer counts or real completion results.

The collection's `[data-product-demo]` has three explicit buttons and `data-state` values plan/connect/finish. Keep the buttons as an aria-pressed group because they change one scene; use the APG tab pattern if you instead build actual tab panels. Labels and the visible status describe each change. Avoid announcing every animation frame. A still mode changes state instantly while preserving the interaction.

For scroll storytelling, use the existing `[data-scroll-scene]` recipe when one visual continues through several paragraphs. Use GSAP timelines/ScrollTrigger when overlapping sequences, responsive pinning and timeline control materially improve the result. Keep normal scroll, enough reading space and a useful exit. CSS scroll/view timelines are another progressive enhancement; check target support and keep one owner for progress.

## SVG and shape continuity

For line drawing, normalize the path with pathLength=1 and animate stroke-dashoffset from 1 to 0. The final diagram should exist even without JS. The collection includes a decorative connection path, not a data visualization. For SVG morphs, compatible path topology or a tool such as MorphSVG can bridge shape states; don't imply all arbitrary SVGs morph smoothly with a single CSS declaration.

Use Rive for authored interactive state machines and Lottie for suitable authored motion assets when those inputs exist. Their runtime does not generate a good scene by itself. Scope animation to a useful interval, pause/halt offscreen and release resources on teardown.

Sources: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [CSS scroll-driven animation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations), [MorphSVG](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/), [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
