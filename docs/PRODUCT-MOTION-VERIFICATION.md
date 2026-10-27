# Product-motion verification — 2026-10-27

The current working checkout passes 52 Node tool/runtime tests, 526 repository validation checks and 17 browser check groups. The browser report is [evidence/product-motion/browser.json](evidence/product-motion/browser.json). All 17 groups passed with zero page/console errors. These results establish the local implementation, not comparative model design quality.

## Executed

```sh
npm test
npm run validate
SUPERBRAIN_BROWSER_EXECUTABLE=/usr/bin/chromium npm run test:scenes -- docs/evidence/product-motion
```

Browser: Chromium 154.0.8037.57 on Linux, via host-provided Playwright 1.62.1. No mandatory runtime or npm dependency was added. The four optional original Anthropic skill packages were separately vendored after the user requested them. The reusable browser command defaults to ignored `artifacts/product-motion`; this run deliberately recorded the new evidence directory. Existing historical evidence files were not overwritten.

## What was checked

- Native WAAPI tracks played complete cycles for all three scenes at 1440px and 390px. Intermediate transforms changed, the next iteration returned to its starting pose, track timing stayed synchronized, and manual pause froze actual animation times.
- A mobile scene stopped offscreen, resumed on return, and retained a manual pause after scrolling away/back. Native Space activation resumed it.
- 320px, 768px and 1024px layouts had no horizontal page overflow, maintained reduced-motion stills, and exposed playback controls with at least 44px height.
- Reduced motion started stationary. An explicit local play action worked; delivered native media-query change events restored the still when the preference changed.
- Synthetic pagehide/pageshow events cancelled every owned animation and restored exactly 13 tracks (3 workflow, 6 orbit, 4 editor). Real link/back navigation also restored one set, without duplicate tracks. These two forms of evidence are labelled separately in the runner.
- No-JavaScript content remained composed and navigable with honestly disabled playback. Removing WAAPI preserved the same still fallback without runtime errors.
- The existing Studio and design-system builder both exported the new technique selection. The builder produced `product-scene.json`; the downloaded brief retained `techniques: ["scenes"]`.
- Unit tests covered document-hidden suspension, live preferences, manual intent, disposal, unavailable/partially failing animation support, selective short-brief routing and scoped edits. A temporary consuming project received a working planner, the guide, the shared runtime and all three scene recipe sources through the real installer.

## Rendered review

The desktop composition and compact/mobile captures were inspected directly. The three scenes use distinct materials: a light planner on a dark field, original dimensional capability icons, and a dark editor with original vector landscape art. No reference-site screenshots, Apple icon assets, product footage or cloned website source were imported. The compact header was adjusted to keep navigation clear at 320px. Scene playback labels and the engine's new checkbox were inspected at mobile width.

Screenshots record intentionally sampled result frames, while the browser checks observe autonomous playback separately:

- [Desktop](evidence/product-motion/desktop.png)
- [390px mobile](evidence/product-motion/mobile.png)
- [320px still](evidence/product-motion/compact-still.png)
- [Workflow result](evidence/product-motion/workflow-result.png), [icon composition](evidence/product-motion/orbit-result.png), [editor result](evidence/product-motion/timeline-result.png)

The previously failing entrypoint-size invariant now passes: the entrypoint was shortened to 6,422 normalized characters, below its unchanged 6,500-character limit, while detailed guidance remains in conditional references. Existing button, pointer, collection, scroll and engine tool tests all passed within npm test. Their unrelated full browser suites were not rerun.

## Limits and next experiment

Verified HTTPS source inspection and native Chromium inspection of meetpave.com, borel.one and huly.io succeeded. Six representative site/viewport observations cover desktop 1440px and mobile 390px with touch emulation. Pave videos advanced, paused offscreen and resumed; concurrency was three on desktop and one on mobile. Borel’s 19 CSS float layers moved and stopped under live reduced motion. Huly rendered changing Rive frames on both viewports; mobile captures use the visible clipped card rather than the wider inner canvas. Read `evidence/product-motion/reference-browser.json` and PRODUCT-MOTION-RESEARCH.md for exact observations and limits.

The user explicitly authorized the certificate prerequisite after automatic review initially rejected it. The platform proxy CA was already present in Chromium’s NSS store; browser execution with access to that store succeeded with TLS verification enabled. No certificate-error bypass was used. Remote Desktop Commander remained unavailable. Borel’s unrelated auth-status request and Huly analytics were blocked; the inspected public feature scenes still loaded and moved.

Native OS background-tab switching, physical phones, Firefox/WebKit, actual Rive/Lottie/video integrations, full WCAG conformance and performance with customer media were not certified. Hidden-document behavior is covered by unit tests. The benchmark prompts in `benchmarks/product-motion-cases.json` define a controlled follow-up; no Claude-versus-Codex or old-versus-new generation trials have run. There is no claim of equal or superior model capability.

The original Anthropic packages, byte-integrity checks, optional native installation and helper verification are documented in `docs/ANTHROPIC-SKILLS.md`. All four original skill entrypoints passed their upstream validator; the upstream server helper ran functional requests and cleanup. Model-evaluation/bootstrap/browser-example paths remain explicitly unrun.

Update consuming projects by pulling the latest source and rerunning the installer. Repository updates do not update previously installed customer projects automatically. Cloud environment publication is a separate action.
