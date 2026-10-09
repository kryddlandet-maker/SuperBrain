# Använd SuperBrain i Codex

Du använder Codex och främst GPT 6.1 Sol. Hjälpmedlen är modelloberoende och tvingar inget modellbyte. Ingen API-nyckel behövs för skillen eller studion.

## Installera i hemsideprojektet

Öppna SuperBrain-mappen och kör:

```sh
node scripts/install.mjs "C:/absolut/sökväg/till/hemsideprojekt"
```

Välj projektet där hemsidans kod ska ligga, inte SuperBrain självt. Installationen skriver bara egna namnrymder och ett avgränsat AGENTS-block. Om gamla hjärnor redan anges i projektets instruktioner, låt Codex granska dem och ersätta deras aktiva laddningsblock med SuperBrain. Installern raderar inte gamla hjärnor automatiskt; dubbla aktiva instruktioner kan återinföra konflikten.

Öppna sedan hemsideprojektet i Codex och använd:

> Använd $superbrain. Bygg en flersidig hemsida för […]. Föreslå en tydlig designriktning och börja bygga direkt. Clean betyder en sammanhängande layout, genomtänkt typografi och lugna övergångar, även med mycket innehåll och avancerade interaktioner. Fråga vid viktiga val under bygget.

Om klienten inte upptäcker skillen direkt, be den läsa `.agents/skills/superbrain/SKILL.md` uttryckligen. Projektets AGENTS-block visar samma ingång. Håll projektfakta i en egen brief och ladda bara relevanta referenskapitel.

## När resultatet blir sämre

Beskriv observerade problem: rubrikfonten känns fel, varje sektion har en annan bakgrund, tjänsterna upprepas som kort, eller undersidor saknas. Be om en riktad ändring och en renderad jämförelse. Undvik att lägga en ny universell regel i hjärnan för varje enskilt fel.

Spara en fungerande version före större omtag. Notera modell, brief, referenser och vilka kapitel som laddades. Jämför samma uppgift med en kortare kontext om ett bygge börjar bli stelt.

## Pluginstöd

- GitHub: versionshantering och dokumenterade ändringar.
- Inbyggd webbläsare: referensgranskning och kontroll av den faktiskt byggda sidan.
- Figma: användbart om du vill redigera eller välja visuella riktningar på en canvas.
- Imagegen: användbart för uttryckliga illustrationer och originalbilder när relevanta assets saknas. Verkliga personer, lokaler och kundprojekt måste presenteras sanningsenligt.

Det här är möjliga verktyg, inte beroenden. Välj dem när de löser ett faktiskt behov. Remote Desktop Commander behövs inte för att använda SuperBrain.

## SuperBrain 2.0 tools

Use quick-edit for a bounded correction, design-build for new work and creative-engineering for advanced motion. In the consuming project read .ai/project/superbrain/project.json and design-system/MASTER.md if present, then only relevant chapters. Use node .superbrain/scripts/design.mjs brief.json --out existing-project to generate synchronized tokens without touching application code. Use node .superbrain/scripts/audit.mjs URL evidence-directory brief.json after starting the target app. The audit runner requires optional Playwright and a compatible installed browser; SUPERBRAIN_PLAYWRIGHT and SUPERBRAIN_BROWSER_CHANNEL configure the host.

Studio at /studio/engine/ renders token previews and exports files. It does not invoke an AI backend or silently write projects. Generated plans are proposals to reconcile with actual assets and user decisions. Review criteria left without attributed screenshot observations remain needs-review. Current release evidence/limits are in IMPLEMENTATION-2.0.md.
