# Verification — local expansion batch 1.3

Baseline: 38fef3ffa2407355723e2ad8a0bd68fe3ee903f0 (1.2.0). Baseline Node tests passed 16/16. Baseline validation failed on a normal Windows CRLF checkout because the frontmatter check required LF.

## Executed checks

| Command | Result | Scope |
| --- | --- | --- |
| npm test | PASS, 23/23 | Existing effects/creative behavior, registry integrity/search, conditional routing, read-only endpoint, standalone installation/conflict checks, binary image preservation, CRLF/BOM handling, touch press cleanup |
| npm run validate | PASS, 411 invariants | Skill size/frontmatter, source references, candidate maturity/evidence paths, all chapters/briefs and HTML local links |
| npm run test:browser | PASS, 18 checks | Headless installed Edge 155.0.4283.45, Chromium, Windows; exact scope below |
| node benchmarks/check-routing.mjs | PASS, five cases | Deterministic chapter routing and UTF-8 bytes normalized to LF; no model runs |
| git diff --check | PASS | Whitespace errors |

Browser runner needs host-provided Playwright and a browser. No package is added to the library's runtime dependencies. Set SUPERBRAIN_PLAYWRIGHT to an absolute installed Playwright module directory when it is not locally resolvable; SUPERBRAIN_BROWSER_CHANNEL=msedge selects an installed Edge. Then run npm run test:browser. Without a channel it uses Playwright's configured Chromium.

## Actual browser coverage

Evidence: docs/evidence/buttons-browser.json, with observed scale/origin/opacity/position samples and two screenshots. Assertions inspect initial, intermediate, interrupted/reversed and resolved directional fills. Horizontal light is invisible at rest, moves in x with fixed y, settles with zero pending RAF callbacks and resets on leave/cancel.

Checked keyboard focus, centered light, Enter/Space activation once each, Tab exit, adjustable variables, stationary preview, live reduced-motion changes, forced colors and disabled tracking. Reflow at 1440, 768, 390 and 320 CSS pixels; no horizontal overflow; button height >=44 CSS pixels. All three CSS focus fills work without JavaScript. All four buttons show explicit emulated touch press feedback, activate once and clear press/tracking.

Computed text contrast for all three supplied palettes, including the brightest glow center at maximum .35 opacity. Lowest observed ratios: fill 7.89:1, maximum glow 5.34:1. This calculation covers these supplied colors, not arbitrary consumer overrides or full WCAG certification.

Combined library query/domain filtering finds C004. Studio plus five representative older routes load with main content. No console/page errors or failed resources occurred in the checked contexts. These older routes receive smoke coverage, not a full visual or interaction recertification.

Desktop/mobile screenshots were visually inspected: readable hierarchy, no overlapping controls, complete four-study layout and mobile stacking. Screenshots are composition evidence; behavior is established separately by the assertions.

## Defects found and fixed

- CRLF/BOM frontmatter portability.
- Installer text-only copying would corrupt new PNG evidence; copy/hash original bytes and verify byte equality/reinstallation.
- Glow's more specific CSS kept its transition under reduced motion; matching specificity now removes it.
- Emulated mobile :active timing did not reliably show press feedback; native pointer events now own a decorative data-pressed state with explicit cleanup, without preventing scrolling or clicks.
- Browser favicon fallback returned 404; local server explicitly returns 204 because the lab has no icon asset.

The harness was also corrected to wait for asynchronous media changes and use actual keyboard navigation when checking :focus-visible. Failed development runs were not counted as passing evidence.

## Measured packaging and limits

The entrypoint grows from 5,063 to 5,733 UTF-8 bytes with LF. The optional button chapter adds exactly one chapter and 4,742 bytes across tech, salon, construction, portfolio and CRM packaging cases. It is absent unless requested. CRM uses the existing other type; no new CRM implementation is claimed.

No controlled model-output comparisons, blind human design evaluations, conversion results, field Web Vitals, FPS guarantees or production integrations were measured. No physical-device, Firefox/WebKit, screen-reader or full WCAG audit was performed. None of the new candidates is PRODUCTION-READY.

## Remote QA

This batch is local. No branch push, PR, deployment, remote demo QA or remote-SHA installation verification has occurred. The portfolio and its installed skill have not been updated. Before a later authorized publication, verify the resulting remote SHA and use a clean pinned source for consumer updates.
