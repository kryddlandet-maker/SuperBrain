# Evidence-led visual improvement

Run node scripts/audit.mjs URL evidence-directory [brief.json] with optional Playwright and an installed supported browser. First start the target using its documented command; SuperBrain's own target starts with npm run studio. Set SUPERBRAIN_PLAYWRIGHT when the host provides Playwright in a nonstandard location. No AI API key is required.

The runner captures desktop, intermediate and mobile screenshots under ordinary and reduced-motion preferences, visible DOM facts, five keyboard-focus positions, and explicitly supplied interaction fixtures. It reports solid-color text contrast, page overflow, missing landmark/heading, names, image failures and missing fragments. Unsupported compositing is unverified, never passed by omission. External backend success and full accessibility certification remain separate.

Use creativeReview to submit attributed observations after inspecting the actual screenshot artifacts and recorded interactions. Cover typography, composition, originality, consistency, brand fit, motion, UX, responsive behavior, accessibility and functionality. Every issue needs evidence, its impact and a scoped correction. No automatic aesthetic score is produced. The engine's contextual review prompts guide the Codex agent or human; they are not a hidden vision model.

Use refinementPlan to select a bounded group of high-impact fixes. Implement one focused correction pass and render the same routes/input/viewports again. Preserve facts, working interactions and unrelated components. More than two rounds requires a concrete unresolved defect or user request. Keep before/after evidence and subjective judgments separate from mechanical findings. Do not equate lower defect counts with aesthetic superiority.

Studio accepts an exported audit JSON and creative observations and produces a concrete review/refinement artifact locally. It does not upload screenshots to an external AI service.

The capture runner also makes bounded same-origin HEAD probes for native destinations. Query, external and potentially state-changing links are left for explicit authorized input checks. Unsupported HEAD endpoints and composited color samples remain unverified.
