# Mein Kompass

Eine interaktive Lern-App: Man lernt Schritt für Schritt über **Geld und das Finanzsystem**, **praktische Werkzeuge**, **persönliche Stärken** und **Selbstverwirklichung**. Dazu gibt es Rechner, Diagramme, Quizfragen und Fragen zum Nachdenken.

## Was die App kann

- **4 Module mit 15 Lektionen**, jede etwa 4 bis 6 Minuten lang
  - Geld & Finanzsystem: Was ist Geld, wie entsteht Geld, Inflation, Zinseszins
  - Werkzeuge für dein Geld: 50/30/20-Budget, Notgroschen, ETFs und Streuung
  - Deine Stärken: Was ist eine Stärke, Stärken-Check, Möglichkeiten daraus
  - Selbstverwirklichung & Entwicklung: Bedürfnispyramide, Lebensrad, Ikigai, SMART-Ziele, Gewohnheiten
- **Interaktive Elemente**: Sparplan-Rechner, Inflationsrechner, Bilanz-Spiel zur Geldentstehung, Budget-Planer, Aktien-Simulation, Stärken-Netzdiagramm, Lebensrad, Ikigai-Diagramm, Zielbaukasten
- **Spielelemente**: Erfahrungspunkte (XP), Level und Lernserie (Tage in Folge)
- **Mein Kompass**: Hier sammeln sich Stärkenprofil, Lebensrad, Ziele, Ikigai und deine Notizen
- Läuft auf **Handy, Tablet und Computer**, mit hellem und dunklem Design
- **Datenschutz**: Alles wird nur im Browser auf dem eigenen Gerät gespeichert, nichts wird verschickt

## App ausprobieren

**Am Computer:** Lade das Projekt herunter (auf GitHub: grüner Button „Code“, dann „Download ZIP“), entpacke es und öffne die Datei `index.html` per Doppelklick. Die App öffnet sich im Browser.

**Für alle im Internet (kostenlos über GitHub Pages):**

1. Im GitHub-Projekt oben auf **Settings** klicken
2. Links **Pages** wählen
3. Bei „Branch“ den Zweig mit der App auswählen (z. B. `main`), Ordner `/ (root)`, dann **Save**
4. Nach ein bis zwei Minuten erscheint dort ein Link wie `https://<dein-name>.github.io/First/`

Diesen Link kannst du am Handy öffnen und über „Zum Startbildschirm hinzufügen“ wie eine App ablegen.

## Inhalte ändern

Alle Texte, Quizfragen und Lektionen stehen in **`js/content.js`**. Die Datei ist so aufgebaut, dass du Texte anpassen kannst, ohne programmieren zu können. Oben in der Datei steht, welche Arten von Schritten es gibt.

## Aufbau des Projekts

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst der Seite |
| `css/style.css` | Farben, Schriften, Layout |
| `js/content.js` | Alle Lerninhalte |
| `js/widgets.js` | Die interaktiven Rechner und Diagramme |
| `js/app.js` | Navigation, Fortschritt, Punkte |
| `js/icons.js` | Symbole |

## Hinweis

Die Finanzinhalte sind allgemeine Bildung und keine Anlage- oder Steuerberatung.
