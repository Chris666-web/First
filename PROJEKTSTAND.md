# Projektstand „Mein Kompass“

Zuletzt aktualisiert: 3. November 2026

> **Für Claude in einem neuen Chat:** Diese Datei ist der aktuelle Stand des
> Projekts. Bitte zuerst lesen. Die Person hinter dem Projekt hat keine
> Programmierkenntnisse: Schritte einfach und auf Deutsch erklären.
> Nach größeren Änderungen diese Datei mit aktualisieren.

## Was ist das Projekt?
Eine interaktive Lern-App (Web-App, am Handy wie eine App nutzbar) zu Geld,
Finanzen, Steuern, Vorsorge, persönlichen Stärken, Verhandeln und
Selbstverwirklichung. Wohnsitz des Betreibers: Österreich. Die App soll später
kommerziell werden.

- Repository: github.com/Chris666-web/First (öffentlich)
- Live-Version: https://chris666-web.github.io/First/ (GitHub Pages, Branch main, Ordner / (root))
- Arbeitsweise: Änderungen auf dem Branch
  `claude/interactive-learning-app-personal-dev-vbn9on`, dann Pull Request nach
  main, den der Betreiber selbst merged. Erst nach dem Merge ist es live.

## 1. Architektur und Tech-Stack
- Reine Web-App ohne Build-Schritt: HTML, CSS, JavaScript (kein Framework)
- Seitennavigation über die Adresse (#start, #modul-geld, #lektion-geld-1,
  #profil, #konto, #impressum, #datenschutz)
- Diagramme als selbst gezeichnete SVGs, keine Diagramm-Bibliothek
- Datenbank und Benutzerkonten: Supabase (Server in Irland/EU), angebunden
  über die Bibliothek supabase-js 2.117.3, die direkt im Projekt liegt
- Tabelle „progress“ (eine Zeile pro Person, Lernstand als JSON),
  Zugriffsschutz per Row Level Security, Funktion delete_my_account
- Ohne Konto wird alles nur im Browser gespeichert (localStorage)
- Schriften liegen im Projekt. Beim Öffnen wird kein fremder Server kontaktiert.
  Supabase erst bei Anmeldung und Abgleich.

## 2. Was schon läuft
- 7 Module, 24 Lektionen: Geld & Finanzsystem, Werkzeuge für dein Geld,
  Steuern verstehen, Absicherung & Altersvorsorge, Deine Stärken, Verhandeln,
  Selbstverwirklichung & Entwicklung
- Lektionen aus Schritten: Text, interaktives Element, Quiz, Nachdenkfrage
- Rund 20 interaktive Elemente, z. B. Sparplan-, Inflations-, Steuertarif-,
  Werbungskosten- und Rentenlücken-Rechner, Versicherungs-Check,
  Stärken-Check, Lebensrad, Ikigai, SMART-Ziele, Gehalts-Verhandlungskarte
- XP, Level, Lernserie; Seite „Mein Kompass“ mit Stärkenprofil, Lebensrad,
  Zielen, Ikigai, Journal
- Benutzerkonten: Registrieren mit Bestätigungsmail, Anmelden, Passwort
  vergessen/ändern, Konto löschen, Abgleich zwischen Geräten (live getestet)
- Impressum (§ 25 Mediengesetz) und Datenschutzerklärung als Seiten in der App,
  Betreiberdaten werden aus js/config.js eingesetzt
- Helles und dunkles Design, funktioniert am Handy und am Computer

## 3. Dateistruktur
- `index.html` – Grundgerüst, lädt alle Dateien
- `css/style.css` – Farben, Layout, Design
- `css/fonts.css` + `fonts/` – lokal eingebundene Schriften (SIL Open Font License)
- `js/content.js` – ALLE Lerninhalte (Module, Lektionen, Texte, Quizfragen)
- `js/widgets.js` – alle interaktiven Rechner und Diagramme
- `js/app.js` – Navigation, Fortschritt, XP, Profilseite, Zusammenführen von Gerät und Konto
- `js/cloud.js` – Benutzerkonten und Abgleich mit Supabase
- `js/legal.js` – Texte von Impressum und Datenschutzerklärung
- `js/config.js` – Supabase-Zugangsdaten und Betreiberangaben
- `js/icons.js` – Symbole
- `js/vendor/supabase.js` – Supabase-Bibliothek (MIT-Lizenz)
- `supabase/setup.sql` – Einrichtung der Datenbank
- `README.md`, `KONTEN-EINRICHTEN.md` – Anleitungen auf Deutsch
- `PROJEKTSTAND.md` – diese Datei
- `manifest.webmanifest`, `icon.svg` – für „Zum Startbildschirm hinzufügen“

## 4. Offene Baustellen
Keine bekannten Fehler. Offen sind:
- Supabase-Auftragsverarbeitungsvertrag (DPA) noch abschließen
- Eigener E-Mail-Versand (SMTP) und deutsche E-Mail-Texte in Supabase,
  weil der kostenlose Versand nur wenige Mails pro Stunde schafft.
  Danach Datenschutzerklärung (js/legal.js) ergänzen.
- In der Datenschutzerklärung prüfen: GitHub im EU-US Data Privacy Framework
  zertifiziert? Standardvertragsklauseln im Supabase-DPA? Altersgrenze „ab 14“ passend?
- Steuerbeträge 2026 gegenprüfen (Grundfreibetrag 12.348 €, Pendlerpauschale
  0,38 € ab 1. km, Homeoffice 6 €/Tag bis 1.260 €, Arbeitnehmer-Pauschbetrag 1.230 €)
- Feedback-Knopf: Weg über E-Mail ist zu umständlich, daher vorerst zurückgestellt.
  Bessere Lösung (z. B. Formular in der App) später überlegen.

Erledigt am 3. November 2026: Diagramme zeichnen sich beim Drehen des Handys
sofort neu; bereits gelöste Quizfragen müssen beim Wiederholen nicht nochmal
beantwortet werden; der Datenschutz-Link im Registrierformular öffnet sich in
einem neuen Fenster, die Eingaben bleiben erhalten.

## 5. Nächste geplante Schritte
1. App 3 bis 5 Testpersonen geben (Feedback-Weg noch klären)
2. Steuerbeträge 2026 gegenprüfen
3. Eigenen E-Mail-Versand in Supabase einrichten
4. App-Namen und Rechtsform klären (WKO-Gründerservice), Rechtstexte prüfen lassen
5. Vor dem kommerziellen Start: Repository privat, Umzug auf Cloudflare Pages,
   eigene Domain (danach Adressen in Supabase und Datenschutzerklärung anpassen)
6. Später je nach Feedback: Erinnerungen, Logo, weitere Lektionen

## Arbeiten mit Claude
- Neuer Chat: einfach schreiben „Lies PROJEKTSTAND.md und mach weiter mit …“
- Einen neuen Chat beginnen, wenn ein Thema abgeschlossen ist oder der
  Verlauf lang wird (Faustregel: ab etwa 150.000 bis 200.000 verbrauchten Tokens)
