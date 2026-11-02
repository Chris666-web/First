/*
 * Impressum und Datenschutzerklärung.
 *
 * Deine Angaben (Name, Anschrift, E-Mail) trägst du nicht hier ein,
 * sondern in js/config.js unter "betreiber". Fehlende Angaben erscheinen
 * in der App gelb markiert.
 *
 * Wichtig: Die Texte beschreiben, was die App technisch tut (Stand November 2026).
 * Wenn neue Dienste dazukommen (z. B. ein eigener E-Mail-Anbieter oder ein anderer
 * Hoster), muss die Datenschutzerklärung angepasst werden. Sie ersetzt keine
 * Rechtsberatung. Vor einem kommerziellen Start bitte prüfen lassen.
 */
(function () {
  const STAND = "November 2026";
  const esc = (s) => window.WidgetParts.esc(s == null ? "" : s);
  const b = () => (window.KOMPASS_CONFIG && window.KOMPASS_CONFIG.betreiber) || {};
  const val = (key, label) => (b()[key] ? esc(b()[key]) : `<mark class="ph">[${label}]</mark>`);
  const mail = () => (b().email ? `<a href="mailto:${esc(b().email)}">${esc(b().email)}</a>` : val("email", "E-Mail-Adresse"));

  function impressum() {
    return `
      <section class="hero"><span class="eyebrow">Rechtliches</span><h1>Impressum</h1></section>
      <div class="legal">
        <section>
          <h2>Offenlegung gemäß § 25 Mediengesetz</h2>
          <p><b>Medieninhaber und Herausgeber:</b><br>${val("name", "Vor- und Nachname")}<br>${val("ort", "Wohnort")}, Österreich</p>
          <p><b>Kontakt:</b> ${mail()}</p>
          <p><b>Grundlegende Richtung:</b> Bildungsangebot zu Geld, Finanzen und persönlicher Entwicklung.</p>
        </section>
        <section>
          <h2>Hinweis zu den Inhalten</h2>
          <p>Die Inhalte dieser App dienen der allgemeinen Bildung. Sie sind keine Anlage-, Steuer-, Versicherungs- oder Rechtsberatung und ersetzen keine individuelle Beratung. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird keine Gewähr übernommen.</p>
        </section>
        <section>
          <h2>Urheberrecht</h2>
          <p>Texte, Grafiken und Programmcode dieser App sind urheberrechtlich geschützt. Eine Verwendung ohne Zustimmung ist nicht gestattet.</p>
          <p class="small muted">Verwendete Schriften: Atkinson Hyperlegible, Bricolage Grotesque und IBM Plex Mono, jeweils unter der SIL Open Font License 1.1. Programmbibliothek: supabase-js unter der MIT-Lizenz.</p>
        </section>
      </div>`;
  }

  function datenschutz() {
    return `
      <section class="hero"><span class="eyebrow">Rechtliches</span><h1>Datenschutzerklärung</h1><p>Stand: ${STAND}</p></section>
      <div class="legal">
        <section>
          <h2>1. Verantwortlicher</h2>
          <address>${val("name", "Vor- und Nachname")}<br>${val("anschrift", "Straße und Hausnummer")}<br>${val("ort", "PLZ und Ort")}, Österreich<br>E-Mail: ${mail()}</address>
          <p>Bei Fragen zum Datenschutz erreichst du uns unter dieser E-Mail-Adresse.</p>
        </section>

        <section>
          <h2>2. Überblick</h2>
          <p>Du kannst die App ohne Konto nutzen. Dann bleibt dein Lernfortschritt ausschließlich in deinem Browser auf deinem Gerät und wird nicht an uns übertragen.</p>
          <p>Wir verwenden keine Werbung, keine Analyse- oder Tracking-Dienste und verkaufen keine Daten. Schriften und Programmbibliotheken sind direkt in der App enthalten. Beim Aufruf werden dafür keine Daten an Schriften- oder Bibliotheksanbieter übertragen.</p>
        </section>

        <section>
          <h2>3. Bereitstellung der App</h2>
          <p>Die App wird über GitHub Pages bereitgestellt (GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA). Beim Aufruf verarbeitet GitHub technisch notwendige Daten wie deine IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und den Browsertyp, um die App auszuliefern und die Sicherheit zu gewährleisten.</p>
          <p>Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und funktionierenden Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden. Die Übermittlung stützt sich auf das EU-US Data Privacy Framework, nach dem GitHub zertifiziert ist.</p>
        </section>

        <section>
          <h2>4. Speicherung auf deinem Gerät</h2>
          <p>Die App speichert deinen Lernfortschritt, deine Eingaben und, wenn du angemeldet bist, deine Anmeldesitzung im lokalen Speicher deines Browsers (Local Storage). Das ist für die von dir gewünschte Funktion technisch erforderlich (§ 165 Abs. 3 TKG 2021). Cookies zu Werbe- oder Analysezwecken setzen wir nicht.</p>
          <p>Du kannst diese Daten jederzeit löschen: in der App unter „Mein Kompass“ mit „Fortschritt zurücksetzen“, durch Abmelden oder über die Einstellungen deines Browsers.</p>
        </section>

        <section>
          <h2>5. Benutzerkonto</h2>
          <p>Wenn du ein Konto erstellst, verarbeiten wir:</p>
          <ul>
            <li>E-Mail-Adresse</li>
            <li>Vorname oder Spitzname</li>
            <li>Passwort (nur verschlüsselt gespeichert, wir können es nicht einsehen)</li>
            <li>Lernfortschritt, Quizergebnisse und Punkte</li>
            <li>deine Eingaben in den Lektionen, zum Beispiel Budget-, Gehalts- und Rentenzahlen, Versicherungs-Check, Ziele, Stärkenprofil und Notizen</li>
          </ul>
          <p>Zweck ist, dir die App mit Konto bereitzustellen und deinen Fortschritt zwischen deinen Geräten abzugleichen. Rechtsgrundlage ist die Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).</p>
          <p>Nach der Registrierung erhältst du eine E-Mail zur Bestätigung deiner Adresse. Ebenso bekommst du eine E-Mail, wenn du dein Passwort zurücksetzt. Diese E-Mails werden über Supabase versendet (siehe Punkt 6).</p>
          <p><b>Bitte gib in den Notizfeldern keine besonders sensiblen Daten ein</b>, etwa zu deiner Gesundheit.</p>
        </section>

        <section>
          <h2>6. Auftragsverarbeiter: Supabase</h2>
          <p>Konten und Daten werden bei Supabase, Inc. (USA) gespeichert. Die Daten liegen auf Servern in Irland (EU). Supabase verarbeitet sie ausschließlich in unserem Auftrag auf Grundlage eines Auftragsverarbeitungsvertrags nach Art. 28 DSGVO. Soweit dabei ein Zugriff aus den USA möglich ist, ist er durch die Standardvertragsklauseln der EU-Kommission abgesichert, die Teil dieses Vertrags sind.</p>
          <p>Beim Anmelden und Abgleichen verarbeitet Supabase außerdem technisch notwendige Daten wie deine IP-Adresse in Protokollen, die nach kurzer Zeit automatisch gelöscht werden.</p>
        </section>

        <section>
          <h2>7. Speicherdauer</h2>
          <p>Wir speichern deine Kontodaten, solange dein Konto besteht. Du kannst dein Konto jederzeit in der App unter „Konto“ selbst löschen. Dabei werden alle gespeicherten Daten entfernt.</p>
        </section>

        <section>
          <h2>8. Weitergabe</h2>
          <p>Wir geben deine Daten nicht an Dritte weiter. Ausnahmen sind die oben genannten Dienstleister, soweit dies für den Betrieb der App nötig ist, und Fälle, in denen wir gesetzlich dazu verpflichtet sind.</p>
        </section>

        <section>
          <h2>9. Alter</h2>
          <p>Die App richtet sich an Personen ab 14 Jahren.</p>
        </section>

        <section>
          <h2>10. Deine Rechte</h2>
          <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Schreib uns dazu einfach eine E-Mail an ${mail()}.</p>
          <p>Wenn du meinst, dass die Verarbeitung deiner Daten gegen das Datenschutzrecht verstößt, kannst du dich bei der Aufsichtsbehörde beschweren. In Österreich ist das die Datenschutzbehörde, Barichgasse 40–42, 1030 Wien, <a href="https://www.dsb.gv.at" target="_blank" rel="noopener">www.dsb.gv.at</a>.</p>
        </section>
      </div>`;
  }

  window.Legal = {
    render(app, page) {
      app.innerHTML = page === "impressum" ? impressum() : datenschutz();
    }
  };
})();
