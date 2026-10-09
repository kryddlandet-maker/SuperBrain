# Resume expansion from this checkpoint

Batch: source 1.3.0 on codex/library-expansion-wave-1, starting at main 38fef3ffa2407355723e2ad8a0bd68fe3ee903f0. Use the local clone attached to this work; this branch has not been published. Inspect git status and git log before continuing. Do not overwrite a consumer's local installed files or assume this branch exists on GitHub.

Implementation/evidence commit: a811fe6. Final documentation is a separate following commit; inspect git log -2 for its exact ID.

## Completed scope

Initial repository audit, actual source review (31 substantive sources plus one directory), A–V scope map (110 capabilities), 32 new nonduplicate candidates, selective CLI/browser discovery, four conditional references, four original configurable button components and scoped evidence. Preserved atlas: 54 IDs. Composed total: 86 candidates, 63 RESEARCHED, 17 PROTOTYPED, 4 TESTED, 2 EXPERIMENTAL, zero PRODUCTION-READY/IDENTIFIED.

Tests: 23 Node, 411 structural invariants, 18 scoped Edge/Chromium browser checks. Reports and screenshots in docs/evidence. Five-case packaging benchmark completed; comparative model-design benchmarks remain unrun.

## Reproduce

```sh
git status --short
npm test
npm run validate
node scripts/discover.mjs --query "horizontal light" --domain D --limit 5
node benchmarks/check-routing.mjs
npm run studio
```

Open /examples/buttons/ and /examples/library/. Optional npm run test:browser requires a host-provided Playwright runtime and browser; see EXPANSION-VERIFICATION.md for configuration. Browser evidence is regenerated only when relevant changes warrant another run.

## Next batches, in order

1. Finish queued mandatory discovery sources in data/discovery.json. Inspect actual source/components and licenses for Hover.dev, React Bits, Magic UI, Aceternity and authored assets; inspect Figma/Framer docs and editorial inspiration separately. Resolve the current Three.js cleanup URL and obtain substantive Rive state-machine instructions. Log unavailable content honestly.
2. Expand distinct candidate coverage across under-researched G/Q/S/U domains: form recovery, CRM permission-aware state, real API contracts, private storage, deployment/monitoring. Continue toward 300 credible distinct candidates (214 more for 300 total), merging overlaps instead of duplicating existing IDs. More than 100 categories is a coverage map, not proof of research across every domain.
3. Build a navigation/form lab: touch disclosure/drawer, Escape/focus return, pending/error/retry with local test endpoints and truthful feedback. No live business submissions or invented success.
4. Build deeper scroll/transition prototypes: interruption, history/direct routes, scrolled layout roots, mobile/static fallback, native timeline support. Compare native APIs with existing GSAP/Motion options before adding dependencies.
5. Implement selected authored/3D integration only after source/license/asset review: bounded camera continuity, demand rendering, resize/context-loss/disposal and a complete DOM/poster equivalent. Mark untested or unsupported cases explicitly.
6. Extend decision routing with clear task/stack/capability constraints and reasoned tradeoffs. Current discovery offers filters/editorial order, not a complete automatic recommendation engine.
7. Run controlled site-generation benchmarks across tech, salon, construction, portfolio and CRM with pinned models/context/asset kits, consistent answers and multiple runs. Blind human review and functional hard gates precede superiority claims. Add physical-device, screen-reader and additional-engine checks where relevant.

For each addition: DISCOVER → VERIFY → ANALYZE → COMPARE → SELECT → IMPLEMENT → TEST → DOCUMENT → INTEGRATE → BENCHMARK. Candidate priority is editorial judgment, not a measured quality score. Prefer one source of truth and conditional references.

## Release boundary

Local completed work is committed. Publication remains unauthorized by the attached brief. Do not push, deploy or update production/consumer installations without a mandate. After an authorized source release, verify the remote SHA, reinstall from a clean pinned checkout, then run local consumer and separate remote QA. Keep project facts in that project rather than reusable guidance.
