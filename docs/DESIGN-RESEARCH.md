# Designresearch för SuperBrain 1.2

Datum: 2026-10-08. Uppdrag: bredda teknik- och designförmågan, undersöka hur effekter faktiskt ser ut och uppdatera SuperBrain. Användaren vill ha fri anpassning efter varumärket och stöd för tech, lokala företag, portfolio och webbshop. Bildmaterial ska väljas efter verksamheten med trovärdiga foton och produktbilder där det passar.

## Resultatet och dess gränser

Kartläggningen omfattar 54 tekniker/designgrepp och 28 källor: officiell dokumentation, standardförklaringar, originaltutorials och visuella referenser. Sökningar användes för upptäckt; rekommendationerna bygger på primärkällor och egna observationer. Det är en bred men avgränsad undersökning, inte bokstavligen hela internet. Den kan inte bevisa en perfekt designhjärna.

Atlasen finns i [TECHNIQUES.md](TECHNIQUES.md), med maskinläsbar proveniens i `data/techniques.json`. 17 poster har lokala exempel från version 1.1/1.2. Två ytterligare har extern visuell observation. Övriga är integrationsråd eller research som behöver en egen prototyp. Lokalt exempel betyder fungerande studie, inte färdig kundkomponent eller certifierad produktionsprestanda.

## Varför fler regler kan ha gjort de gamla hjärnorna sämre

Den ursprungliga [migrationsgranskningen](MIGRATION.md) kvarstår. Användarens observation är att motion förbättrades medan fonter, layout och sammanhang blev sämre. Utan gamla jämförbara byggen går det inte att fastställa orsaken. En rimlig hypotes är att ökande mängd instruktioner, upprepade sektionstyper och enskilda korrigeringar blev starkare än ett projekts art direction.

Att lösa det genom att kräva ytterligare 54 effekter vore samma problem i större skala. Därför är atlasen sökbar referensdata. Kärnan förblir liten. En brief får fördjupningar för valda teknikfamiljer, och AI:n väljer en konkret riktning innan den komponerar sidan. Det finns inga obligatoriska kortgridar, inga fasta effekter för alla företag och ingen universell maximal intensitet.

## Vad en Huly-liknande kvalitet faktiskt kräver

