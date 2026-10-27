# Active product motion: research and implementation

Reviewed 2026-10-27. This change adds a specific missing family to SuperBrain: coordinated, automatically playing product demonstrations inside feature sections. Existing pointer, button and scroll modules remain separate. The local implementations are original interface studies, not copies of the reference sites or real SaaS products.

## What the supplied references establish

The user supplied screenshots of meetpave.com, borel.one and huly.io and requested inspection of their motion. The linked Codex thread was read: recent work emphasizes visible motion, integrated composition, responsive behavior and real navigation. Preferences from individual portfolio builds are context, not universal settings for all SuperBrain projects.

| Reference | Supplied visual and verified implementation source | Reconstruction path | Native browser observations |
| --- | --- | --- | --- |
| Borel | The native-feature icon card uses DOM with individually positioned/rotated icon wrappers. Inner layers use a six-second CSS bento-float cycle with staggered negative delays. Its CSS moves the inner layer vertically by five pixels at mid-cycle and returns to the starting pose. | Original layered icon choreography; preserve the outer layout transform and animate an inner wrapper. No video or GPU engine is needed for this specific card. | Observed 19 independently timed float layers at 1440px and 390px, loaded icon images and changing transforms. Live reduced motion removed these float animations. |
| Pave | The three feature cards explicitly load loop-learn-720.mp4, loop-moment-720.mp4 and loop-memory-720.mp4. They are muted, inline, looping videos, initially preload=none with a data-src. Page code loads on demand, reveals a presented frame over a poster and governs playback by visibility. | Use authorized rendered video when reproducing that filmed editor/material treatment. A simpler original DOM editor can communicate the same product task but is a different visual medium. | Observed three simultaneous card videos on desktop and one on mobile. The clips report 7.0, 6.6 and 6.8 seconds on desktop; playback advanced, paused offscreen and resumed on return. No field-performance claim. |
| Huly | The Team Planner component loads a dedicated team-planner.riv asset with artboard team-planner and state machine SM. The source uses a +1 state-machine input and visibility hooks; the mobile in-view effect fires that input. Other cards have their own .riv assets, and the GitHub section combines Rive with MP4/HLS glow media. | Either author a real Rive scene with declared inputs, or build an original DOM/SVG task scene that explains the same relationship. Installing Rive without an authored scene does not supply the animation. | Observed moving Rive pixels both at idle and with the desktop pointer, plus visible motion under touch emulation without forcing hover. Desktop canvas 768×420; compact layout crops a wider canvas within the 350px card. |

Primary implementation assets and hashes are recorded in `docs/evidence/product-motion/reference-sources.json`. The website HTML and selected public JS/CSS were fetched over verified HTTPS and inspected as text, not executed. Pave's video governor also limits simultaneous section videos to one on mobile and three on desktop, pauses when hidden or the theater is open, and leaves a poster when play is rejected. The subsequent browser inspection confirmed the visible playback and concurrency behavior described above; no field-performance measurements were made. Borel's bundle contains other application subsystems; the finding above is scoped to the icon-card component, not its whole stack.

Initial HTTPS requests were blocked by cloud egress. The three exact hostnames were added to the editable environment network draft; subsequent verified HTTPS requests returned 200 for all three sites and their selected assets. This establishes current read access, without attributing the runtime transition to draft saving alone.

Remote Desktop Commander was unavailable, so the sites were inspected with Chromium 154 and Playwright. After the initial certificate block and automatic-review rejection, the user explicitly authorized the proxy-certificate configuration. Diagnosis found that the exact platform proxy CA was already trusted in the existing NSS database. Direct browser access succeeded when the browser had permission to use that database. TLS verification remained enabled; no certificate-error bypass was used. All three sites returned 200 and their selected feature scenes were inspected at 1440px and 390px (touch emulation).

Native observations are recorded in `docs/evidence/product-motion/reference-browser.json`; local reference frames are under ignored `artifacts/reference-motion/`. Borel's unrelated auth-status request and Huly analytics remained blocked, without preventing the selected public scenes from rendering. The observations cover representative feature motion, not authenticated application behavior, every site interaction or whole-site conformance. A guessed Huly website source repository was unavailable; it and third-party clones were not used as evidence.

## What “this motion” consists of

Useful search terms are animated product demo, feature animation, UI choreography, living bento card, product motion, looping interface scene and motion vignette. This family has several independent axes:

- Trigger: visible-auto, manual, hover, actual product state, scroll progress. A requested active scene generally needs visible-auto, not a hover-only substitute.
- Representation: editable DOM/SVG, authored vector animation, pre-rendered footage/3D, interactive GPU rendering or a hybrid.
- Composition: stable frame and semantic anchors, moving subject, tracked attention, result hold and reset.
- Time: a common timeline with overlapping beats and readable pauses. Constant unrelated floating is not a substitute for explaining the product.
- Lifecycle: visibility gating, explicit pause, live preferences, failed media fallback and disposal.

