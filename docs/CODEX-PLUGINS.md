# SuperBrain Codex plugins

The repository exposes `superbrain` and `frontend-design` through `.agents/plugins/marketplace.json`. Each package has a `.codex-plugin/plugin.json` manifest, a composer icon and a skill directory. Frontend Design includes the unmodified Anthropic `SKILL.md` and `LICENSE.txt`, pinned and verified against the vendored source. SuperBrain's entrypoint conditionally loads `references/plugin-setup.md`; setup is agent-driven, not an automatic platform hook.

See [the Swedish installation guide](CODEX.md) for account registration and local marketplace commands. A project skill (`$superbrain`) and an account plugin selected with `@` have different discovery scopes.

## Package and register

`npm run plugins:package` creates two fresh temporary source snapshots and a file manifest containing SHA-256 digests. It copies explicit repository source directories, excludes Git metadata, artifacts, dependencies and common credential filenames, and rejects symlinks. Each export contains exactly one plugin root: the SuperBrain export excludes the checkout's marketplace metadata and nested Frontend Design plugin, which is exported separately. Original Anthropic resources remain under `vendor/anthropic`. Do not pass the working repository root directly to `plugin/share/save`: Codex's archive builder recursively includes files without applying this repository's `.gitignore`.

`npm run plugins:register` uses the official Codex app-server JSON-RPC interface. It lists both personal plugins (`created-by-me-remote`, with a fresh fetch) and created workspace shares before creating missing ones using `discoverability: PRIVATE` and `shareTargets: []`. Personal plugins are private `USER`-scope packages; Codex omits their `shareContext` and the service replaces `developerName` with the account's name. Personal package identity is checked using the canonical plugin ID, remote source, display name and this repository's website URL. Workspace shares still require private, owner-only principals. Incomplete catalogs and conflicting identities stop before mutation.

Installation uses each plugin's canonical remote marketplace. The helper reads `plugin/installed` (the inventory used by mention surfaces), plugin details and enabled skills before reporting success. Existing content changes only with `--update`; update requests omit access fields because the protocol only accepts those during creation. No public listing, workspace publication or recipient invitation is performed.

The native Codex CLI owns authentication. The helper never reads login files or accepts a token. Each completed save is recorded before installation, under ignored `artifacts/codex-plugins/registration.json`. A failed or timed-out mutation is not automatically repeated. A later run queries existing owned IDs before creating anything. Do not run registrations for the same account concurrently.

The RPC methods are experimental and depend on the installed Codex version and account policy. Update Codex CLI if the server reports unsupported methods. Keep the desktop and cloud clients on the same account/workspace. A verified account registration does not prove that every client has refreshed its @ menu or supports custom plugins.

## Validation and limits

- Ten focused Node tests cover required upload metadata, one plugin root per export, standalone installation, original-file integrity, exclusion of local state, symlink/junction rejection, personal and workspace ownership, retries without duplicates, explicit updates, partial receipts, incomplete catalogs, service failures and RPC lifecycle. Windows tests use directory junctions and do not assert POSIX executable bits on Windows.
- Required upload metadata follows [OpenAI's package error reference](https://developers.openai.com/plugins/deploy/submission-errors): both manifests include an author, a supported category and string-list capabilities. The local validator rejects missing or malformed required listing metadata before export or upload.
- On 2026-10-28, Codex CLI 0.164.0 with the existing ChatGPT login confirmed both personal plugins as installed and enabled, with enabled skills and `USER`-scope ownership. A subsequent registration reused the same two remote IDs. The cached Frontend Design skill and license match the vendored originals byte for byte; all 32 vendored original files pass their integrity checks.
- Protocol behavior was checked against the installed CLI's generated types and the official source for [USER-scope marketplace mapping](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/remote.rs) and [workspace-only share listing](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/remote/share.rs). Account verification does not establish a visual check of every client's @ menu.

Run `npm run test:plugins`, `npm test` and `npm run validate` to verify source behavior. No frontend rendering changed in this packaging update.
