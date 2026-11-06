# Selektiv designresearch — 2.0.0-rc.8

Granskad 2026-11-06. Alla 15 angivna källor har bedömts vid sina ingångssidor. Relevanta guider och implementationsfiler har lästs där de berör SuperBrain. Detta är inte en fullständig revision av varje fil i de stora samlingsrepositorierna eller alla deras externa länkar. Den sammanslagna länken till Refero/Fonts In Use har tolkats som två separata webbplatser.

## Resultatet i SuperBrain

Tre kompletteringar fyller konkreta luckor i det befintliga systemet:

1. **Referens → observation → designbeslut.** `brief.references[].decisions` knyter varje förslag till en befintlig observation och anger vad som ska tillämpas, undvikas och varför det passar projektet. Generatorn sparar ett separat referenskontrakt. Komponentändringar behåller layout och tokens och sparar kontraktet i projektminnet. Webbplatsprojekt får kontraktet under `design-system/`.
2. **Bevis för en avgränsad visuell ändring.** Ett nytt verktyg fångar verklig webbläsar-CSS, text och skärmbilder före/efter. Det kräver ett entydigt mål, förväntade värden och utpekade regioner att bevara. Utebliven ändring, fel värde eller upptäckt förändring i en bevarad region ger `needs-review`.
3. **Webbtext som stöder den riktiga uppgiften.** En valbar guide förenar konkret copy, bibehållen röst, verifierade påståenden och ärliga laddnings-/fel-/successlägen. Den används när textarbete efterfrågas. Inga globala förbud mot ord, skiljetecken eller typsnitt införs.

Två korta referenskapitel tillkommer, [referensresearch](../skills/superbrain/references/reference-research.md) och [webbtext](../skills/superbrain/references/web-copy.md). Routern laddar dem efter relevant uppgift eller uttryckliga referensbeslut. De finns också i Studios befintliga kapitelregister och följer med fristående installationer. Huvudfilen `SKILL.md` har inte vuxit. Befintliga rörelsemoduler, navigation och Studio-estetik har inte bytts ut.

## Källor och urval

Filadresser och Git blob-SHA för lästa GitHub-filer finns i [källförteckningen](../data/design-research-2026-11.json). SHA identifierar filinnehållet vid granskningen, inte ett granskat helt repository eller en säkerhetscertifiering. Externa instruktioner har behandlats som analysmaterial. Inga upstream-installationskommandon har körts.

