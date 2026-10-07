# Hur SuperBrain bör byggas

Analysdatum: 2026-10-07. Rapporten skiljer källbelagda tekniska principer, granskning av användarens hjärnor och egna designrekommendationer. 'Den bästa hjärnan' är en ambition; överlägsenhet måste visas genom verkliga jämförelser, inte genom längre instruktioner.

## Slutsats och konstruktion

SuperBrain bör vara en liten beslutsstödjande kärna med relevanta fördjupningar, faktisk effektkod, projektfakta och en renderingsbaserad förbättringsloop. Den ska ge AI:n större frihet i uttrycket, tydligare vägledning om webbplatsens struktur och mindre processkostnad innan första renderingen. En stor kunskapsbank är användbar; en stor obligatorisk prompt är ett annat beslut.

Det här är en rekommenderad konstruktion utifrån användarens problem och de granskade filerna. Det är inte ett bevis för att modellen alltid designar bättre med den. Originalresultaten från den andra datorn saknas, så jämförelser av deras fonter eller layout har inte gjorts.

## 1. Varför mer instruktioner kan göra arbetet stelare

Anthropics genomgång av context engineering beskriver kontext som en begränsad resurs och förespråkar att relevant material väljs snarare än att allt hålls aktivt. För SuperBrain innebär det en kort ingång och ämneskapitel som läses när uppgiften kräver dem. Det ger utrymme för projektets egna bilder, innehåll och beslut. [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

I de granskade reporna finns både progressiv routing och byggare som sammanfogar hela kunskapsbanken. SuperBrain undviker att använda den fullständiga historiken som normal projektkontext. Den lokala briefkompilatorn tar med kärnan och ett urval för aktuell verksamhet och motionnivå. För en liten focus-fix bör agenten använda den aktuella projektbilden i stället för att starta hela webbdesignprocessen.

Min hypotes är att upprepade krav på koncept, gates och systemspecifikationer kan flytta AI:ns uppmärksamhet från typografi och komposition till procedur. Den hypotesen är rimlig men obevisad för användarens tidigare webbplatser. En annan möjlig förklaring är skillnader i modell, assets, brief, kontextlängd eller antal förfiningsvarv. Benchmarken måste hålla dessa faktorer så lika som möjligt.

## 2. Vad 'clean' betyder i det här bygget

Användaren har bekräftat att clean kan vara avancerat och innehållsrikt. Här tolkas det som läsbar hierarki, sammanhängande typografi, lugn kontroll över ljus/material och övergångar utan godtyckliga avbrott. Det behöver inte betyda få element, liten textmängd eller en vit minimalistisk sida.

Min designrekommendation är att hålla en gemensam grundyta genom flera semantiska sektioner och låta innehållets skala, densitet och bildbehandling skapa variation. Därmed slipper varje ny rubrik signaleras med ny bakgrund, ram eller höjd på en hel skärm. Det finns fortfarande skäl att separera olika uppgifter: ett offertformulär behöver tydlig avgränsning och en prisjämförelse behöver läsbar struktur.

En viktig distinktion är semantisk struktur kontra visuellt snitt. `section`, rubriker och landmarks kan finnas kvar medan en ljusgradient eller ett material fortsätter över gränsen. Riktlinjen ska alltså inte uppmana AI:n att ta bort struktur för att 'smälta ihop' sidan.

## 3. Typografi före fler dekorationer

web.dev beskriver god webbtypografi som ett samspel mellan bland annat textstorlek, radlängd, radavstånd och användarens förutsättningar. Fontnamnet ensamt räcker inte. [Typography](https://web.dev/learn/design/typography/).

Min rekommendation för hjärnan är att välja display- och brödtextroller utifrån verksamheten, prova dem med riktig svensk text och kontrollera verkliga brytningar på mobil. En expressiv serif kan passa en redaktionell salong, medan ett tydligare konstruktivt uttryck kan passa en byggfirma. Inget av detta är ett obligatoriskt typsnitt för en bransch.

Systemfonter i demona visar kontrast och rytm utan nätverksberoenden. De är inte slutgiltiga identitetsval för alla kundprojekt. När en specifik font förbättrar riktningen, använd en tillåten fontfil, relevanta vikter och en läsbar fallback. MDN förklarar hur `font-display` påverkar visningen medan en font laddas; välj strategi med hänsyn till läsbarhet och layoutstabilitet. [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40font-face/font-display).

Typografisk granskning ska fråga om skillnaden mellan rubrik och brödtext, proportioner, läsmått, riktiga långa ord och en tydlig nästa handling. 'Dålig font' kan vara fel familj, men också fel vikt, tracking, radbrytning eller för stor likhet mellan alla textnivåer. Lägg inte fler animationer ovanpå ett sådant problem.

## 4. Webbplatsens arkitektur måste finnas före dekorationen

Här är flersidigt en bekräftad standard från användarens brief. Det betyder faktiska URL:er och undersidor med egna uppgifter. Det betyder inte att varje projekt måste ha exakt fem sidor eller att SPA är förbjudet. En router kan skapa många sidor; en statisk dokumentsajt kan göra samma sak.

För salonger är behandling, team och bokning möjliga separata uppgifter. För byggfirmor är tjänster, projekt, projektdetalj och offertväg ofta mer meningsfullt. För techprodukter kan produkt, lösningar och prisbild behöva utrymme. Dessa rekommendationer måste möta verkligt innehåll. Att dela ett tunt stycke text på fyra sidor hjälper inte.

Varje route ska fungera vid direktladdning, refresh och back/forward. Navigationen ska visa var besökaren är. Undersidor delar identitet men anpassar komposition: behandlingslista, projektgalleri och prisjämförelse behöver olika hierarki. SuperBrains exempel använder vanliga dokumentlänkar och en startserver som faktiskt serverar varje sida.

## 5. Vad Huly visar — och vad vi inte vet

Hulys förstasida granskades i webbläsaren. Observerat: en stor vänsterställd rubrik, mörk produktvärld, lysande fält, tydlig CTA och en stor produktvy. Sidinnehållet inkluderar flera teman och navigering till bland annat prissida och resurser. [Huly](https://huly.io/).

Pekaravslöjande i bakgrunden och färgbubbla som följer musen är beteenden som användaren beskrev. I den här granskningen har vi inte fastställt Hulys exakta interna animationsteknik eller verifierat varje pekarrörelse live. SuperBrains implementationer är originaltekniker för liknande typer av interaktion, inte kodkopior eller en exakt Huly-rekonstruktion.

Min överföring från referensen är: scenkänsla, produkt som visuellt ämne, gemensam atmosfär och små interaktiva upptäckter. Att kopiera mörk bakgrund och glöd till en frisörsalong skulle missa den större principen om verksamhetens egen karaktär.

## 6. Konkreta effekter, inte bara 'gör mer animation'

Pekar-reveal kan byggas genom att lägga dekorativa fragment i ett maskat lager och flytta maskens centrum i scenens lokala koordinater. Text och navigation ligger utanför det dolda lagret. Detta ger en tydlig prototyp utan WebGL. Större flytande distortioner eller partikelsystem kan motivera Canvas/WebGL, men då måste teknikens verkliga nytta och kostnad bedömas.

En ljusbubbla i en knapp kan vara ett klippt pseudo-element vars lokala koordinater följer pekaren. Knappen själv flyttar inte från sin klickyta. Tangentbordsfokus får en stilla markering och outline, medan touch får en komplett statisk knapp. Kodexemplet grupperar inputuppdateringar till animation frames och har cleanup för listeners.

En bubble scene kan ha en stabil yttre mask med en inre transformerad illustrerad scen. Det skiljer layoutägarskap från motionägarskap. Effekten ska vara en ingång till något, eller en tydligt dekorativ studie; det är inte skäl att göra meningslösa element tangentbordsfokuserbara. Techdemots bubbla är en faktisk länk till produktsidan.

Motion erbjuder ett React-hook för reduced motion och GSAP beskriver hur `matchMedia()` kan hantera responsiva villkor och cleanup. SuperBrain använder deras dokumentation som valbara referenser, utan att kräva båda biblioteken i alla projekt. [Motion](https://motion.dev/docs/react-use-reduced-motion), [GSAP](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).

## 7. Rena övergångar mellan riktiga sidor

MDN beskriver View Transition API för både dokumentnavigation och förändringar i samma dokument. Cross-document-varianten har särskilda villkor, bland annat samma origin och stöd i webbläsaren. Därför används den som förbättring ovanpå fungerande normal navigation. [Using View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).

Min rekommendation är en kort crossfade med stabil navigation som vanlig startpunkt. En shared-element-övergång är användbar när besökaren följer en bild in i ett projekt. Det behövs inte stora svep, helskärmsbläck eller långa väntetider mellan vanliga informationssidor. Om browserstöd saknas ska ingen route sluta fungera.

Sammanhängande sektioner och smidig routenavigering är olika saker. Den första löses främst genom komposition och material; den andra genom korrekt navigation, fokus/scroll och en lämplig övergångsteknik. En extra animationsmotor löser inte dålig innehållsarkitektur.

## 8. Tillgänglighet och prestanda ska forma effekten

W3C skiljer mellan rörelse som startar automatiskt och rörelse från interaktion. För automatiskt rörligt innehåll över fem sekunder, parallellt med annat innehåll, kan pause/stop/hide behövas. Animation från interaktion har en egen framgångskriterie på AAA-nivå. SuperBrain erbjuder användbara statiska och reduced-motion-versioner samt rekommenderar relevanta kontroller. [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), [Animation from Interactions](https://w3c.github.io/wcag/understanding/animation-from-interactions.html).

web.dev rekommenderar att framför allt transform och opacity används för täta animationer och att övriga egenskapers renderingseffekt bedöms. Masker, stora gradients och blur är inte gratis bara för att de skrivs i CSS. [High-performance CSS animations](https://web.dev/articles/animations-guide).

Min implementation håller dekorativa introduktionsrörelser korta och behåller allt väsentligt innehåll synligt. Pekartracking stängs av när reduced motion är valt. Dessa val är grundbeteenden, inte bevis för full tillgänglighet eller universell prestanda. Kundbyggen behöver faktisk granskning på sina målmaskiner.

Core Web Vitals skiljer på laddning, interaktion och layoutstabilitet och bedöms som fältmått vid p75. Lokal browsergranskning här fastställer inte dessa värden. Använd en faktisk prestandamätning när media och avancerade scener ökar. [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

## 9. Vad som skulle göra hjärnan bättre över tid

Anthropics genomgång av agentevaluering betonar att beteende behöver utvärderas genom faktisk körning och flera former av evidens. SuperBrain har därför ett separat benchmarkprotokoll för designresultat, snarare än att kalla filvalidering för intelligensprov. [Demystifying evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

Min rekommenderade förbättringsloop är att köra samma brief och assetkit med första hjärnan, nuvarande tre hjärnor och SuperBrain, med samma modell och rimlig likvärdig arbetsbudget. Spara första renderingen och finalen. Granska blindt typografi, komposition, kontinuitet, affärsanpassning och interaktion. Upprepa på både tech och lokala verksamheter. Registrera även försämringar.

Användarfeedback bör bli projektbeslut först. En lärdom får bli global först när den är återkommande och tydligt generaliserbar. 'Den här frisören ska kännas varm' hör i salongens brief. 'Alla webbplatser ska ha beige bakgrund' hör inte i SuperBrain.

## Vad som är levererat och nästa kvalitetstest

Leveransen innehåller en ny samlad skill, elva referenskapitel, en lokal briefstudio, återanvändbar effektkod, tolv demosidor, installer, validerare, verktygstester och sex benchmarkfall. Studion är ett praktiskt stöd utan API-kostnad. Den är inte en separat autonom AI-app.

Nästa test av själva designförmågan är en riktig salong eller byggfirma med bekräftat innehåll och egna bilder, samt en techbrief med relevant produktmaterial. Om skillen därefter ger bättre typografi och sammanhang utan sämre rörelse har vi resultat som stödjer riktningen. Tills dess är det en välmotiverad och användbar grund med ärligt avgränsad evidens.
