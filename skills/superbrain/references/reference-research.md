# Turn references into project decisions

Use when researching visual references, choosing type or converting a reference design system into an implementation contract. Start with the actual brief and existing tokens; this workflow does not impose a new brand on a small edit.

Select a small set that answers the current question. Refero Styles and TypeUI can expose layout/type/color descriptions; verify them against the actual referenced page. Fonts In Use shows typography in context; inspect its specific specimen and confirm available font files, language coverage and licensing separately. An archive entry is not a font license or proof the font loaded in the project.

Record source, reviewer, what was actually observed, component/page/site scope, affected target and what must remain. For each adopted principle state the source observation it follows from, the project reason, the desired change and any recognizable identity to avoid copying. Keep source facts and proposed choices separate. Use cross-category references when helpful, not a quota of references or mandatory alternative concepts.

`brief.references[].decisions` can record up to eight `{aspect, observation, adopt, avoid, reason}` entries. `observation` is the zero-based index of an existing recorded observation; `aspect` is layout, typography, color, imagery, motion or voice. With references the generator emits `design-system/reference-contract.json`, retaining scope, preservation requirements and proposed decisions. A quick edit instead keeps it in `.ai/project/superbrain/reference-contract.json`, preserving existing tokens. This is an authored contract, not automatic scraping or visual verification.

For a layered hero, record each plane, its actual asset, contact/pivot anchor, occlusion order and opening/middle/exit states. Separate mobile composition and still fallback. Reuse the existing cinematic/depth modules when appropriate. Do not add a second scroll controller merely because another repository uses a different engine.

For an Elementor/CMS project, preserve existing editable fields, content relationships and widget lifecycle. Adopt the content/evidence and review method without installing Elementor into unrelated stacks. A verified HTML prototype is not proof of a working CMS widget.

For a targeted visual edit use `scripts/verify-change.mjs`. Capture before and after at the same URL, viewport, motion and state; specify one unique target, expected computed CSS and explicit regions to preserve. A passing report proves only those sampled properties/text. Inspect its paired screenshots and test interactions separately. `needs-review` must not be presented as done.

Example spec: `{"target":"#cta","properties":["color"],"expected":{"color":"rgb(255, 255, 255)"},"preserve":["#nav"]}`. Run `capture URL spec.json new-before`, implement the requested change, run `capture URL spec.json new-after`, then `compare new-before/snapshot.json new-after/snapshot.json`. The tool captures only; it never edits the site or activates its controls.
