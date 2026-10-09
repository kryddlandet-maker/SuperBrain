# SuperBrain 2.0 — implementation research

2026-10-09. Baseline 1.4.0 at 2597b3ff37546494960e3f3207e7c0153483340c: 24 tests and 472 validation invariants passed before editing. Historical 1.2/1.3 documents remain provenance, not a claim of newly repeated research.

## Pinned primary repositories

| System | Exact reviewed commit | Files inspected | Useful mechanism / limitation |
| --- | --- | --- | --- |
| [Impeccable](https://github.com/pbakaus/impeccable) | d631a8827f99414d2b6daba4ef08b7f8701751d7 | skill/reference/critique.md (assessment and persistence sections), audit.md (technical scan), polish.md, crates/detect/src/design_system.rs (discovery and allowlists), LICENSE | Separates judgment and detector evidence; target-scoped preservation; projects can own design allowlists. Its current Rust tooling and multi-agent critique are not a dependency of SuperBrain. We analyzed it as data and did not invoke/copy its full workflow. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 50d8a7de0900119855614541f15a1a616691eb33 | scripts/search.py, design_system.py (configuration, semantic colors, contrast, master/override generation), LICENSE | Search-based domain routing and persistent master/page overrides. Defaults must be reconciled across theme and palette; recommended designs remain hypotheses. No upstream CSVs or code are bundled. |
| [Anthropic Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 9d630808e4add0a7146de4af9384155d5dee350a | frontend-design/SKILL.md in full, LICENSE.txt | Brief-specific characteristic composition, concise type/color/layout decisions and rendered self-critique. Its subjective style preferences do not override this user's decisions. |

Repositories were freshly cloned at shallow HEAD; commit IDs lock the research to content actually available, not a floating latest label. File hashes are in research-2.0.json. Impeccable and Anthropic frontend-design declare Apache-2.0; UI UX Pro Max declares MIT. This update is independently authored; no substantive code/instruction text or external asset is copied. If future integration copies code/data, include required attribution/notices and inspect the particular file's terms.

## Additional primary documentation

- [MDN scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations): native timelines are an option, with feature detection and static fallback. Our new timeline uses coalesced native scroll events, dedicated inner transforms and no scroll hijacking.
- [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API): existing same-origin document transitions and normal routes remain; no replacement SPA router is introduced.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/): scoped cleanup and preference changes. The existing family and new controller independently own their listeners/styles. GSAP itself is not added.
- [Motion animate](https://motion.dev/docs/animate): a richer engine is available for sequences when justified; do not add a universal library to quiet jobs.
- [Three.js cleanup](https://threejs.org/manual/pages/cleanup.html): GPU resources need explicit disposal. Existing on-demand WebGL study stays separate from CSS camera illusion; no new real 3D-model claim.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility): native semantics, labels, focus and keyboard behavior are responsibilities even when using a library.
- [Rive Web](https://rive.app/docs/runtimes/web/web-js): renderer/feature and asset requirements make this an optional integration; a real .riv asset and pinned runtime are needed before claiming it implemented.
- [Codrops](https://tympanus.net/codrops/): current creative research entry point, not a redistributed component package or proof that its demos are tested here.

Existing atlas/research includes Lottie, OGL, Figma/R3F and advanced reference families. Those remain integration guidance/research where no runnable local component exists. The upgrade prioritizes the masterprompt's end-to-end workflows, not an exhaustive reimplementation of every graphics engine.

## Implemented architecture

project-schema → design-engine + skill-router → design-system + project-store → Studio/API/CLI.
visual-audit captures rendered facts; critique stores attributed creative observations and produces a bounded refinement plan. These layers do not pretend to be an external vision model. The Codex agent/human performs actual image judgment. A new reusable scroll controller complements the preserved pointer, state, WebGL and route-transition implementations.

Business facts, direction, page exceptions, knowledge selection, code and QA are separate artifacts. Quick-edit avoids generating a new design system. Design-build loads relevant foundations. Creative-engineering loads specialist dependencies only when requested.

## Comparative evaluation limits

A controlled same-model multi-skill site-build experiment and blind human preference assessment have not been performed. There is no automatic aesthetic-superiority score. New engine tests exercise scope, tokens, routes, feedback and preservation, and browser reports exercise real UI; these do not prove better creative outcomes than the three references.
