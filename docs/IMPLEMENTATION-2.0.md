# SuperBrain 2.0 release candidate — actual implementation and evidence

2026-10-09. Source baseline: 1.4.0 at 2597b3ff37546494960e3f3207e7c0153483340c. Branch: codex/superbrain-2-engine. Version: 2.0.0-rc.1. This is an implemented release candidate, not a claim that every technique named in the masterprompt is now a production component.

## What is implemented

- An executable business/art-direction/layout/interaction planning pipeline with eleven different starting contexts and explicit user overrides, including independently chosen font stacks and three-color palettes.
- Quick-edit, design-build and creative-engineering routing with real chapter dependencies, search and conflict warnings. Quick-edit preserves the incumbent identity and does not generate a replacement token system.
- Project facts, design direction, recorded reference analysis, route exceptions and QA remain separate. Generated project memory can be resumed between Codex sessions.
- A real generator for MASTER.md, token JSON and synchronized CSS, responsive typography, semantic palette, spacing, grids, breakpoints, surface/lighting, component states, motion presets and scoped page exceptions.
- Local Studio builder with rendered sandboxed previews, actual file/brief/bundle downloads, a 26-chapter explorer, evidence import, critique/refinement export and benchmark viewer.
- Browser audit with real screenshots, visible names/landmarks/images/overflow, bounded solid-color contrast and same-origin HEAD link probes. Externally scoped or potentially state-changing destinations are left unverified. Explicit interaction fixtures and keyboard samples can be recorded.
- Creative review records attributed observations against actual screenshot identities, keeps objectiveScore null and generates a bounded correction plan. Codex/humans supply visual judgment; no hidden external AI service is claimed.
- A reversible native-scroll controller demonstrating product rotation, camera illusion/zoom, masking and layered parallax, with preference, visibility, no-JS and disposal behavior.
- The CRM scope fixture changes only the marked tab's fading dot layer. Exact tab size, document position, typography and native destinations are tested at 1440, 390 and 320.
- Standalone consumer installation includes the new executable modules and CLIs and preserves unrelated application code.

## Actual checks

| Check | Result | Scope |
| --- | --- | --- |
| Unit/tool suite | 38/38 pass | Router, facts/overrides, token sync, project ownership, reference scope, audit/critique contract, installed engine, API limits, preserved motion |
| Validation | 510 pass | Real chapters, skill frontmatter/size, briefs, example structure and local links |
| New engine browser suite | 22 groups pass, no runtime errors | Headless Edge; real exports, eleven profiles, four widths 320/390/768/1440, reduced preference changes, keyboard, emulated touch, no-JS, reference scope, audit import |
| Original pointer suite | 20 pass | Existing four soft pointer variants and old-runtime preservation |
| Original button suite | 19 pass | Directional fill, light behavior, controls, fallbacks |
| Product regression | 17 groups across 22 routes / 110 viewport-preference combinations | Existing and added example routes; not Studio engine profile builds |
| Native navigation | 12 pass | Existing direct loading/back/forward and transitions |
| Functional briefing benchmark | 10/10 pass | Actual plan/token generation, context bytes and preservation; not aesthetic/model superiority |

The old button runner initially lacked a bundled Chromium executable; it was rerun successfully using the installed Edge channel. No new browser was installed. The new UI runner found and corrected a quick-edit direction leak and a real 320px heading overflow. Its later focus/pixel-coordinate issues were isolated to the automation harness and corrected using the active test page/document coordinates, without modifying old motion timing or weakening outcomes.

## Before/after review

docs/evidence/engine-before/audit.json captured four small link targets per viewport and a long unpaginated knowledge list. The targeted improvement adds usable link heights and an initial eight-entry explorer with explicit expansion/search. Final docs/evidence/engine/audit/audit.json has zero deterministic findings in the measured Studio snapshots. A zero sampled count is not full accessibility or visual certification.

Screenshots reviewed include mobile salon/CRM and desktop technology token previews, 320px quick-edit output, the 390px stationary scroll study and CRM before/after. The component studies differ in palette, type, density and material; they are not completed customer websites. The CRM screenshots show decoration confined to the same selected row.

## Masterprompt phase acceptance

