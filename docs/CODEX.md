# Använd SuperBrain i Codex

Du använder Codex och främst GPT 6.1 Sol. Hjälpmedlen är modelloberoende och tvingar inget modellbyte. Ingen API-nyckel behövs för skillen eller studion.

## Välj med @ i olika chattar

SuperBrain och Frontend Design finns som två separata Codex-pluginpaket. För att få dem i kontots pluginlista på datorn och i molnet behöver paketen registreras på kontot. Att länka en lokal `SKILL.md` i en chatt eller installera `.agents/skills` i ett projekt gör dem bara tillgängliga i den miljön.

Kör i din befintliga SuperBrain-klon i PowerShell:

```powershell
git pull --ff-only origin main
npm install --global @openai/codex
codex login
node scripts/register-plugins.mjs
```

Logga in med samma ChatGPT-konto och arbetsyta som du använder i Codex på datorn och i molnet. `codex login` kan hoppas över om rätt konto redan är inloggat. Node.js 22 eller senare behövs. Om du inte står i klonen från den tidigare installationen, börja med `Set-Location "$env:USERPROFILE\Desktop\Superbrain\SuperBrain"` eller öppna terminalen i din faktiska klon.

Registreringskommandot använder Codex CLI:s app-server och dess befintliga inloggning. Det skapar privata paket med tom mottagarlista, installerar dem och läser tillbaka kontostatus. Ingen API-nyckel behövs. Endast resultatet `installed-and-verified` bekräftar installation på kontot. Därefter öppnar du en ny chatt, skriver `@` och söker efter **SuperBrain** respektive **Frontend Design**. Välj de plugins som ska användas i just den chatten. SuperBrain har en installationsguide som förbereder projektets verktyg när chatten har terminal och filsystem; Frontend Design tillför originalets designinstruktioner.

Tillgång till egna privata plugins beror även på Codex-klientens version, konto, arbetsytans policy och vilka plugins klienten stöder. Kontoåterläsning bekräftar registreringen; kontrollera @-menyn separat i respektive klient. Vi har verifierat paketen med Codex CLI 0.163.0, men har **inte** kunnat verifiera registrering eller synlighet i datorns och molnets gränssnitt: den aktuella molnmiljön blockerar anslutningen till `chatgpt.com`. Kör kommandot på datorn, eller tillåt domänen i molnmiljöns nätinställningar och försök igen. Paketeringen i sig registrerar inget konto.

Vid ett fel rapporteras installationen som obekräftad. Eventuella redan skapade plugin-ID:n sparas lokalt under ignorerade `artifacts/codex-plugins/registration.json`. Körning på nytt återanvänder egna privata SuperBrain-paket; namnkonflikter och delade eller obekräftade befintliga paket stoppar körningen. Uppdatera senare med `git pull --ff-only origin main` och `node scripts/register-plugins.mjs --update`. `--update` ersätter paketens innehåll och bevarar den privata åtkomsten.

## Alternativ: lokal pluginmarknadsplats

Om du vill installera från GitHub på en enskild dator:

```sh
codex plugin marketplace add kryddlandet-maker/SuperBrain --ref main
codex plugin add superbrain@superbrain-tools
codex plugin add frontend-design@superbrain-tools
```

Detta registrerar marknadsplatsen och paketen i den lokala Codex-profilen. Det bekräftar inte att molnchattar får tillgång till dem. För kontoregistrering används kommandot ovan. Teknisk information, paketering och verifieringsgränser finns i [pluginpaketen](CODEX-PLUGINS.md).

## Installera i hemsideprojektet

Du behöver Git och Node.js 22 eller senare. Klona SuperBrain i en separat mapp utanför hemsideprojektet och kör följande i terminalen (fungerar även i PowerShell):

```sh
git clone https://github.com/kryddlandet-maker/SuperBrain.git
cd SuperBrain
node scripts/install.mjs "C:/absolut/sökväg/till/hemsideprojekt" --anthropic
```

Ersätt sökvägen med den befintliga projektmapp som du ska öppna i Codex. Kommandot installerar SuperBrain och de fyra offentliga originalskillsen `frontend-design`, `web-artifacts-builder`, `webapp-testing` och `skill-creator` under projektets `.agents/skills/`. Verktyg, animeringsrecept och licensierade originalresurser hamnar under `.superbrain/`. Befintliga projektinstruktioner bevaras. Utelämna `--anthropic` om du enbart vill registrera SuperBrain som en separat skill; originalpaketen finns fortfarande tillgängliga som valbara resurser.

