/*
 * Benutzerkonten und Abgleich zwischen Geräten (über Supabase).
 *
 * Ohne Einstellungen in config.js bleibt alles aus, und die App speichert nur lokal.
 * Mit Konto wird der Fortschritt nach jeder Änderung mit dem Server abgeglichen.
 */
(function () {
  const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js";
  const cfg = window.KOMPASS_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey);
  const K = () => window.Kompass;
  const esc = (s) => window.WidgetParts.esc(s == null ? "" : s);

  let client = null;
  let user = null;
  let ready = false;
  let loadError = false;
  let status = "idle"; // idle | saving | saved | offline
  let lastSaved = null;
  let urlMessage = null; // Hinweis nach Klick auf einen E-Mail-Link
  let busy = false, again = false, timer = null;
  const listeners = [];
  const notify = () => listeners.forEach((f) => f());

  const baseUrl = () => location.origin + location.pathname;

  /* Objekte mit sortierten Schlüsseln vergleichen (die Datenbank ändert die Reihenfolge) */
  function stable(v) {
    if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
    if (v && typeof v === "object") return "{" + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ":" + stable(v[k])).join(",") + "}";
    return JSON.stringify(v);
  }

  function loadLibrary() {
    return new Promise((resolve, reject) => {
      if (window.supabase && window.supabase.createClient) return resolve();
      const s = document.createElement("script");
      s.src = LIB;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Bibliothek konnte nicht geladen werden"));
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!enabled) return;
    try {
      await loadLibrary();
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
      });
      client.auth.onAuthStateChange((event, session) => {
        const before = user && user.id;
        user = session ? session.user : null;
        if (event === "PASSWORD_RECOVERY") location.hash = "#konto-passwort";
        // Supabase empfiehlt, im Callback selbst keine weiteren Anfragen abzuwarten
        if (user && user.id !== before) setTimeout(() => sync(true), 0);
        notify();
      });
      const { data } = await client.auth.getSession();
      user = data.session ? data.session.user : null;
      readUrl();
    } catch (e) {
      console.warn(e);
      loadError = true;
    }
    ready = true;
    notify();
  }

  /* Rückkehr von einem E-Mail-Link: Meldung merken und Adresse aufräumen */
  function readUrl() {
    const q = new URLSearchParams(location.search);
    const h = new URLSearchParams(location.hash.replace(/^#/, ""));
    const err = q.get("error_description") || h.get("error_description");
    let target = null;
    if (err) {
      urlMessage = { bad: true, text: /expired|invalid/i.test(err) ? "Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an." : err };
      target = "#konto";
    } else if (q.has("passwort")) {
      target = user ? "#konto-passwort" : "#konto";
      if (!user) urlMessage = { bad: true, text: "Der Link zum Zurücksetzen hat nicht funktioniert. Öffne ihn im selben Browser, in dem du ihn angefordert hast, oder fordere einen neuen an." };
    } else if (q.has("code")) {
      urlMessage = user
        ? { text: "Deine E-Mail-Adresse ist bestätigt. Willkommen!" }
        : { text: "Deine E-Mail-Adresse ist bestätigt. Melde dich jetzt an." };
      target = "#konto";
    }
    if (location.search || err) {
      const keep = /^#[a-z0-9-]*$/i.test(location.hash) ? location.hash : "";
      // Die App zeichnet die Seite neu, sobald die Anmeldung bereit ist
      history.replaceState(null, "", baseUrl() + (target || keep));
    }
  }

  /* Fortschritt mit dem Server abgleichen: holen, zusammenführen, hochladen */
  async function sync(render) {
    if (!client || !user) return;
    if (busy) { again = true; return; }
    busy = true;
    status = "saving";
    notify();
    try {
      const { data, error } = await client.from("progress").select("state").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      const local = K().getState();
      const merged = K().merge(local, (data && data.state) || {});
      if (stable(merged) !== stable(local)) K().replaceState(merged, render);
      if (!data || stable(merged) !== stable(data.state)) {
        const { error: upErr } = await client
          .from("progress")
          .upsert({ user_id: user.id, state: merged, updated_at: new Date().toISOString() });
        if (upErr) throw upErr;
      }
      status = "saved";
      lastSaved = new Date();
    } catch (e) {
      console.warn("Abgleich fehlgeschlagen", e);
      status = "offline";
    }
    busy = false;
    notify();
    if (again) { again = false; sync(); }
  }

  function scheduleSync() {
    if (!user) return;
    clearTimeout(timer);
    timer = setTimeout(() => sync(), 1500);
  }
  document.addEventListener("visibilitychange", () => {
    if (!user) return;
    if (document.visibilityState === "hidden") { clearTimeout(timer); sync(); }
    else sync(true);
  });
  window.addEventListener("online", () => user && sync());

  /* ---------- Fehlermeldungen verständlich machen ---------- */
  function message(err) {
    const code = (err && err.code) || "";
    const msg = (err && err.message) || "";
    if (code === "invalid_credentials" || /invalid login/i.test(msg)) return "E-Mail oder Passwort stimmt nicht.";
    if (code === "email_not_confirmed" || /not confirmed/i.test(msg)) return "Bitte bestätige zuerst deine E-Mail-Adresse. Schau in dein Postfach, auch in den Spam-Ordner.";
    if (code === "user_already_exists" || /already registered/i.test(msg)) return "Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich an.";
    if (code === "weak_password" || /password should/i.test(msg)) return "Das Passwort ist zu schwach. Nimm mindestens 8 Zeichen.";
    if (code === "same_password") return "Das neue Passwort muss sich vom alten unterscheiden.";
    if (/rate limit/i.test(code + msg)) return "Gerade wurden zu viele E-Mails verschickt. Versuch es in einer Stunde noch einmal.";
    if (code === "email_address_invalid" || /invalid.*email|email.*invalid/i.test(msg)) return "Diese E-Mail-Adresse sieht nicht gültig aus.";
    if (/fetch|network/i.test(msg)) return "Keine Verbindung zum Server. Prüfe dein Internet und versuch es noch einmal.";
    return "Das hat nicht geklappt: " + msg;
  }

  /* ---------- Aktionen ---------- */
  async function signUp(name, email, password) {
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: baseUrl() }
    });
    if (error) throw error;
    // Supabase meldet bei bereits vergebenen Adressen aus Datenschutzgründen keinen Fehler
    if (data.user && data.user.identities && data.user.identities.length === 0) throw { code: "user_already_exists" };
    return { confirm: !data.session };
  }
  async function signIn(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function resetPassword(email) {
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: baseUrl() + "?passwort=neu" });
    if (error) throw error;
  }
  async function updatePassword(password) {
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
  }
  async function signOut() {
    clearTimeout(timer);
    await sync();
    if (status === "offline") throw { message: "unsaved" };
    await client.auth.signOut();
    user = null;
    K().clearLocal();
  }
  async function deleteAccount() {
    const { error } = await client.rpc("delete_my_account");
    if (error) throw error;
    await client.auth.signOut({ scope: "local" });
    user = null;
    K().clearLocal();
  }

  /* ---------- Kontoseite ---------- */
  const displayName = () => (user && ((user.user_metadata && user.user_metadata.name) || user.email)) || "";

  function statusText() {
    if (status === "saving") return "Wird gespeichert …";
    if (status === "offline") return "Gerade nicht gespeichert, weil keine Verbindung besteht. Dein Fortschritt bleibt auf diesem Gerät und wird später nachgeholt.";
    if (lastSaved) return "In deinem Konto gespeichert um " + lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr.";
    return "Wird mit deinem Konto abgeglichen.";
  }

  function render(app, mode) {
    const head = (title, text) => `<section class="hero"><span class="eyebrow">Konto</span><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</section>`;
    if (!enabled) {
      app.innerHTML = head("Konten sind noch nicht eingerichtet", "Du lernst gerade ohne Konto. Dein Fortschritt wird nur in diesem Browser gespeichert.") +
        `<section class="panel"><h2>Für die Betreiberin oder den Betreiber</h2><p>Damit sich Menschen registrieren können, muss die App einmalig mit Supabase verbunden werden. Die Anleitung steht in der Datei <b>KONTEN-EINRICHTEN.md</b> im Projekt.</p></section>`;
      return;
    }
    if (!ready) { app.innerHTML = head("Verbinde …", ""); return; }
    if (loadError) {
      app.innerHTML = head("Gerade keine Verbindung", "Der Anmeldedienst ist nicht erreichbar. Prüfe deine Internetverbindung und lade die Seite neu. Du kannst trotzdem weiterlernen. Dein Fortschritt wird auf diesem Gerät gespeichert.");
      return;
    }
    const msg = urlMessage ? `<p class="form-msg ${urlMessage.bad ? "bad" : "good"}" role="status">${esc(urlMessage.text)}</p>` : "";
    urlMessage = null;

    if (user && mode === "passwort") {
      app.innerHTML = head("Neues Passwort festlegen", "") + `<section class="panel auth">
        <form id="f-pass" class="form" novalidate>
          <div class="field"><label for="np">Neues Passwort</label><input id="np" type="password" autocomplete="new-password" minlength="8" required></div>
          <button class="btn" type="submit">Passwort speichern</button>
          <p class="form-msg" role="status"></p>
        </form></section>`;
      bind("#f-pass", async (f, out) => {
        const pw = f.querySelector("#np").value;
        if (pw.length < 8) return say(out, "Nimm mindestens 8 Zeichen.", true);
        await updatePassword(pw);
        location.hash = "#konto";
        urlMessage = { text: "Dein neues Passwort ist gespeichert." };
      });
      return;
    }

    if (user) {
      app.innerHTML = head("Dein Konto", "") + msg + `
        <section class="panel">
          <div class="row"><span class="avatar big">${esc(displayName().slice(0, 1).toUpperCase())}</span>
            <div class="stack" style="gap:0;min-width:0"><b>${esc(displayName())}</b><span class="small muted" style="overflow-wrap:anywhere">${esc(user.email)}</span></div></div>
          <p class="sync ${status}" id="sync-status" role="status">${statusText()}</p>
          <p class="small muted">Dein Lernfortschritt, deine Ziele und Notizen werden in deinem Konto gespeichert. Melde dich auf einem anderen Gerät mit derselben E-Mail an, dann ist alles da.</p>
          <div class="row"><button type="button" class="btn ghost" id="logout">Abmelden</button></div>
          <p class="form-msg" id="logout-msg" role="status"></p>
        </section>
        <section class="panel"><h2>Passwort ändern</h2>
          <form id="f-change" class="form" novalidate>
            <div class="field"><label for="cp">Neues Passwort</label><input id="cp" type="password" autocomplete="new-password" minlength="8" required></div>
            <button class="btn ghost" type="submit">Passwort ändern</button>
            <p class="form-msg" role="status"></p>
          </form>
        </section>
        <section class="panel"><h2>Konto löschen</h2>
          <p class="small muted">Löscht dein Konto und alles, was darin gespeichert ist, endgültig.</p>
          <div class="row" id="del-row"><button type="button" class="btn ghost" id="del">Konto löschen</button></div>
        </section>`;
      app.querySelector("#logout").addEventListener("click", async (e) => {
        e.target.disabled = true;
        try {
          await signOut();
          urlMessage = { text: "Du bist abgemeldet. Dein Fortschritt ist in deinem Konto gespeichert und wurde von diesem Gerät entfernt." };
          location.hash = "#konto";
          render(app, "");
        } catch (err) {
          e.target.disabled = false;
          say(app.querySelector("#logout-msg"), err.message === "unsaved"
            ? "Abmelden geht gerade nicht, weil dein letzter Fortschritt noch nicht gespeichert ist. Prüfe deine Internetverbindung und versuch es noch einmal."
            : message(err), true);
        }
      });
      bind("#f-change", async (f, out) => {
        const pw = f.querySelector("#cp").value;
        if (pw.length < 8) return say(out, "Nimm mindestens 8 Zeichen.", true);
        await updatePassword(pw);
        f.reset();
        say(out, "Dein neues Passwort ist gespeichert.");
      });
      app.querySelector("#del").addEventListener("click", () => {
        const row = app.querySelector("#del-row");
        row.innerHTML = `<span>Wirklich löschen? Das lässt sich nicht rückgängig machen.</span>
          <button type="button" class="btn danger" id="del-yes">Ja, Konto löschen</button>
          <button type="button" class="btn ghost" id="del-no">Abbrechen</button>`;
        row.querySelector("#del-no").addEventListener("click", () => render(app, ""));
        row.querySelector("#del-yes").addEventListener("click", async (e) => {
          e.target.disabled = true;
          try {
            await deleteAccount();
            urlMessage = { text: "Dein Konto und alle gespeicherten Daten sind gelöscht." };
            render(app, "");
          } catch (err) {
            row.innerHTML = `<p class="form-msg bad">${esc(message(err))}</p>`;
          }
        });
      });
      return;
    }

    // Abgemeldet: Anmelden, Registrieren, Passwort vergessen
    const tab = mode === "neu" ? "neu" : mode === "vergessen" ? "vergessen" : "login";
    const hasLocal = K().hasProgress();
    app.innerHTML = head(tab === "neu" ? "Konto erstellen" : tab === "vergessen" ? "Passwort vergessen" : "Anmelden",
      "Mit einem Konto ist dein Fortschritt auf allen Geräten da: am Handy, Tablet und Computer.") + msg + `
      <section class="panel auth">
        ${tab !== "vergessen" ? `<div class="seg" role="group" aria-label="Anmelden oder registrieren">
          <a href="#konto" aria-current="${tab === "login" ? "page" : "false"}">Anmelden</a>
          <a href="#konto-neu" aria-current="${tab === "neu" ? "page" : "false"}">Registrieren</a></div>` : ""}
        ${tab === "login" ? `<form id="f-login" class="form" novalidate>
            <div class="field"><label for="le">E-Mail</label><input id="le" type="email" autocomplete="email" required></div>
            <div class="field"><label for="lp">Passwort</label><input id="lp" type="password" autocomplete="current-password" required></div>
            <button class="btn" type="submit">Anmelden</button>
            <a class="small" href="#konto-vergessen">Passwort vergessen?</a>
            <p class="form-msg" role="status"></p></form>` : ""}
        ${tab === "neu" ? `<form id="f-new" class="form" novalidate>
            <div class="field"><label for="nn">Vorname oder Spitzname</label><input id="nn" type="text" autocomplete="given-name" maxlength="40" required></div>
            <div class="field"><label for="ne">E-Mail</label><input id="ne" type="email" autocomplete="email" required></div>
            <div class="field"><label for="np2">Passwort</label><input id="np2" type="password" autocomplete="new-password" minlength="8" required><span class="small muted">Mindestens 8 Zeichen</span></div>
            <button class="btn" type="submit">Konto erstellen</button>
            <p class="small muted">Dein Lernfortschritt, deine Ziele und Notizen werden in deinem Konto gespeichert.${cfg.privacyUrl ? ` Mehr dazu in der <a href="${esc(cfg.privacyUrl)}" target="_blank" rel="noopener">Datenschutzerklärung</a>.` : ""}</p>
            <p class="form-msg" role="status"></p></form>` : ""}
        ${tab === "vergessen" ? `<form id="f-forgot" class="form" novalidate>
            <p class="muted">Gib deine E-Mail-Adresse ein. Du bekommst einen Link, mit dem du ein neues Passwort festlegst.</p>
            <div class="field"><label for="fe">E-Mail</label><input id="fe" type="email" autocomplete="email" required></div>
            <button class="btn" type="submit">Link schicken</button>
            <a class="small" href="#konto">Zurück zur Anmeldung</a>
            <p class="form-msg" role="status"></p></form>` : ""}
        ${hasLocal && tab !== "vergessen" ? `<p class="tip small"><strong>Gut zu wissen:</strong> Was du auf diesem Gerät schon gelernt hast, wird in dein Konto übernommen.</p>` : ""}
      </section>`;

    const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    bind("#f-login", async (f, out) => {
      const email = f.querySelector("#le").value.trim(), pw = f.querySelector("#lp").value;
      if (!validEmail(email) || !pw) return say(out, "Bitte gib E-Mail und Passwort ein.", true);
      await signIn(email, pw);
      location.hash = "#start";
    });
    bind("#f-new", async (f, out) => {
      const name = f.querySelector("#nn").value.trim(), email = f.querySelector("#ne").value.trim(), pw = f.querySelector("#np2").value;
      if (!name) return say(out, "Wie dürfen wir dich nennen?", true);
      if (!validEmail(email)) return say(out, "Diese E-Mail-Adresse sieht nicht gültig aus.", true);
      if (pw.length < 8) return say(out, "Das Passwort braucht mindestens 8 Zeichen.", true);
      const res = await signUp(name, email, pw);
      if (res.confirm) {
        f.innerHTML = `<p class="form-msg good" role="status"><b>Fast geschafft!</b> Wir haben dir eine E-Mail an ${esc(email)} geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen. Schau auch im Spam-Ordner nach.</p>`;
      } else location.hash = "#start";
    });
    bind("#f-forgot", async (f, out) => {
      const email = f.querySelector("#fe").value.trim();
      if (!validEmail(email)) return say(out, "Diese E-Mail-Adresse sieht nicht gültig aus.", true);
      await resetPassword(email);
      say(out, "Falls es ein Konto mit dieser Adresse gibt, ist der Link unterwegs. Öffne ihn im selben Browser.");
    });
  }

  function say(out, text, bad) {
    out.textContent = text;
    out.className = "form-msg " + (bad ? "bad" : "good");
  }
  function bind(sel, handler) {
    const f = document.querySelector(sel);
    if (!f) return;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      const out = f.querySelector(".form-msg");
      if (btn) btn.disabled = true;
      try { await handler(f, out); }
      catch (err) { say(out, message(err), true); }
      if (btn) btn.disabled = false;
    });
  }

  // Statuszeile auf der Kontoseite live aktualisieren
  listeners.push(() => {
    const el = document.getElementById("sync-status");
    if (el) { el.textContent = statusText(); el.className = "sync " + status; }
  });

  window.Cloud = {
    enabled,
    init,
    render,
    scheduleSync,
    onChange: (f) => listeners.push(f),
    get user() { return user; },
    get ready() { return ready; },
    get name() { return displayName(); }
  };
})();
