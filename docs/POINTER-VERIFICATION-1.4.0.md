# Fyra nya mjuka pekarvarianter — lokal verifiering 1.4.0

Datum: 2026-10-09. Källa: codex/library-expansion-wave-1, utgående lokal baseline 16ae324/v1.3.1. Uppdrag: bevara fungerande funktioner, tillföra fyra olika mjukare pekarinteraktioner, noggrant läsa masterprompten och kontrollera produkten via Remote Desktop Commander. Användaren förtydligade att denna avgränsning ska prioriteras framför hela 2.0-briefen.

## Resultat och bevarande

Den nya vägen `/examples/pointer-buttons/` har separat CSS, pekarmodul och labbkontroller. Varmt sidoljus följer x med y konstant 50%; spotlight följer x/y; kantljus lämnar mitten mörk; magnet flyttar bara sin inre yta högst ±3px/±2px. Den yttre native klickytan ligger kvar. Alla ljus är dolda i vila, följer med tidsbaserad mjuk landning och tonar bort när pekaren lämnar. Tangentbordsfokus är centrerat och stilla med separat ram. Touch, minskad rörelse och no-JS har egna användbara alternativ.

Originalimplementation, visuellt informerad av Huly och användarens bild. Huly granskades både i sidan och via dess renderade knapp. Ingen upstream-kod, brand asset eller exakt timing kopierades. Befintliga Orbit-knappar byts inte ut. Uppdelningen hindrar nya timinginställningar från att påverka gamla integrationer.

Bevarandet är kontrollerat mot git-baseline, inte bara beskrivet: effects.js, effects.css, buttons.css, scroll-scenes.js, scene.css, creative.js, site.js, motion-preview.js och det gamla knapplabbets HTML/JS/CSS är identiska efter normalisering av radslut. Äldre exempel-HTML och generatorn är också identiska efter att endast det nya livscykel-scriptets loader tagits bort. Inga äldre kroppar, rubriker, knappreglage, handlers eller stilar ändras. Studion får en länk till det nya labbet. Installeraren kopierar den nya gemensamma CSS/JS-familjen bytekorrekt; konsumentens installerade portfolio har inte uppdaterats.

## Faktiskt utförda kontroller

Browserkörningar utfördes med Remote Desktop Commander på den auktoriserade Windowsvärden och dess befintliga Microsoft Edge 155.0.4283.45. Det är lokal QA körd genom fjärrverktyget, inte QA av en publicerad remote deployment.

| Kontroll | Resultat | Avgränsning och evidens |
| --- | --- | --- |
| npm test | 24/24 PASS | Befintlig funktionalitet, server/brief/installer/register samt ny coalescing, visibility, scroll, preferensbyte, idle-budget och listener-cleanup. |
| npm run validate | 472 PASS | Skill-format, briefs, lokala länkar, huvudstruktur, register och skydd mot dekorativa överrubriker/räknare. |
| test:pointer | 20 PASS | Alla fyra pointerbanor, mellanläge, konvergens, snabb reversering, fade, noll kvarvarande RAF, fast hit target, kantmask, kontroller, stilla/reduced/preview, tangentbord, disabled, resize, responsive, forced colors, touch/cancel, no-JS, disposal, back, kontrastmodell, bevarande och runtime-fel. Se evidence/pointer-buttons-browser.json. |
| test:browser | 19 PASS | Regression på gamla fyllningar och sidoljus, kontroller, keyboard, touch, reduced motion, no-JS, forced colors, smala bredder och bibliotek. Se evidence/buttons-browser.json. |
| test:product | 17 PASS över 20 routes | 100 route/viewport/preferenskombinationer: 1440/768/320 normal samt 390/632 reduce. Därutöver verklig brief/export, sökning, biblioteksmognad, produktval, comparison, färg, galleri, keyboard-rail, GPU-play/pause/fallback, scroll start/mitt/slut/reversering, Orbit och effekt-/detaljnavigation. Se evidence/product-browser.json. |
| test:navigation | 12 PASS | Alla tre undersidor för varje demo-familj, native tillbaka samt nya labbet–Orbit och projektbild–detalj. Default, explicit no-preference och reduce. Inga runtime-/konsolfel eller saknade resurser. Se evidence/navigation-browser.json. |
| Routingmätning | 5 PASS | Huvudskill 5 986 LF UTF-8-byte (+12 byte för de nya pekartriggers). Knappvalet laddar ett kapitel på 6 827 byte, annars utelämnat. Packaging, inte bevis på bättre design. Se evidence/routing-benchmark.json. |

