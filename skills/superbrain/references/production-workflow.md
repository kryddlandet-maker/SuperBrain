# Media production and site delivery

Use this workflow when a project needs commissioned media, a controlled budget, repeated reviews or a client handoff. Keep normal small builds simple. Existing authorized assets can be used without commissioning new media. No mandatory provider, production tier or film hero applies to every site.

## Persistent production state

`scripts/production.mjs` manages a private production directory. `--help` lists the actual commands. Paths in JSON inputs are relative to the working directory. The directory contains source versions, receipts and review evidence and belongs outside the public site and deployment archive.

Create a specification with `name`, `goal`, `tier` (`studio`, `full-throttle` or `focused-budget`), `budget:{limit,currency}` and optionally `site:{origin,description,defaultLanguage,pages,brand}`. Currency is one explicit ledger unit such as USD or CREDITS; no exchange rate or current provider price is inferred. `studio` separates creative decisions from routine implementation; tier names do not hardcode available model names or promise a particular quality.

```text
node scripts/production.mjs init new-private-production spec.json
node scripts/production.mjs quote private-production quote.json
node scripts/production.mjs approve private-production quote-id approval.json
node scripts/production.mjs spend private-production expense.json
node scripts/production.mjs asset private-production asset.json
node scripts/production.mjs review private-production review.json
node scripts/production.mjs status private-production
node scripts/production.mjs release private-production static-site new-delivery site-options.json
```

A quote needs `{id,provider,description,total,currency,reference?,validUntil?}`. Record the actual provider quote, including redo allowance. Approval needs `{by,note,allowance}`; it records explicit approval of that quote and cannot increase the project ceiling. An expense needs `{id,quoteId,amount,receipt}` and records real spend. The ledger cannot spend money itself. Never invent a human approval or a provider receipt to advance its state.

Import an asset with `{id,kind,file,origin,dependencies?,quoteId?,jobReference?}`. Kinds are `preview-wide`, `preview-portrait`, `film-wide`, `film-portrait`, `poster`, `tracking`, `depth`, `reference` or `other`; origin is `existing` or `generated` (locally authored assets use `existing`). Check the CLI/API validation for accepted values. Generated results need a recorded approved quote and actual provider job reference. Generated films depend on design-accepted wide and portrait previews. Each import is versioned and hashed; changing an input makes its dependent assets stale transitively.

Record reviews with `{assetId,kind,verdict,by,observations,evidenceFiles}`. Kinds are `design`, `film`, `join`, `checkpoint` or `source`; verdict is `accepted` or `changes-requested`. Evidence is copied and hashed against the reviewed asset version. Inspect a real result before recording approval. Watch full playback and joins; still frames alone do not establish smooth film. A release refuses obsolete dependencies, edited evidence or films lacking current film/join reviews.

## Provider generation

Discover relevant connected tools by provider name/capability. When OpenArt is actually available, inspect its real model choices, image/video inputs, quote, job status and download responses; use that schema rather than guessed endpoints. Preserve actual subject/material/geometry details and the approved copy across revisions. Review wide/portrait still compositions before requesting a film. Record the quote and approval before a paid generation, then record actual job/spend and import the downloaded file. Use provider/browser capabilities only within the user's authorization.

When no OpenArt connector is installed, prepare the actual scene specification, approved preview assets and import contract. Do not report generation as submitted. A provider login, paid allowance or final media choice is supplied for that consuming project, not by building SuperBrain itself.

For local media use `cinematic-media.mjs prepare/review`. `cinematic-edit.mjs` accepts an edit JSON containing `{width,height,fps,crossfade,segments:[{source,start,end},...]}` and writes a muted H264 film, source hashes, join timings and a real review sheet. Crossfade zero makes cuts; positive values dissolve. Track the final edited film, not its pre-edit sources; read [film tracking](film-tracking.md) and [depth](depth-media.md) only when needed.

## Delivery and launch

The release exporter works on a real static site in a separate folder. It checks local files, links, anchors, page headings, responsive metadata and language counterparts. It creates a new `public/` tree with canonical/OG/language metadata, sitemap, robots, SVG favicon, PNG icons at 32/180/192/512 and a 1200×630 share image. These are deterministic fallback brand assets from supplied name/colors; use reviewed client branding when available. `site.renderBrandKit:true` additionally renders the brand guide to PNG and PDF with an available Playwright/Chromium installation. The HTML kit and color contracts are always emitted.

`site.pages` entries identify `{route,title?,description?,language,translationKey?}`. Use matching translation keys for genuine translated counterparts. The exporter links supplied translations; it does not invent translations or verified business facts. Preserve functional language-switch links in the site. Structured business data must use verified supplied facts.

Deploy only `public/`. Keep `delivery/`, `brand/`, production ledgers, inbox data, credentials, masters and tools private. Use the user's selected hosting connector or actual file-manager/SFTP access, including Hostinger when available. Confirm the target, document root, domain, HTTPS and backup. A Git push or bundle export does not prove deployment. After upload, verify live routes, metadata, media range seeking and a real authorized form delivery. `scripts/launch-check.mjs` performs bounded GET/robots/noindex checks and can invoke an installed Lighthouse CLI; missing Lighthouse is reported as unrun, never a fabricated score. Include ownership, hosting/domain renewal responsibility and actual verified limits in the client handover.

For an owned form inbox, read [inbox forms](inbox-forms.md). It requires Node hosting/reverse proxy and private persistent storage; PHP-only hosting cannot run this implementation. SMTP and live hosting are configured for a real project, with no messages sent during SuperBrain installation.
