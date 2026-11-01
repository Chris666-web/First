# Mein Kompass

Eine interaktive Lern-App: Man lernt Schritt für Schritt über **Geld und das Finanzsystem**, **praktische Werkzeuge**, **persönliche Stärken** und **Selbstverwirklichung**. Dazu gibt es Rechner, Diagramme, Quizfragen und Fragen zum Nachdenken.

## Was die App kann

- **7 Module mit 24 Lektionen**, jede etwa 4 bis 7 Minuten lang
  - Geld & Finanzsystem: Was ist Geld, wie entsteht Geld, Inflation, Zinseszins
  - Werkzeuge für dein Geld: 50/30/20-Budget, Notgroschen, ETFs und Streuung
  - Steuern verstehen: Einkommensteuer, Steuererklärung und Werbungskosten, Steuern auf Zinsen und Aktien
  - Absicherung & Altersvorsorge: Wichtige und unnötige Versicherungen, die drei Säulen der Rente, Rentenlücke
  - Deine Stärken: Was ist eine Stärke, Stärken-Check, Möglichkeiten daraus
  - Verhandeln: Grundlagen nach dem Harvard-Konzept, Gehaltsverhandlung, Verhandeln im Alltag
  - Selbstverwirklichung & Entwicklung: Bedürfnispyramide, Lebensrad, Ikigai, SMART-Ziele, Gewohnheiten
- **Interaktive Elemente**: Sparplan-Rechner, Inflationsrechner, Bilanz-Spiel zur Geldentstehung, Budget-Planer, Aktien-Simulation, Steuertarif-Rechner, Werbungskosten-Check, Kapitalertragsteuer-Rechner, Versicherungs-Check, Rentenlücken-Rechner, Übung zu Positionen und Interessen, Gehalts-Verhandlungskarte, Stärken-Netzdiagramm, Lebensrad, Ikigai-Diagramm, Zielbaukasten
- **Spielelemente**: Erfahrungspunkte (XP), Level und Lernserie (Tage in Folge)
- **Mein Kompass**: Hier sammeln sich Stärkenprofil, Lebensrad, Ziele, Ikigai und deine Notizen
- **Benutzerkonten** (optional): Registrieren, Anmelden, Passwort vergessen, Konto löschen. Der Fortschritt wird zwischen Handy, Tablet und Computer abgeglichen.
- Läuft auf **Handy, Tablet und Computer**, mit hellem und dunklem Design
- **Ohne Konto** bleibt alles nur im Browser auf dem eigenen Gerät

## Benutzerkonten einschalten

Die App läuft sofort ohne Konten. Damit sich Menschen registrieren können, wird sie einmalig mit dem kostenlosen Dienst Supabase verbunden. Die Schritt-für-Schritt-Anleitung steht in **[KONTEN-EINRICHTEN.md](KONTEN-EINRICHTEN.md)**.

## App ausprobieren

**Am Computer:** Lade das Projekt herunter (auf GitHub: grüner Button „Code“, dann „Download ZIP“), entpacke es und öffne die Datei `index.html` per Doppelklick. Die App öffnet sich im Browser.

**Für alle im Internet (kostenlos über GitHub Pages):**

GitHub Pages funktioniert kostenlos nur bei **öffentlichen** Repositories. Bei einem privaten Repository braucht es GitHub Pro oder einen anderen kostenlosen Hoster wie Cloudflare Pages oder Netlify.

1. Im GitHub-Projekt oben auf **Settings** klicken
2. Links **Pages** wählen
3. Bei „Branch“ **`main`** auswählen und bei Ordner **`/ (root)`**, dann **Save**. Die App liegt direkt im Hauptverzeichnis, deshalb nicht `/docs` wählen.
4. Nach ein bis zwei Minuten ist die App unter `https://chris666-web.github.io/First/` erreichbar.

Änderungen gehen immer zuerst auf den Entwicklungs-Branch. Erst wenn sie per Pull Request in `main` übernommen sind, erscheinen sie auf der Live-Seite.

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
| `js/cloud.js` | Benutzerkonten und Abgleich zwischen Geräten |
| `js/config.js` | Zugangsdaten für Supabase (hier trägst du sie ein) |
| `supabase/setup.sql` | Einrichtung der Datenbank in Supabase |
| `js/icons.js` | Symbole |

## Hinweis

Die Finanz-, Steuer- und Vorsorgeinhalte sind allgemeine Bildung nach Stand 2026 und keine Anlage-, Steuer- oder Versicherungsberatung. Beträge wie Grundfreibetrag oder Pendlerpauschale ändern sich regelmäßig und sollten jährlich geprüft werden. Sie stehen in `js/content.js` und `js/widgets.js`.