The medium matters. Perspective, light, smooth materials and small-screen video may be baked into an asset. Generating more CSS does not replace missing photographic footage, a designer's Rive file or a 3D render. Conversely, installing a video/3D runtime for a simple task-card transfer adds cost without supplying the choreography. The new guide contains a medium-selection table and a concrete beat sheet.

## Public Claude skills reviewed

Primary source: [anthropics/skills](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44), pinned commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44`. The four files below were first reviewed as research data. The user then explicitly requested their complete original packages. Those originals, licenses and helpers are now preserved separately under `vendor/anthropic/`, with exact upstream hashes and opt-in native activation. SuperBrain’s design/motion implementation remains original. See `docs/ANTHROPIC-SKILLS.md` for package availability, helper checks and compatibility.

| Public skill | What it actually supplies | Application to SuperBrain |
| --- | --- | --- |
| [frontend-design](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md) | Subject-specific design direction, deliberate type/layout, compact planning, early critique, plain copy and avoidance of default composition | Keep the distinctive subject visible, make a deliberate first composition, render and critique. Its restraint around unsolicited motion does not override an explicit request for active product scenes. |
| [web-artifacts-builder](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/web-artifacts-builder/SKILL.md) | React/TypeScript/Vite/Tailwind/shadcn scaffolding and an HTML bundling workflow for Claude artifacts | Reusable executable examples and predictable setup reduce work. Do not impose this stack or a single-file artifact on an existing multi-page customer project. Its optional delayed testing policy is not adopted here. |
| [webapp-testing](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/webapp-testing/SKILL.md) | Playwright interaction, DOM reconnaissance, screenshots and server lifecycle helpers | Test what is actually rendered and use reliable readiness conditions. Wait for the application's meaningful state rather than treating a generic wait as proof of correctness. |
| [skill-creator](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/skill-creator/SKILL.md) | Progressive disclosure, triggering examples, test prompts, qualitative/quantitative evaluation and iteration | Keep the entrypoint small; load motion detail only when requested; add controlled prompts and measurable scene requirements. Passing tool tests does not establish superior generated designs. |

These public files do not disclose model weights, hidden system instructions, private assets, every tool available in Claude products, or a universal way to reproduce its outputs. There is no evidence here that the public frontend skill contains a dedicated secret animation engine. The practical improvement is combining subject-specific design, reusable implementation recipes, appropriate assets and browser refinement. Equal skill text alone cannot establish equal model quality.

## Implementation in this repository

- `product-motion.md` recognizes the user's language and routes from short intent to composition, medium, timed beats and evidence.
- The planner recognizes explicit `techniques: ["scenes"]` and common Swedish/English phrases, chooses a workflow/orbit/timeline proposal and exports a scene contract alongside the design system. Quiet briefs select manual playback. Quick edits preserve the surrounding project and do not generate a replacement token system.
- `examples/shared/product-motion.js` uses shared-duration WAAPI tracks without a JavaScript render loop. It owns pause/resume, offscreen/hidden suspension, live motion preferences, a meaningful still and explicit local playback, failure fallback, and teardown.
- `/examples/product-motion/` has three original scenes. Existing projects receive the shared runtime and all three recipe source files through the current installer. No npm dependency or external service is added.
- The four original public Anthropic packages are available on demand, with licenses, helper files and byte verification. `--anthropic` registers them as separate project skills; ordinary briefs do not load all their instructions.
- Both brief interfaces expose the new family. Natural-language brief goals/directions can also select it. The token-preview iframe remains a token study; it does not pretend to be a generated animated customer website.

## A compact request

> Använd SuperBrain. Bygg en flersidig sajt för [produkt] där besökaren ska [mål]. Riktningen är [känsla]. Använd referenserna för komposition och aktiva produktanimationer. Bygg egna scener som visar hur produkten fungerar, med rörliga gränssnitt inne i sektionerna. Gör rimliga antaganden och bygg och granska i webbläsaren innan du lämnar tillbaka.

Actual product facts, licensed assets and real submission destinations still need to exist. Reversible design decisions do not require the user to configure the machinery. If a supplied image is the specification, the existing fidelity workflow remains active.

## Validation and remaining work

See `docs/PRODUCT-MOTION-VERIFICATION.md` and `docs/evidence/product-motion/` for the completed local checks. The public-source comparison is research, not a controlled Claude-versus-Codex evaluation. Verified source inspection and representative native feature-motion inspection of all three sites are complete. Physical-device, authenticated-product and full-site audits were outside this task. Further one-prompt quality claims need equivalent briefs, assets, model/tool settings, time budgets and blind human review; the added benchmark cases specify that next experiment.
