# Color and expression library — 2.0.0-rc.4

SuperBrain now provides 24 editable color families (48 light/dark palettes), 12 selectable visual expressions, and an explicit reproducible variation control. The previous nine families/custom palette inputs remain supported. Existing websites and interaction runtime are preserved.

## Color families

Neutral, blue, indigo, rose, wine, copper, amber, teal and green, plus cyan, navy, violet, lavender, coral, red, orange, yellow, peach, sand, chocolate, slate, plum, pink and azure.

## Visual expressions

Editorial, minimal, swiss, brutalist, noir, atelier, coastal, playful, industrial, heritage, futuristic and gallery. Each authors font roles, measure/tracking, maximum grid width, control/surface radii, surface border/shadow character, and a composition. The exported CSS and rendered study use the same tokens. These are component studies and editable design language, not complete website templates or newly installed custom font files.

The Studio exposes Designuttryck, Variation and Prova ny variation. Leave design expression/color family free to explore; choosing them explicitly keeps those choices. Theme still means light/dark. Full custom brand palettes and structured font/composition choices remain authoritative. Supplied composition uses a neutral stacked study instead of pretending to parse arbitrary layout prose.

brief.designTheme is an optional expression ID. brief.designVariation is an optional integer 0–9999. The first 864 free values cover distinct expression/family/layout combinations; later values repeat. The value is exported with the brief for exact reproduction. The button advances it (blank starts at zero), generates a real proposal and refuses to rebrand quick-edit work. A selected expression/family and complete brand palette are preserved; busy requests disable the variation control, and the upper bound reports honestly.

Existing briefs without the new fields retain their previous profile decisions. Presets and variations do not infer every brand nuance, access unseen previous projects, or guarantee every generated customer website is unique. Real content, imagery/crop, typographic choices, route composition and interaction still require authored decisions and actual render review.

## Codex workflow for distinctive new sites

Read the actual brief, available brand assets/references and supplied previous-project directions. Select a concrete identity across palette, composition, typography, imagery/material and interaction. Do not inherit the previous site's olive footer, oversized italic hero, pill controls or section ordering by habit. Choose differences because they fit this visitor goal, not from a novelty quota.

Example:
> Använd $superbrain. Skapa en egen visuell identitet för det här projektet utifrån målgruppen, varumärket och mina referenser. Jämför med tidigare tillgängliga projektriktningar och välj en motiverad ny kombination av palett, typografi, bildbehandling, layout och interaktion. Gör en tidig renderad studie, bevara fungerande funktioner och verifiera desktop, mobil, tangentbord och minskad rörelse.

For an existing brand, preserve its identity unless the user requests a redesign. Save the final rationale/tokens in that project's memory; never put client-specific preferences into reusable defaults.

## Verification — 2026-10-10

- 44 unit/tool tests and 510 validation invariants pass.
- 24 families × two themes × eleven contexts: 528 readable synchronized color configurations.
- All 12 expression token contracts differ; custom brand palette, font and composition precedence is exercised.
- 864 free expression/family/layout combinations are distinct and exactly reproducible, with readable body/action/muted color pairs.
- Nine color browser groups cover all families in light/dark, real token/brief downloads, precedence, transactional errors, keyboard and overflow at 1440/390/320 px. [Color report](evidence/colors/browser.json).
- Ten focused theme browser groups cover all 12 rendered expressions at three widths, actual type/radius/border/layout, UI export JSON, token/bundle/brief downloads, advancing/reproducing variations, explicit choices, quick-edit preservation, upper bound, keyboard, overflow and emulated touch. [Theme report](evidence/themes/browser.json).
- Existing 22 engine browser groups and ten functional briefing cases pass.
- Direct in-app review selected playful/coral and observed a matching rendered study, then verified the new variation button advancing from editorial/0 to minimal/1. [Capture](evidence/themes/in-app-playful.png).
- Initial headless theme-suite mouse dispatch did not produce the expected button click event. Final theme checks use native keyboard token/bundle/brief downloads; separate color and engine suites verify pointer downloads. Every theme's visible export JSON is also checked. No underlying cause of the initial input-dispatch failure is claimed.

Local Edge/emulated touch results do not certify physical devices, all engines, production/backends, complete WCAG, whole-product Remote Desktop review or controlled aesthetic superiority. Earlier interaction results retain their historical scope. Published source SHA and pinned installation hashes belong in the consuming project installation journal.
