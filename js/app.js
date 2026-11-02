/*
 * Steuerung der App: Seiten anzeigen, Fortschritt speichern, Punkte vergeben.
 */
(function () {
  const STORE_KEY = "kompass.v1";
  const XP_LESSON = 20;
  const XP_QUIZ = 5;
  const XP_LEVEL = 100;
  const { esc } = window.WidgetParts;

  /* ---------- Speichern (nur im Browser dieses Geräts) ---------- */
  const fresh = () => ({ xp: 0, done: {}, quiz: {}, notes: {}, data: {}, ts: {}, streak: { count: 0, last: null } });
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY));
      return Object.assign(fresh(), raw || {});
    } catch (e) {
      return fresh();
    }
  }
  let state = load();
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* Speicher nicht verfügbar */ }
    renderStats();
  }
  function save() {
    persist();
    if (window.Cloud) Cloud.scheduleSync();
  }

  /* XP ergeben sich immer aus erledigten Lektionen und beim ersten Versuch gelösten Quizfragen */
  const xpOf = (s) => Object.keys(s.done).length * XP_LESSON + Object.keys(s.quiz).length * XP_QUIZ;

  /*
   * Zwei Spielstände zusammenführen (dieses Gerät + Konto).
   * Erledigtes wird vereinigt, bei Notizen und Eingaben gewinnt die neuere Änderung.
   */
  function merge(localIn, remoteIn) {
    let a = Object.assign(fresh(), localIn), b = Object.assign(fresh(), remoteIn);
    const ra = a.resetAt || 0, rb = b.resetAt || 0;
    if (rb > ra) a = Object.assign(fresh(), { resetAt: rb });
    if (ra > rb) b = Object.assign(fresh(), { resetAt: ra });
    const out = fresh();
    if (a.resetAt) out.resetAt = a.resetAt;
    out.done = Object.assign({}, b.done);
    Object.keys(a.done).forEach((k) => { if (!out.done[k] || a.done[k] < out.done[k]) out.done[k] = a.done[k]; });
    out.quiz = Object.assign({}, b.quiz, a.quiz);
    const keys = new Set([...Object.keys(a.ts), ...Object.keys(b.ts)]);
    [["data", "data"], ["notes", "note"]].forEach(([coll, p]) => [a, b].forEach((s) => Object.keys(s[coll]).forEach((k) => keys.add(p + ":" + k))));
    keys.forEach((key) => {
      const i = key.indexOf(":"), kind = key.slice(0, i), name = key.slice(i + 1);
      const coll = kind === "data" ? "data" : kind === "note" ? "notes" : null;
      if (!coll) return;
      const ta = a.ts[key] || 0, tb = b.ts[key] || 0;
      let src = ta > tb ? a : tb > ta ? b : a[coll][name] !== undefined ? a : b;
      if (src[coll][name] !== undefined) out[coll][name] = src[coll][name];
      if (ta || tb) out.ts[key] = Math.max(ta, tb);
    });
    const la = a.streak.last || "", lb = b.streak.last || "";
    out.streak = la > lb ? a.streak : lb > la ? b.streak : { count: Math.max(a.streak.count, b.streak.count), last: a.streak.last };
    out.xp = xpOf(out);
    return out;
  }

  window.Kompass = {
    getData: (k) => state.data[k],
    setData: (k, v) => { state.data[k] = v; state.ts["data:" + k] = Date.now(); save(); },
    getState: () => state,
    merge,
    hasProgress: () => Object.keys(state.done).length > 0 || Object.keys(state.notes).length > 0 || Object.keys(state.data).length > 0,
    /* Stand aus dem Konto übernehmen. Während einer Lektion wird die Seite nicht neu gezeichnet. */
    replaceState(s, rerender) {
      state = Object.assign(fresh(), s);
      persist();
      if (rerender && !location.hash.startsWith("#lektion-")) route();
    },
    /* Beim Abmelden: alles von diesem Gerät entfernen */
    clearLocal() {
      state = fresh();
      run = null;
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* egal */ }
      renderStats();
    }
  };

  const today = () => new Date().toISOString().slice(0, 10);
  function touchStreak() {
    const t = today();
    if (state.streak.last === t) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    state.streak.count = state.streak.last === y ? state.streak.count + 1 : 1;
    state.streak.last = t;
  }
  function liveStreak() {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    return state.streak.last === today() || state.streak.last === y ? state.streak.count : 0;
  }

  /* ---------- Daten-Helfer ---------- */
  const MODULES = window.MODULES;
  const findModule = (id) => MODULES.find((m) => m.id === id);
  const findLesson = (lid) => {
    for (const m of MODULES) {
      const i = m.lessons.findIndex((l) => l.id === lid);
      if (i >= 0) return { module: m, lesson: m.lessons[i], index: i };
    }
    return null;
  };
  const doneCount = (m) => m.lessons.filter((l) => state.done[l.id]).length;
  const nextLessonIn = (m) => m.lessons.find((l) => !state.done[l.id]);
  const isUnlocked = (m, i) => i === 0 || !!state.done[m.lessons[i - 1].id];
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalDone = () => Object.keys(state.done).length;
  const level = () => Math.floor(state.xp / XP_LEVEL) + 1;

  function ring(m) {
    const r = 19, c = 2 * Math.PI * r, p = doneCount(m) / m.lessons.length;
    return `<svg class="ring" viewBox="0 0 46 46" aria-label="${doneCount(m)} von ${m.lessons.length} Lektionen erledigt">
      <circle class="bg" cx="23" cy="23" r="${r}"/>
      <circle class="fg" cx="23" cy="23" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 23 23)"/>
      <text x="23" y="27" text-anchor="middle">${doneCount(m)}/${m.lessons.length}</text></svg>`;
  }
  const mc = (m) => `--mc: var(--m-${m.id})`;

  /* ---------- Kopfzeile ---------- */
  const app = document.getElementById("app");
  function renderStats() {
    const s = document.getElementById("stats");
    if (!s) return;
    s.innerHTML = `<span class="pill xp" title="Erfahrungspunkte">${ICON("star")}<span class="num">${state.xp}</span> XP</span>
      <span class="pill streak" title="Tage in Folge gelernt">${ICON("flame")}<span class="num">${liveStreak()}</span></span>`;
  }
  function renderAccountButton() {
    const el = document.getElementById("account");
    if (!el || !window.Cloud || !Cloud.enabled) return;
    el.hidden = false;
    if (Cloud.user) {
      el.innerHTML = `<span class="avatar">${esc(Cloud.name.slice(0, 1).toUpperCase())}</span>`;
      el.setAttribute("aria-label", "Dein Konto: " + Cloud.name);
      el.title = Cloud.name;
    } else {
      el.innerHTML = ICON("user");
      el.setAttribute("aria-label", "Anmelden");
      el.title = "Anmelden";
    }
  }
  function setTab(name) {
    document.querySelectorAll(".tab").forEach((t) => (t.dataset.tab === name ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current")));
  }

  /* ---------- Startseite ---------- */
  function renderHome() {
    setTab("start");
    let next = null;
    for (const m of MODULES) { const l = nextLessonIn(m); if (l) { next = { m, l }; break; } }
    const lv = level(), into = state.xp % XP_LEVEL;
    app.innerHTML = `
      <section class="hero">
        <span class="eyebrow">Dein Lernpfad</span>
        <h1>Geld verstehen. Stärken entdecken. Deinen Weg gehen.</h1>
        <p>Kurze, interaktive Lektionen zu Finanzen, Werkzeugen, persönlichen Stärken und Entwicklung. Schritt für Schritt, in deinem Tempo.</p>
        <div class="level">
          <div class="level-badge" aria-label="Level ${lv}">${lv}</div>
          <div class="row" style="justify-content:space-between"><b>Level ${lv}</b><span class="small muted num">${into} / ${XP_LEVEL} XP</span></div>
          <div class="bar"><span style="width:${into}%"></span></div>
        </div>
      </section>
      ${window.Cloud && Cloud.enabled && Cloud.ready && !Cloud.user
        ? `<a class="banner" href="#konto">${ICON("user")}<span><b>Lernst du auf mehreren Geräten?</b> Mit einem kostenlosen Konto ist dein Fortschritt überall dabei.</span></a>`
        : ""}
      ${next
        ? `<a class="continue" href="#lektion-${next.l.id}">
            <div class="stack"><span class="eyebrow">${totalDone() ? "Weiter lernen" : "Hier starten"} · ${esc(next.m.short)}</span><h3>${esc(next.l.title)}</h3><span class="small">${next.l.minutes} Minuten</span></div>
            <span class="go">${ICON("arrow")}</span></a>`
        : `<div class="continue"><div class="stack"><span class="eyebrow">Alles geschafft</span><h3>Du hast alle ${totalLessons} Lektionen abgeschlossen.</h3></div></div>`}
      <section class="stack">
        <h2>Module</h2>
        <div class="modules">${MODULES.map(
          (m) => `<a class="module-card" style="${mc(m)}" href="#modul-${m.id}">
            <div class="top"><span class="module-icon">${ICON(m.icon)}</span>${ring(m)}</div>
            <h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p></a>`
        ).join("")}</div>
      </section>`;
  }

  /* ---------- Modulseite ---------- */
  function renderModule(id) {
    const m = findModule(id);
    if (!m) return renderHome();
    setTab("start");
    const next = nextLessonIn(m);
    app.innerHTML = `
      <a class="back" href="#start">${ICON("back")} Alle Module</a>
      <section class="module-head" style="${mc(m)}">
        <span class="module-icon">${ICON(m.icon)}</span>
        <h1>${esc(m.title)}</h1>
        <p class="muted">${esc(m.desc)} · ${doneCount(m)} von ${m.lessons.length} Lektionen erledigt</p>
      </section>
      <ol class="path">${m.lessons.map((l, i) => {
        const done = state.done[l.id], open = isUnlocked(m, i), isNext = next && next.id === l.id;
        const cls = done ? "is-done" : isNext ? "is-next" : open ? "" : "is-locked";
        const inner = `<span class="eyebrow">Lektion ${i + 1} · ${l.minutes} Min.</span><h3>${esc(l.title)}</h3>`;
        return `<li class="${cls}" style="${mc(m)}">
          <span class="node">${done ? ICON("check") : open ? i + 1 : ICON("lock")}</span>
          ${open ? `<a class="lesson-link" href="#lektion-${l.id}">${inner}</a>` : `<div class="lesson-link" aria-disabled="true">${inner}<span class="small">Schließe zuerst die vorige Lektion ab.</span></div>`}
        </li>`;
      }).join("")}</ol>
      ${m.disclaimer ? `<p class="disclaimer">${esc(m.disclaimer)}</p>` : ""}`;
  }

  /* ---------- Lektion ---------- */
  let run = null; // laufende Lektion

  function renderLesson(lid) {
    const found = findLesson(lid);
    if (!found) return renderHome();
    if (!isUnlocked(found.module, found.index)) return renderModule(found.module.id);
    setTab("start");
    if (!run || run.id !== lid) run = { id: lid, step: 0, correct: 0, earned: 0 };
    drawStep(found);
  }

  function drawStep(found) {
    const { module: m, lesson: l } = found;
    const total = l.steps.length;
    if (run.step >= total) return drawFinish(found);
    const st = l.steps[run.step];
    app.innerHTML = `
      <div class="lesson-top">
        <a class="back" href="#modul-${m.id}" aria-label="Lektion verlassen">${ICON("back")}</a>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${run.step}"><span style="width:${(run.step / total) * 100}%"></span></div>
        <span class="small num muted">${run.step + 1}/${total}</span>
      </div>
      <article class="step" id="step"></article>
      <div class="lesson-actions">
        ${run.step > 0 ? '<button type="button" class="btn ghost" id="prev">Zurück</button>' : ""}
        <button type="button" class="btn" id="next">Weiter ${ICON("arrow")}</button>
      </div>`;
    const box = document.getElementById("step");
    const nextBtn = document.getElementById("next");
    const go = (d) => { run.step += d; drawStep(found); window.scrollTo({ top: 0, behavior: "smooth" }); };
    nextBtn.addEventListener("click", () => go(1));
    const prev = document.getElementById("prev");
    if (prev) prev.addEventListener("click", () => go(-1));

    if (st.type === "text") {
      box.innerHTML = `<span class="eyebrow">${esc(l.title)}</span><h2>${st.title}</h2>
        <div class="body">${st.body}
        ${st.points ? `<ul class="points">${st.points.map((p) => `<li><span>${p}</span></li>`).join("")}</ul>` : ""}
        ${st.tip ? `<p class="tip">${st.tip}</p>` : ""}</div>`;
    } else if (st.type === "widget") {
      box.innerHTML = `<span class="eyebrow">Ausprobieren</span><h2>${st.title}</h2>${st.intro ? `<p class="muted">${st.intro}</p>` : ""}<div id="widget"></div>`;
      const w = window.Widgets[st.widget];
      if (w) w(document.getElementById("widget"), { block: (b) => (nextBtn.disabled = b) });
    } else if (st.type === "quiz") {
      drawQuiz(box, st, l, nextBtn);
    } else if (st.type === "reflect") {
      const val = state.notes[st.id] ? state.notes[st.id].text : "";
      box.innerHTML = `<span class="eyebrow">Nachdenken</span><h2>Deine Gedanken</h2>
        <label for="note">${st.prompt}</label>
        <textarea id="note" placeholder="${esc(st.placeholder || "Schreib einfach drauflos …")}">${esc(val)}</textarea>
        <p class="small muted">Wird nur auf diesem Gerät gespeichert und erscheint in deinem Journal. Du kannst den Schritt auch überspringen.</p>`;
      document.getElementById("note").addEventListener("input", (e) => {
        const text = e.target.value;
        if (text.trim()) state.notes[st.id] = { text, prompt: st.prompt, lesson: l.title, date: today() };
        else delete state.notes[st.id];
        state.ts["note:" + st.id] = Date.now();
        save();
      });
    }
  }

  function drawQuiz(box, st, l, nextBtn) {
    const key = l.id + ":" + run.step;
    box.innerHTML = `<span class="eyebrow">Quiz</span><h2>${st.q}</h2>
      <div class="options">${st.options.map((o, i) => `<button type="button" class="option" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></button>`).join("")}</div>
      <div id="fb" aria-live="polite"></div>`;
    nextBtn.disabled = true;
    let tries = 0;
    box.querySelectorAll(".option").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.dataset.i;
        tries++;
        const fb = document.getElementById("fb");
        if (i === st.correct) {
          b.classList.add("correct");
          box.querySelectorAll(".option").forEach((x) => (x.disabled = true));
          let bonus = "";
          if (tries === 1 && !state.quiz[key]) {
            state.quiz[key] = true;
            state.xp += XP_QUIZ;
            run.earned += XP_QUIZ;
            run.correct++;
            save();
            bonus = ` +${XP_QUIZ} XP`;
          }
          fb.innerHTML = `<div class="feedback good"><strong>Richtig!${bonus}</strong>${st.explain}</div>`;
          nextBtn.disabled = false;
        } else {
          b.classList.add("wrong");
          b.disabled = true;
          fb.innerHTML = `<div class="feedback bad"><strong>Noch nicht ganz.</strong>Versuch es noch einmal.</div>`;
        }
      })
    );
  }

  function drawFinish(found) {
    const { module: m, lesson: l, index } = found;
    if (!state.done[l.id]) {
      state.done[l.id] = today();
      state.xp += XP_LESSON;
      run.earned += XP_LESSON;
      touchStreak();
      save();
    }
    const nxt = m.lessons[index + 1];
    app.innerHTML = `<article class="step finish">
      <svg class="confetti" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="38" style="fill:var(--gold-soft)"/>
        <path d="m60 36 7 14.5 16 2.3-11.5 11.2 2.7 15.9L60 72.4l-14.2 7.5 2.7-15.9L37 52.8l16-2.3z" style="fill:var(--gold)"/>
        <circle cx="18" cy="30" r="5" style="fill:var(--s1)"/><circle cx="102" cy="26" r="4" style="fill:var(--s2)"/>
        <circle cx="100" cy="96" r="6" style="fill:var(--s3)"/><circle cx="20" cy="94" r="4" style="fill:var(--m-entwicklung)"/>
      </svg>
      <span class="eyebrow">Lektion abgeschlossen</span>
      <h2>${esc(l.title)}</h2>
      <p class="big-fact">+${run.earned} XP</p>
      <p class="muted">${liveStreak() > 1 ? `Du lernst seit ${liveStreak()} Tagen in Folge. Bleib dran!` : "Stark! Komm morgen wieder, dann startet deine Serie."}</p>
      <div class="row" style="justify-content:center">
        <a class="btn ghost" href="#modul-${m.id}">Zum Modul</a>
        ${nxt ? `<a class="btn" href="#lektion-${nxt.id}">Nächste Lektion ${ICON("arrow")}</a>` : `<a class="btn" href="#start">Zur Übersicht</a>`}
      </div>
    </article>`;
    run = null;
  }

  /* ---------- Mein Kompass (Profil) ---------- */
  function renderProfile() {
    setTab("profil");
    const P = window.WidgetParts;
    const st = state.data.strengths;
    const complete = st && Object.keys(st.answers || {}).length === P.QUESTIONS.length;
    const wheel = state.data.lifewheel;
    const iki = state.data.ikigai;
    const goals = state.data.goals || [];
    const notes = Object.values(state.notes).sort((a, b) => (a.date < b.date ? 1 : -1));
    const ikiOv = iki ? P.ikigaiOverlaps(iki) : [];
    app.innerHTML = `
      <section class="hero">
        <span class="eyebrow">Mein Kompass</span>
        <h1>Was du über dich herausgefunden hast</h1>
        <p>${totalDone()} von ${totalLessons} Lektionen · Level ${level()} · ${state.xp} XP</p>
      </section>
      <div class="two-col" style="align-items:start">
        <section class="panel"><h2>Stärkenprofil</h2>
          ${complete
            ? `<div class="chart">${P.radar(P.DIMS.map((d) => d.name), P.strengthScores(st.answers), 5)}</div>
               <p>Am stärksten: <b>${P.topStrengths(st.answers).map((t) => t.name).join(" und ")}</b></p>`
            : `<p class="empty">Noch kein Ergebnis. Mach den Stärken-Check im Modul <a href="#modul-staerken">Deine Stärken</a>.</p>`}
        </section>
        <section class="panel"><h2>Lebensrad</h2>
          ${wheel
            ? `<div class="chart">${P.wheel(wheel)}</div>`
            : `<p class="empty">Noch nicht ausgefüllt. Du findest es im Modul <a href="#modul-entwicklung">Selbstverwirklichung & Entwicklung</a>.</p>`}
        </section>
      </div>
      <section class="panel"><h2>Meine Ziele</h2>
        ${goals.length
          ? `<div class="journal">${goals.map((g, i) => `<article><div class="q">Gesetzt am ${new Date(g.created + "T12:00:00").toLocaleDateString("de-DE")}</div><div class="a">${esc(g.text)}</div><button type="button" class="btn ghost small" data-del-goal="${i}" style="margin-top:6px">Erledigt oder entfernen</button></article>`).join("")}</div>`
          : `<p class="empty">Noch keine Ziele. In der Lektion „Ziele, die du wirklich erreichst“ baust du dein erstes SMART-Ziel.</p>`}
      </section>
      ${iki && Object.values(iki).some((v) => v && v.trim())
        ? `<section class="panel"><h2>Mein Ikigai</h2><div class="venn">${P.venn(iki)}</div>
            ${ikiOv.length ? `<p><b>Überschneidungen:</b> ${ikiOv.map((o) => esc(o.word)).join(", ")}</p>` : ""}</section>`
        : ""}
      <section class="panel"><h2>Journal</h2>
        ${notes.length
          ? `<div class="journal">${notes.map((n) => `<article><div class="q">${esc(n.lesson)} · ${esc(n.prompt)}</div><div class="a">${esc(n.text)}</div></article>`).join("")}</div>`
          : `<p class="empty">Hier sammeln sich deine Antworten aus den Nachdenk-Schritten.</p>`}
      </section>
      <section class="panel"><h2>Daten</h2>
        <p class="small muted">${window.Cloud && Cloud.user
          ? "Deine Eingaben werden in deinem Konto gespeichert, damit du sie auf allen Geräten hast. Zurücksetzen löscht den Fortschritt auch im Konto."
          : "Ohne Konto bleibt alles, was du hier eingibst, nur in diesem Browser auf diesem Gerät."}</p>
        <div class="row" id="reset-row"><button type="button" class="btn ghost" id="reset">Fortschritt zurücksetzen</button></div>
      </section>`;
    app.querySelectorAll("[data-del-goal]").forEach((b) =>
      b.addEventListener("click", () => {
        goals.splice(+b.dataset.delGoal, 1);
        window.Kompass.setData("goals", goals);
        renderProfile();
      })
    );
    document.getElementById("reset").addEventListener("click", () => {
      document.getElementById("reset-row").innerHTML = `<span>Wirklich alles löschen? Das lässt sich nicht rückgängig machen.</span>
        <button type="button" class="btn danger" id="reset-yes">Ja, alles löschen</button>
        <button type="button" class="btn ghost" id="reset-no">Abbrechen</button>`;
      document.getElementById("reset-yes").addEventListener("click", () => { state = fresh(); state.resetAt = Date.now(); save(); location.hash = "#start"; renderHome(); });
      document.getElementById("reset-no").addEventListener("click", renderProfile);
    });
  }

  /* ---------- Navigation über die Adresszeile (#start, #modul-geld, #lektion-geld-1, #profil) ---------- */
  function route() {
    const h = location.hash.replace(/^#/, "");
    if (h.startsWith("lektion-")) renderLesson(h.slice(8));
    else {
      run = null;
      if (h.startsWith("modul-")) renderModule(h.slice(6));
      else if (h === "profil") renderProfile();
      else if (h === "impressum" || h === "datenschutz") { setTab(""); Legal.render(app, h); }
      else if (h === "konto" || h.startsWith("konto-")) { setTab("konto"); Cloud.render(app, h.slice(6)); }
      else renderHome();
    }
    if (!h.startsWith("lektion-")) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  renderStats();
  route();

  // Konto: bei An- oder Abmeldung Kopfzeile und Seite aktualisieren
  let authKey = "";
  Cloud.onChange(() => {
    const k = Cloud.ready + "|" + (Cloud.user ? Cloud.user.id : "");
    if (k === authKey) return;
    authKey = k;
    renderAccountButton();
    if (!location.hash.startsWith("#lektion-")) route();
  });
  renderAccountButton();
  Cloud.init();
})();
