/*
 * Einstellungen der App: Benutzerkonten und Angaben für Impressum und Datenschutzerklärung.
 *
 * Solange supabaseUrl und supabaseKey leer sind, läuft die App ohne Konten:
 * Der Fortschritt bleibt dann nur im Browser des jeweiligen Geräts.
 *
 * Wie du die Werte bekommst, steht Schritt für Schritt in KONTEN-EINRICHTEN.md.
 */
window.KOMPASS_CONFIG = {
  // Project URL aus Supabase, z. B. "https://abcdefghijkl.supabase.co"
  supabaseUrl: "https://xrmdidlasfrzaoxcifnd.supabase.co",

  // Publishable key (oder "anon public" key) aus Supabase. Dieser Schlüssel darf öffentlich sein.
  supabaseKey: "sb_publishable_HpkUkdzcJjysDgGTMMlfTg_2HaN2e2Z",

  // Optional: Link zu einer externen Datenschutzerklärung. Leer lassen, dann wird die Seite in der App verwendet.
  privacyUrl: "",

  // Angaben für Impressum und Datenschutzerklärung.
  // Leere Felder erscheinen in der App als gelb markierte Platzhalter.
  betreiber: {
    name: "",      // Vor- und Nachname oder Firmenname mit Rechtsform
    anschrift: "", // Straße und Hausnummer
    ort: "",       // Postleitzahl und Ort, z. B. "1010 Wien"
    email: ""      // E-Mail-Adresse für Kontakt und Datenschutzanfragen
  }
};
