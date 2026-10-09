# SuperBrain — första utbyggnadsbatchen

Version 1.3.0 är implementerad och verifierad lokalt. Hela uppdraget är inte färdigt: målet om minst 300 trovärdiga kandidater, research över samtliga domäner och jämförande designbenchmarkar återstår. Checkpointen anger exakt fortsatt arbete.

## 1. Befintlig SuperBrain

Basen var main 38fef3f, version 1.2.0: en huvudskill, 18 fördjupningar, 54 teknikposter, 28 källposter och 17 lokala studier. Informationsarkitektur, flersidiga routes, begränsade animationer, fallback och installationsskydd bevarades. Gap: mognadsmodell, större discoverykarta, reproducerbar sökning och de exakt begärda knappvarianterna. Den äldre ljusknappen syntes i viloläge och följde båda axlarna. Windowsvalideringen föll på CRLF.

## 2. Research

32 aktuellt granskade käll-URL:er: 31 substantiella källor och en discoverykatalog. Faktiska skillfiler från bland andra Anthropic, OpenAI, Vercel, Addy Osmani, Meng To, b4Help, Emmraan och Seva granskades; dessutom MDN, W3C, GSAP, Motion, Lenis, Radix, shadcn, Playwright, model-viewer, Lottie, Codrops och R3F. Findings, attribuering, licensanteckningar och åtkomstbegränsningar finns i EXPANSION-RESEARCH.md och registret. Inga externa implementationer kopierades.

Kartan har 22 domäner och 110 kapacitetsområden. Dessa är omfattningskategorier, inte 110 verifierade tekniker. Flera obligatoriska startpunkter är fortfarande köade; backend och CRM har främst kartlagts.

## 3. Nya och förbättrade skills

Fyra nya villkorliga fördjupningar: button-interactions, accessible-actions, motion-lifecycle och library-discovery. Huvudskillen är fortsatt en skill med nu 22 referenskapitel. Kandidaterna räknas efter sin verkliga typ; 32 poster betyder inte 32 nya agent-skills.

## 4. Teknikregister

86 distinkta kandidater: 54 bevarade och 32 nya. Mognad: 63 RESEARCHED, 17 PROTOTYPED, 4 TESTED, 2 EXPERIMENTAL, 0 IDENTIFIED och 0 PRODUCTION-READY. De äldre posterna har konservativt ärvda nivåer och har inte automatiskt blivit testade. TESTED gäller de fyra nya knapparnas dokumenterade lokala omfattning. Det sammansatta registret har 60 källposter och 54 unika URL:er, inklusive historiska källor.

## 5. Interaktiva demonstrationer

/examples/buttons/ har fyllning från vänster, botten och toppen samt en ljusbubbla som visas vid hover och följer horisontellt. Reglage styr varaktighet, kurva, palett, storlek, intensitet och stilla förhandsvisning. Native knappar, separat fokus, touchtryck, live reduced motion och no-JavaScript-alternativ ingår. Tidigare demos bevaras. Övriga nya kandidater är research; inga nya fullständiga 3D/Rive/Lottie/CRM-implementationer påstås.

## 6. Arkitektur

data/discovery.json kompletterar atlasen. lib/library.mjs sammanställer, validerar och filtrerar; scripts/discover.mjs visar kompakta eller valda fullständiga poster. /examples/library/ använder en avgränsad läs-API. Valet buttons i briefbyggaren aktiverar bara knappkapitlet. Installern inkluderar discoveryverktyget och kopierar/hashar filer bytekorrekt; befintliga instruktioner och konfliktskydd bevaras.

## 7. Kvalitetskontroller

npm test: 23/23. npm run validate: 411 invariants. npm run test:browser: 18 avgränsade kontroller i Edge/Chromium 155 på Windows. Testade mellanlägen, avbrott, horisontell geometri, fokus, native aktivering, alla fyra touchvarianter, inställningsreglage, live reduced motion, forced colors, disabled, no-JavaScript och 1440/768/390/320 bredder. Sökning och äldre routes fick funktionella kontroller respektive smoke-test. Bilder inspekterades.

Lägsta beräknade textkontrast bland de tre paletterna: 7,89:1 för fyllning och 5,34:1 vid maximal ljusstyrka. Faktiska mobiler, andra browsermotorer, skärmläsare och full WCAG/produktionsaudit återstår. Remote QA har inte utförts.

## 8. Benchmark

Windowsfrontmatterkontrollen går nu från FAIL till PASS, och bildkopiering är byteverifierad. Fem reproducerbara packagingfall kördes: tech, salong, bygg, portfolio och CRM via typen other. Knappvalet tillför exakt ett kapitel och 4 742 UTF-8-byte, och är annars utelämnat. Entrypoint växer från 5 063 till 5 733 byte med LF.

Detta mäter routing och kontextstorlek. Ingen bättre designkvalitet, konvertering, field Web Vitals eller modellprestation är bevisad. Kontrollerade jämförande byggen och blind bedömning återstår.

## 9. Git och filer

Lokal branch: codex/library-expansion-wave-1. Implementation och evidens: a811fe6. Rapport/README/checkpoint sparas i en separat dokumentationscommit. git log -2 ger båda exakta ID:n. Ingen push, PR, deployment eller portfolioinstallation har utförts.

Viktiga filer: data/discovery.json; lib/library.mjs; scripts/discover.mjs; examples/buttons; examples/library; examples/shared/buttons.css; fyra nya referenskapitel; tests/library.test.mjs; tests/button-press.test.mjs; scripts/check-buttons.mjs; docs/evidence; EXPANSION-VERIFICATION.md och EXPANSION-CHECKPOINT.md.

## 10. Återstående möjligheter

Nästa ordning: slutför köade källor/licenser; utöka underforskade form/CRM/API/engineering-domäner mot 300 distinkta kandidater; navigation/formlabb; djupare scroll och transitions; selektiv authored/3D-integration; bättre beslutsrouting; kontrollerade modellbenchmarkar och bredare browser/device/assistiv QA. Det behövs 214 ytterligare distinkta kandidater för 300 totalt. Publikation och konsumentuppdateringar kräver separat mandat enligt briefen.
