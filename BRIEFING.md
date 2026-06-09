# Corabell – Wall of Fame · Entwicklungs-Briefing

## Projektziel

Eine Hollywood-thematisierte, statische JavaScript-Webanwendung (kein Build-System, reines HTML/CSS/JS), die den "Corabell Lebenslauf – Walk of Fame" als interaktives Erlebnis präsentiert. Datenbasis ist die Datei `source/StarFlash_Canva_Anleitung-mitzitat.pdf`.

---

## Dateien & Assets

| Datei | Zweck |
|---|---|
| `source/StarFlash_Canva_Anleitung-mitzitat.pdf` | Einzige Datenquelle – Seite 3 = Übersichtstabelle, Seite 4+ = Detaileinträge |
| `source/seite-43-lovestory.png` | Seite 43 der Hochzeitszeitung – Lovestory-Titel pro Eintrag (Quelle für `lovestoryTitel`) |
| `source/Corabell - Lebenslauf - Walk of Fame - big.jpg` | Design-Referenz für die Detailkarten |
| `source/Corabell - Lebenslauf - Walk of Fame - small.jpg` | Optimierte Version für die Übersichtsseite |
| `source/Corabell - Lebenslauf - Walk of Fame.svg` | Canva-Export (6 MB) – nur als Referenz, **nicht** direkt einbetten |
| `restetst/test.png` | Foto für die Übersichtsseite |
| `images/teaser/poster-1.jpg` … `poster-10.jpg` | Filmplakat-Teaser pro Karte – ✅ vorhanden |

---

## Datenextraktion & JSON-Struktur

Die Daten sind vollständig extrahiert in `data/walloffame.json`. Quellen: PDF (Filmtitel, Zitat, Szene, Wer sagt) + `seite-43-lovestory.png` (Lovestory-Titel).

### JSON-Schema (finales Format)

```json
{
  "palette": { ... },
  "eintraege": [
    {
      "nr": 1,
      "sternTitel": "KNIGHT RIDER",
      "filmtitel": "Knight Rider",
      "typ": "TV-Serie",
      "jahre": "1982 – 1986",
      "jahr": 1982,
      "lovestoryTitel": "2003 – Ein Auto, ein Kennzeichen, ein Schicksal.",
      "zitat": "Ein Mann, der die Welt verändern will – mit einem Auto, das denken kann.",
      "werSagt": "Wilton Knight ...",
      "szeneBeschreibung": "Aus dem ikonischen Vorspann ...",
      "teaserBild": "images/teaser/01-knight-rider.jpg"
    }
  ]
}
```

**Pflichtfelder:** `nr`, `sternTitel`, `filmtitel`, `jahr`, `zitat`, `lovestoryTitel`  
**Optionale Felder:** `szeneBeschreibung`, `werSagt` (aufklappbar auf Detailseite)  
**Asset-Felder:** `teaserBild` (Pfad zum Teaser-Bild; Fallback: Platzhalter-Gradient wenn Datei fehlt)

---

## Seiten & Features

### 1. Übersichtsseite (`index.html`)

- **Darstellung:** Grid aus Teaser-Kacheln – je Eintrag eine Karte mit:
  - `teaserBild` als Hintergrundbild (Cover-Fit); fehlendes Bild → Gold/Pink-Gradient als Fallback
  - Oberes Overlay: Nummer (`#nr`) + `filmtitel` + `jahre`
  - `lovestoryTitel` als **Gold-Label am unteren Kartenrand** – schmaler, halb-transparenter schwarzer Balken mit goldenem Text, linksbündig, Cinzel-Schrift, Kleinbuchstaben-Kapitälchen (`font-variant: small-caps`)

```
┌─────────────────────────────┐
│  [Teaser-Bild]              │
│  #1  Knight Rider           │  ← oberes Overlay (gold, Cinzel)
│       1982–1986             │
│                             │
│                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← schwarzer Balken (rgba 0,0,0,0.72)
│ 2003 – Ein Auto, ein …     │  ← lovestoryTitel, Gold, Cinzel small-caps
└─────────────────────────────┘
```