| Phase | Current outcome |
| --- | --- |
| 1 Audit | Baseline tests, source inventory and preservation recorded. Architecture in ARCHITECTURE-2.0.md. Historical docs remain labelled historical. |
| 2 Research | Real implementations of the three mandatory repositories were inspected and pinned by commit/file hashes. RESEARCH-2.0.md records independent design and license boundaries. Additional official docs reviewed. |
| 3 Intelligence | Executable planning, explicit decisions, unknown facts, eleven contexts and project persistence. Recommendations are starting hypotheses. |
| 4 Discovery | Existing 86-candidate registry preserved; 26 actual chapters indexed with categories, triggers, dependencies, sources and scoped guidance status. |
| 5 Motion | Existing tested families preserved; new scroll timeline and state/CRM demonstrations added. Real 3D-camera/model physics, fluid simulation and Rive/Lottie asset integrations remain specialized research/integration choices, not fabricated implementations. |
| 6 Visual critique | Runnable browser capture/audit, local observation intake, scoped refinement and measured before/after. Creative image judgment uses the available Codex/human reviewer; there is no independently calibrated automatic vision model. |
| 7 Anti-slop | Concrete user preference for substantive headings retained; no decorative counters/eyebrows added. Other decisions remain contextual. |
| 8 Design systems | Working generator and synced exports, states, presets, dial effects and route exceptions. |
| 9 Reference/vision | Recorded source/reviewer/scope/preservation pipeline; rendered HTML preview and measured CRM scope example. No generated vision image is claimed. Image tools remain an optional Codex workflow. |
| 10 Studio | Builder, actual knowledge search, playground links, local critique import and real benchmark data. No new framework or external AI backend. |
| 11 Agent workflow | Three modes, selective dependencies and persistent project decisions. Entry remains below the 6500-character limit. |
| 12 Benchmarks | Ten functional cases plus browser regressions. Controlled same-model site builds against external skills and blind human review explicitly not run. |
| 13 Iteration | Early render → combined audit → focused correction → verifying capture. Exact failures and limits retained. |
| 14 Delivery | Versioned dedicated branch; publish/pinned installation checks recorded separately. No automatic main merge or production deployment. |

## Critical outstanding verification

Remote Desktop Commander was initialized and navigated Chrome to the local Studio, but stopped before screenshot review because it could not confidently identify the current browser URL for policy enforcement. No further desktop input or workaround was attempted. Independent headless QA continued; it does not replace this missing desktop observation. Therefore this remains a release candidate and is not presented as completely verified for the user's live desktop browser.

Physical devices, additional engines, real backend integrations, full WCAG, controlled same-model creative comparisons and blind human judgment are not certified. The masterprompt allows unavailable fair comparisons to be reported as not run. Unsupported advanced techniques are not quietly renamed as tested components.

## Use

In the SuperBrain source:
- npm run studio → /studio/engine/ for builder, knowledge and critique.
- node scripts/design.mjs brief.json --out existing-project to persist facts/tokens safely.
- node scripts/audit.mjs URL evidence-directory brief.json to capture the actual target after starting it with its documented command.
- SUPERBRAIN_PLAYWRIGHT and SUPERBRAIN_BROWSER_CHANNEL can select host-provided test dependencies.

In a consuming Codex project, use $superbrain and read project memory first. The installed CLIs are .superbrain/scripts/design.mjs and audit.mjs. Ask for a bounded quick-edit when only one component changes. Supply owned assets, real facts, audience and visitor goal for a new site. Inspect the proposed direction and render before declaring the customer site ready.

## Delivery index

- Baseline, gaps and rationale: [architecture](ARCHITECTURE-2.0.md). Missing planning/token/critique tools were the main functional gaps; the existing interaction runtime was already working.
- Studied systems and licenses: [research](RESEARCH-2.0.md) and [pinned file evidence](research-2.0.json). No upstream code or CSV was copied and no mandatory runtime dependency was added.
- New knowledge chapters: design-intelligence, design-systems, visual-critique and reference-workflow. The router groups actual chapters into A–H and records guidance separately from executed components.
- Important source changes: lib/design-engine.mjs, design-system.mjs, skill-router.mjs, project-store.mjs, critique.mjs, scripts/design.mjs, audit.mjs, studio/engine/, examples/cinematic/ and crm-scope/.
- Actual screenshots and findings: [new browser report](evidence/engine/browser.json), [before audit](evidence/engine-before/audit.json), [after audit](evidence/engine/audit/audit.json), [attributed visual observations](evidence/engine/creative-observations.json).
- Functional comparisons: [ten routing cases](evidence/engine-routing.json); this measures scope/context/export behavior rather than aesthetic quality.
- Source publication SHA and consumer installation hashes belong in the consuming project delivery record, since this committed report cannot contain its own commit hash. The dedicated branch is codex/superbrain-2-engine.

Installation from a clean pinned clone: node scripts/install.mjs /absolute/path/to/existing-project. It refuses locally changed managed files and unmanaged collisions before writing. Consumer update needs a backup and manifest verification. This release candidate remains distinct from the stable main branch; neither main merge nor production deployment is automatic.
