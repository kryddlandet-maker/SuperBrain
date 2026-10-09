# SuperBrain 2.0 architecture

The 1.4.0 source is preserved and extended. A compact entrypoint routes tasks, not whole historical brains.

- lib/project-schema.mjs: typed brief validation and safe local routes.
- data/business-profiles.json: distinct editable starting hypotheses for eleven contexts; never business facts.
- lib/design-engine.mjs: explicit choices, business rationale, workflow mode and unknowns.
- lib/skill-router.mjs: actual chapter index, triggers, dependency closure, conflict warnings and search.
- lib/design-system.mjs: synchronized semantic token JSON/CSS, component and motion contracts, route exceptions.
- lib/project-store.mjs: hash ownership checks, no unmanaged overwrite, local project memory.
- lib/visual-audit.mjs + scripts/audit.mjs: actual browser snapshots, screenshots, preference and input evidence.
- lib/critique.mjs: measured findings separate from attributed creative judgments and one scoped refinement.
- studio/engine/: browser design-system preview, explorer, local review import and benchmark viewer.
- examples/shared/scroll-timeline.js: reversible event-coalesced tracks; owned transforms, visibility/preferences and cleanup.

No mandatory external AI service or new frontend framework. Optional host-provided Playwright is needed for CLI browser captures. New functions do not change old pointer/motion modules. API endpoints do not write project files or run arbitrary shell commands. Persisting a design system is an explicit CLI action into a named existing project.

A starter profile is not a mandatory template. Codex reconciles it with real imagery, typography availability and the user's direction at the first render. Creative observations require actual screenshot identities and named reviewers; incomplete criteria remain needs-review.
