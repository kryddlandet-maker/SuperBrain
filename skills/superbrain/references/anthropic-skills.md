# Optional original Anthropic skills

Read when the user explicitly wants the public Claude/Anthropic skill packages or names frontend-design, web-artifacts-builder, webapp-testing or skill-creator. These are selectable resources, not mandatory chapters for every website. SuperBrain's own design guidance, verified project decisions and user requirements continue to apply.

The four complete, unmodified upstream packages are under `vendor/anthropic/skills/` in this repository and `.superbrain/vendor/anthropic/skills/` in a consuming project. Each has its original SKILL.md, license and any scripts/assets/references. `vendor/anthropic/manifest.json` records the exact source commit and file hashes. Inspect only the selected original's entrypoint and relevant resources; do not concatenate all four into a brief.

| Original package | Select it for | Tool compatibility |
| --- | --- | --- |
| frontend-design | Original subject-specific typography, composition and critique instructions | Text guidance; reconcile with the user's chosen direction |
| web-artifacts-builder | Original React artifact scaffolding and single-HTML bundling | Shell/npm dependencies; a Claude artifact is a different delivery surface from a multi-page customer app |
| webapp-testing | Original Python Playwright examples and server-lifecycle helper | Requires Python and, for its browser examples, Python Playwright plus a compatible browser |
| skill-creator | Original skill-evaluation, packaging and review workflow | Its model evaluation helpers call Claude tooling; a copied skill does not install the Claude CLI |

List or verify originals from the source checkout:

```sh
npm run skills:anthropic
npm run skills:anthropic -- --verify
```

In an installed consuming project, use `node .superbrain/scripts/anthropic.mjs --verify`. For separate native project-skill discovery, the user can select the optional installation:

```sh
node scripts/install.mjs /existing/project --anthropic
```

This registers the originals under `.agents/skills/<name>` alongside SuperBrain. Do not run this installer against the SuperBrain source itself. Preserve local edits and read the conflict error rather than force-overwriting an existing skill. Refer to `vendor/anthropic/README.md` for attribution and packaging behavior.

When choosing an original, report which package is being used and adapt only the surrounding workflow. The vendored originals stay unchanged. Capture required project-specific dependency setup separately and verify executed helpers. Research, original package availability, local helper tests and comparative model quality are distinct outcomes.
