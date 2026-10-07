# SuperBrain

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

Öppna `http://127.0.0.1:4317`. Studion har en briefbyggare och tre flersidiga exempel. Techdemot visar en bakgrund som avslöjas av pekaren, en ljusbubbla i knappen och interaktiva orbitaler. Salong och bygg använder samma principer med andra material, kompositioner och intensiteter. Alla företagsnamn och verksamhetsuppgifter i demona är fiktiva och märkta som demo.

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
