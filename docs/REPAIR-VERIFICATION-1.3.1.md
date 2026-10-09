# Reparationsrapport 1.3.1

Användaren rapporterade uteblivna svep, permanent ljus i Orbit, otydliga reglage och stilla scrollscen. Den tidigare kontrollen omfattade främst det nya knappdemot och laddning av äldre routes. Den räckte inte för att verifiera det faktiska användarförloppet.

## Reproducerat i användarens browser

Codex In-app Browser hade `prefers-reduced-motion: reduce`, fin pekare och 632 × 604 px viewport vid reproduktionen. Den äldre scrollscenen stängde av rörelse både vid denna preferens och under 760 px. Knappreglagen ändrade variabler, men övergångarna var avstängda utan tydlig förklaring. Orbits äldre knapp hade dessutom ljusets vilolägesopacitet .65. En senare visuell genomgång gjordes efter att browserpanelen blivit 903 px bred. Därefter återtestades exakt 632 × 604 px med en tillfällig viewport-override: vanlig scroll ändrade progress från cirka .05 till .43 och kompositionen granskades visuellt. Override återställdes. Systemets rörelsepreferens var reduce hela tiden.

## Ändringar

- Fyllningar översätts som hela lager från vänster, botten eller toppen; klickyta och text ligger kvar. Återgång börjar från mellanläget.
- Även äldre ljusknappar har opacity 0 i vila, följer enbart x, har fast y och tonar bort vid leave. Tangentbordsfokus har avsiktligt centrerat ljus och separat outline.
- Labben och Orbit beskriver aktuellt rörelseläge. Ett uttryckligt sidlokalt förhandsvisningsval visar rörelse utan att ändra systeminställningen. Stilla förhandsvisning har företräde. Det ordinarie reduced-motion-alternativet finns kvar.
- Scrollscenen fungerar i smala paneler med en kompakt sticky komposition. Samma objekt ändrar tillstånd med vanlig scroll framåt och bakåt. Minskad rörelse har en läsbar stilla reservvy.
- Den smala fasta scenen har en sammanhängande bakgrund, så passerande text inte syns som avklippta fragment runt den centrerade grafiken. Detta upptäcktes vid bildgranskning efter den funktionella körningen.
- Dekorativa räknare och eyebrow/kicker-rubriker har tagits bort ur standardinstruktionen, generatorn och samtliga demosidor. En valideringsregel stoppar återinförd dekorativ markup. Faktiska produktsteg, register-ID:n och demo-disclosures finns kvar.
- Mobilöverflöd i byggrubriken vid 390 px och Orbits rundscen vid 320 px har åtgärdats.
- Dokumentövergången väljer `navigation: none` vid minskad rörelse. Detta eliminerade browserns abortdiagnostik i de verifierade förloppen. Det följer [WICG:s primära API-förklaring](https://github.com/WICG/view-transitions/blob/main/cross-doc-explainer.md).

## Utförd kontroll

| Kontroll | Resultat | Faktisk omfattning |
| --- | --- | --- |
| `npm test` | 23/23 PASS | Verktyg, installation, register, livscykel, input och reversibel scroll; nya förhandsvisningsvillkor |
| `npm run validate` | 443 PASS | Skill, referenser, lokala länkar och dekorativ markup |
| `npm run test:browser` | 19 PASS | Svepets riktning/mellanläge/avbrutna återgång, ljus, alla reglage, tangentbord, touch, disabled, no-JS, live motion-preferens och explicit preview |
| `npm run test:product` | 17 PASS | Alla 19 routes i fem viewport/preferenslägen; verkliga funktionella förlopp nedan |
| `node benchmarks/check-routing.mjs` | 5 PASS | Selektiv fördjupning, 5 974 bytes i huvudskillen med LF; inget modellkvalitetsbetyg |
| Faktisk Codex-browser | PASS inom beskriven omfattning | Rörelseinställning observerad, färg/tid ändrade med UI-input, knapprespons, Orbit utan permanent ljus, scroll framåt/bakåt och visuell granskning |

Den breda kontrollen kördes via Remote Desktop Commander på den anslutna Windows-enheten 5CD513936W med installerad Edge 155.0.4283.45. Browserkanalens automatiska sökväg fungerade inte i connectorns processmiljö; körningen använde därför den verifierade befintliga Edge-exekveringsfilen. Inget nytt browserpaket installerades.

Routes kontrollerades vid 1440/768/320 px med normal rörelse och 632/390 px med reduced motion: 95 route/viewport-kombinationer. Förloppen täcker lokal brief-kompilering och nedladdning, atlasens sök/tom/återställning, bibliotekets mognadsfilter, produktsteg, bildreglage, snabb omvänd gallerifiltrering, färgval, horisontell tangentbordsscroll, WebGL-rendering samt play/pause, scroll start/mitt/slut/återgång vid 1440/632/390, Orbit-pekarljus och produktnavigation, effektens känsloval och bildroute med tillbaka-navigation utan dubblerad aktivering. Inga konsolfel, okontrollerade page-exceptions eller saknade resurser registrerades i slutkörningen.

Under utvecklingskörningarna upptäcktes och rättades också saknad markup för förhandsvisningskontrollen. Testharnessen korrigerades för Windows-radbrytningar i nedladdningar, faktisk pilnavigering i den horisontella regionen och korrekt aktiveringsräkning efter både reload och bakåtcache. Misslyckade utvecklingskörningar räknas inte som godkända belägg.

## Belägg och begränsningar

Maskinläsbara resultat: `docs/evidence/buttons-browser.json` och `product-browser.json`. Bilder: `buttons-desktop.png`, `buttons-mobile.png`, `scroll-narrow-preview.png`, `orbit-codex-browser.jpg` och `scroll-codex-browser.jpg`. Stillbilder visar komposition; tidsprover och faktiska inputförlopp verifierar beteendet.

Detta är lokal QA på Windows med Chromium/Edge och Codex-browsern. Mobilstorlekar, touch och media-preferenser i automatik är emulerade. Ingen fysisk telefon, Firefox/WebKit, skärmläsare, produktionsbackend eller publicerad deployment har certifierats. Ingen kandidat uppgraderas till PRODUCTION-READY. Källändringen är lokalt versionsatt och committad; ingen push, PR, publicering eller uppdatering av portfolions installerade skill ingår. En senare godkänd konsumentuppdatering ska ske från ren pinnad källa efter verifierad remote SHA.
