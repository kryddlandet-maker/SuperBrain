# Återanvänd kollektion 1.2

Starta studion och öppna `/examples/collection/`. Markera Prova stilla version för att behålla handlingarna men slå av rörelse. Det är en manuell förhandsvisning; OS-inställningen för reduced motion hanteras separat.

## Bibliotek

`examples/shared/creative.js` exporterar `initCreative(root, {reducedMotion:false})`. Anropa en gång per monterad yta; anropa cleanup vid avmontering. `examples/shared/atmosphere.js` exporterar `initAtmosphere(canvas, playButton, document, {reducedMotion:false})` med motsvarande cleanup. Alla imports fungerar utan ramverksberoenden. Projektets bundler eller publika filstruktur avgör den slutliga sökvägen.

Installationen kopierar biblioteket under `.superbrain/examples/shared`, referenserna till `.agents/skills/superbrain` samt research/data under `.superbrain/docs` och `.superbrain/data`. Den fulla demo-HTML:n finns i källrepot; anpassa markup, CSS och URL:er till målprojektet. Kopiera inte hela demo-layouten som en obligatorisk mall.

| Markup / fil | Funktion | Anpassning |
| --- | --- | --- |
| `[data-depth]` med inre `.depth-visual` | Pekardjup, stabil ägare | Perspektiv, maxvinkel, ljus och mobilkomposition |
| `[data-arrive]` med `[data-line]` | Kort radentré | Äkta rubrik, rytm, line breaks |
| `[data-arrive]` på bildyta | Clip-path-entré | Utsnitt och slutbild |
| SVG-path `[data-arrive][data-draw]`, pathLength=1 | Linje ritas | Slutdiagram och önskad timing |
| `[data-compare]` med native range och output | Bildjämförelse | Två tillåtna bilder, matching crop, tydligt label |
| `[data-product-demo]` och `[data-product-step]` | Styrbara produktsteg | Äkta produktförlopp och statusbeskrivningar |
| `[data-filter-gallery]`, filterknappar och kategorier | Filtrering med begränsad layoutrespons | Kategorier, länkar, eget grid |
| `atmosphere.js` | Original procedural shader | Färger, stråk, position och renderingsbudget |
| `collection.css` rail/zoom/material | Native scroll serie och bildspråk | Produktmaterial och eget uttryck |

`data-needs-js` visar extra kontroller efter init; native jämförelsereglaget börjar disabled tills det får sin uppdateringslogik. Själva innehållet finns redan i HTML. Färgvalet i demo-skriptet ändrar bara en illustrerad lampa; det behöver ersättas av riktig variantlogik i en butik.

Ljusfältet har två uniforms för pekarposition och tid samt aspect ratio. Uppspelningen varar högst fyra sekunder och kan pausas. CSS-bakgrunden finns kvar vid GPU-fel. Ingen extern texture eller 3D-modell laddas. Vid förlorad GPU-context används reservvyn tills komponenten monteras om.

Texturer, fluid simulation, particle systems, Rive, Lottie och riktig 3D finns som separata integrationsspår i hjärnan. De är inte implementationer i den här kollektionen. Läs `advanced-graphics.md` och bygg en riktig prototyp med projektets assets när behovet finns.
