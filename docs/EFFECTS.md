# Effektbibliotek 1.1

Starta `npm run studio` och öppna `/examples/effects/`. Standardkänslan är mjuk och elegant; växla till precis och futuristisk i labbet. Effekterna kompletterar typografi, layout och innehåll. De ska väljas efter verksamheten.

## Återanvänd i ett projekt

Installera SuperBrain med `node scripts/install.mjs /sökväg/till/projekt`. Biblioteket kopieras till `.superbrain/examples/shared`. Använd sökvägar som fungerar i projektets bundler eller kopiera filerna till projektets publika tillgångar. HTML-demona använder den lokala studions absoluta URL-sökvägar; anpassa dessa vid integration.

Ladda `effects.css` samt `scene.css` efter sidans layoutstylesheet för scrollscenen. Importera `initEffects` från `effects.js`, anropa en gång per monterad yta och anropa returvärdet vid avmontering. `scroll-scenes.js` följer med. Vid vanlig dokumentnavigering visar `lab.js` hantering av pagehide/pageshow och återställning ur bakåtcache. `motion-preview.js` förklarar det aktiva rörelseläget och låter besökaren uttryckligen förhandsvisa rörelse på just demosidan; `{motionPreview:true}` aktiverar detta. `{reducedMotion:true}` har företräde för stilla förhandsvisning. Systeminställningar ändras aldrig.

### 1. Pekar-reveal

```html
<section class="reveal-field" data-pointer data-follow="soft">
  <div class="reveal-art" aria-hidden="true">Dekorativa former</div>
  <h2>All viktig information ligger utanför masken</h2>
</section>
```

Ägaren behöver positionering och en genomtänkt lagerordning. Se `lab.css`. `--reveal-radius` styr ljusets storlek. Soft följer med tidsbaserad utjämning och stoppar animationen när pekaren nåtts; direct följer direkt. Mobil visar en stilla bakgrund. Minskad rörelse stänger av följningen.

### 2. Ljusknappar

```html
<button class="light-button" data-pointer data-light-button type="button">
  <span class="button-content">Öppna information</span>
  <span class="button-ripple" aria-hidden="true"></span>
</button>
```

Koppla en verklig handling till knappen eller använd en länk för navigering. Labbet visar bara lokal demo-feedback. Ljus följer pekaren, kanten reagerar och en kort våg utgår från klicket. Enter/Space ger en centrerad våg och fokusmarkeringen är synlig. Själva klickytan flyttar sig inte. Färger styrs med `--button-base`, `--button-ink` och `--glow-core`/`--glow-mid`/`--glow-edge`.

### 3. Sammanhängande scrollscen

`data-scroll-scene` får `--scene-progress` mellan 0 och 1 samt `data-scene-state`: gather, connect eller resolve. Använd progress för att rotera, skala och samla samma visuella objekt. `scene.css` visar hur en sticky scen möter tre vanliga textavsnitt utan att låsa scrollningen, också i en smal browserpanel. När scenen lämnar observationsområdet görs inga fler uppdateringar. Minskad rörelse visar en stilla komposition som standard; demosidans uttryckliga förhandsvisningsval kan aktivera rörelsen. Stilla förhandsvisning har företräde.

### 4. Bildövergång mellan sidor

Ge en enda bild i vardera dokumentet `view-transition-name: sb-project-image`. Båda behöver stylesheeten med `@view-transition { navigation: auto; }`. Vanliga länkar leder mellan två riktiga routes inom samma ursprung. Den inkluderade gårdsillustrationen är originalmaterial och används i båda vyerna. Undvik dubbla namn om flera projektkort syns: tilldela namnet bara till det valda kortet i den lösningen.

Stöd varierar mellan webbläsare. Utan stödet navigerar länken normalt; ingen funktion är beroende av animationen. Se [MDN:s API-guide](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) och [Chromes dokumentation om övergångar mellan dokument](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document). Scrollscenen använder [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) för synlighetsgränsen.

## Bedömning

Testa mus, tangentbord, mobilbredd, framåt/bakåt och minskad rörelse. Mät i målprojektet innan större bakgrundsytor, tunga medier eller många samtidiga scener införs. Ett lätt demo bevisar inte prestanda på alla telefoner eller att AI:n väljer rätt design varje gång.
