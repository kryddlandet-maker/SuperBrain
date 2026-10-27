# SuperBrain Codex plugins

The repository exposes `superbrain` and `frontend-design` through `.agents/plugins/marketplace.json`. Each package has a `.codex-plugin/plugin.json` manifest, a composer icon and a skill directory. Frontend Design includes the unmodified Anthropic `SKILL.md` and `LICENSE.txt`, pinned and verified against the vendored source. SuperBrain's entrypoint conditionally loads `references/plugin-setup.md`; setup is agent-driven, not an automatic platform hook.

See [the Swedish installation guide](CODEX.md) for account registration and local marketplace commands. A project skill (`$superbrain`) and an account plugin selected with `@` have different discovery scopes.

## Package and register

`npm run plugins:package` creates two fresh temporary source snapshots and a file manifest containing SHA-256 digests. It copies explicit repository source directories, excludes Git metadata, artifacts, dependencies and common credential filenames, and rejects symlinks. Do not pass the working repository root directly to `plugin/share/save`: Codex's archive builder recursively includes files without applying this repository's `.gitignore`.

`npm run plugins:register` uses the official Codex app-server JSON-RPC interface. It first lists created plugins, then creates missing ones using `discoverability: PRIVATE` and `shareTargets: []`. It installs by remote ID from `workspace-shared-with-me` and reads back installed, enabled and private owner-only state. Existing names must identify private SuperBrain packages with owner-only principals. Existing content changes only with `--update`; update requests omit access fields because the protocol only accepts those during creation. No public listing, workspace publication or recipient invitation is performed.

The native Codex CLI owns authentication. The helper never reads login files or accepts a token. Each completed save is recorded before installation, under ignored `artifacts/codex-plugins/registration.json`. A failed or timed-out mutation is not automatically repeated. A later run queries existing owned IDs before creating anything. Do not run registrations for the same account concurrently.

The RPC methods are experimental and depend on the installed Codex version and account policy. Update Codex CLI if the server reports unsupported methods. Keep the desktop and cloud clients on the same account/workspace. A verified account registration does not prove that every client has refreshed its @ menu or supports custom plugins.

## Validation and limits

- Seven focused Node tests cover standalone exported installation, original-file integrity, exclusion of local state, symlink rejection, owner-only creation, conflict handling, explicit updates, partial receipts, service failures and RPC lifecycle.
- Native Codex CLI 0.163.0 discovers both marketplace entries and reads their manifests and skills. No profile installation is required for this discovery check.
- The registration protocol was checked against the installed CLI's generated JSON schemas and the public `openai/codex` implementation at `19d730175f68d56aba23eae6c765b4e133299069` (`core-plugins/src/remote.rs`, `app-server/src/request_processors/plugins.rs` and protocol types).
- Account registration and desktop/cloud @ visibility remain unverified. The current cloud proxy blocks `https://chatgpt.com/backend-api/ps/plugins/workspace/created`; the helper stops at that initial read before uploading packages. A network configuration draft is not evidence that the running environment has applied the change.

Run `npm run test:plugins`, `npm test` and `npm run validate` to verify source behavior. No frontend rendering changed in this packaging update.
