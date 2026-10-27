# Original Anthropic skills in SuperBrain

Four complete public Anthropic skill packages are included, unmodified, under `vendor/anthropic/skills/`:

| Package | Included original material |
| --- | --- |
| frontend-design | SKILL.md and LICENSE.txt |
| web-artifacts-builder | SKILL.md, license, bootstrap and bundling shell helpers, component archive |
| webapp-testing | SKILL.md, license, Python server-lifecycle helper and Playwright examples |
| skill-creator | SKILL.md, license, agent prompts, schemas, packaging/evaluation/report scripts and review viewer |

The exact upstream commit is `dbd4588f9e1033efb41dad4bef2f7947c8993d44` from [anthropics/skills](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44). All 32 upstream files, including their original licenses and the upstream third-party notices, are recorded with byte counts and SHA-256 hashes in `vendor/anthropic/manifest.json`. The manifest and packaging README are separate SuperBrain files. Source instructions and helper code were not rewritten.

## Use them

List packages or verify their integrity:

```sh
npm run skills:anthropic
npm run skills:anthropic -- --verify
```

Every ordinary SuperBrain installation makes the originals available under `.superbrain/vendor/anthropic/skills/`. An explicit request can select a particular original; the default brief loads only SuperBrain guidance. The optional chapter explains how to find the selected package without concatenating all four into every prompt.

To additionally install them as separately discoverable project skills alongside SuperBrain:

```sh
node scripts/install.mjs /absolute/path/to/existing-project --anthropic
```

This puts the originals in `.agents/skills/frontend-design`, `.agents/skills/web-artifacts-builder`, `.agents/skills/webapp-testing` and `.agents/skills/skill-creator`. It preserves the project's AGENTS.md content and refuses existing unmanaged or locally edited files before mutation. Repeated installation is supported. Running without the flag later retains previously installed managed files; it does not uninstall them. The source repository uses the vendored resources directly; do not install SuperBrain into its own checkout.

## Verification

- Every upstream file matches the manifest; a modified-original fixture is rejected.
- A real temporary consuming project received the full bundle, verified it offline using the installed CLI, and activated all four native skill folders. Original SKILL.md files and the binary component archive remained byte-identical; executable shell helper modes were retained.
- Reinstallation, unmanaged destination conflicts and local-edit protection were tested. Original text was not added to every generated brief.
- Anthropic's unmodified `quick_validate.py` accepted all four original skill entrypoints using the available host Python and PyYAML.
- The original `with_server.py` started the actual Studio on an isolated temporary port, ran successful page and skill-search requests, propagated the probe's result and stopped its server. The tested POSIX server command uses `exec node scripts/serve.mjs` so the helper owns the server process.
- Both original shell helpers passed `bash -n`. Their dependency-installing/bootstrap and artifact-build paths were not executed.

Detailed helper outcomes are recorded in `docs/evidence/anthropic/checks.json`. Normal repository validation verifies the upstream bundle as well as SuperBrain's own checks.

## Scope

These are the four publicly released original packages selected by the user. Their instructions retain references to Claude artifacts, the Claude CLI and upstream workflows. Copying them does not install an AI model or automatically provide those services. Python Playwright examples require Python Playwright and an appropriate browser; model-evaluation helpers require the tooling and access named by the originals. SuperBrain's own Node and motion tools remain usable independently.

Claude model evaluation/description-optimization, comparative model builds, frontend bootstrap installations and the Python Playwright examples were not run. Package integrity, local helper behavior and opt-in installation are verified separately from model quality. There is no claim of private Claude skills or guaranteed equivalent design output. Changes are local until deliberately committed/published; previously installed customer projects are not updated automatically.
