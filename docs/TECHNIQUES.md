# Teknikatlas för SuperBrain 1.2

54 tekniker och designgrepp kartlagda från 28 primärkällor, originaltutorials och demos. Detta är ett urval med bred täckning, inte hela internet eller ett bevis på perfekt design. Tabellen skiljer provade lokala exempel från integrationsråd och research. Läs bara familjer som hjälper det aktuella projektet.

| ID | Teknik | Syfte / miljö | Implementation | Evidens | Viktigt val |
| --- | --- | --- | --- | --- | --- |
| T01 | Pekar-reveal | Upptäckt i bakgrund; tech, portfolio | CSS mask + lokala koordinater | Lokalt exempel 1.1 | Maskera inte viktig information |
| T02 | Ljusföljande CTA | Taktil respons; alla efter varumärke | Clipped gradient + pointer | Lokalt exempel 1.1 | Stabil klickyta och fokus |
| T03 | Klickvåg | Bekräfta input; knappar | Web Animations | Lokalt exempel 1.1 | Våg betyder inte lyckad inskickning |
| T04 | Orbital bubbelvy | Visa ett samlat system; tech | CSS transform-lager | Lokalt exempel 1.1 | Kort loop eller explicit kontroll |
| T05 | Sammanhängande scrollscen | Fortsätta ett visuellt subjekt; tech, process | Sticky + observer + progress | Lokalt exempel 1.1 | Mobil behöver egen komposition |
| T06 | Delad bild mellan dokument | Kontinuitet in i detalj; portfolio, projekt | View Transitions | Lokalt exempel 1.1 | Unikt namn och vanlig navigation |
| T07 | Proceduralt ljusfält | Egen atmosfär; tech, produkt | WebGL fragment shader | Lokalt exempel 1.2 | Skydda läsytan och ha reservvy |
| T08 | Pekardjup / tilt | Taktildjup; produkt, portfolio | CSS perspective + inre transform | Lokalt exempel 1.2 | Flytta inte klickmålet |
| T09 | Produktberättelse i steg | Förklara relationer; SaaS, tjänst | DOM state + finite animation | Lokalt exempel 1.2 | Använd verifierade funktioner |
| T10 | SVG-linje som ritas | Visa koppling; process, diagram | pathLength + dashoffset | Lokalt exempel 1.2 | Diagrammet ska finnas utan JS |
| T11 | Radvis typografisk entré | Sätta rytm; editorial, varumärke | Observer + Web Animations | Lokalt exempel 1.2 | Bevara textens semantik |
| T12 | Bildmask vid entré | Introducera motiv; portfolio, salong | Clip-path | Lokalt exempel 1.2 | Settled state måste visa motivet |
| T13 | Bildjämförelse | Bedöma två tillstånd; bygg, salong, produkter | Native range + clip overlay | Lokalt exempel 1.2 | Demo visar färgtolkning, inte verkligt resultat |
| T14 | Filtrerat galleri med FLIP | Hitta rätt projekt; portfolio, katalog | DOM filter + före/efter-transform | Lokalt exempel 1.2 | Hantera snabb upprepad input |
| T15 | Försiktig bildzoom | Peka ut interaktiv bild; portfolio, shop | Transform inom crop | Lokalt exempel 1.2 | Bevara caption och fokus |
| T16 | Horisontell produktserie | Utforska fler objekt; shop, portfolio | Native scroll snap proximity | Lokalt exempel 1.2 | Kap inte vertikal scroll |
| T17 | Material-/färgval | Inspektera variant; shop, produkt | Labeled buttons + selected state | Lokalt exempel 1.2 | Koppla verklig variantlogik i kundprojekt |
| T18 | Mesh-liknande gradient | Mjukt färgrum; tech, kultur | CSS layered gradients / shader | Integrationsråd, ej lokalt prov | Komposition framför slumpmässiga blobbar |
| T19 | Fin grain / dithering | Material och bandningskontroll; editorial, tech | Small noise texture / shader | Integrationsråd, ej lokalt prov | Inspektera textkontrast |
| T20 | Ljusstråk / bloom | Stark visuell accent; tech | Pre-render / shader / layered glow | Integrationsråd, ej lokalt prov | Undvik stora dyra blur-lager |
| T21 | Glas och genomskinliga ytor | Lagerhierarki; produkt UI | Alpha surface + optional backdrop filter | Integrationsråd, ej lokalt prov | Kontrast på alla underlag |
| T22 | Material som fortsätter mellan sektioner | Minska visuella snitt; alla | Shared background + anchor motif | Integrationsråd, ej lokalt prov | Semantiska rubriker kvar |
| T23 | Bunden scroll-parallax | Djup mellan lager; portfolio, arkitektur | Scroll progress + transforms | Integrationsråd, ej lokalt prov | Begränsa amplitud, stilla mobil |
| T24 | SVG form-morph | Visa förändring; varumärke, process | Compatible paths / MorphSVG | Integrationsråd, ej lokalt prov | Alla path-par är inte kompatibla |
| T25 | Gooey bild-reveal | Visuell upptäckt; kreativ portfolio | Texture shader + noise | Extern visuell observation | Behåll identifierbart motiv och stillvy |
| T26 | Bildrefraction / displacement | Materialförvrängning; kultur, experiment | WebGL textures or SVG filter | Integrationsråd, ej lokalt prov | Profilera storlek och förvräng inte produktdetalj |
| T27 | Fluid / flow-map | Flytande pekarspår; experimentell hero | GPU simulation/render targets | Research, behöver separat prototyp | Separat mätning och statisk reservvy behövs |
| T28 | Partikelfält | Rymd och rörelsesamband; tech, kultur | Canvas2D / GPU particles | Integrationsråd, ej lokalt prov | Bunden mängd och livslängd |
| T29 | Kort pekartrail | Lekfull gest; portfolio | Canvas2D pooled particles | Integrationsråd, ej lokalt prov | Dekorativt, inte ersätta systempekare |
| T30 | Riktig 3D-produkt | Inspektera form; produkt, webbshop | model-viewer / Three.js | Extern visuell observation | Kräver optimerad modell och stillbild |
| T31 | Bespoke 3D-hero | Egen scen; tech, produkt | Three.js/OGL scene | Integrationsråd, ej lokalt prov | Ljus, kamera och material måste designas |
| T32 | 3D-hotspots / annotationer | Förklara detaljer; produkt | DOM overlay + projected positions | Integrationsråd, ej lokalt prov | Text och kontroll kvar i DOM |
| T33 | AR-produktförhandsvisning | Bedöma objekt i rum; produkt | model-viewer + supported AR mode | Research, behöver separat prototyp | Enhetsstöd och fysisk test återstår |
| T34 | Rive tillståndsmaskin | Authored interaktion; produkt, illustration | Rive runtime + .riv | Integrationsråd, ej lokalt prov | Kräver riktig authored asset |
| T35 | Lottie vektorsekvens | Authored motion; illustration, onboarding | Lottie runtime + export | Integrationsråd, ej lokalt prov | Kontrollera featurestöd och städa runtime |
| T36 | Scrollstyrd videosekvens | Visa utveckling; produkt, process | Video seeking + scroll | Integrationsråd, ej lokalt prov | Mät seeking och behåll poster |
| T37 | Bildsekvens på canvas | Exakt frame-kontroll; produkt | Decoded frame sequence | Integrationsråd, ej lokalt prov | Minnes-/överföringsbudget krävs |
| T38 | CSS scroll/view timeline | Progressiv native rörelse; reveal, process | animation-timeline + feature detect | Integrationsråd, ej lokalt prov | Kontrollera målwebbläsarnas stöd |
| T39 | Delad layout inom app | Behålla objektidentitet; React UI | Motion layout/layoutId | Integrationsråd, ej lokalt prov | En transform-ägare, undvik dubbel motor |
| T40 | Expanderande innehåll | Visa detalj på plats; FAQ, information | details / accordion + layout animation | Integrationsråd, ej lokalt prov | Korrekt semantik och fokus |
| T41 | Dialog / lightbox | Inspektera större bild; gallerier | Native dialog | Integrationsråd, ej lokalt prov | Escape, fokusretur och alttext |
| T42 | Responsivt textsplit | Kinetisk rubrik; kampanj, portfolio | SplitText autoSplit | Integrationsråd, ej lokalt prov | Revert/resplit efter font och bredd |
| T43 | Variabel typografi | Typens egen karaktär; varumärke | Licensed variable font axes | Integrationsråd, ej lokalt prov | Kontrollera faktisk axel och reflow |
| T44 | Ordvis betoning | Framhäva tanke; editorial | Finite opacity/transform | Integrationsråd, ej lokalt prov | Låt övrig text vara lätt att läsa |
| T45 | Text-scramble / decoding | Kort teknisk gest; experimentell tech | DOM text timing | Integrationsråd, ej lokalt prov | Äkta text och navlabel kvar |
| T46 | Marquee / logoband | Visa serie/rytm; kultur, varumärke | CSS finite/controlled loop | Integrationsråd, ej lokalt prov | Pausa lång rörelse, fabricera inte kunder |
| T47 | Asymmetrisk redaktionell grid | Varierad komposition; portfolio, salong | CSS Grid | Integrationsråd, ej lokalt prov | Delade ankare, inte slumpmässigt ojämnt |
| T48 | Subgrid för captions och produktinfo | Gemensamma läskanter; shop, editorial | CSS subgrid | Integrationsråd, ej lokalt prov | Innehåll och fallback styr |
| T49 | Containerbaserad komposition | Komponenter i flera miljöer; alla | Container queries | Integrationsråd, ej lokalt prov | Anpassa till tillgänglig komponentbredd |
| T50 | Text runt en form | Redaktionellt bildmöte; editorial | shape-outside | Integrationsråd, ej lokalt prov | Läsbar measure och rak mobilkolumn |
| T51 | Organisk bildbeskärning | Eget bildspråk; salong, mat, kultur | Mask/clip-path + art direction | Integrationsråd, ej lokalt prov | Motivets viktiga delar får inte försvinna |
| T52 | Optisk bildövergång / crossfade | Byta variant/utsnitt; shop, galleri | Opacity + stable container | Integrationsråd, ej lokalt prov | Ingen layoutshift eller dold prisskillnad |
| T53 | Kontrollerad mikrointeraktion | Tydlig statefeedback; form, navigation | CSS/WAAPI state transitions | Integrationsråd, ej lokalt prov | Rörelse är inte bevis på lyckad handling |
| T54 | Tabbar med sammanhängande panel | Organisera information; produkt, tjänst | APG tabs + finite transition | Integrationsråd, ej lokalt prov | Piltangenter/selected state när riktiga tabs |