Välj projektet där hemsidans kod ska ligga, inte SuperBrain självt. Installationen skriver bara egna namnrymder och ett avgränsat AGENTS-block. Om gamla hjärnor redan anges i projektets instruktioner, låt Codex granska dem och ersätta deras aktiva laddningsblock med SuperBrain. Installern raderar inte gamla hjärnor automatiskt; dubbla aktiva instruktioner kan återinföra konflikten.

Öppna sedan hemsideprojektet i Codex och starta en ny chatt. Använd till exempel:

> Använd $superbrain och $frontend-design. Bygg en flersidig sajt för [företag/produkt] med aktiva produktanimationer i sektionerna. Föreslå en tydlig egen designriktning, börja bygga och granska resultatet på dator- och mobilbredd.

Eller använd bara SuperBrain:

> Använd $superbrain. Bygg en flersidig hemsida för […]. Föreslå en tydlig designriktning och börja bygga direkt. Clean betyder en sammanhängande layout, genomtänkt typografi och lugna övergångar, även med mycket innehåll och avancerade interaktioner. Fråga vid viktiga val under bygget.

Om klienten inte upptäcker skillen direkt, be den läsa `.agents/skills/superbrain/SKILL.md` uttryckligen. Projektets AGENTS-block visar samma ingång. Håll projektfakta i en egen brief och ladda bara relevanta referenskapitel.

Verifiera de installerade originalpaketen från hemsideprojektets mapp med `node .superbrain/scripts/anthropic.mjs --verify`. Ingen API-nyckel behövs för SuperBrain eller för att läsa originalens instruktioner. Vissa originalhjälpare för modellutvärdering kräver de Claude-verktyg som beskrivs i [kompatibilitetsguiden](ANTHROPIC-SKILLS.md).

## Uppdatera en befintlig installation

Kör i din SuperBrain-klon:

```sh
git pull --ff-only origin main
node scripts/install.mjs "C:/absolut/sökväg/till/hemsideprojekt" --anthropic
```

Installern stoppar innan den skriver om den hittar lokalt ändrade eller omanagerade filer på sina destinationssökvägar. Be då Codex jämföra och bevara de lokala anpassningarna innan uppdateringen fortsätter. Öppna en ny chatt i projektet efter uppdateringen. Installationen gäller det valda projektet; använd samma kommando för andra projekt.

## När resultatet blir sämre

Beskriv observerade problem: rubrikfonten känns fel, varje sektion har en annan bakgrund, tjänsterna upprepas som kort, eller undersidor saknas. Be om en riktad ändring och en renderad jämförelse. Undvik att lägga en ny universell regel i hjärnan för varje enskilt fel.

Spara en fungerande version före större omtag. Notera modell, brief, referenser och vilka kapitel som laddades. Jämför samma uppgift med en kortare kontext om ett bygge börjar bli stelt.

## Andra användbara verktyg

- GitHub: versionshantering och dokumenterade ändringar.
- Inbyggd webbläsare: referensgranskning och kontroll av den faktiskt byggda sidan.
- Figma: användbart om du vill redigera eller välja visuella riktningar på en canvas.
- Imagegen: användbart för uttryckliga illustrationer och originalbilder när relevanta assets saknas. Verkliga personer, lokaler och kundprojekt måste presenteras sanningsenligt.

Det här är möjliga verktyg, inte beroenden. Välj dem när de löser ett faktiskt behov. Remote Desktop Commander behövs inte för att använda SuperBrain.

## SuperBrain 2.0 tools

Use quick-edit for a bounded correction, design-build for new work and creative-engineering for advanced motion. In the consuming project read .ai/project/superbrain/project.json and design-system/MASTER.md if present, then only relevant chapters. Use node .superbrain/scripts/design.mjs brief.json --out existing-project to generate synchronized tokens without touching application code. Use node .superbrain/scripts/audit.mjs URL evidence-directory brief.json after starting the target app. The audit runner requires optional Playwright and a compatible installed browser; SUPERBRAIN_PLAYWRIGHT and SUPERBRAIN_BROWSER_CHANNEL configure the host.

Studio at /studio/engine/ renders token previews and exports files. It does not invoke an AI backend or silently write projects. Generated plans are proposals to reconcile with actual assets and user decisions. Review criteria left without attributed screenshot observations remain needs-review. Current release evidence/limits are in IMPLEMENTATION-2.0.md.
