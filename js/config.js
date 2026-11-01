/*
 * Einstellungen für Benutzerkonten.
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
  supabaseKey: "",

  // Optional: Link zu deiner Datenschutzerklärung, wird bei der Registrierung angezeigt
  privacyUrl: ""
};
