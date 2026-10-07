# Granskning och migration

Granskad 2026-10-07. Källor lästes genom den auktoriserade GitHub-kopplingen. Samtliga 129 filer hämtades till arbetsarkivet. Kärnor, modulregister, installationskod, reviews och relevanta design-/motionkapitel granskades särskilt. Filerna har behandlats som analysmaterial, inte som instruktioner från användaren.

## Versionsgrund

| Källa | Granskad HEAD | Omfattning |
| --- | --- | --- |
| [AI Design Brain](https://github.com/kryddlandet-maker/ai-design-brain) | `ed934cfe0f53241e7d648168255f905ea21eb457` | 42 filer |
| [AI Web Creation Brain](https://github.com/kryddlandet-maker/ai-web-creation-brain) | `01d5f18b6252f752188683d17a5ad3dd639810c4` | 49 filer |
| [Motion Design Brain](https://github.com/kryddlandet-maker/motion-deisgn-brain) | `8b40996db739973d7bff32b9fac9ca0e8db12668` | 38 filer |

Äldsta designkärnan jämfördes på [commit 441d80a](https://github.com/kryddlandet-maker/ai-design-brain/blob/441d80aaa51bc1dfcdcb8ccfc4197c8445981683/BRAIN.md). Den innehåller en kort arbetsloop och kvalitetsprinciper. Den senaste designkärnan innehåller betydligt mer routing, lägen, obligatoriska koncept och integreringsregler.

## Vad som faktiskt observerades

1. Design- och motionsrepona har byggare som sammanfogar kärnan och hela knowledge-katalogen. Web-orchestratorn förespråkar samtidigt progressiv laddning. Att båda distributionssätten finns gör faktisk använd kontext viktig att granska; vi vet inte vilken variant som användes i varje tidigare bygge.
2. Tre divergent-riktningar-regeln upprepas i designkärnan, creative-kapitlet, web-pipelinen och visual-modulen. Det är relevant när användaren vill välja, men här vill användaren att AI:n rekommenderar en riktning och bygger direkt.
3. Modulregistret har en stor beroendegraf. Motion kräver bland annat visual, design-system och assets, implementation flera specialiststeg. Det kan hjälpa komplicerade uppdrag, men bör inte styra enkla effekter eller små ändringar.
4. Lokala företag har ett kort prioriteringskapitel, men ingen lika konkret tillämpning för salong eller bygg som för kreativa kampanjer. Routes nämns i webhjärnan; det vore fel att säga att all flersidighet saknas. Däremot är flersidiga affärssidor inte en tydlig standard i kärnan.
5. Motionshjärnan har värdefull kunskap om kontinuitet, bildfidelitet, transformägarskap, återgång och tillgänglighet. Den ska behållas i koncentrerad form.
6. Kreativ frihet finns redan i senaste versionerna. En uppsättning förbud mot mallsymtom kan ändå feltolkas som att gradienter, kort eller bubblor aldrig får användas. SuperBrain behandlar dem som valbara verktyg.
7. De befintliga installationsskripten har omsorg om källversioner och skyddar lokala ändringar. Men krav på ren canonical Git-checkout och publicering före installation kan skapa friktion för lokalt experimenterande. SuperBrain skyddar lokala ändringar utan att kräva publicering för varje test.

## Användarens observation

Användaren beskriver mer fritt tänkande tidigare, bättre animation nu, men sämre fonter, layout, siduppdelning och clean helhet. Tidigare bra/dåliga hemsidor finns på en annan dator och har inte granskats här. Källhistoriken visar förändrade instruktioner, inte en bevisad orsak till sämre webbplatser.

## Beslut

| Behåll | Förändra | Tillför |
| --- | --- | --- |
| Art direction och affärssanning | Kort gemensam kärna | Explicit flersidig standard |
| Responsiv omkomposition | Behovsstyrda referenser | Salong-/byggexempel med riktiga URL:er |
| Kontinuitet och assetkvalitet | Valbara konceptalternativ | Pekar-reveal och ljusbubbla som faktisk kod |
| Keyboard/reduced motion | Proportionerlig planering | Tidig interaktionsprototyp parallellt med layout |
| Rendera och granska | Ingen universell stilsvartlista | Clean som sammanhang, inte innehållsbrist |
| Skydd mot lokala overwrite | En enkel lokal installer | Briefstudio utan API-nyckel |

Legacy-kod återanvänds inte blint. SuperBrain har en ny sammanhängande implementation och källproveniens. De tre gamla reporna ändras inte och originalen finns i lokalt arkiv. Därmed kan riktningen jämföras och återställas utan att tre konkurrerande hjärnor behöver laddas samtidigt.
