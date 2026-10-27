# Optional original Anthropic skills

These are unmodified packages from the public [anthropics/skills](https://github.com/anthropics/skills) repository, pinned to commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44`, reviewed 2026-10-27:

- `skills/frontend-design`: the original design instructions and license.
- `skills/web-artifacts-builder`: original instructions, shell helpers and component archive.
- `skills/webapp-testing`: original instructions, Python server helper and examples.
- `skills/skill-creator`: original instructions, evaluator/reviewer helpers, agent prompts and schema reference.

Each package retains its own complete `LICENSE.txt`. The upstream `THIRD_PARTY_NOTICES.md` is also retained verbatim; it covers the wider upstream repository and does not mean that all the software it lists is bundled here. `manifest.json` records the selected upstream files and their SHA-256 hashes. This README and manifest are SuperBrain packaging metadata, outside the original skill directories.

Run `npm run skills:anthropic -- --verify` to verify every original file. No upstream helper, shell bootstrap, model evaluation or package installation runs during this check or normal SuperBrain installation.

The ordinary SuperBrain installer includes this directory under `.superbrain/vendor/anthropic`, so the originals remain available on demand. To additionally register the four originals as separate discoverable project skills:

```sh
node scripts/install.mjs /absolute/path/to/existing-project --anthropic
```

This copies them into `.agents/skills/<original-name>`. It preserves existing project instructions and refuses unmanaged or locally edited destinations before writing. Repeating the command is supported. A later installation without the flag retains previously managed skill files; it is not an uninstall command.

The packages keep their upstream instructions, including Claude-specific artifact and evaluation workflows. Executing those workflows may require Python packages, frontend dependencies or the Claude CLI named by the originals. SuperBrain's native scene runtime and Node tools remain available independently. Use original helpers deliberately in a suitable project; do not assume that copying an instruction file installs an AI model or every tool it describes. These are publicly released skills, with no claim of private/internal Claude capability or guaranteed equal model output.
