# Benutzerkonten einrichten

Damit sich Menschen in „Mein Kompass“ registrieren können und ihr Fortschritt auf allen Geräten verfügbar ist, wird die App mit **Supabase** verbunden. Supabase ist ein Dienst, der Benutzerkonten und eine Datenbank bereitstellt. Für den Anfang reicht der kostenlose Tarif.

Du brauchst dafür etwa 15 Minuten und keine Programmierkenntnisse. Solange die Verbindung nicht eingerichtet ist, funktioniert die App ganz normal ohne Konten.

## 1. Supabase-Projekt anlegen

1. Gehe auf [supabase.com](https://supabase.com) und registriere dich (zum Beispiel mit deinem GitHub-Konto).
2. Klicke auf **New project**.
3. Fülle aus:
   - **Name:** zum Beispiel `mein-kompass`
   - **Database Password:** ein langes Passwort. Speichere es in deinem Passwort-Manager. Die App braucht es nicht, du aber vielleicht später.
   - **Region:** **Central EU (Frankfurt)**. So bleiben die Daten in der EU.
4. Klicke auf **Create new project** und warte, bis das Projekt fertig ist (1 bis 2 Minuten).

## 2. Datenbank vorbereiten

1. Klicke links auf **SQL Editor**.
2. Öffne im Projekt die Datei [`supabase/setup.sql`](supabase/setup.sql), kopiere den **gesamten Inhalt** und füge ihn in den SQL Editor ein.
3. Klicke auf **Run**. Unten sollte „Success“ stehen.

Damit entsteht eine Tabelle für den Lernfortschritt. Jede Person kann darin nur ihre eigenen Daten lesen und ändern.

## 3. Adresse der App eintragen

Supabase muss wissen, wohin es nach dem Klick auf einen Bestätigungslink weiterleiten darf.

1. Klicke links auf **Authentication** und dann auf **URL Configuration**.
2. Trage bei **Site URL** `https://chris666-web.github.io/First/` ein. Wie die App über GitHub Pages veröffentlicht wird, steht in der [README](README.md).
3. Trage dieselbe Adresse zusätzlich bei **Redirect URLs** ein und speichere. Wichtig ist der abschließende Schrägstrich `/`.

## 4. Schlüssel in die App eintragen

1. Klicke oben im Projekt auf **Connect** oder gehe zu **Project Settings → API Keys**.
2. Du brauchst zwei Werte:
   - die **Project URL**, zum Beispiel `https://abcdefghijkl.supabase.co`
   - den **Publishable key** (in älteren Projekten heißt er **anon public**)
3. Öffne im Projekt die Datei [`js/config.js`](js/config.js) und trage beide Werte zwischen die Anführungszeichen ein:

```js
window.KOMPASS_CONFIG = {
  supabaseUrl: "https://abcdefghijkl.supabase.co",
  supabaseKey: "sb_publishable_...",
  privacyUrl: ""
};
```

Auf GitHub geht das direkt im Browser: Datei öffnen, auf das Stift-Symbol klicken, ändern, unten auf **Commit changes** klicken. Achte darauf, dass du dabei auf dem Branch **`main`** bist, denn nur `main` wird live ausgeliefert.

> **Wichtig:** Trage nur den *Publishable key* oder den *anon public* key ein. Er darf öffentlich sein. Den **secret key** oder den **service_role key** niemals in die App eintragen. Damit hätte jede Person Vollzugriff auf alle Daten.

## 5. Ausprobieren

Öffne die App, tippe oben rechts auf das Personen-Symbol und erstelle ein Konto. Du bekommst eine E-Mail mit einem Bestätigungslink. Nach dem Klick darauf bist du angemeldet. Melde dich danach auf einem zweiten Gerät an. Dein Fortschritt ist dort ebenfalls da.

## Gut zu wissen

- **E-Mail-Versand:** Supabase verschickt im kostenlosen Tarif nur wenige E-Mails pro Stunde. Zum Testen reicht das. Bevor viele Menschen die App nutzen, solltest du unter **Authentication → Emails → SMTP Settings** einen eigenen E-Mail-Dienst eintragen (zum Beispiel Brevo, Resend oder das Postfach deines E-Mail-Anbieters). Dort kannst du auch die Texte der E-Mails auf Deutsch ändern.
- **Pausierung:** Kostenlose Projekte werden nach einer Woche ohne Nutzung pausiert. Du kannst sie im Supabase-Dashboard mit einem Klick wieder starten.
- **Rechtliches:** Sobald fremde Menschen Konten anlegen, brauchst du in Deutschland ein **Impressum** und eine **Datenschutzerklärung**. Beide Seiten sind in der App schon vorhanden. Deine Angaben trägst du in `js/config.js` unter `betreiber` ein. Lass dich dazu im Zweifel rechtlich beraten.
- **Was gespeichert wird:** E-Mail-Adresse, Name, erledigte Lektionen, Quizergebnisse, Eingaben in den Rechnern, Ziele und Notizen.
- **Konto löschen:** Nutzerinnen und Nutzer können ihr Konto in der App unter „Konto“ selbst löschen. Dabei werden auch alle gespeicherten Daten entfernt.
