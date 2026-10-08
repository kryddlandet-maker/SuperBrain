# Choosing an expressive system

Use when deciding which effects belong together. The broader research inventory is `docs/TECHNIQUES.md`; it is a menu to search, not compulsory context or a checklist to implement. Build evidence is separated from recommendations in `docs/DESIGN-RESEARCH.md` and `docs/VISUAL-AUDIT.md`.

Those paths are relative to the source repository. In an installed customer project, use `.superbrain/docs/` instead; the catalogue is `.superbrain/data/techniques.json`.

## Translate a reference into roles

Describe the composition before naming libraries: dominant subject, type voice, crop, background continuity, depth, light source, visitor action, motion trigger. A luminous SaaS reference might suggest an atmospheric field, cursor discoveries and explanatory UI scenes; a salon might suggest tactile imagery, considered crops and responsive booking feedback. Keep these roles while making an original visual direction. Do not transplant logos, client proof, screenshots or exact proprietary artwork.

Choose compatible techniques rather than maximizing their count. One hero can carry a strong material effect; nearby text may share its quiet background. A transition should preserve something recognizable: image, shape, light, grid or type. A dramatic effect is useful when it helps the intended feeling or understanding. No universal ban on vivid effects or compulsory animation quota.

## Judge with actual evidence

Prototype the effect at real size with actual copy, images and the intended CTA. Compare still and moving states. Inspect start, middle, settled state, fast/reverse scroll and exit. Ask: does motion clarify hierarchy, is the subject recognizable, do timing and lighting agree, is the target stable, does mobile feel composed? If it looks like an unrelated layer, adjust its position, crop, contrast or amplitude before adding more effects.

Separate technique feasibility from aesthetic judgment. State which browser and interactions were observed. A screenshot can show layout but cannot prove fluidity, input latency or performance. Keep experimental effects available with honest labels; do not silently promote every tutorial into a validated component.

## Route to detail

- Light, grain, glass, masks, layering: `visual-materials.md`.
- Kinetic text and reflow: `type-motion.md`.
- Product states, SVG diagrams, choreography: `product-stories.md`.
- Galleries, filtering, comparison, commerce: `galleries-commerce.md`.
- Shaders, 3D, particles, Rive/Lottie, heavier rendering: `advanced-graphics.md`.

Start with native CSS/DOM for simple responses. Use Web Animations for finite sequences, GSAP for complex timelines, Motion for React layout continuity, and rendering tools when the desired visual needs them. Verify current support and licenses before integrating a library. These choices preserve design freedom without making all projects carry a heavy default stack.
