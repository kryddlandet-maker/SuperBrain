# Planar film tracking and perspective text

Use this family when text should stay attached to a visible wall, tabletop, sign or other textured plane in an authorized film. This estimates the projective motion of **one selected plane**. It is not a full 3D camera solve, object segmentation or a guarantee that featureless, blurred or heavily occluded footage can be tracked.

## Measure a local delivery film

Track the final constant-frame-rate delivery variant, after encoding, crop and trim. `scripts/cinematic-media.mjs prepare` can create that film. Changing its timing, crop or pixels requires tracking again. Wide and separately composed portrait films need separate tracks; never apply one source's geometry to a different film.

The tracker needs an existing Python environment with `opencv-python-headless` and `numpy`; `SUPERBRAIN_TRACKING_PYTHON` selects its executable. FFprobe or FFmpeg must also be available through PATH or `FFPROBE`/`FFMPEG`. The command does not install software, upload a film or overwrite an existing output directory.

```text
node scripts/film-tracking.mjs track hero-wide.mp4 new-wide-track --quad 0.15,0.2,0.85,0.2,0.85,0.8,0.15,0.8 --fps 12
```

Select the four corners in the first frame in top-left, top-right, bottom-right, bottom-left order. Coordinates are fractions of the **source film**, not the displayed crop. Without `--quad`, the whole frame is the reference and the dominant plane supplies a camera-motion approximation. A smaller selected plane prevents unrelated moving subjects from governing the solution.

The original implementation uses OpenCV ORB descriptors, ratio-filtered Hamming matches and RANSAC homography. Every sampled frame is compared with the reference frame, avoiding accumulated interframe drift and allowing recovery after an occlusion. Insufficient matches, weak inlier support, large reprojection errors or invalid projected corners yield a `lost` frame with `quad:null`, never fabricated coordinates. Inspect the selected surface at forward/reverse/jump positions; a high inlier fraction alone does not prove a successful creative result.

`track.json` contains:

```js
{
  schema:1, kind:'planar-film-track',
  source:{name,sha256,width,height,duration,fps},
  selection:{quad,referenceFrame:0},
  frames:[{time,at,quad,confidence,state,inliers,matches,errorPx}],
  algorithm:{name,opencv,referenceFeatures,sampleFps,timestampSource},
  summary:{samples,tracked,lost,coverage,reviewRequired:true}
}
```

`time` is seconds and `at` is time divided by source duration. A tracked `quad` contains four source-normalized pairs; corners can leave the visible source. `confidence` is the RANSAC inlier fraction, not a probability of correctness. `errorPx` is median inlier reprojection error in source pixels. Failed frames remain explicit in the file. The browser refuses to interpolate across a lost or low-confidence interval. Between measurements it interpolates corresponding corners; the short unsampled tail holds the last measurement. Use higher sampling frequency for rapid or nonlinear camera moves. Analysis is bounded to 12,000 samples.

## Attach a dedicated DOM layer

```js
import {initFilmSurface} from './film-surface.js';
import {initCinematicScene} from './cinematic.js';
const track=await fetch('./assets/hero-track.json').then(r=>r.json());
const surface=initFilmSurface(headlineInner,{
  track,container:videoStage,fit:'cover',position:[.5,.5],
  stillAt:0,layerWidth:520,layerHeight:280
});
const scene=initCinematicScene(section,{
  video,src:'./assets/hero-wide.mp4',poster:'./assets/poster.png',
  onFrame:snapshot=>surface.update(snapshot)
});
// On unmount: scene.dispose(); surface.dispose();
```

Use the same fit and fractional object position as the video. The positioned stage must be the video's containing box with no internal padding. The dedicated layer's untransformed width and height represent the rectangle mapped onto the measured quad; keep text padding inside it. `layerWidth` and `layerHeight` can be omitted when `offsetWidth`/`offsetHeight` are stable. Its children retain real semantic text, but place essential headings and actions in a separate, readable composition when the tracked layer can be cropped or lost.

The controller owns only the layer's transform, transform origin, position, top/left and visibility. It restores the previous inline properties and `data-film-surface` attribute on disposal. Use dedicated inner layers so another animation does not compete for the same transform. It has no animation loop or media clock: the cinematic controller supplies actual presented media progress, including reverse seeks, rather than requested scroll position. Resize recomputes the cover/contain crop and CSS `matrix3d` from the same measured source coordinates.

A static/error scene uses `stillAt`; the poster must represent that frame. Reduced motion keeps that composition until an explicit local motion choice reaches `update` with `motionEnabled:true`. A lost interval hides the tracked duplicate; retain the normal heading and action. Independent portrait sources require initializing the corresponding track when switching variants.

## Reproduce the technical evidence

With the optional local dependencies available:

```text
python scripts/create-film-tracking-demo.py artifacts/new-tracking-fixture
node scripts/check-film-tracking.mjs artifacts/new-tracking-fixture
node --test tests/film-tracking.test.mjs
```

The fixture is original procedural media with known moving corner geometry and a second film containing an occlusion. The check measures source-pixel corner error, deterministic repeat results, reported loss/recovery, actual presented-time projection in Chrome on desktop/mobile widths and still-first behavior. It writes its evidence to a new folder under `artifacts/`. This is scoped synthetic technical evidence, not validation of every customer's film.

Primary algorithm references: [OpenCV feature matching](https://docs.opencv.org/4.x/dc/dc3/tutorial_py_matcher.html) and [homography with RANSAC](https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html). No implementation code, instructions or media from 10k-websites are included.
