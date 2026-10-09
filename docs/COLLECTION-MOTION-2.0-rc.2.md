# Collection motion control — 2.0.0-rc.2

The collection previously exposed only “Prova stilla version”. Its Creative/Atmosphere modules always honored the system preference, so a user with reduced motion had no page-local way to inspect the effects and the light-play control was hidden.

A visible native button now switches between “Aktivera rörelse” and “Pausa rörelse”. It explicitly enables motion on this page, resets stationary preview, reveals supported light playback and starts the bounded four-second light study. Product transitions, arrival effects and desktop pointer depth share that override. Product/filter/color choices and native scrolling remain user-controlled. Pausing clears active animation and tracking; useful actions remain available.

Reduced motion remains the initial default. Stationary preview has precedence. CSS and JavaScript share the same state. Unsupported WebGL leaves the static light fallback and no unusable play button. Without JavaScript, controls stay hidden and content remains visible. No OS/browser preference is changed and no endless playback is introduced.

## Actual verification

- npm test: 39/39 pass; npm run validate: 510 pass.
- npm run test:collection: 20 groups pass at 1440/390/320 with both motion preferences; no runtime errors. Tests inspect real changing GPU screenshots, product animations, pointer depth, automatic playback completion, pause cleanup, CSS transitions, input state, live preference change, history, emulated touch and no-JavaScript.
- npm run test:product: 17 groups pass over 22 document routes / 110 viewport-preference combinations; existing product, image, gallery, rail, navigation and other demo flows remain working.
- Live Codex in-app browser at http://127.0.0.1:4325/examples/collection/: default stationary state observed; activate revealed the light-play button and active status; pause returned to stationary state; reactivation succeeded. Screenshot: evidence/collection-motion/in-app-active.png.
- This focused live browser check does not close the earlier whole-product Remote Desktop Commander interruption or certify physical mobile, other browser engines or full accessibility.

Changed runtime: examples/collection/index.html, collection.js, collection.css; optional motionPreview support in shared/creative.js and atmosphere.js. Other shared interaction modules and consuming portfolio app code are unaffected. The optional flag preserves previous behavior when omitted.

Evidence: evidence/collection-motion/browser.json and evidence/product-browser.json. Source branch: codex/superbrain-2-engine; PR #2. Published SHA and clean pinned installation are recorded in the consuming project's .ai/project/SUPERBRAIN_INSTALL.md. No automatic main merge.
