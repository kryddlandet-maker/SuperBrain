# SuperBrain rc.7 — film, depth and production

This expansion completes the previously identified functional gaps with original SuperBrain implementations and local tools. It does not copy the external skill, force a film onto every site or claim identical behavior to every upstream internal heuristic.

The comparison was pinned to [10k-websites commit b01a74d](https://github.com/meticsmedia/10k-websites/tree/b01a74dcd7bf1cfdc8448ed077f6d333fc329e40), still its main revision at inspection on 2026-11-03. The complete tree contained 56 files and no LICENSE/COPYING/NOTICE file. Its feature selection was research input; no upstream source code, instruction text or media is vendored. The existing Anthropic originals are separate and retain their verified bytes.

## Implemented capabilities

| Capability | Actual implementation |
| --- | --- |
| Camera/plane movement | `film-tracking.mjs` and its Python worker measure ORB features and RANSAC homography in the selected plane of a real local delivery film. Frames with insufficient evidence are explicitly lost; reference matching can recover after occlusion. |
| Perspective text | `film-surface.js` maps real DOM text with a projective CSS matrix, object-fit crop correspondence, presented-media time and separate still/resize/disposal behavior. |
| Image depth | `depth-media.mjs` runs pinned Apache-2.0 Depth Anything V2 Small locally through Transformers.js. Original image and map hashes stay linked. `depth-scene.js` renders bounded WebGL image displacement with a useful static image. |
| Scene assembly and joins | `cinematic-edit.mjs` trims, rescales and assembles 2–12 local segments into H264 with cuts or dissolves, source hashes, join timings and actual review frames/player. Output is a muted decorative film. |
| Additional small effects | Expand/split composition, pinned rail with native mobile scrolling, scroll-color, spotlight, tilt/glare, glass sheen, floating row preview, split words/chars, word rotator, countup, drifting columns, marquee and flowing SVG paths. Existing magnet, procedural light and view transitions remain available. |
| Production profiles and budget | Full-throttle/Studio/Focused profiles record actual quotes, approval allowances, expenses and remaining budget without hardcoded current prices/models or implicit purchases. |
| Media versions and acceptance | Actual files/evidence are hashed and copied into private state. Generated film requires design-accepted wide/portrait previews. Replacement invalidates dependent versions transitively. Release requires current film/join reviews and refuses altered evidence. |
| Form inbox | Real Node HTTP backend with durable private storage, owner setup/password, session/CSRF protection, validation, signed form tokens, rate limit, honeypot, duplicate prevention, status and safe CSV export. Optional authenticated TLS SMTP transport uses real supplied settings. |
| Site and language delivery | Real static-site link/anchor/heading checks; supplied language counterparts, canonical and OG metadata, robots and sitemap; original SVG favicon, raster icons and 1200×630 share image. No business facts or translations are invented. |
| Client handover | Private delivery report, file hashes, handover Markdown, brand JSON/CSS and HTML kit. Optional actual Chromium PNG/PDF export is tested. |
| Launch checks | Bounded real GET checks for pages/robots/sitemap/noindex, plus an optional installed Lighthouse CLI producing actual desktop/mobile reports. No indexing or design-quality claim is inferred. |
| Continuity in Codex | Selectively routed references, executable tools and all 52 Studio entries/demos now survive standalone project installation while unrelated consumer files remain intact. |

The live studies are at `/examples/advanced-studio/`; `/studio/production/` creates a downloadable production specification. The Studio root now contains 52 genuine studies/tools in eight categories, with sampled source thumbnails and real preview routes.

## Use the tools

```text
node scripts/depth-media.mjs infer photo.png new-depth-output
node scripts/film-tracking.mjs track hero.mp4 new-track-output --quad 0.15,0.2,0.85,0.2,0.85,0.8,0.15,0.8
node scripts/cinematic-edit.mjs edit.json new-film-output
node scripts/production.mjs --help
node scripts/inbox.mjs --help
node scripts/launch-check.mjs https://actual-site.example new-launch-report --lighthouse
```

Depth inference needs the optional Transformers.js runtime and downloads pinned model weights on first use; images never leave the computer. Tracking needs Python/OpenCV/numpy and FFmpeg/FFprobe. Film assembly uses FFmpeg. Browser/PDF checks need Playwright and Chromium. Lighthouse and Nodemailer are optional, explicitly selected runtimes. No global software installation, model download, provider login or paid generation is part of the ordinary plugin install. Development smoke dependencies were installed only under ignored `artifacts/`.

See the focused guides for [tracking](../skills/superbrain/references/film-tracking.md), [depth](../skills/superbrain/references/depth-media.md), [effects](../skills/superbrain/references/inspiration-effects.md), [production](../skills/superbrain/references/production-workflow.md) and [inbox](../skills/superbrain/references/inbox-forms.md).

## Verification on 2026-11-03

- The complete **109-test suite**, **638** repository/skill/page/link validation checks and skill frontmatter validation passed.
- 11 Studio browser groups passed with all 52 entries, real previews and saved-idea→brief/download flows. Existing product regression passed **17 groups across 26 routes** at five viewport/preference combinations.
- Five new browser groups passed for the actual advanced studies at 1440, 390 and 320 px, presented-time forward/reverse tracking, rendered WebGL depth, pointer/static controls, timed rotation, reduced motion, disposal and no-JavaScript content.
- Real original tracked film: 100% coverage on the textured planar test; maximum known-corner error **1.82 source pixels**, mean **0.26 pixels**, deterministic repetition. Deliberate occlusion produced lost samples and later recovery. Browser projection was checked independently against known corners at two widths and forward/reverse positions. [Tracking evidence](evidence/production-rc7/tracking.json).
- Depth model inference executed on the original procedural source image, then repeated successfully from cached weights in offline mode with identical output hash. The map drives the actual demo; the page runs no inference model. [Depth provenance](../examples/advanced-studio/assets/depth-manifest.json).
- A separate consuming project successfully installed all tools/demos, served its own 52-entry catalog, compiled specialized guidance and downloaded a real production specification. An unrelated consumer file was preserved.
- The release forward-test wrote genuine PNG icons/share image and an actual browser-rendered PNG/PDF brand guide. Actual FFmpeg dissolve assembly encoded a 2.71-second film with a measured join at 1.25 seconds and real review frames.
- The launch checker ran Lighthouse **13.6.0** on that minimal local delivery fixture in desktop and mobile modes and recorded its returned reports. This validates the executable integration, not the design or performance of every SuperBrain-generated site. [Launch integration evidence](evidence/production-rc7/launch.json).
- The inbox HTTP tests exercise actual storage, duplicate suppression, validation failures, owner setup/login, CSRF/status/CSV, notification failure and restart persistence. No email was sent externally and no production inbox was deployed.

[Advanced browser evidence](evidence/production-rc7/advanced.json), [perspective study](evidence/production-rc7/surface-desktop.png), [mobile depth](evidence/production-rc7/depth-mobile.png), [standalone/release evidence](evidence/production-rc7/forward.json).

## Real project configuration and limits

OpenArt and Hostinger workflows are provider-neutral handoff/import/deploy guidance, as their upstream integrations also depend on available connectors. Neither connector is available in this session. No OpenArt job, hosting purchase or site publication is reported as executed. The actual consuming project supplies provider access, approved quote/media, deployment target and SMTP settings when needed. GitHub main and the private SuperBrain plugin are distinct from a deployed customer website.

The inbox implementation requires Node hosting and an HTTPS reverse proxy; PHP-only/static hosting cannot run it. This is a functional backend alternative, not a PHP-compatible port. The release deliberately rejects SuperBrain production state and inbox configuration inside the public input tree.

Tracking covers a textured plane, not arbitrary nonrigid objects, a complete 3D camera reconstruction or guaranteed featureless-footage tracking. Depth is inferred relative structure and may misread fine edges/reflections. Original synthetic/illustrative fixtures and Chrome emulation were used; physical-phone, Safari/Firefox, production SMTP and external-host deployment remain project-level verification. Automated checks and frame samples supplement full-playback, responsive and human design review; they do not establish universal premium design quality.
