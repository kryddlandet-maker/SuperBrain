# Verifiering 2026-10-07

## Körda kodkontroller

- `npm test`: sju tester godkända. Briefens modulval och validering, installation/uppdatering, bevarade AGENTS-instruktioner, skydd mot lokala ändringar och destinationskonflikter, serverroutes och API-felhantering, pekarkoordinater, frame-samordning, cleanup samt coarse/reduced-motion-styrning.
- `npm run validate`: 191 kontroller godkända för skillfrontmatter, kort ingång, existerande referenser, exempelbriefs, sidstruktur och lokala länkmål.
- Testkörningen använder Node's inbyggda testbibliotek i samma process, eftersom sandboxen begränsar barnprocesser. Inga projektpaket behövs.

## Observerat i browser

| Kontroll | Observation | Status |
| --- | --- | --- |
| Lokal studio | Egen typografisk riktning, tre studies och briefbyggare visas | Granskad |
| Brief | Formulär med salong genererar användbar brief med relevanta kapitel | Godkänd |
| Tech desktop | Typografi, orbital scen och ljus-CTA renderar | Granskad |
| Pointer | Drag/pekarrörelse i hero uppdaterar `--pointer-x/y` i scenens koordinater | Godkänd för grundtracking |
| Navigation | Produktsida öppnas från navigation; back går till homepage | Godkänd |
| Salon desktop/mobile | Redaktoriell type och omkomponerad layout; ingen horisontell overflow i granskad mobilvy | Granskad |
| Tech mobile | Readable content, routes and CTA; ingen horisontell overflow i granskad mobilvy | Granskad |
| Construction inner page mobile | Projekt-URL laddas direkt; ingen horisontell overflow i granskad mobilvy | Granskad |

Mobiltestet använde begärd viewport 390×844; scrollbar/in-app-rendering rapporterade 375px innehållsbredd. Förhandsbilder sparades separat i leveransmappen. Browserns färgåtergivning kan påverkas av användarens miljö.

## Praktiska begränsningar

- Reduced-motion och coarse-pointer-beteendet är verifierat i effekttester och CSS granskad, men inte fullständigt visuellt observerat med varje OS/browserinställning.
- Ingen full WCAG-granskning, långvarig motionprofilering eller fältmätning av Core Web Vitals har utförts.
- View Transitions är en progressive enhancement. Navigation fungerar även utan den; full cross-browser-övergångsprofil är inte testad.
- Demona har avsiktligt abstrakta originalillustrationer och tydliga demouppgifter. De tar inga verkliga bokningar/offertförfrågningar.
- Ingen jämförande AI-generation med tidigare hjärnor har körts. Benchmarkprotokollet finns, men designöverlägsenhet är inte bevisad.

GitHub-publicering och lokal checkout verifieras separat mot det faktiska publicerade committrädet. De tre källhjärnorna har inte ändrats.