Manuell kontroll i faktisk Codex-förhandsvisning: alla fyra knappar provades med drag över sina ytor, ändrad preview och lokal enkel aktivering. Desktop- och mobilkomposition samt den gamla Orbit-sidan granskades. Bevisbild: evidence/pointer-buttons-codex.jpg. Fristående desktop-/mobilbilder sparades också av browserkörningen. Bilder visar utseende; rörelsebelägget kommer från mätningar och verkliga pointer-events.

Den modellerade sRGB-kontrasten vid maximal central ljusstyrka är minst 4,84:1 för de levererade textpaletterna. Detta är en beräkning för givna tokens, inte en full rendered-contrast/WCAG-certifiering. Andra projektfärger kräver ny kontroll.

## Upptäckta fel och riktade korrigeringar

Disabled-state hade först en kort kvarvarande fade. Disabled/aria-disabled stänger nu ljuset och eventuell magnetisk transform omedelbart, även med preview aktiverat.

Utökad normal navigation gav native `InvalidStateError: ViewTransition opt-in disabled`. Navigationen fullföljdes, men den förväntade `ready`-avbrytningen blev en ohanterad rejection. Den fristående transition-lifecycle.js laddas tidigt i dokument som använder sidövergångar. Den hanterar enbart detta specifika opt-out-fall i pageswap/pagereveal, låter andra fel fortsätta synas och återställer listeners vid BFCache. Den ändrar inga animationsstilar eller URL-flöden. En module-import laddade för sent och ersattes med tidig loader. Kontroll för normal/reduced navigation och runtime-fel passerade efter korrigeringen. [Primär API-beskrivning](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).

Det gamla produkttestet tog ett slutvärde efter 100ms trots knappens befintliga 180ms opacityfade. Det väntar nu på det verkligt upplösta tillståndet med timeout och behåller samma geometriska assertions. Inga gamla effekttider ändrades för att få testet att passera. Ett separat host-timeout under en lång paus räknades inte som PASS; slutkörningarna slutfördes med exit code 0.

## Masterprompt, mognad och leveransgräns

Hela bifogade masterprompten har lästs. MASTERPROMPT-2-REVIEW.md går igenom samtliga 14 faser, befintliga belägg och kvarvarande 2.0-arbete. Ingen designmotor/token-generator/automatisk kreativ kritik eller blind extern designbenchmark uppges vara byggd av dessa fyra tillägg. Versionen är därför 1.4.0.

Registret står kvar på 86 poster och sin tidigare konservativa mognadsfördelning. De fyra ytterligare pekarvarianterna har separat faktisk testbevisning och är tillgängliga genom det villkorliga knappkapitlet och nya labbet; de har ännu inte införts som egna sökposter. Ingen PRODUCTION-READY-stämpel delas ut.

Fysisk mobil, Firefox/WebKit, skärmläsare, full WCAG, verklig integrering och field performance har inte certifierats. Inga påhittade design-/konverteringsresultat. Ingen push, PR, main-merge, deploy, DNS-/produktionsdataändring eller portfolioinstallation har gjorts. Remote main verifierades read-only som 38fef3ffa2407355723e2ad8a0bd68fe3ee903f0. Lokal commit identifieras med git log -1; publicering ska följas av remote SHA-verifiering och ren låst installation enligt projektregeln.
