# Inferred image depth

Use image-based depth when a modest spatial response serves an actual photograph or illustration. This is relative depth displacement, not metric depth or full 3D reconstruction. Supplied images and their inferred map must stay aligned; crop both identically.

`scripts/depth-media.mjs infer <local-image> <new-output-folder>` runs Depth Anything V2 Small locally through Transformers.js. It writes the unchanged source image, `depth.png` and a manifest with source/output hashes and the pinned model revision. The Apache-2.0 model is downloaded on first use, never bundled into the plugin. No customer image is uploaded.

For an available Node runtime, install the optional dependency into an isolated tools folder, then set `SUPERBRAIN_TRANSFORMERS` to that package folder:

```text
npm install --prefix artifacts/depth-runtime --no-package-lock @huggingface/transformers@3.8.1
```

Set `SUPERBRAIN_MODEL_CACHE` or pass `--cache` for a chosen model cache. A later `--offline` run uses cached weights and refuses remote fetching. Existing output folders and symlink destinations are refused. Normal website builds do not install or run the model.

Import `initDepthScene` from `examples/shared/depth-scene.js` (under `.superbrain/` in a consuming project). Supply a container with `[data-depth-photo]`, a hidden `[data-depth-map]` image, and an initially hidden canvas. Make the photo useful static content, give the canvas `aria-hidden="true"`, and position it over the photo with CSS. The map is not visitor-facing content. Both assets must be same-origin or use valid CORS.

The runtime uses a small WebGL displacement shader, bounded pointer/scroll offsets, demand-based frames, capped pixel resolution, offscreen/hidden suspension and disposal. Reduced motion starts with the original image; `setEnabled(true/false)` is an explicit local choice and a new reduced-motion preference revokes it. Unsupported or lost graphics retain the image. On unmount call `dispose()`.

Inspect foreground edges and mobile cropping at the actual requested strength. Inference can misread reflections, transparent objects and fine edges; reduce strength or choose the static image when the result is distracting. A generated map alone does not establish acceptable visual quality.

Sources: [model and Apache-2.0 license](https://huggingface.co/onnx-community/depth-anything-v2-small/tree/4472b7362082ad9968fee890ca0f1e5aca36b93d), [Transformers.js pipeline](https://huggingface.co/docs/transformers.js/v3.8.1/en/pipelines), [local/cache configuration](https://huggingface.co/docs/transformers.js/v3.8.1/en/custom_usage).