- **Eingebundenes Bild:** `restetst/test.png` prominent im Header als Hero-Element oberhalb des Grids
- **Interaktion:** Klick auf eine Kachel → Navigation zur Detailansicht
- **Animationen:**
  - Kacheln erscheinen gestaffelt beim Laden (staggered fade-in + scale)
  - Hover: Teaser-Bild zoomt leicht (`scale(1.06)`), Gold-Glow am Rand, `lovestoryTitel`-Balken fährt leicht nach oben
  - Header mit Lauflichter-Animation (Marquee-Lichter blinkend)

### 2. Detailseite (`detail.html?id=1`)

- **Inhalt (Pflicht, immer sichtbar):**
  - Nummer im Stern
  - `zitat` im Marquee-Schild
  - `filmtitel`, `typ`, `jahre` in der Goldrahmen-Box
  - `lovestoryTitel` prominent als persönlicher Lovestory-Bezug (hervorgehobene Headline unter der Karte)
- **Inhalt (optional/aufklappbar):** `szeneBeschreibung` und `werSagt` – via Toggle/Accordion
- **Navigation:** Zurück-Button + Vor/Zurück zwischen Einträgen
- **Animationen:**
  - Karten-Einflug-Animation beim Laden
  - Glitzer-Partikel am Stern (CSS-only oder leichtgewichtig via Canvas)
  - Marquee-Lichter blinken kontinuierlich
  - Zitat-Text tippt sich ein (typewriter effect)
  - `lovestoryTitel` faded separat mit leichter Verzögerung rein

---

## Design-System

Aus der Design-Referenz (`big.jpg`) abgeleitet:

```css
:root {
  --bg-primary: #0a0a0a;          /* Tiefschwarz – Hintergrund */
  --gold: #d4a843;                /* Gold – Rahmen, Akzente */
  --gold-light: #f0c96a;          /* Helles Gold – Sterne, Lichter */
  --star-pink: #e8a0b4;           /* Glitter-Rosa – Hauptstern */
  --marquee-bg: #f5f0e8;          /* Cremeweiß – Marquee-Schild */
  --marquee-text: #1a1a1a;        /* Fast Schwarz – Schrift im Schild */
  --title-gold: #d4a843;          /* Gold – Filmtitel */
  --font-display: 'Playfair Display', serif;  /* Filmtitel, dekorativ */
  --font-mono: 'Special Elite', monospace;    /* Marquee-Schrift */
  --font-body: 'Nunito', sans-serif;
}
```

### Strukturelemente der Detailkarte

