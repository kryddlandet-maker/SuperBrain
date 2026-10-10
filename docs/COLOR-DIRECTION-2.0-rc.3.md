# Color direction — 2.0.0-rc.3

The previous salon and construction starting palettes used green undertones in their text/surface roles, not just accents. The Studio exposed only an accent input with a green example. Repeated demo aesthetics could therefore become an accidental default for new projects.

## Implemented behavior

Nine editable color families are available in every business context: neutral, blue, indigo, rose, wine, copper, amber, teal and green. Each has light and dark starting palettes. Green remains an intentional option. New salon, construction, real-estate and generic starting profiles remove the previous green undertones; these are hypotheses, not mandatory brand decisions.

Color precedence is explicit:
1. A complete `artDirection.palette` containing background, text and accent overrides profile, family and theme.
2. An explicit `paletteFamily` selects that family in the chosen theme (or profile light/dark mode).
3. Theme alone uses the profile's family.
4. With neither, the editable profile starting palette applies.
5. An explicit `accent` overrides only the accent role.

Readable text/status tokens may adapt for contrast. Success semantics do not make the whole brand green. JSON, CSS, persisted decisions and rendered component samples use the same resulting tokens.

The Studio exposes family, background, text and accent. A partial custom background/text palette produces an error and preserves the previous paired preview/export. Accent alone remains supported. Quick edits do not create or replace a design system.

The skill entry and relevant references require color decisions from supplied brand assets, attributed reference observations and the actual brief. Demo greens and previous-project colors are not reusable defaults. This is guidance, not a guarantee of every future model decision. No natural-language color inference or randomized palettes are claimed.

## Use

In the Studio, choose Färgfamilj and Tema, or supply all three brand colors, then press Skapa förslag.

For Codex:
> Använd $superbrain. Välj en färgriktning utifrån varumärket, målgruppen och mina referenser. Föreslå tre tydligt olika paletter med bakgrund, text och accent och motivera dem. Undvik grönt och olivtoner i det här projektet. Behåll fungerande funktioner och kontrollera kontrast i renderingen.

In a brief:
```json
{
  "name": "My project",
  "type": "salon",
  "goal": "Choose a verified service",
  "paletteFamily": "blue",
  "theme": "light"
}
```

Existing Lumi, Autocar and Bygg demo projects have their own saved color decisions. Those project files and app styles are unchanged; updating the generic skill does not recolor them. A scoped project color edit should inspect its tokens and preserve layout, facts and interactions.

## Verification — 2026-10-10

- 42/42 unit/tool tests and 510 validation invariants pass.
- Cross-context color regression: nine families × two themes × eleven business types (198 configurations), synchronized JSON/CSS and readable solid color pairs.
- Nine focused Edge browser groups cover real Studio selection, iframe computed colors, downloaded tokens/briefs, custom palette precedence, transactional errors, bounded edits, keyboard and overflow at 1440, 390 and 320 px. [Report](evidence/colors/browser.json).
- The existing 22 engine browser groups pass after the color UI change. Current screenshots/audit are in evidence/engine/.
- Live Codex in-app Studio: selected blue/light for the salon context and generated the actual blue preview with matching color decisions. [Capture](evidence/colors/in-app-blue.png).
- Earlier interaction/product evidence remains historical; unchanged runtime modules were not rerun in this focused change. No physical-device, production or whole-product desktop certification is claimed.

Published source SHA, pull request and clean pinned consumer installation are recorded in the consuming project's installation record.
