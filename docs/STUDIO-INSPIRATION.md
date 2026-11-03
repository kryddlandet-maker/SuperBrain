# SuperBrain Studio — inspirationsbibliotek

Studio-startsidan samlar nu **52 lokala studier och verktyg i åtta kategorier**. Kör `npm run studio` och öppna adressen som servern skriver ut. Befintliga demonstrationer har sina egna adresser och kan fortfarande öppnas direkt. [Tilläggen i rc.7](PRODUCTION-EXPANSION-RC7.md).

## Hitta, prova och samla

- Bläddra bland Knappar, Mus & ljus, Scroll & typografi, Produktanimationer, Grafik & 3D, Bilder & galleri, Webbplatser och Verktyg.
- Sök efter effekt, känsla eller funktion. Sökningen kombineras med kategorin och förstår svenska sökord även utan å/ä/ö. Sortera efter rekommenderad ordning eller namn.
- Klicka på en bild eller rubrik för att prova den verkliga demonstrationen i en dialog. Dator/Mobil ändrar förhandsvisningens bredd; länken öppnar hela studien. På en smal skärm begränsas båda lägena av tillgänglig bredd.
- Spara med bokmärket. Vyn **Sparade idéer** samlar valen och erbjuder **Kopiera idéerna** samt **Ta med till en brief**. Kopieringen skapar instruktioner att klistra in i projektets Codex-chatt.
- Briefen tar med studiernas namn, beskrivning och lokala adresser och föreslår relevanta teknikfamiljer. Du kan ändra förslagen, skriva en egen riktning och ta bort inspirationsvalen. Borttagning bevarar teknikval som du själv hunnit ändra.

Sökningen kan fokuseras med `/`. Escape stänger förhandsvisningen. Kategori, sökning, sortering och vald studie kan delas via sidans URL; webbläsarens bakåtknapp fungerar för vyerna.

Favoriter sparas i `localStorage` för den aktuella webbläsaren och serveradressen, inklusive port. De synkas inte med Codex-kontot eller mellan datorer. Om webbläsaren blockerar lagring fungerar valen under den aktuella visningen. Kopiering och briefexport fungerar utan någon extern AI-tjänst.

## Befintliga verktyg

| Adress | Innehåll |
| --- | --- |
| `/` | Inspirationsbiblioteket |
| `/studio/brief/` | Projektbrief med nedladdning av Markdown |
| `/studio/engine/` | Befintligt designverktyg med färger, uttryck och projektplanering |
| `/examples/library/` | Hela teknikregistret, inklusive research med angiven mognadsnivå |
| `/examples/atlas/` | Teknikatlasen |

Den gamla startsidans `#brief`-länk leder vidare till briefverktyget. Studions egen CSS är separat från designverktygets befintliga stilar.

## Bilder och katalog

`data/studio-catalog.json` är ett kuraterat register över faktiska lokala destinationer. `/api/studio` validerar katalogen och kontrollerar dess målfiler och ankare innan den lämnas till gränssnittet. Researchposter i det större teknikregistret räknas inte automatiskt som fungerande demostudier.

Kortbilderna i `studio/previews/` är skärmbilder av de faktiska demonstrationerna. De är stillbilder av ett valt ögonblick, inte bevis på att en animation fungerar. En enda levande demonstration laddas först när dess förhandsvisning öppnas och tas bort när dialogen stängs. Källkod, mål, bildhash och fångstprofil kan följas i `studio/previews/manifest.json`.

Med tillgänglig Playwright och webbläsare kan bilderna uppdateras med:

```text
node scripts/capture-studio-previews.mjs
node scripts/capture-studio-previews.mjs --only workflow-scene,project-brief
```

Oförändrade källor återanvänder befintliga bilder. Skriptet vägrar skriva över en bild som saknar känt ursprung eller har ändrats efter fångsten. Det gör inga externa nätverksanrop.

## Verifiering

Ombyggnaden i rc.6 med dåvarande 35 poster verifierades lokalt på Windows den 2026-11-03. Senare tillägg har separat [rc.7-verifiering](PRODUCTION-EXPANSION-RC7.md).

- 92 Node-tester och 600 valideringskontroller godkända. Valideringen omfattar även befintliga Anthropic-originals integritet och de två pluginpaketen.
- 11 fokuserade webbläsargrupper godkända i Chrome: bildladdning, kombinerad sökning och filtrering, tomma resultat, position vid kategoribyte, levande preview, byte till mobilbredd, dialogstängning, beständig lagring, kopierat innehåll, faktisk brief-API och nedladdning, URL/bakåt, felläge/återförsök och användbar navigation utan JavaScript.
- Studio kontrollerad på 1440, 768, 390 och 320 px. Ingen horisontell sidöverflow eller okontrollerade JavaScriptfel observerades i dessa flöden. Separat visuell och funktionell granskning på 1440, 390 och 320 px godkänd.
- 17 befintliga produktkontroller godkända över 25 routes. Direktladdning och layout kontrollerade vid 1440, 768, 632, 390 och 320 px; tidigare reglage, scroll, navigation och export fungerar i de kontrollerade flödena. [Produktregression](evidence/studio-inspiration/product-browser.json).

[Webbläsarprotokoll](evidence/studio-inspiration/verification.json), [datorvy](evidence/studio-inspiration/desktop.png), [mobilvy](evidence/studio-inspiration/mobile.png).

```text
npm test
npm run validate
npm run test:studio
npm run test:product -- artifacts/studio-product-regression
```

Webbläsarskripten behöver Playwright och en installerad Chromium-webbläsare. `SUPERBRAIN_PLAYWRIGHT` kan ange en befintlig Playwright-installation och `SUPERBRAIN_BROWSER_CHANNEL` kan välja exempelvis `chrome`. Testerna använder lokala servrar och påverkar inte användarens riktiga favoriter eller urklipp. Breddtester är emulering; fysiska telefoner, Safari, Firefox och skärmläsare har inte testats i denna ombyggnad.

Detta är en ombyggnad av Studio. Tidigare integration med 10k-websites omfattar fortfarande utvalda, egna implementationer; hela det externa paketet har inte importerats. Se [cinematic-integrationen](CINEMATIC-MEDIA.md) för exakt omfattning och kvarvarande funktioner.
