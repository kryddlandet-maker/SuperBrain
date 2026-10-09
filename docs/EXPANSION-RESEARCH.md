# Research batch — 2026-10-09

Baseline: SuperBrain 1.2.0 at 38fef3f. The initial audit is in docs/EXPANSION-GAPS.md. This batch inspected 32 distinct source URLs: 31 substantive engineering/skill/documentation sources and one discovery directory. Actual upstream skill files were read rather than judged from search snippets. No upstream code or asset was copied. New local implementation is original. License notes are adoption warnings, not blanket redistribution permission.

The composed registry has 60 source records and 54 unique URLs including historical 1.2 records. This does not claim all 54 were freshly reviewed today. Historical evidence and dates remain visible. Candidates include components, techniques, patterns and references; they are not all agent skills.

## Findings that changed this batch

1. Agent Skills and skill-creator support progressive disclosure. Retain a small entrypoint and extend conditional references instead of hundreds of always-loaded instructions.
2. Existing .light-button is visible at rest and follows both axes. A separate opt-in family meets the requested horizontal hover-only light and preserves legacy behavior.
3. Native actions, visible focus, live media changes and lifecycle ownership matter beyond a hover screenshot. Inspect initial, intermediate, final and interrupted states.
4. Motion/GSAP/Lenis/graphics runtimes solve different ownership problems. They remain researched options; no new animation dependency is installed.
5. External skills overlap existing art direction and motion guidance. Keep useful principles, decline imported style bans and mandatory approval/reveal sequences, and do not count aliases as new capabilities.
6. Directory popularity is discovery evidence. Older tutorials need current lifecycle/DPR adaptation. Runtime and model/animation asset licenses are separate.
7. Animation-from-interactions is WCAG AAA. Pause/stop/hide has separate A conditions. Neither reduced-motion CSS nor a passing demo certifies a whole site.

## Reviewed sources

Each row records inspected material, author and adoption finding. Detailed access/date/license notes and three inspected skill blob SHAs are in data/discovery.json. Maintenance is a reviewed snapshot, never guaranteed ongoing support.

