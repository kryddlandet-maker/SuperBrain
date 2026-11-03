# Cinematic media in SuperBrain

This optional family adds scroll-controlled local film, authored text cues tied to decoded media time, media preparation and film review. It complements the existing editable product scenes; ordinary briefs do not load it. Select `techniques: ["cinematic"]`, describe a scroll film in the brief, or use the studio's cinematic choice. Quick edits preserve the existing site.

## What is implemented

- `examples/shared/cinematic.js`: one native video seek owner, wide/portrait source selection, decoded-frame text cues, latest-request seeking, visibility suspension, reduced-motion still, explicit local opt-in, failure fallback and disposal. It does not autoplay or intercept scrolling.
- `examples/cinematic-media/`: an original four-second procedural light study with separate wide and portrait films, semantic content, normal navigation, a still control and a skip link. Its media is authored by `scripts/create-cinematic-demo.mjs`, with provenance beside the assets.
- `scripts/cinematic-media.mjs prepare`: produces a seek-friendly local H.264 film, poster and optional portrait crop without changing the source.
- `scripts/cinematic-media.mjs review`: produces a time-stamped HTML contact sheet and a local playback page with speed and nominal-frame stepping controls.
- Brief/design exports include `design-system/motion/cinematic-scene.json` and `cinematic-production.json`: authored scene beats, wide/portrait needs, selected media/dependencies, approvals and review requirements. These are implementation plans, not generated photographs or films.
- The standalone installer retains the runtime, demo, guide and media commands. Plugin exports also include them. Existing project files and modified installations retain the installer's conflict protection.

Read `skills/superbrain/references/cinematic-media.md` for the actual API and consuming-project workflow. The studio links to the runnable demo at `/examples/cinematic-media/`.

## Local commands

```sh
npm test
npm run validate
npm run studio
npm run test:cinematic
node scripts/cinematic-media.mjs prepare authorized-film.mp4 new-web-output --portrait --focus 0.5
node scripts/cinematic-media.mjs review authorized-film.mp4 new-review-output --frames 9
```

Only the preparation/review commands require an already installed FFmpeg. Set `FFMPEG` and optionally `FFPROBE` to existing executables when needed. Nothing installs itself or calls a generation/hosting account. Output directories must be new, protecting existing files. Open the generated review HTML locally. The frame step uses nominal fps; variable-rate or browser decoding can differ from an exact encoded-frame editor.

Browser checks use optional Playwright and an installed browser, like the existing project checks. `SUPERBRAIN_PLAYWRIGHT` points to the available package; `SUPERBRAIN_BROWSER_CHANNEL` or `SUPERBRAIN_BROWSER_EXECUTABLE` selects the host browser. No such dependency is required by the shipped runtime.

## Provenance and scope

The user identified [meticsmedia/10k-websites](https://github.com/meticsmedia/10k-websites). Its scroll-film, film typography, media review and production-plan concepts informed the capability selection. Source review was pinned to commit `b01a74dcd7bf1cfdc8448ed077f6d333fc329e40`. Its complete tree had no license file at inspection. No upstream code, instruction text, film or image is copied or vendored into SuperBrain; the implementation, guidance and procedural demo are written for this repository. Anthropics existing original packages are separate and remain unchanged.

Platform behavior is documented by [MDN's video-frame callback reference](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), [native currentTime seeking](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime), and [FFmpeg's documentation](https://ffmpeg.org/ffmpeg.html). The runtime uses presented `mediaTime` where supported and a `seeked` fallback. It does not claim to guarantee compositor timing on every browser.

Automatic optical/camera tracking, perspective-locked text and inferred depth maps are not implemented. Existing pointer-depth and scroll/product modules remain available. Neither a passing technical check nor a contact sheet establishes cinematic/design quality; watch complete playback, fast/reverse scroll and joins, then judge the result against the actual brief.

## Verification

Focused unit checks cover queued seeks, presented-time interpolation, late metadata during suspension, explicit motion, source switching, failure and cleanup. Media-tool tests cover probes, output protection and argument handling; a real FFmpeg smoke test also produced wide/portrait films, posters and review frames. The separate browser check exercises the demo, mobile selection, native skip navigation, still/error/no-JavaScript states and studio-to-design export.

Final local run on 2026-11-03: **86 Node tests**, **539 validation invariants**, **11 cinematic browser groups**, skill frontmatter validation and all **32 original Anthropic-file integrity checks** passed. Chrome was exercised at 1440×900, 390×844 and 320×667, including a live wide→portrait→wide change. Desktop and phone compositions were visually inspected. The real FFmpeg smoke and an independent installed-project forward-test also completed preparation and review. [Browser evidence](evidence/cinematic-media/verification.json), [desktop frame](evidence/cinematic-media/film-1440.png), [portrait frame](evidence/cinematic-media/film-390.png). Physical-phone and Safari behavior remain unverified.