```
┌─────────────────────────────────┐
│  [schwarzer Hintergrund, Sterne]│
│         ★ Glitter-Stern ★       │
│           [  #1  ]              │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ○○○○○○○○○○○○○○○○○○○○○○ │    │  ← Leuchtrahmen (Marquee)
│  │   ZITAT TEXT HIER       │    │
│  │ ○○○○○○○○○○○○○○○○○○○○○○ │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  FILMTITEL              │    │  ← Goldrahmen-Box
│  │  Filmname               │    │
│  │  ★  Typ · Jahr  ★       │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## HTML statt SVG – Analyse & Umsetzungsplan

### Warum kein SVG

| Kriterium | SVG direkt | HTML/CSS Hybrid |
|---|---|---|
| Dateigröße | 6 MB (Canva-Export) | < 10 KB CSS + 1 PNG |
| Daten dynamisch einfügen | Komplex (SVG-DOM, Namespace) | Trivial (`textContent`, `innerHTML`) |
| Animierbarkeit | Nur per SMIL oder viel JS | Native CSS transitions |
| Responsive | Nur mit viewBox-Tricks | Native (aspect-ratio + %) |
| Wartbarkeit | Nicht editierbar ohne Canva | Vollständig im Code |

---

### Anatomie der Walk-of-Fame-Karte (aus `big.jpg` + `karte_leer_01.png`)

Die Karte gliedert sich in **3 Zonen**:

```
┌──────────────────────────────────────┐  ← Gold-Außenrahmen (gesamte Karte)
│                                      │
│   Zone 1 – Sternfeld   (0 – 57 %)   │  Schwarzes Sternenhimmel-Glitzer-Bg
│                                      │
│         ╔══════════╗                 │  ← Pink Glitter-Stern
│         ║  ( #1 )  ║                 │  ← Gold-Kreis mit Nummer (dynamisch)
│         ╚══════════╝                 │
│                                      │
│   ┌──○──○──○──○──○──○──○──○──┐      │  ← Zone 2: Marquee-Schild (47–62 %)
│   │  ZITAT TEXT (dynamisch)  │      │  Glühbirnen-Border, cremefarbener Bg
│   └──○──○──○──○──○──○──○──○──┘      │
│                                      │
├──────────────────────────────────────┤
│   Zone 3 – Infopanel   (62–100 %)   │  Schwarz, Gold-Doppelrahmen
│                                      │
│   STAR THIS PARAGRAPH               │  ← Kleintext, Gold, Cinzel
│   THIS PART IS FOR                  │  ← Kleintext, Gold, Cinzel
│   Knight Rider                      │  ← Filmtitel groß, Skriptschrift
│   ★  TV-Serie · 1982–1986  ★        │  ← Typ + Jahr, Gold, Cinzel
│                                      │
│   ──────────────────────────         │  ← Trennlinie (neu)
│   2003 – Ein Auto, ein …            │  ← lovestoryTitel (neu, kursiv)
│                                      │
└──────────────────────────────────────┘
```

---

### Empfohlene Strategie: PNG-Hybrid + Inline-SVG

Die Implementierung nutzt **drei Ebenen**, je nach verfügbarem Asset:

| Zone | Technik | Warum |
|---|---|---|
| Zone 1: Sternfeld + Stern | `karte_leer_01.png` als `background-image` | Glitter-Textur ist in CSS nicht authentisch nachbildbar |
| Zone 2: Marquee-Schild (Zitat) | `StarFlash_Marquee_mit_Platzhalter.svg` **inline** eingebettet | SVG ist nur 240 Zeilen, vollständig per JS befüllbar, Glühbirnen per CSS animierbar |
| Zone 3: Infopanel (Filmtitel etc.) | Absolut positioniertes HTML über PNG | Einfachste Lösung, kein extra Asset nötig |
| Banner: `lovestoryTitel` | Vereinfachte Version des Marquee-SVG | Gleiche Optik wie Zitat-Schild, aber als breites Banner unterhalb der Karte |

---

### Schlüssel-Asset: `StarFlash_Marquee_mit_Platzhalter.svg`

Diese SVG-Datei ist **klein (240 Zeilen, ~10 KB)** und bereits vollständig als Marquee-Schild ausgebaut:

- `viewBox="0 0 1500 500"` – querformat, ideal als Banner
- Fertige Glühbirnen-Definitionen (`<g id="bulb">`) mit realistischem Glow via `radialGradient`
- 30 Birnen oben, 30 unten, 7 links und rechts
- 4 Textplatzhalter-Zeilen mit bekannten `y`-Positionen (135, 220, 305, 390)
- Holz/Metall-Rahmen-Gradient + cremefarbene Innentafel mit Glanzlicht

**Verwendung:** Das SVG wird per `fetch()` geladen oder direkt inline in die HTML-Seite eingebettet. JS ersetzt dann die `<text>`-Inhalte:

```js
// Zitat ins Marquee-Schild injizieren
svgDoc.querySelector('#placeholderText text:nth-child(1)').textContent = eintrag.zitat;

// lovestoryTitel ins Banner injizieren
bannerSvg.querySelector('#placeholderText text:nth-child(1)').textContent = eintrag.lovestoryTitel;
```

**Glühbirnen-Animation:** Die `<use>`-Elemente der Birnen bekommen CSS-Klassen und blinken per `@keyframes` mit gestaffeltem `animation-delay`:

```css
#bulbsTop use:nth-child(odd)  { animation: bulbOn 1.4s 0.0s infinite alternate; }
#bulbsTop use:nth-child(even) { animation: bulbOn 1.4s 0.7s infinite alternate; }
@keyframes bulbOn {
  from { opacity: 0.3; }
  to   { opacity: 1.0; }
}
```

---

### `lovestoryTitel` als Banner (Detailseite)

Der Banner erscheint **unterhalb der Karte**, in voller Breite – gleiche Marquee-Optik wie das Zitat-Schild:

```
┌─────────────────────────────────────────────────────────────┐
│  Walk-of-Fame-Karte (2:3, karte_leer_01.png + Overlays)    │
└─────────────────────────────────────────────────────────────┘

○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
┌─────────────────────────────────────────────────────────────┐
│   2003 – Ein Auto, ein Kennzeichen, ein Schicksal.          │  ← lovestoryTitel
└─────────────────────────────────────────────────────────────┘
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
```

Das Banner nutzt **dasselbe SVG**, aber mit nur 1 aktiver Textzeile (Zeile 1) und ggf. reduzierter Höhe via `viewBox`-Anpassung per JS (`viewBox="0 100 1500 300"` schneidet die ungenutzten Zeilen weg).

---

### Was ist bereits vorhanden

| Asset | Status | Verwendung |
|---|---|---|
| `StarFlash_Karten_leer_fuer_Canva/karte_leer_01.png` | ✅ vorhanden | Hintergrundbild Zone 1 (alle 10 Karten) |
| `source/StarFlash_Marquee_mit_Platzhalter.svg` | ✅ vorhanden | Zitat-Schild + lovestoryTitel-Banner |
| `data/walloffame.json` | ✅ fertig | Alle Textinhalte inkl. `lovestoryTitel` |
| Google Font: **Cinzel Bold** | ✅ kostenlos | Labels, Typ/Jahr-Zeile |
| Google Font: **Great Vibes** | ✅ kostenlos | Filmtitel-Skriptschrift |
| Farbpalette | ✅ im JSON | CSS-Variablen |

---

### Was noch fehlt

| Was | Warum nötig | Entscheidung |
|---|---|---|
| **Genaue Position des Nummern-Overlays** | `#nr` muss auf den Sternkreis von `karte_leer_01.png` passen | Per DevTools kalibrieren (ca. 50% links, 38% von oben) |
| **Teaser-Bilder** (`images/teaser/`) | ✅ vorhanden | `poster-1.jpg` … `poster-10.jpg` |
| **`lovestoryTitel` auf Übersichtsseite** | ✅ Entschieden | Gold-Label am unteren Kartenrand (schwarzer Balken, Cinzel small-caps) |

---

### Kartenaufbau als HTML-Struktur (Detailseite)

```html
<article class="wof-card">

  <!-- Zone 1: Stern + Nummern-Overlay -->
  <div class="wof-star-zone">
    <!-- karte_leer_01.png via CSS background-image -->
    <span class="wof-number">#1</span>   <!-- absolut zentriert auf dem Kreis -->
  </div>

  <!-- Zone 2: Zitat-Marquee (SVG inline) -->
  <div class="wof-marquee-wrap">
    <!-- StarFlash_Marquee_mit_Platzhalter.svg wird hier per JS injiziert -->
    <!-- JS setzt: text[0].textContent = eintrag.zitat -->
  </div>

  <!-- Zone 3: Infopanel -->
  <div class="wof-info">
    <p class="wof-label">STAR THIS PARAGRAPH</p>
    <p class="wof-sublabel">THIS PART IS FOR</p>
    <p class="wof-filmtitel">Knight Rider</p>
    <p class="wof-meta">★&ensp;TV-Serie · 1982–1986&ensp;★</p>
  </div>

</article>

<!-- lovestoryTitel-Banner (SVG inline, volle Breite) -->
<div class="wof-banner-wrap">
  <!-- Gleiche SVG-Struktur, viewBox auf 1 Zeile reduziert -->
  <!-- JS setzt: text[0].textContent = eintrag.lovestoryTitel -->
</div>
```

**Skalierung:** `wof-card` bekommt `aspect-ratio: 2/3` und `width: min(420px, 100%)`. Alle Abstände in `%` relativ zur Kartengröße. Der Banner darunter ist `width: 100%`, `max-width: 900px`.

---

## Projektstruktur

```
corabell-walloffame-2/
├── index.html              ← Übersichtsseite
├── detail.html             ← Detailseite (bekommt ?id= Parameter)
├── data/
│   └── walloffame.json     ← Alle extrahierten Einträge (fertig)
├── images/
│   └── teaser/             ← Teaser-Bilder pro Eintrag (01-knight-rider.jpg etc.)
│                              NOCH BEREITZUSTELLEN – Fallback: Gradient
├── css/
│   ├── base.css            ← Variablen, Reset, Typografie
│   ├── overview.css        ← Styles Übersichtsseite inkl. Teaser-Grid
│   └── detail.css          ← Styles Detailseite
├── js/
│   ├── data.js             ← JSON laden + Helper
│   ├── overview.js         ← Kacheln rendern (teaserBild + lovestoryTitel) + Animationen
│   └── detail.js           ← Detailkarte rendern (lovestoryTitel als Headline) + Animationen
└── source/                 ← Alle Original-Assets (unverändert)
```

---

## Animations-Konzept

### Übersichtsseite
- **Entrance:** `IntersectionObserver` → Karten faden gestaffelt rein (`animation-delay: calc(var(--i) * 80ms)`)
- **Hover:** Stern-Glow via `filter: drop-shadow(0 0 12px var(--gold))` + `transform: scale(1.05) rotate(-1deg)`
- **Hintergrund:** Subtile CSS-Keyframe-Animation mit langsam driftenden Glitzer-Punkten (pure CSS, kein JS)

### Detailseite
- **Einflug:** Karte fährt von unten rein (`translateY(60px) → translateY(0)`, `ease-out`, 600ms)
- **Marquee-Lichter:** CSS `@keyframes blink` mit gestaffeltem Delay pro Licht-Kreis
- **Zitat:** Typewriter-Effekt via JS (`setInterval`, Zeichen für Zeichen)
- **Stern-Glitzer:** Kleine `<span>` Elemente mit zufälligen Positionen und CSS-Keyframes (kein Canvas nötig)
- **Seitenübergang:** `View Transitions API` (Chrome 111+) oder `history.pushState` + CSS fade

---

## Extrahierte Daten (vollständig)

Die JSON-Datei `data/walloffame.json` ist fertig befüllt. Sie enthält:
- Alle **10 Filmeinträge** mit allen Pflicht- und Optionalfeldern
- Die **Farbpalette** aus dem PDF als `palette`-Objekt

### Alle 10 Einträge

| # | Filmtitel | Jahr | Lovestory-Titel (aus seite-43-lovestory.png) |
|---|---|---|---|
| 1 | Knight Rider | 1982–1986 | 2003 – Ein Auto, ein Kennzeichen, ein Schicksal. |
| 2 | Notting Hill | 1999 | 2003 – Die Schwägerin weiß es zuerst |
| 3 | Shrek – Der tollkühne Held | 2001 | Ostern 2003 – „Ralf der tollkühne Held" |
| 4 | Einer flog über das Kuckucksnest | 1975 | 2005 – Gemeinsames Nest oder Irrenanstalt |
| 5 | Kuck mal, wer da spricht! | 1989 | 2007 – „Hallo, ich bin neu hier" – die Geburt des ersten Sohnes |
| 6 | Verrückt nach Mary | 1998 | 2008 – „Verrückt nach Platz": Umzug in die Theo-Neubauer-Straße |
| 7 | Findet Nemo | 2003 | 2010 – „Findet Emil": Die Geburt des zweiten Sohns |
| 8 | Die Hochzeit meines besten Freundes | 1997 | 2017 – „Die Hochzeit meiner besten Freunde": Verlobung mit Ansage |
| 9 | Und täglich grüßt das Murmeltier | 1993 | 2026 – Déjà-vu oder spätes Revival – oder doch schon Demenz? |
| 10 | Harry und Sally | 1989 | 2026 – Was lange währt, wird endlich gut |

### Farbpalette (aus PDF)

| Element | Hex-Code |
|---|---|
| Hintergrund schwarz | `#0F0F12` |
| Gold (Rahmen) | `#D4AF5F` |
| Gold hell (Akzente) | `#EBC878` |
| Gold dunkel | `#967332` |
| Pink (Stern hell) | `#FAD2D7` |
| Weiß (Filmtitel) | `#F5F0E6` |
| Schwarz im Stern | `#08080A` |

---

## Offene Punkte vor Entwicklungsstart

1. **Teaser-Bilder (`images/teaser/`):** 10 Bilder müssen noch geliefert werden (je 1 pro Eintrag). Empfohlenes Format: JPG, 600×400 px. Dateinamen: `01-knight-rider.jpg` … `10-harry-und-sally.jpg`. Solange fehlend → Gold/Pink-Gradient als automatischer Fallback.
2. **Foto (`restetst/test.png`):** Positionierung auf der Übersichtsseite noch offen – aktuell eingeplant als Hero-Bild über dem Grid.
3. **Kartenfarben:** Alle 10 Karten haben dieselbe Farbpalette. Soll jede Karte eine individuelle Akzentfarbe bekommen?
4. **Hosting:** Statisch (GitHub Pages, Netlify, lokaler Server)?
