# SuperBrain

## Korrigering 1.3.1 — faktisk browserkontroll

Riktiga svep i knappstudierna, ljus som är dolt i viloläge även i Orbit och en scrollscen som fungerar i smala browserpaneler. Minskad rörelse respekteras som standard; labben visar aktivt läge och erbjuder ett uttryckligt val för rörelse på den aktuella sidan. Dekorativa 01/02/03 och små överrubriker har tagits bort från skillens standard, generatorn och demona.

Alla 19 dokumentroutes har kontrollerats vid 1440, 768, 632, 390 och 320 px. Separata funktionella förlopp täcker knappar, scroll, reglage, sökning, produktval, export och navigation. Läs [reparationsrapporten](docs/REPAIR-VERIFICATION-1.3.1.md) för belägg och avgränsningar. `npm run test:product` kör den breda kontrollen med separat tillgänglig Playwright/Edge.

## Utbyggnad 1.3 — lokal första våg

Fyra justerbara knappstudier finns på `/examples/buttons/`: fyllning från vänster, botten och toppen samt en ljusbubbla som visas vid hover och följer enbart horisontellt. Tangentbord, touch, minskad rörelse och stilla förhandsvisning har egna beteenden.

`/examples/library/` och `npm run discover -- --query "horizontal light" --domain D --limit 5` söker det sammansatta registret: 54 bevarade poster plus 32 nya kandidater. De 110 kapacitetsområdena är en omfattningskarta. Totalt 4 TESTED, 17 PROTOTYPED, 63 RESEARCHED och 2 EXPERIMENTAL; inga produktionsklara anspråk. Fyra nya fördjupningar laddas bara vid behov. I en installation används `node .superbrain/scripts/discover.mjs`.

Läs [research](docs/EXPANSION-RESEARCH.md), [lokal verifiering](docs/EXPANSION-VERIFICATION.md) och [checkpoint med nästa batcher](docs/EXPANSION-CHECKPOINT.md). Målet om 300 kandidater och full research över alla domäner är ännu inte uppnått. Tidigare rapporter nedan är historiska.

Kör `node benchmarks/check-routing.mjs` för en deterministisk mätning av selektiv briefstorlek. `npm run test:browser` kräver separat tillgänglig Playwright och webbläsare, se verifieringsrapporten. Grundverktyg och demos har fortsatt inga paketberoenden eller API-nycklar. Ingen publicering eller konsumentuppdatering ingår i denna lokala batch.

En gemensam designhjärna för kodande AI: avancerade techsidor, frisörsalonger, byggfirmor och andra verksamheter. Den kombinerar design, informationsarkitektur, innehåll och motion utan att låsa alla projekt till samma mall.

## Börja här

Öppna projektet i Codex och skriv:

> Använd SuperBrain. Bygg en flersidig webbplats för [företaget]. Målgruppen är […]. Målet är […]. Referenser: […]. Ge mig en tydlig egen designriktning, sammanhängande sektioner och fungerande undersidor. Fråga om viktiga val under arbetet och bygg vidare på oberoende delar medan jag svarar.

Kärnan finns i [skills/superbrain/SKILL.md](skills/superbrain/SKILL.md). Övriga kapitel laddas efter behov. Det här är kunskap och verktyg för en kodande AI, inte en tränad modell eller ett löfte om automatiskt perfekt design.

## Lokal studio och kodexempel

Node.js 22 eller senare, inga paket eller API-nycklar behövs:

```sh
npm test
npm run validate
npm run studio
```

Öppna `http://127.0.0.1:4317`. Studion har en briefbyggare, tre flersidiga exempel och ett nytt effektlabb med en egen projektsida. Techdemot visar en bakgrund som avslöjas av pekaren, en ljusbubbla i knappen och interaktiva orbitaler. Salong och bygg använder samma principer med andra material, kompositioner och intensiteter. Alla företagsnamn och verksamhetsuppgifter i demona är fiktiva och märkta som demo.

Studion kör ingen AI och skickar inga uppgifter till en extern tjänst. Den exporterar en brief som du lämnar till Codex eller annan kodande AI. Demona är laboratorier, inte färdiga kundsidor; de innehåller inga påhittade bokningar eller offertinskick.

## Använd i ett annat projekt

```sh
node scripts/install.mjs /absolut/sökväg/till/befintligt/projekt
```

Installationen placerar skillen i `.agents/skills/superbrain`, lägger ett avgränsat block i befintlig `AGENTS.md` och kopierar verktygen under `.superbrain`. Befintliga instruktioner bevaras. Vid lokala ändringar av installerade filer avbryts uppdateringen i stället för att skriva över. Ingen global installation behövs.

Skapa en projektspecifik brief med:

```sh
node scripts/brief.mjs examples/briefs/salon.json /sökväg/till/brief.md
```

En kompilerad brief innehåller kärnan och bara valda kapitel. Utan utdatapath skrivs den till terminalen. Befintlig utdata skrivs inte över.

## Vad granskningen visar

[Research report](docs/RESEARCH.md) skiljer observationer, hypoteser och rekommendationer. [Migration audit](docs/MIGRATION.md) dokumenterar vad som behållits, förenklats och ersatts från de tre hjärnorna, med källversioner. [Benchmark](benchmarks/README.md) beskriver hur faktisk designförbättring ska jämföras med tidigare versioner.

Kodtester bevisar verktygens beteende; de bevisar inte AI:ns designförmåga. Läs [verifieringsrapporten](docs/VERIFICATION.md) för vad som faktiskt körts och vad som återstår.

## Effektbibliotek 1.1

Fyra utvecklade tekniker finns i [effektlabbet](examples/effects/index.html): mjuk pekar-reveal, ljusknappar med klickrespons, en sammanhängande scrollscen och bildövergång mellan riktiga sidor. Två känslor kan provas: mjuk/elegant och precis/futuristisk. [Integrationsguide](docs/EFFECTS.md) beskriver återanvändning, mobilversioner och rörelsepreferenser.

## Designresearch och kollektion 1.2

[Designresearch](docs/DESIGN-RESEARCH.md) och [teknikatlas](docs/TECHNIQUES.md) kartlägger 54 tekniker från 28 primärkällor, originaltutorials och demos. Atlasen skiljer lokala exempel från integrationsråd och framtida prototyper. [Visuell granskning](docs/VISUAL-AUDIT.md) beskriver vad som faktiskt observerats och justerats.

Öppna `/examples/collection/` i studion: eget WebGL-ljusfält, produktsteg, pekardjup, radentré, SVG-linje, bildmask, jämförelse, filtrerat galleri, bildzoom, produktserie och färgval. Alla illustrationer är originalmaterial och exemplen är fiktiva. 3D, fluid simulation, Rive och Lottie ingår som kunskap och integrationsvägar, inte som färdigtestade lokala komponenter.

Briefbyggaren stöder nu även portfolio, webbshop och restaurang. Valfria teknikfamiljer lägger bara till relevant fördjupning. Fördjupningarna är inte en obligatorisk effektlista.