| Källa och läst omfattning | Beslut och plats i SuperBrain |
| --- | --- |
| [system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks), README/index | Väljs bort. Samlingen av påstått läckta systemprompter tillför ingen tillförlitlig, avgränsad designfunktion. Varken prompttexter eller leverantörsspecifika systemregler importeras. |
| [awesome-ChatGPT-repositories](https://github.com/taishi-i/awesome-ChatGPT-repositories), README/index | En upptäcktskälla. Hela katalogen och dess orelaterade verktyg blir inte beroenden eller standardkontext. |
| [humanizer](https://github.com/blader/humanizer), README och SKILL.md | Anpassad princip i webbtextguiden: granska repetitiv struktur och tomma påståenden, bevara faktainnehåll och avsiktlig röst. Ingen kopia av skillen, inget löfte om att kringgå AI-detektorer och ingen tvingande vardaglig ton. |
| [pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills), README och user-interview-synthesis/SKILL.md | Spårbar evidens, motsägelser och skillnaden mellan observation och hypotes. Referenskontraktet och webbtextguiden använder principen. Övriga PM-, affärs- och livsmoduler väljs bort; obligatoriska deltagarantal blir inte regler. |
| [Refero Styles](https://styles.refero.design/), offentliga biblioteksroten | Källa för att hitta och formulera designreferenser. Enskild provsida kunde inte öppnas med granskningsverktyget och har inte detaljgranskats. Ingen hel stilbank har importerats. Det faktiska valda exemplet ska granskas vid användning. |
| [Fonts In Use](https://fontsinuse.com/), arkivets ingång och filter | Typografi i verklig kontext. Referensguiden kräver separat kontroll av tillgängliga typsnitt, språkstöd och rättigheter. Inga fontfiler har hämtats eller licensierats genom arkivlänken. |
| [Reddit-tråden](https://www.reddit.com/r/claudeskills/comments/1vhz1ol/web_uiux_design_with_ai_what_skills_prompts_or/), offentlig diskussion | Erfarenheter och upptäcktsförslag. Inte tekniska verifieringar. Relevanta önskemål om referenser och mindre verktygsbrus stämmer med den selektiva routern; inga kommentarsinstruktioner blir globala regler. |
| [Zima-artikeln](https://shop.zimaspace.com/sv/blogs/tech-ai-hub/10-best-ai-design-skills-tools-for-better-ui-ux), offentlig artikel | Orientering om arbetsflöden och verktyg. Marknadsföringsrankingen är inte bevis för designkvalitet. Ingen ny verktygssvit eller prenumeration installeras. |
| [TypeUI design skills](https://www.typeui.sh/design-skills), offentlig katalog | Valbar referenskälla. Betalda skilltexter har inte hämtats. Katalogen ersätter inte det befintliga systemet och laddas inte automatiskt. |
| [scroll-craft](https://github.com/nateherkai/scroll-craft), README, huvudskill och hero-depth | Konkret lagerplanering: plan, ankare, ocklusion, start/mellan/slut, mobil och stillbild. Förtydligat i referensguiden med återanvändning av befintlig film-/djupmodul. Ingen andra scrollmotor, effektkvot, obligatorisk frågelista eller låst estetik. |
| [elementor-website-skill](https://github.com/javen-wangjunren/elementor-website-skill), README och README_EN | Verifierade affärsfakta, sidans uppgift, prototypgranskning och redigerbara CMS-fält är användbara. Den villkorliga CMS-guiden skiljer HTML-prototyp från verifierad Elementor-widget. WordPress, Elementor och dess agentuppsättning installeras inte i andra projekt. |
| [loupe](https://github.com/winchxyz/loupe), README och FEATURES.md | Principen om exakt ändringsmål och synligt före/efter har fått ett eget, mindre verifieringsverktyg. Electron-appen, autentisering, modellkopplingar, referenskorpus och agentloopar importeras inte. Ingen kompatibilitet med Loupes API påstås. |
| [cineritual](https://github.com/tech-maxara/cineritual), README och core/engine.js | Scrollfilm överlappar befintlig funktion. Den granskade motorn förladdar frames och använder GSAP; filen visar inte motsvarande reduced-motion-/disposalhantering. Ingen motor importeras. SuperBrains befintliga resursbudget, stillbild och livscykel behålls. |
| [Ultra-web-design](https://github.com/wrg32786/Ultra-web-design), README, huvudskill, visual-craft, design-system-contract och audit-release | Användbar separation av observerat, föreslaget och verifierat förstärker referenskontraktet. Modulärt tänk finns redan. Inga obligatoriska alternativkvoter, stilförbud, fulla promptpaket eller osakliga kvalitetsbetyg läggs till. |
| [ui-design-bootcamp](https://github.com/allknowledge34/ui-design-bootcamp), README och Swiss/index.html | Stilövningar kan vara valbara referenser. SuperBrain har redan egna uttrycksfamiljer. Ingen kopierad mallbank, extern fontinstallation eller ytterligare React-runtime behövs. |

Detta är originalskriven syntes och originalkod. Inga externa skilltexter, mallar, fontfiler eller kodmotorer har kopierats in. Detta urval innebär inte att alla upstream-licenser har granskats för framtida återdistribution. Ny faktisk kopiering måste granskas separat. Anthropics redan versionslåsta originalpaket och det separata Frontend Design-pluginet är orörda.

## Användning

En referens kan exempelvis kompletteras med:

```json
{
  "aspect": "typography",
  "observation": 0,
  "adopt": "Kort, tydlig rubrik vid bokningsknappen",
  "avoid": "Referensens logotyp och varumärkesbokstäver",
  "reason": "Gör nästa verkliga steg lättare att hitta"
}
```

Lägg objektet i `references[].decisions`. `observation` är ett nollbaserat index i samma referens `observations`. Högst åtta beslut per referens tillåts. Saknad observationskoppling stoppas. Det är en författad projektplan; en ifylld observation är inte automatiskt verifierad av verktyget.

För en avgränsad CSS-ändring, skapa `change.json`:

```json
{"target":"#cta","properties":["color"],"expected":{"color":"rgb(255, 255, 255)"},"preserve":["#nav"]}
```

```text
node scripts/verify-change.mjs capture http://localhost:4317 change.json new-before
# Implementera och granska den begärda ändringen.
node scripts/verify-change.mjs capture http://localhost:4317 change.json new-after
node scripts/verify-change.mjs compare new-before/snapshot.json new-after/snapshot.json
```

Fristående projekt använder `.superbrain/scripts/verify-change.mjs`. Som övriga browserverktyg kräver fångsten valfri Playwright samt installerad Chromium/Edge/Chrome. `SUPERBRAIN_PLAYWRIGHT`, `SUPERBRAIN_BROWSER_CHANNEL` och `SUPERBRAIN_BROWSER_EXECUTABLE` väljer befintlig runtime. Ingen hämtas automatiskt. Varje fångst har fast 1280×900 och minskad rörelse. Nya outputmappar krävs; befintlig output skrivs inte över. Verktyget aktiverar inga sidkontroller.

## Verifiering och gränser

- `npm test`: **111/111** verktygs-/kodtester passerade, inklusive felaktiga observationsindex, selektiv routing, bevarad quick-edit-omfattning, utebliven ändring, fel mål, bevarandekrav och viewportskillnad.
- `npm run validate`: **640** skill-, brief-, sid- och länkinvarianter passerade.
- En verklig separat konsumentinstallation genomfördes i en ny lokal testmapp. Installerad generator, selektiv guide och referenskontrakt fungerade. Ägarmodifierad output blockerade överskrivning; orelaterad ägarfil bevarades.
- Installerat browserverktyg kördes mot en egen HTTP-fixtur i Chrome: verklig färg-/bakgrundsändring passerade, verklig ändring av navigationstext upptäcktes, oförändrad fångst avvisades, befintlig output skyddades och HTTP 404 avvisades. Installerad CLI kunde jämföra de riktiga fångsterna.
- Före-/efterbilder inspekterades med Remote Desktop Commander på datorn. Knappens kontrast ändrades och samma navigation, rubrik, text och placering var kvar i den godkända jämförelsen. Lokal receipt och bilder: `artifacts/research-smoke-2PhKak/` (ignorerad arbetsdata, ingår inte i pluginpaketet).

Ett godkänt CSS-prov bevisar bara de samplade egenskaperna och texterna. Det bevisar inte alla pixlar, osamplade komponenter, interaktioner, backendresultat, alla skärmstorlekar eller estetisk kvalitet. Olika webbadresser, viewport, rörelseläge eller specifikation får inte jämföras som samma tillstånd. Att guida bättre text eller design är inte ett genomfört jämförande modelltest. Inga påståenden om att systemet är bäst görs.
