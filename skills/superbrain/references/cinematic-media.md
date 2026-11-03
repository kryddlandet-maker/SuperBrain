# Cinematic media as an optional scene

Use when the brief asks for a scrollfilm, scrollvideo or cinematic hero. Choose it because the footage explains a product, place or transformation. Keep ordinary product cards on the lighter `scenes` family and preserve existing interactions during a quick edit. Neither a film hero nor a particular media provider is a SuperBrain default.

## Plan the film and the page together

A brief can select `techniques: ["cinematic"]`. The design generator records `cinematicMotion` in project memory and exports `design-system/motion/cinematic-scene.json` and `cinematic-production.json`. These are implementation proposals, with missing assets and unauthorised spending clearly unset. They do not generate a film or modify the application.

Give the film a legible opening, one consequential change, a result and a composed next action. Adapt those beats to the actual story; the planner's normalized cue positions are editable starting points. Author copy against identifiable events in the selected delivery film and leave reading holds. Keep the primary action reachable without completing the film: a normal skip link should reach the following section.

Record the selected source version, permitted use, duration and the wide/portrait compositions. Choose a reviewed crop, a separately composed portrait film or an intentional still after inspecting the whole journey on a narrow screen. A good first frame cannot establish that the subject survives every later crop.

The production contract connects the selected film to its delivery variants, posters, typography cues and review evidence. When a source changes, recheck those dependencies and identify which files are current. Keep real subject traits, geometry, materials and claims consistent unless a change is intentional. Treat a reference image's identity, framing and detail roles separately.

Use existing authorized media when it fits. If original generation is requested, record the actual provider/model/settings, quote, approved allowance, correction reserve and actual spend. An available balance is not a budget approval. SuperBrain does not choose a paid provider or purchase media through this module.

## Prepare authorized local media

The optional command uses a separately installed FFmpeg; `FFMPEG` and `FFPROBE` can select existing executable paths. It does not install packages or contact generation services. Commands require a new output folder, so existing media and local work are preserved.

```sh
node scripts/cinematic-media.mjs prepare /absolute/path/source.mp4 /absolute/path/new-delivery --portrait --focus 0.5 --name hero
node scripts/cinematic-media.mjs review /absolute/path/new-delivery/hero.mp4 /absolute/path/new-review --frames 9
```

Preparation writes the delivery MP4 and poster PNG, an optional portrait pair, and a manifest. Review writes timestamped samples, `contact-sheet.html` and a `review.html` film player with playback-speed and frame-step controls. In a consuming project the installed command is `node .superbrain/scripts/cinematic-media.mjs` with the same arguments.

Choose actual delivery dimensions and file weight from the target devices and measured seeking behavior. Keep source masters outside the deployed site's asset folder. Re-encoding changes frame timing or composition; derive final text cues from the file that the page actually plays.

## Integrate one media clock

Use `examples/shared/cinematic.js` (`.superbrain/examples/shared/cinematic.js` after installation), exporting `initCinematicScene`. Start from the original `/examples/cinematic-media/` study and adapt its composition, source paths and styles to the project. Keep useful HTML, heading, action and poster visible before JavaScript. Leave the video's `src` and child `<source>` unset in HTML so still-first rendering can avoid the download.

```js
import {initCinematicScene} from './cinematic.js';
const scene=initCinematicScene(section,{
  video,src:'./assets/hero.mp4',portraitSrc:'./assets/hero-portrait.mp4',
  poster:'./assets/hero-poster.png',portraitPoster:'./assets/hero-portrait-poster.png',
  stillAt:1,
  motionEnabled:plan.playback==='static-first'?false:null,
  layers:[{element:headlineInner,keyframes:[
    {at:0,x:0,y:0,scale:1,opacity:1},
    {at:.45,x:0,y:-24,scale:1.04,opacity:1},
    {at:1,x:0,y:-24,scale:1.04,opacity:1}
  ]}]
});
// A clearly labelled local choice can call scene.setMotionEnabled(true/false).
// Inspect scene.getState() or onFrame for mediaTime and mediaProgress.
// On unmount: scene.dispose().
```

Apply the dedicated layer's `--cinematic-x`, `--cinematic-y`, `--cinematic-rotate`, `--cinematic-scale` and `--cinematic-opacity` variables in project CSS. Translation and rotation values are numbers; multiply by `1px` and `1deg` in `calc()`. Match `stillAt` to the poster's normalized source position; preparation selects a final-frame poster, so the example uses `1`. Use `motionEnabled:false` at initialization for a quiet scene before any source can load; `null` follows system preference, and `true` is explicit local opt-in. A newly enabled reduced-motion preference revokes that opt-in.

The scene maps normal scroll to a paused video's position and applies authored text-layer keyframes using the presented media time. Text should follow the displayed frame while the decoder catches up, rather than claiming to be synchronized because both use scroll progress. Forward, reverse and arbitrary seeking must arrive at the same media-time state.

Give each animated property one owner. Keep inner-layer transforms separate from controls and the pointer hit target. Supply intentional wide and portrait layouts; changing viewport must not fetch both full films unnecessarily. The controller's cleanup belongs in framework unmount and page lifecycle handling. Confirm the returned state and handle failed media with the composed still.

This module interpolates authored cues. It does not measure camera movement, track text onto surfaces, infer depth maps or invent missing photographic footage. Surface tracking and image-based depth need separate licensed tooling and their own validation.

## Review motion and fallback separately

Watch the complete film, including joins, at normal speed; use slow motion and frame steps to diagnose a defect. Contact sheets make missing beats and crop problems easier to inspect, but cannot prove smooth playback, stable frame synchronization or an acceptable join velocity.

In the actual site, check desktop and portrait layouts by scrolling forward, backward and jumping. Record the delivery version, decoded time, expected text state and observed result at representative cues. Exercise the skip link, primary action and keyboard navigation. Inspect small-screen headline line breaks and the full page after the film, not just a hero crop.

Reduced motion starts with the still and no unnecessary film request. A clearly labelled local choice can enable the scene without changing system preferences. Test live preference changes, offscreen and hidden-document suspension, unavailable media, no JavaScript and disposal/reinitialization. Report unit tests, encoded-media checks, browser observations and creative judgment as different evidence.
