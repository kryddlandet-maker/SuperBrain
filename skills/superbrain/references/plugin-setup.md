---
name: superbrain-setup
description: Prepare SuperBrain resources in the current Codex project when the user adds the SuperBrain plugin to a conversation. Reuse installed resources or the plugin checkout and preserve existing project files.
---

# Prepare SuperBrain for this conversation

The user selected the SuperBrain plugin. Make its guidance and reusable tools available in the current project, then continue the user's actual task. Each cloud task is already isolated; use its existing checkout and do not create a Git worktree unless requested.

1. Establish the actual working directory and read its AGENTS.md. If no repository or execution environment is available, use the plugin's design guidance and describe executable setup as unrun. Never claim files were installed when only instructions were read.
2. Check `.agents/skills/superbrain/SKILL.md` and `.superbrain/scripts/design.mjs` in the current project. If installed, reuse them and verify relevant commands. Do not reinstall on every turn.
3. If the current checkout is the SuperBrain source itself, use its existing `skills/superbrain/SKILL.md`, scripts and examples directly. The installer deliberately rejects installing into its own source checkout.
4. Otherwise locate the plugin's own source/resources from the provided plugin root or skill resource metadata. Its root contains `package.json`, `scripts/install.mjs`, `skills/superbrain`, `lib`, `data`, `examples` and `vendor/anthropic`. Use those retained files when available. For this guide's local filesystem path, the root is three directories above its containing references directory; confirm the actual files before use.
5. If executable plugin files are unavailable in a cloud runtime, check for a usable existing SuperBrain checkout outside the consuming project. If needed, clone `https://github.com/kryddlandet-maker/SuperBrain.git` into a task-owned tools/cache directory outside that project and record its commit. Keep the current project checkout in place. Use existing HTTPS Git authentication; no API key is needed for the public instructions/tools.
6. From the confirmed SuperBrain source, run `node scripts/install.mjs /absolute/path/to/current-project` using the actual project path. This default installs SuperBrain and retains optional original Anthropic resources; separate native registration of all four originals requires an explicit `--anthropic` choice. Require Node.js >=22 for executable tools. Preserve original-file checks and TLS verification.
7. The installer preserves AGENTS.md content and refuses unmanaged or locally edited destination files before mutation. Inspect and reconcile such conflicts without force-overwriting user work. When the project path, tools or access remain unavailable, complete independent design work and report the precise setup limitation.
8. Verify `.agents/skills/superbrain/SKILL.md` and the installed tool paths. For source-backed resources run `node .superbrain/scripts/anthropic.mjs --verify` from the consuming project to check its retained originals. Then read the main SuperBrain skill and only the relevant chapters for the user's task.

Selecting a plugin supplies its resources to this conversation. An account-level plugin catalog or another machine's installation is a separate platform action; filesystem setup alone does not prove that a plugin appears in every desktop/cloud @ menu. Report those states separately.