## Källor och spårbarhet

Maskinläsbar koppling mellan varje teknik och källorna finns i `data/techniques.json`. Visuell bedömning finns i [VISUAL-AUDIT.md](VISUAL-AUDIT.md).

- **huly**: [Huly](https://huly.io/). reference. Evidens: hero, pointer discovery and product continuity inspected.
- **codrops-image**: [Codrops: Gooey Image Hover](https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/). original tutorial. Evidens: linked demo inspected: reveal intermediate state.
- **codrops-type**: [Codrops: On-Scroll Typography Set 2](https://tympanus.net/Development/OnScrollTypographyAnimations/index2.html). demo. Evidens: composition inspected; scroll sequence not fully verified.
- **webgl**: [MDN: WebGL drawing](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context). documentation. Evidens: read.
- **three**: [Three.js responsive rendering](https://threejs.org/manual/pages/responsive.html). documentation. Evidens: read.
- **model**: [model-viewer](https://modelviewer.dev/). documentation/demo. Evidens: rendered product model inspected.
- **rive**: [Rive runtime feature support](https://github.com/rive-app/rive-docs/blob/main/feature-support.mdx). documentation. Evidens: read.
- **lottie**: [Lottie web](https://github.com/airbnb/lottie-web). documentation. Evidens: read.
- **gsap-scroll**: [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). documentation. Evidens: read.
- **gsap-split**: [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/). documentation. Evidens: read.
- **gsap-morph**: [GSAP MorphSVG](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/). documentation. Evidens: read.
- **motion**: [Motion layout animation](https://motion.dev/docs/react-layout-animations). documentation. Evidens: read.
- **timeline**: [MDN scroll-driven animation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations). documentation. Evidens: read.
- **clip**: [MDN clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path). documentation. Evidens: read.
- **displace**: [MDN SVG displacement](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap). documentation. Evidens: read.
- **variable**: [MDN variable font settings](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings). documentation. Evidens: read.
- **shapes**: [MDN CSS shapes](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Shapes). documentation. Evidens: read.
- **container**: [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries). documentation. Evidens: read.
- **subgrid**: [MDN subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid). documentation. Evidens: read.
- **snap**: [MDN scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type). documentation. Evidens: read.
- **dialog**: [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). documentation. Evidens: read.
- **tabs**: [WAI APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). documentation. Evidens: read.
- **performance**: [web.dev animation performance](https://web.dev/articles/animations-guide). documentation. Evidens: read.
- **reduce**: [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). standard explanation. Evidens: read; criterion AAA.
- **pause**: [W3C pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). standard explanation. Evidens: read; criterion A.
- **transition**: [MDN View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using). documentation. Evidens: read in 1.1 research.
- **crossdoc**: [Chrome cross-document transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document). documentation. Evidens: read in 1.1 research.
- **observer**: [MDN Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). documentation. Evidens: read in 1.1 research.