| Source | Finding | License/adoption |
| --- | --- | --- |
[Agent Skills: spec](https://agentskills.io/specification) | Specification defines metadata and progressive disclosure; references load only on demand. | review-before-copy
[Vercel Labs: directory](https://skills.sh/) | Directory useful for discovery; install counts are not quality evidence. | not-a-code-license
[Anthropic: anthropic-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Read actual skill. Ground identity in subject, typography and functional language; keep client brief above style defaults. | Apache-2.0 (per-skill license inspected)
[OpenAI: openai-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md) | Skill authoring reviewed through installed current skill and upstream entry; keep instructions scoped and validate behavior. | review-before-copy
[Vercel Labs: vercel-review](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) | Read actual loader. Narrow audit activation and refreshing authoritative guidelines; no automatic adoption of remote instructions. | unverified; no content imported
[Vercel Labs: skills-cli](https://github.com/vercel-labs/skills) | Read CLI installation behavior, copy/symlink modes and private repository auth reuse. Preserve existing local installer. | MIT reported in README; review before copying
[Addy Osmani: web-quality](https://github.com/addyosmani/web-quality-skills/blob/main/skills/accessibility/SKILL.md) | Read accessibility skill and live/static evidence distinction; native controls avoid duplicate keyboard activation. | unverified; original synthesis only
[Addy Osmani: frontend-engineering](https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md) | Read component and state ownership. Some global style bans conflict with SuperBrain; do not import those bans. | unverified; original synthesis only
[Meng To: meng-css](https://github.com/MengTo/skills/blob/main/agent-skills/web-design/css-border-gradient/SKILL.md) | Read actual CSS gradient skill; border effects need radius-aware layers and readable foreground. | MIT; LICENSE inspected
[b4Help / Meng To attribution: b4-motion](https://github.com/b4Help/WebDesignSkills/blob/main/agent-skills/web-design/animation-systems/SKILL.md) | Read actual animation system. Treat timing as tunable starts; do not adopt compulsory reveal sequences or approval rules. | MIT; LICENSE attributes Meng To
[Emmraan; skill credits wondelai / Dan Saffer: emmraan-micro](https://github.com/Emmraan/agent-skills/blob/main/skills/animation-webgl/microinteractions/SKILL.md) | Read triggers, rules and honest feedback; diagnostic score is heuristic, not measured UI quality. | MIT; repo LICENSE inspected
[Seva Gulian: seva-router](https://github.com/sevq1993-cyber/web-design-motion-skill-family/blob/main/skills/frontend-motion-style-system/SKILL.md) | Read runtime routing: CSS state, Motion layout, GSAP scenes, authored assets, real 3D. High overlap: extend existing references. | MIT; LICENSE inspected
[MDN contributors: mdn-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin) | Scale a decorative layer around selected origin without moving the button hit area. | documentation terms; original code
[MDN contributors: mdn-focus](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) | Browser heuristics identify visible focus; preserve a clear independent focus indicator. | documentation terms; original code
[MDN contributors: mdn-leave](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerleave_event) | Pointer leave follows hit boundaries; reset tracking on leave and cancellation. | documentation terms; original code
[MDN contributors: mdn-media](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) | MediaQueryList changes let open pages respond to new input capabilities and motion preference. | documentation terms; original code
[MDN contributors: mdn-raf](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) | One-shot callbacks and elapsed-time interpolation prevent continuous idle work and refresh-rate dependent smoothing. | documentation terms; original code
[GSAP: gsap-media](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) | Responsive conditions revert owned animations; explicit event listeners still need cleanup. | GSAP terms must be checked at integration
[Motion: motion-layout](https://motion.dev/docs/react-layout-animations) | Shared layout uses layoutId; scroll/fixed roots require layoutScroll/layoutRoot; transforms can distort children. | runtime license review required; no dependency added
[Darkroom Engineering: lenis-docs](https://github.com/darkroomengineering/lenis) | Read lifecycle, reduced-motion indicator, nested scroll limitations and destroy method. Native scroll remains default. | runtime license review required; no dependency added
[Kayce Basques / Rachel Andrew, web.dev: animation-performance](https://web.dev/articles/animations-guide) | Transform/opacity avoid many layout/paint costs; profile actual effects and add will-change only when justified. | CC-BY-4.0 prose / Apache-2.0 samples; original synthesis
[W3C WAI: apg-button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | Native buttons support Enter and Space; focus follows action and toggle labels remain stable. | W3C document terms; original code
[Radix / WorkOS: radix-access](https://www.radix-ui.com/primitives/docs/overview/accessibility) | Primitives manage semantics, focus and keyboard behavior; consumer still supplies meaningful labels and composition. | review component license before integration
[shadcn/ui: shadcn-button](https://ui.shadcn.com/docs/components/base/button) | Read variants and semantic-link advice; button styling must not replace anchor semantics. | review chosen implementation license
[W3C WAI: apg-nav](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) | Ordinary site navigation uses disclosure and links, not application menu roles; Escape closes and returns focus. | W3C document terms; original synthesis
[Microsoft / Playwright: playwright-emulation](https://playwright.dev/docs/emulation) | Read viewport/media/input and JavaScript-disabled emulation; simulated devices do not prove physical-device behavior. | review runtime license; optional host-provided test tool
[Google model-viewer: model-materials](https://modelviewer.dev/examples/scenegraph/) | Material and variant APIs differ across AR modes; assets have distinct licenses. Historical Safari claim requires rechecking. | Apache-2.0 runtime; models separately licensed
[Airbnb / Hernan Torrisi: lottie-runtime](https://github.com/airbnb/lottie-web) | Read loading, renderer, segment/pause/destroy APIs and export limitations; bound playback and handle asset failures. | review runtime and asset licenses separately
[Arno Di Nunzio / Codrops: codrops-gooey](https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/) | Read DOM geometry and shader sampling tutorial; 2019 render loop/uncapped DPR need lifecycle and performance adaptation. | review linked implementation license; no copy
[Poimandres: r3f-performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) | Read demand rendering, instancing and adaptive quality; invalidate requests frames, it does not force immediate render. | review runtime license at integration
[W3C WAI: wcag-animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | Read SC 2.3.3 (AAA): allow disabling nonessential interaction motion. Native scrolling is distinct; this is not an AA conformance claim. | W3C document terms; original synthesis
[W3C WAI: wcag-pause](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | Read SC 2.2.2 (A): automatic moving content over five seconds alongside other content needs pause/stop/hide; auto-updating content has no five-second exemption. | W3C document terms; original synthesis

## Coverage and remaining research

The A–V map contains 22 domains and 110 named capability areas. It is a scope map from the brief, not 110 researched techniques. This wave adds 32 nonduplicate candidates to the preserved 54 records: four tested button components and 28 source-reviewed techniques/patterns/references. Backend and application categories are largely mapped, not investigated or implemented.

The target of 300 candidates remains open: 214 additional distinct candidates are needed for 300 total. Mandatory discovery starting points still queued: Figma, Framer's former Motion entrypoint, Awwwards, SiteInspire, Hover.dev, Aceternity, React Bits, Magic UI and LottieFiles. Current Motion docs were read; that does not silently complete a different queued source.

Access limits: the old Three.js /manual/en/cleanup.html URL returned 404; Rive state-machines returned a shell without substantive instructions. Some raw GitHub failures were recovered through repository file reads. Composio's ranking article is discovery-only. Do not count queued or unavailable content as studied.

Next actions are in docs/EXPANSION-CHECKPOINT.md. No remote scripts were executed for discovery and no external publication was performed.