Vid desktopgranskning av [Huly](https://huly.io/) såg jag en stor tydlig rubrik på en lugn läsyta, ett sammanhängande mörkt ljusfält, en ljusaccent i CTA:n, pekaravslöjade produktfragment och en stor produktvy nedanför som fortsatte samma ljus/material. Min bedömning är att sammanhanget mellan dessa delar är viktigare än deras antal. Exakt renderingsmotor, shaderimplementation och full animationskedja har inte verifierats.

SuperBrain bör kunna översätta referensen till roller: typografisk tyngd, bakgrundens djup, en ljuskälla, små upptäckter och en berättelse om produkten. Den egna implementationen behöver sedan ett originaluttryck och tillåtna assets. Ett glödande ljus bakom en generisk hero plus fristående kort är ingen automatisk motsvarighet.

Det nya lokala ljusfältet testar denna roll med en originalshader. Produktstegen testar stabila rubriker, sammanhängande kort och explicita val. De visar principen, inte Huly:s produkt eller visuella identitet. En kunds verkliga UI, bilder och innehåll är nästa nödvändiga input.

## Teknikval efter önskad effekt

**DOM/CSS först när det räcker.** Klippning, gradienter, perspektiv, bildzoom och vanliga tillstånd kan ofta byggas med webbläsarens egna verktyg. De ger lättanpassad struktur och innehåll. Transform/opacity har generellt bättre utgångsläge för animation än egenskaper som kräver upprepad layout/paint; kostnaden behöver ändå granskas i målprojektet. [web.dev](https://web.dev/articles/animations-guide)

**Finite animation för en konkret gest.** Web Animations passar den här samlingens korta radentré, diagramlinje och panelrespons. Animationerna behöver inte en evig loop. Läsbar slutkomposition finns i HTML/CSS, med JS som tillägg.

**Timelines för mer koreografi.** GSAP/ScrollTrigger är en integrationsväg när många sekvenser, pinning och responsiva beroenden behöver samordnas. CSS scroll/view-timelines kan vara ett progressivt alternativ. Vi har ingen anledning att tvinga en enda motor på alla projekt. [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [MDN scroll-driven animation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)

**Layoutkontinuitet för interaktion.** I det lilla vaniljgalleriet mäts placering före/efter filtrering och en begränsad transform mjukar upp förändringen. I en större React-app kan Motion layout/layoutId hjälpa delade element och layoutförändringar. Båda kräver att olika motorer inte skriver över samma transform. [Motion](https://motion.dev/docs/react-layout-animations)

**Typrörelse med fungerande text.** SplitText har stöd för responsiv omsplittring; variabla fonter ger ytterligare möjligheter när deras axlar finns. Men effekten behöver passa språk, radbrytning och lästempo. Den lokala studien animerar manuellt komponerade korta rader; den utger sig inte för att lösa godtycklig textsplit. [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/), [MDN font variations](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings)

**GPU för rätt visuellt behov.** WebGL kan skapa procedural atmosfär och sampling/förvrängning av bilder. Riktig produkt-3D behöver modell, material, miljö och kamera; en CSS-tilt är ett annat slags djup. Three.js och model-viewer är lämpliga integrationsspår för dessa olika behov. Begränsad renderingsupplösning är ett aktivt val, särskilt när pixel density ökar belastningen. [MDN WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context), [Three.js](https://threejs.org/manual/pages/responsive.html), [model-viewer](https://modelviewer.dev/)

**Authored assets för ett färdigt rörelsespråk.** Rive och Lottie kan spela och styra rätt skapade tillgångar. De ersätter inte illustration, berättelse eller art direction. Stöd varierar mellan exportfunktioner/runtime; kontrollera tillgången och aktuell runtime innan integration. [Rive](https://github.com/rive-app/rive-docs/blob/main/feature-support.mdx), [Lottie](https://github.com/airbnb/lottie-web)

## Olika webbplatser kräver olika kompositioner

För lokala verksamheter är tydliga tjänster, praktiska uppgifter och verklig bokning/offert viktigare än en experimentell pekare. Bildbeskärning, gallery detail och lugn respons kan ge mycket karaktär. För portfolio behövs en egen projektindex och genomtänkta case routes. För webbshop måste material, produktdetalj, variant och pris kunna bedömas. För tech kan produktens samband bli en del av berättelsen.

CSS Grid/subgrid, container queries och former kring text ger kompositionsmöjligheter utöver motion. Använd dem för informationens verkliga relationer, inte för att skapa slumpmässig asymmetri. [Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid), [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries), [CSS shapes](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Shapes)

Nya briefval stödjer portfolio, webbshop och restaurang, och `site-archetypes.md` hjälper route- och kompositionsval. Det är inte ett tillskott av fungerande checkout eller reservationsbackend. Sådana flöden behöver byggas och verifieras i det riktiga projektet.

## Visuell utvärdering och verifiering

Bedömning är ett designomdöme med dokumenterat underlag. Den är inte en universell kvalitetsranking. [VISUAL-AUDIT.md](VISUAL-AUDIT.md) skiljer skärmbild, observerad interaktion, kodtest och sådant som återstår.

Behåll text, navigering och handlingar när dekoration försvinner. De nya studierna har ändliga förlopp, stilla förhandsvisning, reduced-motion-anpassning och kontroller som fungerar utan rörelse. W3C:s förklaring av Animation from Interactions gäller nivå AAA; Pause/Stop/Hide gäller nivå A med sina villkor för automatiskt rörligt innehåll. Vi använder dem som stöd för designval, inte som ett påstående om att hela projektet är WCAG-certifierat. [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Pause/Stop/Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

För att påvisa att hjärnan bygger bättre webbplatser behöver nästa bedömning använda samma verkliga brief och assets i flera jämförbara byggen, enligt [benchmarkprotokollet](../benchmarks/README.md). Den här versionen breddar kunskap och konkreta teknikmöjligheter; den garanterar inte kvaliteten på varje framtida AI-bygge.
