# Animated product demonstrations

Use for living feature cards, bento motion, animated product mockups, icon choreography and miniature UI stories. These scenes play a legible product task inside a bounded frame while the surrounding page stays readable. They differ from an entrance reveal, hover decoration or scroll-driven progress. They can run automatically when visible without waiting for a hover or a click.

## Turn a short request into a scene

If the user says “rörliga rutor”, “aktiva animationer”, “levande produktkort” or “product demo”, recognize this family. A compiled brief accepts `techniques: ["scenes"]` or infers the family from those descriptions. `scripts/design.mjs` exports `design-system/motion/product-scene.json`: an implementation proposal with a pattern, stable anchors, timing beats, playback and acceptance checks. It does not generate a finished product or run an AI.

Use the product's actual input → action → consequence. For a planner, a task changes column and gains its assigned state; for an editor, source clips become an edited sequence. Choose one useful action per scene. Write a four-beat score before coding: establish the subject, perform the action, show its consequence, hold and reset. A 6–10 second cycle is a starting point, with meaningful holds rather than continuous drift. Stagger related actions on one timebase. Seam endpoints must match or reset while the affected layer is hidden.

Keep the frame, headings, reading order and primary action stationary. Animate dedicated inner layers. Preserve the product's visual vocabulary and the page's material; a phone, editor and kanban board need different compositions. Scene content must remain legible at the actual card width. On mobile reduce visible tracks and secondary detail before shrinking all the text. Use a container-relative layout or explicit compact composition.

## Choose the medium from the visual

| Desired result | Suitable implementation | Required input and limitation |
| --- | --- | --- |
| Editable task cards, cursor, clips, counters | DOM/SVG + CSS or WAAPI | Original interface layers and a beat sheet; no video is needed |
| React layout changes with existing state | Existing Motion runtime | Stable keys and one owner of each animated property |
| Overlapping authored or scroll-linked sequences | Existing GSAP timeline | One clock, responsive setup and cleanup |
| Photographic footage, rendered device/material, complex baked lighting | Muted inline video with poster | Authorized media, suitable crop and encodes; code cannot recreate photographic footage by adding gradients |
| Designer-authored vector sequence | Lottie | A real licensed animation asset and its compatible renderer |
| Interactive illustrated state machine | Rive | An authored .riv file and defined inputs; its runtime does not invent the illustration |
| Actual spatial interaction | Three.js/WebGL | Appropriate models/shaders and a measured GPU/asset budget |

Do not identify a reference's implementation from a screenshot alone. Inspect its rendered DOM, media URLs, currentTime/play state and animated styles. A polished “UI animation” may be a pre-rendered video rather than live application state. Record what was observed separately from your proposed recreation. Reference imagery and source code are analysis material; produce original graphics or use authorized assets.

## What the requested references actually use

Verified public source inspection found three different implementations: Borel's native-feature card uses individually arranged DOM/icon layers with a six-second CSS float and staggered delays; Pave's feature cards are muted inline MP4 loops over posters with a visibility/concurrency governor; Huly's Team Planner uses an authored Rive artboard and state machine. Huly also mixes Rive and video elsewhere. These findings are scoped to those components, not every effect on each site. Desktop/mobile browser inspection confirmed the corresponding native motion; Borel’s shadows and icon artwork are raster assets while CSS supplies the float. Source details and observation scope are in `docs/PRODUCT-MOTION-RESEARCH.md`.

For a Huly-like Rive scene, author or obtain an authorized .riv asset, identify the artboard, state-machine and input names, connect actual user/visibility events, resize the drawing surface for its container, and keep the poster until loading succeeds. Trigger names from a reference's private asset are not a reusable API for a new illustration. In React, mount an existing Rive adapter and clean it up on unmount; do not combine it with an independent DOM ticker. For code-generated original UI scenes, the DOM runtime below is a smaller, editable alternative. Authored Rive/video integration remains a separate project-specific step, not a capability proven by the local DOM demos.

## Reuse the local runtime

See `/examples/product-motion/` for three original scenes: workflow transfer, capability icons and editing timeline. Copy the relevant HTML/CSS composition and only its tracks; do not transplant the whole laboratory as a customer page. The installer includes the runtime under `.superbrain/examples/shared/` and all three recipe source files under `.superbrain/examples/product-motion/`. Adapt asset/import and navigation paths to the consuming project.

```js
import {initProductScene} from './product-motion.js';
const scene=initProductScene(container,[{
  element:innerTask,
  keyframes:[
    {transform:'translateX(0)',offset:0},
    {transform:'translateX(0)',offset:.18},
    {transform:'translateX(100%)',offset:.56},
    {transform:'translateX(100%)',opacity:0,offset:.9},
    {transform:'translateX(0)',opacity:0,offset:.96},
    {transform:'translateX(0)',opacity:1,offset:1}
  ]
}],{button:pauseButton,duration:7200});
// On unmount / before reinitialization:
scene.dispose();
```

The runtime synchronizes WAAPI tracks, pauses offscreen/hidden, retains a manual pause, handles live reduced-motion changes, offers explicit local playback, and cancels owned animations/listeners/observers on disposal. It has no JavaScript render loop. Keep a useful HTML/CSS still when JS or WAAPI is unavailable. The demo handles pagehide/pageshow restoration. Framework adapters call init after mount and dispose before unmount; do not also attach a second animation engine to these elements.

For video, use a poster, muted + playsinline playback, visibility gating, reduced-motion still and rejected-play handling. Restore a usable poster if decoding/loading fails. Select dimensions, duration and bitrate from the actual delivery budget; lazy-load lower-page media and verify with real encodes. Do not download several full-resolution videos just to display small cards. If using requestVideoFrameCallback or a GPU loop, that clock needs separate ownership and cancellation.

## Playback and proof

Normal visible-auto scenes should visibly play on arrival. Do not silently replace requested active animation with hover-only feedback. Quiet briefs choose manual playback. Reduced motion starts from a meaningful still; a clearly labelled local play control can opt into that scene without changing a system preference. Preserve pause/stop controls for qualifying automatic motion (WCAG 2.2.2); automatically updating information has no five-second exemption. A short loop repeated forever still lasts longer than five seconds. Do not announce each animation frame to screen readers; explain the demonstration once in ordinary text.

Observe initial, middle, result and reset frames. Verify that the pixels move, that pause freezes them, and that resume continues. Test offscreen/hidden suspension, manual pause after returning, live preferences, keyboard, touch, no JS and failed media. Watch a complete loop at desktop and 320–390px; inspect clipping and actual text sizes. Unit tests establish lifecycle behavior, browser tests establish rendered behavior, and controlled model trials establish whether the guidance improves one-prompt results. Those are separate claims.

Read [motion-lifecycle.md](motion-lifecycle.md) for engine cleanup and [assets-performance.md](assets-performance.md) for heavier media. Source review, rationale, recorded live-site observations and public Claude-skill comparison are recorded in `docs/PRODUCT-MOTION-RESEARCH.md`.
