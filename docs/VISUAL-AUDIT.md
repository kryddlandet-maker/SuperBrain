# Visuell granskning — SuperBrain 1.2

Granskad 2026-10-08 i Codex inbyggda Chromium-browser, normal datorvy och 390 px mobilvy. Bedömningarna gäller dessa kompositioner och interaktioner, inte alla möjliga implementationer av en teknik. Källorna och deras evidensnivåer finns i [teknikatlasen](TECHNIQUES.md). 54 tekniker är kartlagda; 17 har lokala exempel från 1.1/1.2. Övriga är integrationsrecept eller research, med två särskilt märkta externa visuella observationer.

## Referenser som faktiskt öppnades

| Referens | Observation | Designbedömning och gräns |
| --- | --- | --- |
| [Huly](https://huly.io/) | Hero, pekarupptäckter och vidare scroll till produktmaterial | Atmosfär och produktpresentation hör ihop genom ljus och bakgrund. Relevant för uttrycksfull tech; en lokal firma behöver en egen bildvärld och tydligare verksamhetsinformation. Observationen är inte en fullständig teknisk reverse engineering. |
| [Gooey Image Hover Effects](https://tympanus.net/Tutorials/GooeyImageHoverEffects/) | Bildens avslöjande och deformering observerades i den externa demon | Intressant när bildupptäckten är en del av portfolions identitet. Förvrängningen kan försämra produktigenkänning i en butik. Ingen motsvarande bildshader implementerades lokalt. |
| [On-scroll Typography](https://tympanus.net/Development/OnScrollTypographyAnimations/index2.html) | Inledande komposition och försök att följa scrollsekvensen | Den stora seriftypografin ger egen karaktär. Hela animationsförloppet kunde inte säkerställas i granskningen; därför inget godkännande av alla typanimationer i exemplet. |
| [model-viewer](https://modelviewer.dev/) | Renderad astronautmodell på den officiella webbplatsen | Äkta geometri skiljer sig tydligt från CSS-djup. Relevant när själva objektet behöver förstås. Rotation, lastkostnad och mobil GPU-prestanda verifierades inte här. |

## Lokal kollektion

Öppna `/examples/collection/` efter `npm run studio`. Innehållet är uttryckligen fiktiva designstudier. Bildjämförelsen använder två behandlingar av samma originalillustration, inte ett verkligt före/efter-projekt. Produktpanelen demonstrerar steg, inte en verklig SaaS-tjänst. Lampans färger demonstrerar materialval, inte en butik.

| Yta | Observerat och justerat | Bedömning |
| --- | --- | --- |
| Hero och procedural ljusshader | WebGL renderade bakom läsbar rubrik. Separat uppspelningsknapp och statisk bakgrund finns. | Ljusfältet ger atmosfär utan att ta över texten. Inga externa modeller eller texturer. Ingen FPS- eller GPU-profilering har gjorts. |
| Produktberättelse | Connect-steget gav uppdaterad panel och status. Stilla förhandsvisning behöll stegval och Finish. | Produktförloppet förklarar något istället för att bara dekorera en skärmbild. På mobil var tre kolumner för små: de byggdes om till staplade läsbara kort. |
| SVG och korta entréer | Linjer och textentréer observerades i sidans sammanhang. Slutinnehållet finns direkt i HTML. | Kort rörelse passar den lugna rytmen. Exakta tider behöver justeras mot verkligt innehåll i nästa kundprojekt. |
| Bildjämförelse | Native range med tangentbordets End gav 100 %, uppdaterat output och mask. | Stor stabil bildyta ger jämförelsen mening. Det är viktigt att verkliga bilder har samma utsnitt och en ärlig förklaring. |
| Filtrerat galleri | Objekt gav två synliga resultat; Rum fungerade även i stilla läget. | Första layoutanimationen reste för långt och korsade annan text. FLIP-rörelsen begränsades därefter till 48 px; snabba nya filter avbryter föregående animation. |
| Produktmaterial | Salvia uppdaterade lampans färg, markerad knapp och synlig status. | Direkt respons gör materialvalet begripligt. Verkliga produkter behöver riktiga produktbilder och variantlogik. |
| Mobil 390 px | Ingen horisontell dokumentöverströmning; pekardjup avstängt; produktkort staplade efter omarbetning. | Mobil får egen komposition. Scrollserien är en separat avsiktligt horisontell yta. Ingen fysisk touchtelefon provades. |

Inga varningar eller fel rapporterades i kollektionens browserlogg under dessa kontroller. Manuell stilla förhandsvisning är kontrollerad i browsern. OS reduced-motion, borttagen WebGL-context, resursstädning och snabba filter täcks även av riktade automatiska tester; de är inte samma sak som fysisk testning av alla operativsystem eller GPU:er. Utan JavaScript ligger sluttext och bilder redan i markup; ett separat browserpass med JavaScript helt avstängt genomfördes inte.

## Atlas och arbetsflöde

Den sökbara atlasen på `/examples/atlas/` gav 13 resultat för “3D” och 17 för filtret Lokala exempel. Alla 54 poster ligger redan i HTML; sökningen är en förbättring ovanpå innehållet. Webbshopsbriefen skapades i studion med bildfamiljen vald: gallerier/commerce följde med, medan kapitlet om avancerad grafik inte följde med. Ingen AI eller extern brief-tjänst körs i studion.

## Vad som återstår per verklig webbplats

Välj och granska tekniker med det projektets bilder, text, typografi, routes och mål. Mät prestanda på de enheter som målgruppen använder. En väl fungerande demonstration garanterar inte att samma effekt passar en annan verksamhet. Riktig 3D, fluid simulation, particles, Rive och Lottie är dokumenterade integrationsspår, inte färdiga eller lokalt visuellt godkända komponenter i den här utgåvan.
