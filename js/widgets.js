/*
 * Interaktive Bausteine der Lektionen.
 * Jedes Widget bekommt ein leeres HTML-Element und füllt es selbst.
 */
(function () {
  const K = () => window.Kompass;

  /* ---------- Hilfsfunktionen ---------- */
  const eur = (v, digits = 0) =>
    v.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: digits, minimumFractionDigits: digits });
  const num = (v, d = 0) => v.toLocaleString("de-DE", { maximumFractionDigits: d, minimumFractionDigits: d });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let uid = 0;
  const id = (p) => p + "-" + ++uid;

  function slider(o) {
    const sid = id(o.key);
    return `<div class="control">
      <div class="lab"><label for="${sid}">${o.label}</label><span class="num" data-out="${o.key}"></span></div>
      <input type="range" id="${sid}" data-key="${o.key}" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}">
    </div>`;
  }
  function numberField(o) {
    const sid = id(o.key);
    return `<div class="control">
      <label for="${sid}">${o.label}</label>
      <input type="number" inputmode="decimal" id="${sid}" data-key="${o.key}" min="${o.min || 0}" step="${o.step || 1}" value="${o.value}">
    </div>`;
  }
  function readInputs(host) {
    const v = {};
    host.querySelectorAll("[data-key]").forEach((i) => (v[i.dataset.key] = parseFloat(i.value) || 0));
    return v;
  }

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  /*
   * Zeichnet ein Diagramm neu, sobald sich seine Breite ändert
   * (z. B. beim Drehen des Handys oder Ändern der Fenstergröße).
   */
  function redrawOnResize(el, fn) {
    if (!el || !window.ResizeObserver) return;
    let w = Math.round(el.clientWidth), raf = 0;
    const ro = new ResizeObserver(() => {
      if (!el.isConnected) { ro.disconnect(); return; }
      const nw = Math.round(el.clientWidth);
      if (!nw || nw === w) return;
      w = nw;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fn());
    });
    ro.observe(el);
  }

  const compact = (v) =>
    Math.abs(v) >= 1e6 ? num(v / 1e6, 1) + " Mio." : Math.abs(v) >= 1e4 ? num(v / 1e3) + " T" : num(v);

  /*
   * Linien-/Flächendiagramm mit Fadenkreuz und Tooltip.
   * series: [{ name, color, values }]   stacked: Flächen übereinander
   */
  function xyChart(host, o) {
    const W = Math.max(300, Math.round(host.clientWidth) || 640), H = W < 520 ? 230 : 270, m = { l: 62, r: 14, t: 14, b: 30 };
    const n = o.xs.length;
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const totals = o.xs.map((_, i) => o.series.reduce((s, se) => s + se.values[i], 0));
    const peak = o.stacked ? Math.max(...totals) : Math.max(...o.series.flatMap((s) => s.values));
    const ticks = niceTicks(0, Math.max(peak, o.minMax || 0), 4);
    const ymax = ticks[ticks.length - 1];
    const x = (i) => m.l + (pw * i) / (n - 1);
    const y = (v) => m.t + ph - (ph * v) / ymax;
    const yFmt = o.yFmt || compact;

    let grid = "", axis = "", marks = "";
    ticks.forEach((t) => {
      grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>`;
      axis += `<text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${yFmt(t)}</text>`;
    });
    const every = o.every ? (W < 520 ? o.every * 2 : o.every) : Math.max(1, Math.ceil(n / (W < 520 ? 4 : 7)));
    for (let i = 0; i < n; i += every) {
      axis += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${o.xFmt(o.xs[i])}</text>`;
    }

    const base = new Array(n).fill(0);
    const tops = [];
    o.series.forEach((s) => {
      const top = s.values.map((v, i) => (o.stacked ? base[i] + v : v));
      tops.push(top);
      const line = top.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
      if (o.stacked || o.area) {
        const lower = o.stacked ? base.slice() : new Array(n).fill(0);
        const back = lower.map((v, i) => `L${x(n - 1 - i).toFixed(1)},${y(lower[n - 1 - i]).toFixed(1)}`).join("");
        marks += `<path d="${line}${back}Z" style="fill:${s.color};fill-opacity:${o.stacked ? 0.85 : 0.14}"/>`;
      }
      marks += `<path d="${line}" style="fill:none;stroke:${o.stacked ? "var(--surface)" : s.color};stroke-width:2;stroke-linejoin:round"/>`;
      if (o.stacked) top.forEach((v, i) => (base[i] = v));
    });
    // Optional: eine feste Markierung, z. B. für den aktuell eingestellten Wert
    if (o.mark != null) {
      const i = clamp(o.mark, 0, n - 1);
      marks += `<line x1="${x(i)}" x2="${x(i)}" y1="${m.t}" y2="${m.t + ph}" style="stroke:var(--ink-2);stroke-width:1.5;stroke-dasharray:4 3"/>`;
      tops.forEach((t, k) => (marks += `<circle cx="${x(i)}" cy="${y(t[i])}" r="5" style="fill:${o.series[k].color};stroke:var(--surface);stroke-width:2"/>`));
    }

    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Diagramm")}">
        <g class="grid">${grid}</g>
        <g>${marks}</g>
        <g class="axis">${axis}</g>
        <line class="cross" y1="${m.t}" y2="${m.t + ph}" x1="0" x2="0" visibility="hidden"/>
        <g class="dots"></g>
        <rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="transparent" class="hit"/>
      </svg>
      <div class="tooltip" hidden></div>`;

    const svg = host.querySelector("svg");
    const cross = svg.querySelector(".cross");
    const dots = svg.querySelector(".dots");
    const tip = host.querySelector(".tooltip");
    const show = (i) => {
      cross.setAttribute("x1", x(i));
      cross.setAttribute("x2", x(i));
      cross.setAttribute("visibility", "visible");
      dots.innerHTML = o.series
        .map((s, k) => `<circle cx="${x(i)}" cy="${y(tops[k][i])}" r="5" style="fill:${s.color};stroke:var(--surface);stroke-width:2"/>`)
        .join("");
      const r = svg.getBoundingClientRect();
      const top = Math.max(...tops.map((t) => t[i]));
      tip.innerHTML = o.tip(i);
      tip.hidden = false;
      const left = clamp((x(i) / W) * r.width, 80, r.width - 80);
      tip.style.left = left + "px";
      tip.style.top = (y(top) / H) * r.height + "px";
    };
    const hide = () => {
      cross.setAttribute("visibility", "hidden");
      dots.innerHTML = "";
      tip.hidden = true;
    };
    const move = (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      show(clamp(Math.round(((px - m.l) / pw) * (n - 1)), 0, n - 1));
    };
    const hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", hide);
  }

  function legend(items) {
    return `<div class="legend">${items.map((i) => `<span><i style="background:${i.color}"></i>${i.name}</span>`).join("")}</div>`;
  }

  /* Netzdiagramm (Stärken) – Werte 0..max */
  function radar(labels, values, max) {
    const S = 360, c = S / 2, R = 112;
    const pt = (i, v) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length;
      return [c + Math.cos(a) * R * (v / max), c + Math.sin(a) * R * (v / max)];
    };
    let rings = "";
    for (let k = 1; k <= max; k++) {
      rings += `<polygon points="${labels.map((_, i) => pt(i, k).join(",")).join(" ")}" style="fill:none;stroke:var(--line)"/>`;
    }
    const spokes = labels.map((_, i) => `<line x1="${c}" y1="${c}" x2="${pt(i, max)[0]}" y2="${pt(i, max)[1]}" style="stroke:var(--line)"/>`).join("");
    const shape = `<polygon points="${values.map((v, i) => pt(i, v).join(",")).join(" ")}" style="fill:var(--s1);fill-opacity:.25;stroke:var(--s1);stroke-width:2;stroke-linejoin:round"/>`;
    const dots = values.map((v, i) => `<circle cx="${pt(i, v)[0]}" cy="${pt(i, v)[1]}" r="4.5" style="fill:var(--s1);stroke:var(--surface);stroke-width:2"/>`).join("");
    const lbls = labels
      .map((l, i) => {
        const [lx, ly] = pt(i, max * 1.2);
        const anchor = Math.abs(lx - c) < 8 ? "middle" : lx > c ? "start" : "end";
        return `<text x="${lx}" y="${ly + 4}" text-anchor="${anchor}" style="fill:var(--ink);font-family:var(--f-body);font-size:15px;font-weight:700">${l}</text>`;
      })
      .join("");
    return `<svg viewBox="-40 0 ${S + 80} ${S}" role="img" aria-label="Stärkenprofil">${rings}${spokes}${shape}${dots}${lbls}</svg>`;
  }

  /* Lebensrad als Tortenstücke, Länge = Wert 1..10 */
  const WHEEL_AREAS = ["Gesundheit", "Finanzen", "Beruf & Bildung", "Partnerschaft", "Familie & Freunde", "Freizeit & Spaß", "Persönliches Wachstum", "Wohnen & Umfeld"];
  const WHEEL_SHORT = ["Gesundheit", "Finanzen", "Beruf", "Partner", "Familie", "Freizeit", "Wachstum", "Wohnen"];
  function wheel(values) {
    const S = 300, c = S / 2, R = 112, n = values.length;
    const arc = (a0, a1, r) => {
      const p = (a) => [c + Math.cos(a) * r, c + Math.sin(a) * r];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${c},${c}L${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}Z`;
    };
    let out = "";
    for (let k = 2; k <= 10; k += 2) out += `<circle cx="${c}" cy="${c}" r="${(R * k) / 10}" style="fill:none;stroke:var(--line)"/>`;
    values.forEach((v, i) => {
      const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a1 = a0 + (2 * Math.PI) / n;
      out += `<path d="${arc(a0, a1, (R * v) / 10)}" style="fill:var(--accent);fill-opacity:${(0.25 + v * 0.07).toFixed(2)};stroke:var(--surface);stroke-width:2"/>`;
      const am = (a0 + a1) / 2;
      const lx = c + Math.cos(am) * (R + 18), ly = c + Math.sin(am) * (R + 18);
      const anchor = Math.abs(lx - c) < 10 ? "middle" : lx > c ? "start" : "end";
      out += `<text x="${lx}" y="${ly + 4}" text-anchor="${anchor}" style="fill:var(--ink);font-family:var(--f-body);font-size:16px;font-weight:700">${WHEEL_SHORT[i]} <tspan style="fill:var(--ink-2);font-family:var(--f-num)">${v}</tspan></text>`;
    });
    return `<svg viewBox="-80 0 ${S + 160} ${S}" role="img" aria-label="Lebensrad">${out}</svg>`;
  }

  /* ---------- Widgets ---------- */
  const W = {};

  W.timeline = function (host) {
    const items = [
      { icon: "swap", when: "Frühzeit", what: "Tauschhandel", text: "Getreide gegen Werkzeug, Fell gegen Fisch. Das Problem: Beide müssen genau das wollen, was der andere hat, und zwar zur selben Zeit." },
      { icon: "shell", when: "ab ca. 3000 v. Chr.", what: "Warengeld", text: "Gerste, Salz oder Kaurimuscheln werden zum allgemeinen Tauschmittel. Sie sind begehrt, haltbar und lassen sich zählen." },
      { icon: "coin", when: "ca. 600 v. Chr.", what: "Münzen", text: "Im Königreich Lydien (heute Türkei) entstehen die ersten geprägten Münzen. Ein Stempel garantiert Gewicht und Wert." },
      { icon: "note", when: "11. Jh.", what: "Papiergeld", text: "In China wird erstmals Papiergeld verbreitet genutzt. Es ist leichter als Münzen und verspricht Wert, statt ihn selbst zu haben." },
      { icon: "link", when: "1971", what: "Ende der Goldbindung", text: "Die USA beenden den Umtausch von Dollar in Gold. Seitdem beruht der Wert großer Währungen allein auf Vertrauen in Staat und Zentralbank." },
      { icon: "phone", when: "heute", what: "Digitales Geld", text: "Der allergrößte Teil des Geldes existiert nur noch als Zahl auf Konten. Du zahlst per Karte oder App, und die EZB bereitet einen digitalen Euro vor." }
    ];
    host.innerHTML = `<div class="widget">
      <div class="timeline" role="group" aria-label="Zeitstrahl">${items
        .map((it, i) => `<button type="button" class="tl-item" data-i="${i}" aria-pressed="false">${ICON(it.icon)}<span class="when">${it.when}</span><span class="what">${it.what}</span></button>`)
        .join("")}</div>
      <div class="tl-detail" aria-live="polite"></div></div>`;
    const detail = host.querySelector(".tl-detail");
    const pick = (i) => {
      host.querySelectorAll(".tl-item").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
      detail.innerHTML = `<h3>${items[i].what}</h3><p>${items[i].text}</p>`;
    };
    host.querySelectorAll(".tl-item").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.i)));
    pick(0);
  };

  W.moneyCreation = function (host) {
    const steps = [
      { t: "Ausgangslage", d: "Lina hat 0 € auf dem Konto. Die Bank prüft, ob sie den Kredit zurückzahlen kann.", a: [], p: [], m: 0 },
      { t: "Der Kredit wird ausgezahlt", d: "Die Bank bucht auf beiden Seiten ihrer Bilanz gleichzeitig 10.000 €. Sie hat dafür niemandem Geld weggenommen. Es ist neues Geld entstanden.", a: [["Forderung an Lina", 10000]], p: [["Guthaben auf Linas Konto", 10000]], m: 10000 },
      { t: "Lina kauft das Auto", d: "Das Guthaben wandert zum Autohaus. Das Geld bleibt in der Welt, es hat nur den Besitzer gewechselt.", a: [["Forderung an Lina", 10000]], p: [["Guthaben des Autohauses", 10000]], m: 10000 },
      { t: "Lina zahlt den Kredit zurück", d: "Über die Jahre zahlt Lina zurück, Rate für Rate. Mit jeder Tilgung verschwindet Geld wieder. Die Zinsen, die sie zusätzlich zahlt, sind der Verdienst der Bank.", a: [], p: [], m: 0 }
    ];
    let s = 0;
    host.innerHTML = `<div class="widget">
      <div class="row" style="justify-content:space-between"><span class="eyebrow" data-r="n"></span><span class="row"><button type="button" class="btn ghost small" data-r="prev">Zurück</button><button type="button" class="btn small" data-r="next">Weiter</button></span></div>
      <div class="stack" style="gap:6px"><h3 data-r="t"></h3><p data-r="d"></p></div>
      <div class="ledger">
        <div class="ledger-col"><h4>Bank besitzt (Aktiva)</h4><div class="stack" data-r="a"></div></div>
        <div class="ledger-col"><h4>Bank schuldet (Passiva)</h4><div class="stack" data-r="p"></div></div>
      </div>
      <div class="money-total"><span>Durch diesen Kredit neu entstandenes Geld</span><span class="num" data-r="m"></span></div>
    </div>`;
    const r = (k) => host.querySelector(`[data-r="${k}"]`);
    const draw = () => {
      const st = steps[s];
      r("n").textContent = `Schritt ${s + 1} von ${steps.length}`;
      r("t").textContent = st.t;
      r("d").textContent = st.d;
      r("a").innerHTML = st.a.map(([l, v]) => `<div class="entry a">${l}<br><span class="num">${eur(v)}</span></div>`).join("") || '<span class="muted small">leer</span>';
      r("p").innerHTML = st.p.map(([l, v]) => `<div class="entry p">${l}<br><span class="num">${eur(v)}</span></div>`).join("") || '<span class="muted small">leer</span>';
      r("m").textContent = eur(st.m);
      r("prev").disabled = s === 0;
      r("next").textContent = s === steps.length - 1 ? "Von vorn" : "Weiter";
    };
    r("prev").addEventListener("click", () => { s = Math.max(0, s - 1); draw(); });
    r("next").addEventListener("click", () => { s = s === steps.length - 1 ? 0 : s + 1; draw(); });
    draw();
  };

  W.inflation = function (host) {
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${slider({ key: "rate", label: "Inflation pro Jahr", min: 0, max: 10, step: 0.5, value: 2 })}
        ${slider({ key: "years", label: "Jahre", min: 1, max: 40, step: 1, value: 25 })}
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="pp"></span><span class="l">Kaufkraft deiner 1.000 €</span></div>
        <div class="kpi"><span class="v" data-k="loss"></span><span class="l">Wertverlust</span></div>
        <div class="kpi"><span class="v" data-k="basket"></span><span class="l">kostet dann ein Einkauf, der heute 100 € kostet</span></div>
      </div>
      <div class="chart"></div>
    </div>`;
    const update = () => {
      const v = readInputs(host);
      const r = v.rate / 100;
      host.querySelector('[data-out="rate"]').textContent = num(v.rate, 1) + " %";
      host.querySelector('[data-out="years"]').textContent = v.years;
      const xs = Array.from({ length: v.years + 1 }, (_, i) => i);
      const pp = xs.map((t) => 1000 / Math.pow(1 + r, t));
      const end = pp[pp.length - 1];
      host.querySelector('[data-k="pp"]').textContent = eur(end);
      host.querySelector('[data-k="loss"]').textContent = "−" + num(100 - end / 10, 0) + " %";
      host.querySelector('[data-k="basket"]').textContent = eur(100 * Math.pow(1 + r, v.years));
      xyChart(host.querySelector(".chart"), {
        xs, area: true, minMax: 1000,
        series: [{ name: "Kaufkraft", color: "var(--s1)", values: pp }],
        xFmt: (t) => "J. " + t,
        yFmt: (t) => num(t) + " €",
        label: "Kaufkraft von 1.000 Euro über die Jahre",
        tip: (i) => `<b>Nach ${xs[i]} Jahren</b><br>Kaufkraft: ${eur(pp[i])}`
      });
    };
    host.addEventListener("input", update);
    update();
    redrawOnResize(host.querySelector(".chart"), update);
  };

  W.compound = function (host) {
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${slider({ key: "monthly", label: "Sparrate pro Monat", min: 25, max: 1000, step: 25, value: 100 })}
        ${slider({ key: "start", label: "Startkapital", min: 0, max: 20000, step: 500, value: 0 })}
        ${slider({ key: "years", label: "Dauer in Jahren", min: 1, max: 45, step: 1, value: 30 })}
        ${slider({ key: "rate", label: "Rendite pro Jahr", min: 0, max: 10, step: 0.5, value: 6 })}
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="end"></span><span class="l">Endwert</span></div>
        <div class="kpi"><span class="v" data-k="paid"></span><span class="l">selbst eingezahlt</span></div>
        <div class="kpi"><span class="v" data-k="gain"></span><span class="l">durch Zinsen dazu</span></div>
      </div>
      ${legend([{ name: "Eingezahlt", color: "var(--s1)" }, { name: "Zinsen und Zinseszinsen", color: "var(--s2)" }])}
      <div class="chart"></div>
    </div>`;
    const update = () => {
      const v = readInputs(host);
      ["monthly", "start"].forEach((k) => (host.querySelector(`[data-out="${k}"]`).textContent = eur(v[k])));
      host.querySelector('[data-out="years"]').textContent = v.years;
      host.querySelector('[data-out="rate"]').textContent = num(v.rate, 1) + " %";
      const mr = v.rate / 100 / 12;
      const xs = [], paid = [], gain = [];
      let bal = v.start, inp = v.start;
      for (let yr = 0; yr <= v.years; yr++) {
        if (yr > 0) for (let mth = 0; mth < 12; mth++) { bal = bal * (1 + mr) + v.monthly; inp += v.monthly; }
        xs.push(yr); paid.push(inp); gain.push(bal - inp);
      }
      host.querySelector('[data-k="end"]').textContent = eur(bal);
      host.querySelector('[data-k="paid"]').textContent = eur(inp);
      host.querySelector('[data-k="gain"]').textContent = eur(bal - inp);
      xyChart(host.querySelector(".chart"), {
        xs, stacked: true,
        series: [
          { name: "Eingezahlt", color: "var(--s1)", values: paid },
          { name: "Zinsen", color: "var(--s2)", values: gain }
        ],
        xFmt: (t) => "J. " + t,
        yFmt: (t) => compact(t) + " €",
        label: "Wachstum des Sparplans",
        tip: (i) => `<b>Nach ${xs[i]} Jahren: ${eur(paid[i] + gain[i])}</b><br><span class="sw" style="background:var(--s1)"></span>eingezahlt ${eur(paid[i])}<br><span class="sw" style="background:var(--s2)"></span>Zinsen ${eur(gain[i])}`
      });
    };
    host.addEventListener("input", update);
    update();
    redrawOnResize(host.querySelector(".chart"), update);
  };

  W.budget = function (host) {
    const saved = K().getData("budget") || { income: 2200, needs: 58, wants: 30 };
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${numberField({ key: "income", label: "Netto pro Monat (€)", value: saved.income, step: 50 })}
        ${slider({ key: "needs", label: "Bedürfnisse", min: 0, max: 100, step: 1, value: saved.needs })}
        ${slider({ key: "wants", label: "Wünsche", min: 0, max: 100, step: 1, value: saved.wants })}
      </div>
      <div class="stack">
        <div class="budget-row"><span class="small"><b>Deine Aufteilung</b></span><div class="stackbar" data-k="mine"></div></div>
        <div class="budget-row"><span class="small"><b>50/30/20</b></span><div class="stackbar" data-k="rule"></div></div>
        ${legend([{ name: "Bedürfnisse", color: "var(--s1)" }, { name: "Wünsche", color: "var(--s2)" }, { name: "Sparen", color: "var(--s3)" }])}
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="n"></span><span class="l">Bedürfnisse</span></div>
        <div class="kpi"><span class="v" data-k="w"></span><span class="l">Wünsche</span></div>
        <div class="kpi"><span class="v" data-k="s"></span><span class="l">Sparen pro Monat</span></div>
      </div>
      <p class="verdict" data-k="verdict"></p>
    </div>`;
    const bar = (a, b, c) =>
      [[a, 1], [b, 2], [c, 3]].map(([p, k]) => `<div class="seg-${k}" style="flex:0 0 ${p}%">${p >= 9 ? p + " %" : ""}</div>`).join("");
    const update = (e) => {
      const v = readInputs(host);
      if (v.needs + v.wants > 100) {
        const other = e && e.target.dataset.key === "wants" ? "needs" : "wants";
        v[other] = 100 - v[e && e.target.dataset.key === "wants" ? "wants" : "needs"];
        host.querySelector(`[data-key="${other}"]`).value = v[other];
      }
      const save = 100 - v.needs - v.wants;
      host.querySelector('[data-out="needs"]').textContent = v.needs + " %";
      host.querySelector('[data-out="wants"]').textContent = v.wants + " %";
      host.querySelector('[data-k="mine"]').innerHTML = bar(v.needs, v.wants, save);
      host.querySelector('[data-k="rule"]').innerHTML = bar(50, 30, 20);
      host.querySelector('[data-k="n"]').textContent = eur((v.income * v.needs) / 100);
      host.querySelector('[data-k="w"]').textContent = eur((v.income * v.wants) / 100);
      host.querySelector('[data-k="s"]').textContent = eur((v.income * save) / 100);
      const yearly = (v.income * save * 12) / 100;
      host.querySelector('[data-k="verdict"]').innerHTML =
        save >= 20
          ? `<b>Stark.</b> Du sparst ${save} %, das sind ${eur(yearly)} im Jahr.`
          : save >= 10
          ? `<b>Guter Anfang.</b> ${save} % sind ${eur(yearly)} im Jahr. Schon 5 Prozentpunkte mehr wären weitere ${eur(v.income * 0.05 * 12)} pro Jahr.`
          : `<b>Hier steckt Potenzial.</b> Mit ${save} % bleibt kaum Puffer. Schau zuerst bei den Wünschen, ob 5 % frei werden. Das wären ${eur(v.income * 0.05)} pro Monat.`;
      K().setData("budget", { income: v.income, needs: v.needs, wants: v.wants });
    };
    host.addEventListener("input", update);
    update();
  };

  W.emergency = function (host) {
    const saved = K().getData("emergency") || { costs: 1500, months: 3, have: 1200, rate: 150 };
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${numberField({ key: "costs", label: "Ausgaben pro Monat (€)", value: saved.costs, step: 50 })}
        ${numberField({ key: "have", label: "Schon zurückgelegt (€)", value: saved.have, step: 50 })}
        ${numberField({ key: "rate", label: "Sparrate pro Monat (€)", value: saved.rate, step: 25 })}
        ${slider({ key: "months", label: "Monate absichern", min: 3, max: 6, step: 1, value: saved.months })}
      </div>
      <div class="stack" style="gap:6px">
        <div class="row" style="justify-content:space-between"><b>Fortschritt</b><span class="num" data-k="pct"></span></div>
        <div class="bar" style="height:16px"><span data-k="bar" style="background:var(--s3)"></span></div>
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="goal"></span><span class="l">Ziel</span></div>
        <div class="kpi"><span class="v" data-k="miss"></span><span class="l">fehlen noch</span></div>
        <div class="kpi"><span class="v" data-k="when"></span><span class="l">bis zum Ziel</span></div>
      </div>
    </div>`;
    const update = () => {
      const v = readInputs(host);
      host.querySelector('[data-out="months"]').textContent = v.months;
      const goal = v.costs * v.months;
      const miss = Math.max(0, goal - v.have);
      const pct = goal ? clamp((v.have / goal) * 100, 0, 100) : 0;
      host.querySelector('[data-k="pct"]').textContent = num(pct) + " %";
      host.querySelector('[data-k="bar"]').style.width = pct + "%";
      host.querySelector('[data-k="goal"]').textContent = eur(goal);
      host.querySelector('[data-k="miss"]').textContent = eur(miss);
      host.querySelector('[data-k="when"]').textContent =
        miss === 0 ? "geschafft" : v.rate > 0 ? Math.ceil(miss / v.rate) + " Monate" : "Sparrate fehlt";
      K().setData("emergency", v);
    };
    host.addEventListener("input", update);
    update();
  };

  W.diversify = function (host) {
    const N = 60, YEARS = 10, START = 10000, CAP = 60000;
    const gauss = () => {
      let u = 0, v = 0;
      while (!u) u = Math.random();
      while (!v) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    // Modell: gemeinsamer Markt + Zufall je Firma + kleines Pleiterisiko
    const investor = (stocks) => {
      const vals = new Array(stocks).fill(START / stocks);
      for (let y = 0; y < YEARS; y++) {
        const market = 0.07 + 0.16 * gauss();
        for (let s = 0; s < stocks; s++) {
          if (vals[s] === 0) continue;
          if (Math.random() < 0.015) { vals[s] = 0; continue; }
          vals[s] *= Math.max(0.05, 1 + market + 0.3 * gauss());
        }
      }
      return vals.reduce((a, b) => a + b, 0);
    };
    host.innerHTML = `<div class="widget">
      <div class="row" style="justify-content:space-between">${legend([{ name: "1 Aktie", color: "var(--s1)" }, { name: "50 Aktien", color: "var(--s2)" }])}<button type="button" class="btn small" data-r="run">Neu simulieren</button></div>
      <div class="chart"></div>
      <div class="kpis" data-r="kpis"></div>
      <p class="verdict small">Jeder Punkt ist ein Anleger nach 10 Jahren. Die gestrichelte Linie markiert die eingesetzten 10.000 €.</p>
    </div>`;
    let groups = [];
    const draw = () => {
      groups = [
        { name: "1 Aktie", color: "var(--s1)", vals: Array.from({ length: N }, () => investor(1)) },
        { name: "50 Aktien", color: "var(--s2)", vals: Array.from({ length: N }, () => investor(50)) }
      ];
      render();
    };
    const render = () => {
      const chart = host.querySelector(".chart");
      const Wd = Math.max(300, Math.round(chart.clientWidth) || 640), Hd = 230, m = { l: 86, r: 22, t: 10, b: 30 };
      const x = (v) => m.l + ((Wd - m.l - m.r) * Math.min(v, CAP)) / CAP;
      const rowH = (Hd - m.t - m.b) / 2;
      let s = "";
      (Wd < 520 ? [0, 10000, 20000, 40000, 60000] : [0, 10000, 20000, 30000, 40000, 50000, 60000]).forEach((t) => {
        s += `<line x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${Hd - m.b}" style="stroke:var(--line);${t === START ? "stroke-dasharray:4 3;stroke:var(--ink-2)" : ""}"/>`;
        s += `<text class="lbl" x="${x(t)}" y="${Hd - 10}" text-anchor="middle">${t === CAP ? "≥ 60 T" : t / 1000 + " T"}</text>`;
      });
      groups.forEach((g, gi) => {
        const cy = m.t + rowH * gi + rowH / 2;
        s += `<text x="${m.l - 12}" y="${cy + 4}" text-anchor="end" style="fill:var(--ink);font-family:var(--f-body);font-size:13px;font-weight:700">${g.name}</text>`;
        g.vals.forEach((v, i) => {
          const jitter = ((i * 37) % 17) / 17 - 0.5;
          s += `<circle cx="${x(v)}" cy="${cy + jitter * rowH * 0.7}" r="5" style="fill:${g.color};fill-opacity:.75;stroke:var(--surface);stroke-width:1.5"><title>${eur(v)}</title></circle>`;
        });
      });
      chart.innerHTML = `<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Ergebnisse der Anleger nach 10 Jahren">${s}</svg>`;
      const median = (a) => { const b = a.slice().sort((p, q) => p - q); return (b[29] + b[30]) / 2; };
      host.querySelector('[data-r="kpis"]').innerHTML = groups
        .map((g) => {
          const lost = g.vals.filter((v) => v < START * 0.5).length;
          return `<div class="kpi"><span class="v">${eur(median(g.vals))}</span><span class="l">typisches Ergebnis (Median) mit ${g.name}. ${lost} von ${N} haben mehr als die Hälfte verloren.</span></div>`;
        })
        .join("");
    };
    host.querySelector('[data-r="run"]').addEventListener("click", draw);
    draw();
    redrawOnResize(host.querySelector(".chart"), render);
  };

  /* Stärken-Check */
  const DIMS = [
    { id: "analytisch", name: "Analytisch" },
    { id: "kreativ", name: "Kreativ" },
    { id: "empathisch", name: "Empathisch" },
    { id: "organisiert", name: "Organisiert" },
    { id: "antrieb", name: "Antrieb" },
    { id: "praktisch", name: "Praktisch" }
  ];
  const QUESTIONS = [
    ["analytisch", "Ich zerlege Probleme gern in ihre Einzelteile."],
    ["kreativ", "Mir fallen oft neue Ideen oder ungewöhnliche Lösungen ein."],
    ["empathisch", "Ich spüre schnell, wie es anderen gerade geht."],
    ["organisiert", "Ich mache gern Pläne und halte mich daran."],
    ["antrieb", "Wenn nichts vorangeht, übernehme ich die Initiative."],
    ["praktisch", "Ich packe lieber an, als lange zu reden."],
    ["analytisch", "Zahlen, Daten oder Knobelaufgaben reizen mich."],
    ["kreativ", "Ich gestalte gern: Texte, Bilder, Musik, Räume."],
    ["empathisch", "Menschen erzählen mir oft persönliche Dinge."],
    ["organisiert", "Ordnung und klare Abläufe geben mir Ruhe."],
    ["antrieb", "Ich kann andere für eine Idee begeistern."],
    ["praktisch", "Ich repariere, baue oder bastle gern etwas."]
  ];
  function strengthScores(answers) {
    return DIMS.map((d) => {
      const vals = QUESTIONS.map((q, i) => (q[0] === d.id ? answers[i] : undefined)).filter((v) => v);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
  }
  function topStrengths(answers) {
    return strengthScores(answers)
      .map((s, i) => ({ id: DIMS[i].id, name: DIMS[i].name, s }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 2);
  }

  W.strengths = function (host, ctx) {
    const answers = Object.assign({}, (K().getData("strengths") || {}).answers);
    host.innerHTML = `<div class="widget two-col" style="align-items:start">
      <div>${QUESTIONS.map(
        (q, i) => `<div class="question"><span>${i + 1}. ${q[1]}</span>
          <div class="scale" role="group" aria-label="Bewertung für Aussage ${i + 1}">${[1, 2, 3, 4, 5]
            .map((v) => `<button type="button" data-q="${i}" data-v="${v}" aria-pressed="${answers[i] === v}">${v}</button>`)
            .join("")}</div></div>`
      ).join("")}</div>
      <div class="stack" style="position:sticky;top:calc(env(safe-area-inset-top, 0px) + 72px)">
        <div class="chart" data-r="radar"></div>
        <p data-r="result" aria-live="polite"></p>
      </div>
    </div>`;
    const draw = () => {
      host.querySelector('[data-r="radar"]').innerHTML = radar(DIMS.map((d) => d.name), strengthScores(answers), 5);
      const count = Object.keys(answers).length;
      const res = host.querySelector('[data-r="result"]');
      if (count < QUESTIONS.length) {
        res.innerHTML = `<span class="muted">${count} von ${QUESTIONS.length} beantwortet.</span>`;
        ctx && ctx.block(true);
      } else {
        const top = topStrengths(answers);
        res.innerHTML = `<b>Deine stärksten Bereiche:</b> ${top[0].name} und ${top[1].name}.`;
        ctx && ctx.block(false);
      }
    };
    host.querySelectorAll(".scale button").forEach((b) =>
      b.addEventListener("click", () => {
        const q = +b.dataset.q;
        answers[q] = +b.dataset.v;
        b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        K().setData("strengths", { answers });
        draw();
      })
    );
    draw();
  };

  const IDEAS = {
    analytisch: { job: ["Datenanalyse", "Controlling & Finanzen", "Softwareentwicklung", "Forschung"], side: ["Excel-Hilfe für kleine Betriebe", "Mathe-Nachhilfe", "Vergleichsrechner oder Haushaltsbuch-Vorlagen"], learn: ["Tabellenkalkulation für Fortgeschrittene", "Programmieren mit Python", "Statistik-Grundlagen"] },
    kreativ: { job: ["Grafik- und UX-Design", "Marketing & Content", "Fotografie, Video", "Architektur, Innenausbau"], side: ["Eigener Online-Shop für Selbstgemachtes", "Social-Media-Kanal zu deinem Thema", "Fotos für Events und Vereine"], learn: ["Gestaltung mit Canva oder Figma", "Storytelling", "Fotografie-Kurs"] },
    empathisch: { job: ["Pflege & Gesundheit", "Pädagogik, Soziale Arbeit", "Personalwesen", "Coaching, Beratung"], side: ["Nachhilfe oder Mentoring", "Ehrenamt in Beratung oder Begleitung", "Kurse für Senioren am Smartphone"], learn: ["Gesprächsführung", "Grundlagen Psychologie", "Coaching-Ausbildung"] },
    organisiert: { job: ["Projektmanagement", "Verwaltung & Backoffice", "Logistik", "Eventplanung"], side: ["Virtuelle Assistenz", "Ordnungs- und Umzugshilfe", "Organisation im Verein"], learn: ["Projektmethoden wie Kanban und Scrum", "Werkzeuge wie Notion oder Trello", "Buchhaltung-Grundlagen"] },
    antrieb: { job: ["Vertrieb", "Teamleitung", "Selbstständigkeit, Gründung", "Politik, Verbände"], side: ["Kleines Online-Business testen", "Veranstaltungen organisieren", "Vorstand in einem Verein"], learn: ["Verhandeln", "Rhetorik und Präsentieren", "Grundlagen der Gründung"] },
    praktisch: { job: ["Handwerk", "Technik & Mechatronik", "Gastronomie", "Garten- und Landschaftsbau"], side: ["Reparatur-Service in der Nachbarschaft", "Möbel aufarbeiten und verkaufen", "Gartenhilfe"], learn: ["Kurs in einer offenen Werkstatt", "Elektronik-Grundlagen", "Weiterbildung zum Meister oder Techniker"] }
  };

  W.opportunities = function (host) {
    const st = K().getData("strengths");
    const fromTest = st && Object.keys(st.answers || {}).length === QUESTIONS.length;
    let picked = fromTest ? topStrengths(st.answers).map((t) => t.id) : ["analytisch", "kreativ"];
    host.innerHTML = `<div class="widget">
      <p class="small ${fromTest ? "" : "muted"}">${fromTest ? "Vorausgewählt aus deinem Stärken-Check." : "Beispielauswahl. Mach den Stärken-Check in der vorigen Lektion oder wähle hier bis zu zwei Bereiche."}</p>
      <div class="chips" role="group" aria-label="Stärken auswählen">${DIMS.map((d) => `<button type="button" class="chip" data-id="${d.id}">${d.name}</button>`).join("")}</div>
      <div class="stack" data-r="out"></div>
    </div>`;
    const draw = () => {
      host.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(picked.includes(c.dataset.id))));
      host.querySelector('[data-r="out"]').innerHTML = picked
        .map((p) => {
          const d = DIMS.find((x) => x.id === p), I = IDEAS[p];
          const list = (a) => `<ul>${a.map((x) => `<li>${x}</li>`).join("")}</ul>`;
          return `<h3>${d.name}</h3><div class="idea-grid">
            <div class="idea"><span class="eyebrow">Berufsfelder</span>${list(I.job)}</div>
            <div class="idea"><span class="eyebrow">Nebenprojekte</span>${list(I.side)}</div>
            <div class="idea"><span class="eyebrow">Als Nächstes lernen</span>${list(I.learn)}</div></div>`;
        })
        .join("") + (picked.length === 2 ? `<p class="tip"><strong>Die Kombination macht dich besonders.</strong> Suche Aufgaben, in denen ${DIMS.find((x) => x.id === picked[0]).name} und ${DIMS.find((x) => x.id === picked[1]).name} zusammenkommen. Dort hast du weniger Konkurrenz und mehr Freude.</p>` : "");
    };
    host.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        const idx = picked.indexOf(c.dataset.id);
        if (idx >= 0) picked.splice(idx, 1);
        else { picked.push(c.dataset.id); if (picked.length > 2) picked.shift(); }
        draw();
      })
    );
    draw();
  };

  W.maslow = function (host) {
    const L = [
      { short: "Grundbedürfnisse", name: "Körperliche Grundbedürfnisse", text: "Essen, Trinken, Schlaf, ein Dach über dem Kopf.", money: "Geld deckt hier das Nötigste: Miete, Lebensmittel, Energie." },
      { short: "Sicherheit", name: "Sicherheit", text: "Ein sicherer Job, Gesundheit, Schutz vor Gefahren, Planbarkeit.", money: "Notgroschen und Versicherungen geben Sicherheit. Darum kommt der Notgroschen vor dem Investieren." },
      { short: "Soziales", name: "Soziale Bedürfnisse", text: "Freundschaft, Liebe, Familie, Zugehörigkeit zu einer Gruppe.", money: "Geld kann Zeit mit Menschen ermöglichen, etwa für Besuche oder gemeinsame Erlebnisse, sie aber nicht ersetzen." },
      { short: "Anerkennung", name: "Anerkennung", text: "Wertschätzung, Erfolg, Selbstvertrauen, Respekt von anderen.", money: "Vorsicht vor Statuskonsum: Viele kaufen Dinge, um Anerkennung zu bekommen." },
      { short: "Sinn", name: "Selbstverwirklichung", text: "Das eigene Potenzial entfalten, Sinn finden, kreativ sein, wachsen.", money: "Finanzielle Freiheit schafft Raum für Entscheidungen nach Sinn statt nach Zwang." }
    ];
    const Wd = 460, top = 10, H = 280, lh = H / 5, topW = 70, baseW = 440;
    const wAt = (yy) => topW + ((baseW - topW) * (yy - top)) / H;
    let svg = "";
    L.forEach((l, i) => {
      const y1 = top + H - lh * i, y0 = y1 - lh;
      const w0 = wAt(y0), w1 = wAt(y1), c = Wd / 2;
      svg += `<g class="lvl" data-i="${i}" tabindex="0" role="button" aria-label="${l.name}">
        <path d="M${c - w1 / 2},${y1}L${c + w1 / 2},${y1}L${c + w0 / 2},${y0}L${c - w0 / 2},${y0}Z" style="fill:var(--accent);fill-opacity:${(0.55 + i * 0.11).toFixed(2)}"/>
        <text x="${c}" y="${(y0 + y1) / 2 + 5}" text-anchor="middle" style="fill:var(--accent-ink)">${i + 1}. ${l.short}</text></g>`;
    });
    host.innerHTML = `<div class="widget">
      <div class="pyramid"><svg viewBox="0 0 ${Wd} ${H + 20}" role="group" aria-label="Bedürfnispyramide">${svg}</svg></div>
      <div class="tl-detail" aria-live="polite"></div></div>`;
    const detail = host.querySelector(".tl-detail");
    const pick = (i) => {
      host.querySelectorAll(".lvl").forEach((g) => g.classList.toggle("dim", +g.dataset.i !== i));
      detail.innerHTML = `<span class="eyebrow">Stufe ${i + 1}</span><h3>${L[i].name}</h3><p>${L[i].text}</p><p class="small" style="margin-top:6px"><b>Bezug zu Geld:</b> ${L[i].money}</p>`;
    };
    host.querySelectorAll(".lvl").forEach((g) => {
      g.addEventListener("click", () => pick(+g.dataset.i));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(+g.dataset.i); } });
    });
    pick(0);
  };

  W.lifewheel = function (host) {
    const saved = K().getData("lifewheel");
    const vals = saved ? saved.slice() : [6, 4, 7, 5, 8, 5, 6, 7];
    host.innerHTML = `<div class="widget two-col">
      <div class="stack"><div class="chart" data-r="wheel"></div><p class="small" data-r="note" aria-live="polite"></p></div>
      <div class="stack">${WHEEL_AREAS.map((a, i) => slider({ key: "w" + i, label: a, min: 1, max: 10, step: 1, value: vals[i] })).join("")}</div>
    </div>`;
    let touched = !!saved;
    const update = (e) => {
      const v = readInputs(host);
      WHEEL_AREAS.forEach((_, i) => { vals[i] = v["w" + i]; host.querySelector(`[data-out="w${i}"]`).textContent = vals[i]; });
      host.querySelector('[data-r="wheel"]').innerHTML = wheel(vals);
      if (e) { touched = true; K().setData("lifewheel", vals.slice()); }
      const low = vals.indexOf(Math.min(...vals));
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      host.querySelector('[data-r="note"]').innerHTML = touched
        ? `Durchschnitt <b class="num">${num(avg, 1)}</b>. Am meisten Luft nach oben hat <b>${WHEEL_AREAS[low]}</b>.`
        : `<span class="muted">Das sind Beispielwerte. Bewege die Regler, um dein eigenes Rad zu erstellen.</span>`;
    };
    host.addEventListener("input", update);
    update();
  };

  const IKI = [
    { k: "love", label: "Was liebst du?", short: "Liebe", color: "var(--s2)" },
    { k: "good", label: "Worin bist du gut?", short: "Können", color: "var(--s1)" },
    { k: "world", label: "Was braucht die Welt?", short: "Welt braucht", color: "var(--s3)" },
    { k: "paid", label: "Wofür kannst du bezahlt werden?", short: "Bezahlung", color: "var(--gold)" }
  ];
  const splitWords = (s) => (s || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
  function ikigaiOverlaps(d) {
    const seen = {};
    IKI.forEach((c) => splitWords(d[c.k]).forEach((w) => {
      const key = w.toLowerCase();
      seen[key] = seen[key] || { word: w, in: new Set() };
      seen[key].in.add(c.short);
    }));
    return Object.values(seen).filter((x) => x.in.size > 1);
  }
  function venn(d) {
    const pos = { love: [210, 145], good: [145, 210], world: [275, 210], paid: [210, 275] };
    const lbl = { love: [210, 80], good: [78, 214], world: [342, 214], paid: [210, 350] };
    let s = "";
    IKI.forEach((c) => {
      const [cx, cy] = pos[c.k];
      s += `<circle cx="${cx}" cy="${cy}" r="100" style="fill:${c.color};stroke:${c.color}"/>`;
    });
    IKI.forEach((c) => {
      const [lx, ly] = lbl[c.k];
      const n = splitWords(d[c.k]).length;
      s += `<text x="${lx}" y="${ly}" text-anchor="middle">${c.short}</text><text x="${lx}" y="${ly + 16}" text-anchor="middle" style="fill:var(--ink-2);font-family:var(--f-num);font-weight:500">${n} ${n === 1 ? "Eintrag" : "Einträge"}</text>`;
    });
    [["Leidenschaft", 152, 152], ["Mission", 268, 152], ["Beruf", 152, 274], ["Berufung", 268, 274]].forEach(([t, x, y]) => {
      s += `<text x="${x}" y="${y}" text-anchor="middle" style="font-size:11px;fill:var(--ink-2)">${t}</text>`;
    });
    s += `<text class="c" x="210" y="216" text-anchor="middle">Ikigai</text>`;
    return `<svg viewBox="0 30 420 360" role="img" aria-label="Ikigai-Diagramm">${s}</svg>`;
  }
  W.ikigai = function (host) {
    const d = Object.assign({ love: "", good: "", world: "", paid: "" }, K().getData("ikigai"));
    host.innerHTML = `<div class="widget">
      <div class="venn" data-r="venn"></div>
      <div class="ikigai-grid">${IKI.map((c) => {
        const sid = id("iki");
        return `<div class="control"><label for="${sid}"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${c.color};margin-right:6px"></i>${c.label}</label><textarea id="${sid}" data-k="${c.k}" placeholder="z. B. ${{ love: "Kochen, Reisen, Musik", good: "Zuhören, Organisieren, Kochen", world: "gesundes Essen, Zuhören, Klimaschutz", paid: "Organisieren, Kochen, Beratung" }[c.k]}">${esc(d[c.k])}</textarea></div>`;
      }).join("")}</div>
      <p data-r="over" aria-live="polite"></p>
    </div>`;
    const update = () => {
      host.querySelectorAll("textarea").forEach((t) => (d[t.dataset.k] = t.value));
      host.querySelector('[data-r="venn"]').innerHTML = venn(d);
      const ov = ikigaiOverlaps(d);
      host.querySelector('[data-r="over"]').innerHTML = ov.length
        ? `<b>Überschneidungen:</b> ${ov.map((o) => `${esc(o.word)} (${[...o.in].join(" + ")})`).join(", ")}`
        : `<span class="muted">Sobald ein Stichwort in mehreren Kreisen steht, erscheint es hier. Dort liegt oft ein Hinweis auf dein Ikigai.</span>`;
      K().setData("ikigai", Object.assign({}, d));
    };
    host.addEventListener("input", update);
    update();
  };

  W.smart = function (host) {
    const F = [
      { k: "was", l: "S: Was genau willst du erreichen?", ph: "einen Notgroschen aufbauen" },
      { k: "mess", l: "M: Woran misst du den Erfolg?", ph: "1.500 € auf dem Tagesgeldkonto" },
      { k: "warum", l: "A: Warum ist dir das wichtig?", ph: "ich ruhiger schlafen will" },
      { k: "wie", l: "R: Mit welchem konkreten Schritt?", ph: "richte ich einen Dauerauftrag über 250 € ein" },
      { k: "bis", l: "T: Bis wann?", ph: "", type: "date" }
    ];
    const draft = Object.assign({}, K().getData("smartDraft"));
    host.innerHTML = `<div class="widget">
      <div class="controls">${F.map((f) => {
        const sid = id("smart");
        return `<div class="control"><label for="${sid}">${f.l}</label><input id="${sid}" type="${f.type || "text"}" data-f="${f.k}" placeholder="${f.ph}" value="${esc(draft[f.k] || "")}"></div>`;
      }).join("")}</div>
      <div class="checks" data-r="checks"></div>
      <p class="smart-out" data-r="out" aria-live="polite"></p>
      <div class="row"><button type="button" class="btn" data-r="save">Ziel speichern</button><span class="small muted" data-r="msg" aria-live="polite"></span></div>
    </div>`;
    const fmtDate = (s) => { const dt = new Date(s + "T12:00:00"); return isNaN(dt) ? "" : dt.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }); };
    const sentence = (v) =>
      `Bis ${v.bis ? fmtDate(v.bis) : "…"} will ich ${v.was || "…"}: ${v.mess || "…"}. Dafür ${v.wie || "…"}, weil ${v.warum || "…"}.`;
    const update = () => {
      host.querySelectorAll("[data-f]").forEach((i) => (draft[i.dataset.f] = i.value.trim()));
      const filled = F.filter((f) => draft[f.k]).length;
      host.querySelector('[data-r="checks"]').innerHTML = F.map((f) => `<span class="check ${draft[f.k] ? "ok" : ""}">${f.l[0]}</span>`).join("");
      const out = host.querySelector('[data-r="out"]');
      if (filled === 0) {
        const ex = {}; F.forEach((f) => (ex[f.k] = f.ph));
        out.innerHTML = `<span class="eyebrow" style="display:block;margin-bottom:4px">Beispiel</span>Bis 31. März will ich ${ex.was}: ${ex.mess}. Dafür ${ex.wie}, weil ${ex.warum}.`;
      } else out.textContent = sentence(draft);
      host.querySelector('[data-r="save"]').disabled = filled < F.length;
      K().setData("smartDraft", Object.assign({}, draft));
    };
    host.addEventListener("input", update);
    host.querySelector('[data-r="save"]').addEventListener("click", () => {
      const goals = K().getData("goals") || [];
      goals.push({ text: sentence(draft), created: new Date().toISOString().slice(0, 10) });
      K().setData("goals", goals);
      host.querySelector('[data-r="msg"]').textContent = "Gespeichert. Du findest es unter Mein Kompass.";
    });
    update();
  };

  W.habits = function (host) {
    host.innerHTML = `<div class="widget">
      <div class="controls">${slider({ key: "p", label: "Veränderung pro Tag", min: 0.1, max: 2, step: 0.1, value: 1 })}</div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="up" style="color:var(--s3)"></span><span class="l">nach einem Jahr, wenn du täglich besser wirst</span></div>
        <div class="kpi"><span class="v" data-k="down" style="color:var(--s2)"></span><span class="l">nach einem Jahr, wenn du täglich nachlässt</span></div>
      </div>
      ${legend([{ name: "täglich besser", color: "var(--s3)" }, { name: "täglich schlechter", color: "var(--s2)" }])}
      <div class="chart"></div>
    </div>`;
    const update = () => {
      const p = readInputs(host).p / 100;
      host.querySelector('[data-out="p"]').textContent = num(p * 100, 1) + " %";
      const xs = []; for (let d = 0; d <= 365; d += 5) xs.push(d);
      if (xs[xs.length - 1] !== 365) xs.push(365);
      const up = xs.map((d) => Math.pow(1 + p, d)), down = xs.map((d) => Math.pow(1 - p, d));
      host.querySelector('[data-k="up"]').textContent = "× " + num(up[up.length - 1], 1);
      host.querySelector('[data-k="down"]').textContent = "× " + num(down[down.length - 1], 2);
      xyChart(host.querySelector(".chart"), {
        xs,
        series: [{ name: "besser", color: "var(--s3)", values: up }, { name: "schlechter", color: "var(--s2)", values: down }],
        xFmt: (d) => "Tag " + d,
        yFmt: (t) => "× " + num(t, t < 10 && t % 1 ? 1 : 0),
        label: "Täglich besser gegenüber täglich schlechter",
        tip: (i) => `<b>Tag ${xs[i]}</b><br><span class="sw" style="background:var(--s3)"></span>× ${num(up[i], 2)}<br><span class="sw" style="background:var(--s2)"></span>× ${num(down[i], 2)}`
      });
    };
    host.addEventListener("input", update);
    update();
    redrawOnResize(host.querySelector(".chart"), update);
  };

  /* ---------- Steuern ---------- */

  // Einkommensteuer-Grundtarif 2026 (§ 32a EStG), Alleinstehende
  function incomeTax2026(zve) {
    const x = Math.floor(zve);
    if (x <= 12348) return 0;
    if (x <= 17799) { const y = (x - 12348) / 10000; return Math.floor((914.51 * y + 1400) * y); }
    if (x <= 69878) { const z = (x - 17799) / 10000; return Math.floor((173.1 * z + 2397) * z + 1034.87); }
    if (x <= 277825) return Math.floor(0.42 * x - 11135.63);
    return Math.floor(0.45 * x - 19470.38);
  }
  function marginalRate2026(zve) {
    if (zve <= 12348) return 0;
    if (zve <= 17799) return (2 * 914.51 * ((zve - 12348) / 10000) + 1400) / 10000;
    if (zve <= 69878) return (2 * 173.1 * ((zve - 17799) / 10000) + 2397) / 10000;
    return zve <= 277825 ? 0.42 : 0.45;
  }

  W.incomeTax = function (host) {
    host.innerHTML = `<div class="widget">
      <div class="controls">${slider({ key: "zve", label: "Zu versteuerndes Einkommen pro Jahr", min: 0, max: 150000, step: 500, value: 40000 })}</div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="tax"></span><span class="l">Einkommensteuer pro Jahr</span></div>
        <div class="kpi"><span class="v" data-k="avg"></span><span class="l">Durchschnittssteuersatz</span></div>
        <div class="kpi"><span class="v" data-k="marg"></span><span class="l">Grenzsteuersatz</span></div>
      </div>
      <p class="verdict" data-k="say" aria-live="polite"></p>
      ${legend([{ name: "Grenzsteuersatz", color: "var(--s2)" }, { name: "Durchschnittssteuersatz", color: "var(--s1)" }])}
      <div class="chart"></div>
      <p class="small muted">Grundtarif 2026 für Alleinstehende, ohne Solidaritätszuschlag und Kirchensteuer.</p>
    </div>`;
    const STEP = 2500;
    const xs = [];
    for (let v = 0; v <= 150000; v += STEP) xs.push(v);
    const marg = xs.map((v) => marginalRate2026(v) * 100);
    const avg = xs.map((v) => (v ? (incomeTax2026(v) / v) * 100 : 0));
    const update = () => {
      const zve = readInputs(host).zve;
      const tax = incomeTax2026(zve), m = marginalRate2026(zve), a = zve ? tax / zve : 0;
      host.querySelector('[data-out="zve"]').textContent = eur(zve);
      host.querySelector('[data-k="tax"]').textContent = eur(tax);
      host.querySelector('[data-k="avg"]').textContent = num(a * 100, 1) + " %";
      host.querySelector('[data-k="marg"]').textContent = num(m * 100, 1) + " %";
      host.querySelector('[data-k="say"]').innerHTML = zve <= 12348
        ? "Dein Einkommen liegt im <b>Grundfreibetrag</b> von 12.348 €. Darauf zahlst du keine Einkommensteuer."
        : `Von jedem zusätzlich verdienten Euro gehen <b>${num(m * 100)} Cent</b> an die Einkommensteuer. Auf dein gesamtes Einkommen zahlst du im Schnitt <b>${num(a * 100, 1)} %</b>.`;
      xyChart(host.querySelector(".chart"), {
        xs, minMax: 45, mark: Math.round(zve / STEP), every: 10,
        series: [
          { name: "Grenzsteuersatz", color: "var(--s2)", values: marg },
          { name: "Durchschnittssteuersatz", color: "var(--s1)", values: avg }
        ],
        xFmt: (v) => (v ? num(v / 1000) + " T €" : "0"),
        yFmt: (t) => num(t) + " %",
        label: "Grenz- und Durchschnittssteuersatz nach Einkommen",
        tip: (i) => `<b>${eur(xs[i])}</b><br><span class="sw" style="background:var(--s2)"></span>Grenzsteuersatz ${num(marg[i], 1)} %<br><span class="sw" style="background:var(--s1)"></span>Durchschnitt ${num(avg[i], 1)} %`
      });
    };
    host.addEventListener("input", update);
    update();
    redrawOnResize(host.querySelector(".chart"), update);
  };

  W.werbungskosten = function (host) {
    const PAUSCH = 1230, KM = 0.38, HO = 6, HO_MAX = 1260;
    const s = K().getData("werbungskosten") || { km: 15, office: 140, home: 60, mittel: 300, bildung: 0, rate: 30 };
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${numberField({ key: "km", label: "Einfache Strecke zur Arbeit (km)", value: s.km })}
        ${slider({ key: "office", label: "Tage im Büro pro Jahr", min: 0, max: 230, step: 5, value: s.office })}
        ${slider({ key: "home", label: "Tage im Homeoffice pro Jahr", min: 0, max: 230, step: 5, value: s.home })}
        ${numberField({ key: "mittel", label: "Arbeitsmittel, z. B. Laptop (€)", value: s.mittel, step: 10 })}
        ${numberField({ key: "bildung", label: "Fortbildungen (€)", value: s.bildung, step: 10 })}
        ${slider({ key: "rate", label: "Dein Grenzsteuersatz", min: 14, max: 42, step: 1, value: s.rate })}
      </div>
      <div class="wk-bar"><div class="stackbar" data-k="bar"></div><span class="wk-mark" data-k="mark"><span>Pauschbetrag 1.230 €</span></span></div>
      ${legend([{ name: "Fahrtkosten", color: "var(--s1)" }, { name: "Homeoffice", color: "var(--s2)" }, { name: "Arbeitsmittel und Fortbildung", color: "var(--s3)" }])}
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="sum"></span><span class="l">Werbungskosten gesamt</span></div>
        <div class="kpi"><span class="v" data-k="over"></span><span class="l">über dem Pauschbetrag</span></div>
        <div class="kpi"><span class="v" data-k="back"></span><span class="l">geschätzte Erstattung</span></div>
      </div>
      <p class="verdict" data-k="say" aria-live="polite"></p>
      <p class="small muted">Grobe Schätzung nach den Regeln 2026. Die tatsächliche Erstattung hängt von deiner gesamten Steuersituation ab.</p>
    </div>`;
    const update = () => {
      const v = readInputs(host);
      host.querySelector('[data-out="office"]').textContent = v.office;
      host.querySelector('[data-out="home"]').textContent = v.home;
      host.querySelector('[data-out="rate"]').textContent = v.rate + " %";
      const fahrt = v.km * KM * v.office;
      const home = Math.min(v.home * HO, HO_MAX);
      const rest = v.mittel + v.bildung;
      const sum = fahrt + home + rest;
      const over = Math.max(0, sum - PAUSCH);
      const scale = Math.max(sum, PAUSCH) * 1.15;
      const pct = (x) => ((x / scale) * 100).toFixed(2) + "%";
      host.querySelector('[data-k="bar"]').innerHTML =
        `<div class="seg-1" style="flex:0 0 ${pct(fahrt)}"></div><div class="seg-2" style="flex:0 0 ${pct(home)}"></div><div class="seg-3" style="flex:0 0 ${pct(rest)}"></div>`;
      const mark = host.querySelector('[data-k="mark"]');
      const at = (PAUSCH / scale) * 100;
      mark.style.left = at + "%";
      mark.firstElementChild.style.transform = at > 55 ? "translateX(calc(-100% + 2px))" : "none";
      host.querySelector('[data-k="sum"]').textContent = eur(sum);
      host.querySelector('[data-k="over"]').textContent = eur(over);
      host.querySelector('[data-k="back"]').textContent = "≈ " + eur(over * (v.rate / 100));
      const tooMany = v.office + v.home > 230 ? " Mehr als rund 230 Arbeitstage im Jahr sind unüblich, das Finanzamt fragt dann eventuell nach." : "";
      host.querySelector('[data-k="say"]').innerHTML = (over > 0
        ? `<b>Es lohnt sich.</b> Du liegst ${eur(over)} über dem Pauschbetrag, den das Finanzamt ohnehin anrechnet.`
        : `Du liegst unter dem Pauschbetrag von 1.230 €. Die Werbungskosten bringen dir nichts extra. Eine Erklärung kann sich trotzdem lohnen, etwa wegen Spenden, Handwerkerkosten oder Versicherungen.`) + tooMany;
      K().setData("werbungskosten", v);
    };
    host.addEventListener("input", update);
    update();
  };

  W.capitalTax = function (host) {
    let etf = true, auftrag = true;
    host.innerHTML = `<div class="widget">
      <div class="controls">${slider({ key: "ertrag", label: "Kapitalerträge pro Jahr", min: 0, max: 5000, step: 50, value: 1500 })}</div>
      <div class="stack" style="gap:8px">
        <span class="small"><b>Woher kommen die Erträge?</b></span>
        <div class="chips" role="group" aria-label="Art der Erträge">
          <button type="button" class="chip" data-type="zins">Zinsen oder Dividenden</button>
          <button type="button" class="chip" data-type="etf">Aktien-ETF</button>
        </div>
        <div class="chips"><button type="button" class="chip" data-r="auftrag">Freistellungsauftrag erteilt</button></div>
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="free"></span><span class="l">bleiben steuerfrei</span></div>
        <div class="kpi"><span class="v" data-k="tax"></span><span class="l">Steuer</span></div>
        <div class="kpi"><span class="v" data-k="net"></span><span class="l">bleiben dir</span></div>
      </div>
      <p class="verdict" data-k="say" aria-live="polite"></p>
    </div>`;
    const calc = (ertrag, withAuftrag) => {
      const teil = etf ? ertrag * 0.3 : 0;
      const base = ertrag - teil;
      const pausch = withAuftrag ? Math.min(1000, base) : 0;
      return { teil, pausch, tax: (base - pausch) * 0.26375 };
    };
    const update = () => {
      const ertrag = readInputs(host).ertrag;
      host.querySelector('[data-out="ertrag"]').textContent = eur(ertrag);
      host.querySelectorAll("[data-type]").forEach((c) => c.setAttribute("aria-pressed", String((c.dataset.type === "etf") === etf)));
      host.querySelector('[data-r="auftrag"]').setAttribute("aria-pressed", String(auftrag));
      const r = calc(ertrag, auftrag);
      host.querySelector('[data-k="free"]').textContent = eur(r.teil + r.pausch);
      host.querySelector('[data-k="tax"]').textContent = eur(r.tax, 2);
      host.querySelector('[data-k="net"]').textContent = eur(ertrag - r.tax, 2);
      const extra = r.tax - calc(ertrag, true).tax;
      host.querySelector('[data-k="say"]').innerHTML = !auftrag && extra > 0
        ? `<b>Ohne Freistellungsauftrag</b> behält die Bank ${eur(extra, 2)} zu viel ein. Zurück bekommst du das nur über die Steuererklärung.`
        : etf
        ? `Beim Aktien-ETF sind 30 % der Erträge steuerfrei (Teilfreistellung). Danach greift der Sparerpauschbetrag von 1.000 €.`
        : `Zinsen und Dividenden sind voll steuerpflichtig, sobald sie den Sparerpauschbetrag von 1.000 € übersteigen.`;
    };
    host.querySelectorAll("[data-type]").forEach((c) => c.addEventListener("click", () => { etf = c.dataset.type === "etf"; update(); }));
    host.querySelector('[data-r="auftrag"]').addEventListener("click", () => { auftrag = !auftrag; update(); });
    host.addEventListener("input", update);
    update();
  };

  /* ---------- Absicherung & Altersvorsorge ---------- */

  const SITUATIONS = [
    { id: "income", label: "Ich lebe von meinem Arbeitseinkommen" },
    { id: "auto", label: "Ich habe ein Auto" },
    { id: "family", label: "Jemand ist finanziell von mir abhängig" }
  ];
  const INSURANCES = [
    { id: "haftpflicht", name: "Private Haftpflicht", why: "Zahlt, wenn du anderen einen Schaden zufügst.", cat: () => "muss" },
    { id: "kranken", name: "Krankenversicherung", why: "In Deutschland Pflicht.", cat: () => "muss" },
    { id: "kfz", name: "Kfz-Haftpflicht", why: "Pflicht für jedes zugelassene Auto.", cat: (s) => (s.auto ? "muss" : "none") },
    { id: "bu", name: "Berufsunfähigkeit", why: "Ersetzt Einkommen, wenn du nicht mehr arbeiten kannst.", cat: (s) => (s.income ? "wichtig" : "kann") },
    { id: "risikoleben", name: "Risikolebensversicherung", why: "Sichert Angehörige ab, wenn du stirbst.", cat: (s) => (s.family ? "wichtig" : "none") },
    { id: "hausrat", name: "Hausrat", why: "Sinnvoll bei wertvoller Einrichtung.", cat: () => "kann" },
    { id: "rechtsschutz", name: "Rechtsschutz", why: "Kann bei Streit mit Arbeitgeber oder Vermieter helfen.", cat: () => "kann" },
    { id: "handy", name: "Handy- oder Elektronikversicherung", why: "Teuer im Verhältnis zum Schaden.", cat: () => "selten" },
    { id: "gepaeck", name: "Reisegepäckversicherung", why: "Viele Ausschlüsse, kleiner Schaden.", cat: () => "selten" },
    { id: "restschuld", name: "Restschuldversicherung", why: "Oft teuer und wird beim Kredit mitverkauft.", cat: () => "selten" },
    { id: "kapitalleben", name: "Kapitallebensversicherung zum Sparen", why: "Meist hohe Kosten. Sparen und Versichern lieber trennen.", cat: () => "selten" }
  ];
  const CAT_LABEL = { muss: "Muss", wichtig: "Wichtig", kann: "Je nach Lage", selten: "Meist unnötig", none: "Für dich nicht nötig" };

  W.insuranceCheck = function (host) {
    const saved = K().getData("insurance") || {};
    const sit = Object.assign({ income: true, auto: false, family: false }, saved.sit);
    const have = Object.assign({}, saved.have);
    host.innerHTML = `<div class="widget">
      <div class="stack" style="gap:8px"><span class="small"><b>Deine Lebenslage</b></span>
        <div class="chips" role="group" aria-label="Lebenslage">${SITUATIONS.map((x) => `<button type="button" class="chip" data-sit="${x.id}">${x.label}</button>`).join("")}</div></div>
      <div class="ins-list" data-r="list"></div>
      <div class="stack" data-r="out" aria-live="polite"></div>
    </div>`;
    const draw = () => {
      host.querySelectorAll("[data-sit]").forEach((c) => c.setAttribute("aria-pressed", String(!!sit[c.dataset.sit])));
      host.querySelector('[data-r="list"]').innerHTML = INSURANCES.map((i) => {
        const c = i.cat(sit);
        return `<div class="ins-row"><div class="stack" style="gap:2px;min-width:0"><b>${i.name}</b><span class="small muted">${i.why}</span></div>
          <div class="side"><span class="tag t-${c}">${CAT_LABEL[c]}</span><button type="button" class="chip" data-have="${i.id}" aria-pressed="${!!have[i.id]}">Habe ich</button></div></div>`;
      }).join("");
      host.querySelectorAll("[data-have]").forEach((b) => b.addEventListener("click", () => { have[b.dataset.have] = !have[b.dataset.have]; save(); draw(); }));
      const missing = INSURANCES.filter((i) => ["muss", "wichtig"].includes(i.cat(sit)) && !have[i.id]);
      const check = INSURANCES.filter((i) => ["selten", "none"].includes(i.cat(sit)) && have[i.id]);
      host.querySelector('[data-r="out"]').innerHTML =
        (missing.length ? `<p class="feedback bad"><strong>Fehlt dir wahrscheinlich:</strong>${missing.map((i) => i.name).join(", ")}</p>` : `<p class="feedback good"><strong>Die wichtigen Risiken sind abgedeckt.</strong>Prüfe trotzdem ab und zu Leistungen und Beiträge.</p>`) +
        (check.length ? `<p class="feedback bad"><strong>Kritisch prüfen:</strong>${check.map((i) => i.name).join(", ")}. Hier sparst du womöglich Geld.</p>` : "");
    };
    const save = () => K().setData("insurance", { sit: Object.assign({}, sit), have: Object.assign({}, have) });
    host.querySelectorAll("[data-sit]").forEach((c) => c.addEventListener("click", () => { sit[c.dataset.sit] = !sit[c.dataset.sit]; save(); draw(); }));
    draw();
  };

  W.pensionGap = function (host) {
    const KV = 0.89; // grob: Kranken- und Pflegeversicherung der Rentner abziehen
    const s = K().getData("pension") || { netto: 2400, rente: 1300, anteil: 80, jahre: 30, dauer: 20, rendite: 3 };
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${numberField({ key: "netto", label: "Dein Netto heute pro Monat (€)", value: s.netto, step: 50 })}
        ${numberField({ key: "rente", label: "Rente laut Renteninformation, brutto (€)", value: s.rente, step: 50 })}
        ${slider({ key: "anteil", label: "Bedarf im Alter, Anteil vom Netto", min: 50, max: 100, step: 5, value: s.anteil })}
        ${slider({ key: "jahre", label: "Jahre bis zur Rente", min: 1, max: 45, step: 1, value: s.jahre })}
        ${slider({ key: "dauer", label: "Jahre in Rente", min: 10, max: 35, step: 1, value: s.dauer })}
        ${slider({ key: "rendite", label: "Rendite nach Inflation", min: 0, max: 6, step: 0.5, value: s.rendite })}
      </div>
      <div class="stack" style="gap:6px">
        <div class="row" style="justify-content:space-between"><b>Dein Bedarf im Alter</b><span class="num" data-k="need"></span></div>
        <div class="stackbar" data-k="bar"></div>
        ${legend([{ name: "Gesetzliche Rente, netto geschätzt", color: "var(--s1)" }, { name: "Rentenlücke", color: "var(--s2)" }])}
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="gap"></span><span class="l">Rentenlücke pro Monat</span></div>
        <div class="kpi"><span class="v" data-k="cap"></span><span class="l">nötiges Vermögen zum Rentenstart</span></div>
        <div class="kpi"><span class="v" data-k="save"></span><span class="l">Sparrate pro Monat ab heute</span></div>
      </div>
      <p class="small muted">Alle Beträge in heutiger Kaufkraft. Von der Bruttorente werden grob 11 % für Kranken- und Pflegeversicherung abgezogen. Steuern auf die Rente sind nicht berücksichtigt.</p>
    </div>`;
    const update = () => {
      const v = readInputs(host);
      host.querySelector('[data-out="anteil"]').textContent = v.anteil + " %";
      host.querySelector('[data-out="jahre"]').textContent = v.jahre;
      host.querySelector('[data-out="dauer"]').textContent = v.dauer;
      host.querySelector('[data-out="rendite"]').textContent = num(v.rendite, 1) + " %";
      const need = (v.netto * v.anteil) / 100;
      const pension = v.rente * KV;
      const gap = Math.max(0, need - pension);
      const r = v.rendite / 100;
      const annuity = r ? (1 - Math.pow(1 + r, -v.dauer)) / r : v.dauer;
      const capital = gap * 12 * annuity;
      const rm = r / 12, n = v.jahre * 12;
      const rate = capital === 0 ? 0 : rm ? (capital * rm) / (Math.pow(1 + rm, n) - 1) : capital / n;
      const p1 = need ? clamp((pension / need) * 100, 0, 100) : 100;
      host.querySelector('[data-k="need"]').textContent = eur(need);
      host.querySelector('[data-k="bar"]').innerHTML =
        `<div class="seg-1" style="flex:0 0 ${p1}%">${p1 >= 25 ? eur(Math.min(pension, need)) : ""}</div><div class="seg-2" style="flex:1 1 0">${100 - p1 >= 25 ? eur(gap) : ""}</div>`;
      host.querySelector('[data-k="gap"]').textContent = eur(gap);
      host.querySelector('[data-k="cap"]').textContent = eur(Math.round(capital / 1000) * 1000);
      host.querySelector('[data-k="save"]').textContent = eur(rate);
      K().setData("pension", v);
    };
    host.addEventListener("input", update);
    update();
  };

  /* ---------- Verhandeln ---------- */

  const SORT_ITEMS = [
    { t: "„Ich will 4.000 € brutto.“", a: "pos", why: "Eine konkrete Forderung. Das Interesse dahinter könnte Sicherheit oder Anerkennung sein." },
    { t: "„Ich möchte mir eine eigene Wohnung leisten können.“", a: "int", why: "Das ist der Grund. Dafür gibt es mehrere Wege: mehr Gehalt, Zuschüsse, weniger Pendelkosten." },
    { t: "„Ich arbeite ab sofort nur noch drei Tage im Büro.“", a: "pos", why: "Eine feste Forderung. Was steckt dahinter? Vielleicht Zeit für Familie oder ruhiges Arbeiten." },
    { t: "„Ich brauche mehr Zeit, um meine Kinder von der Kita abzuholen.“", a: "int", why: "Das eigentliche Bedürfnis. Gleitzeit könnte es genauso lösen wie Homeoffice." },
    { t: "„Der Preis muss unter 200 € liegen.“", a: "pos", why: "Eine Grenze. Das Interesse könnte sein, im Monatsbudget zu bleiben. Ratenzahlung wäre auch eine Lösung." },
    { t: "„Ich möchte mich im Job weiterentwickeln.“", a: "int", why: "Ein Interesse. Mögliche Lösungen: neue Aufgaben, Weiterbildung, ein Mentor." }
  ];
  W.interestsSort = function (host, ctx) {
    const answers = {};
    host.innerHTML = `<div class="widget"><div>${SORT_ITEMS.map((it, i) => `<div class="sort-item">
        <span>${it.t}</span>
        <div class="row" role="group" aria-label="Position oder Interesse">
          <button type="button" class="chip" data-i="${i}" data-a="pos">Position</button>
          <button type="button" class="chip" data-i="${i}" data-a="int">Interesse</button>
        </div>
        <p class="small muted" data-why="${i}" aria-live="polite"></p></div>`).join("")}</div>
      <p class="verdict" data-r="score" aria-live="polite"></p></div>`;
    const done = () => Object.keys(answers).length;
    const draw = () => {
      const right = Object.keys(answers).filter((i) => answers[i] === SORT_ITEMS[i].a).length;
      host.querySelector('[data-r="score"]').innerHTML = done() < SORT_ITEMS.length
        ? `${done()} von ${SORT_ITEMS.length} beantwortet.`
        : `<b>${right} von ${SORT_ITEMS.length} richtig.</b> Frag in deiner nächsten Verhandlung: „Was ist Ihnen dabei wichtig?“`;
      ctx && ctx.block(done() < SORT_ITEMS.length);
    };
    host.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i;
      if (answers[i]) return;
      answers[i] = b.dataset.a;
      const ok = b.dataset.a === SORT_ITEMS[i].a;
      host.querySelectorAll(`[data-i="${i}"]`).forEach((x) => {
        x.disabled = true;
        if (x.dataset.a === SORT_ITEMS[i].a) x.classList.add("correct");
        else if (x === b) x.classList.add("wrong");
      });
      host.querySelector(`[data-why="${i}"]`).textContent = (ok ? "Richtig. " : "Nicht ganz. ") + SORT_ITEMS[i].why;
      draw();
    }));
    draw();
  };

  W.salaryPlan = function (host) {
    const s = Object.assign({ heute: 42000, von: 45000, bis: 52000, ziel: 50000, grenze: 46000, argumente: "", plan: "" }, K().getData("salary"));
    const field = (key, label, ph) => { const sid = id(key); return `<div class="control"><label for="${sid}">${label}</label><textarea id="${sid}" data-t="${key}" placeholder="${ph}">${esc(s[key])}</textarea></div>`; };
    host.innerHTML = `<div class="widget">
      <div class="controls">
        ${numberField({ key: "heute", label: "Dein Gehalt heute (€ brutto/Jahr)", value: s.heute, step: 500 })}
        ${numberField({ key: "von", label: "Marktspanne von (€)", value: s.von, step: 500 })}
        ${numberField({ key: "bis", label: "Marktspanne bis (€)", value: s.bis, step: 500 })}
        ${numberField({ key: "ziel", label: "Dein Ziel (€)", value: s.ziel, step: 500 })}
        ${numberField({ key: "grenze", label: "Deine Untergrenze (€)", value: s.grenze, step: 500 })}
      </div>
      <div class="stack" style="gap:8px"><div class="chart salary-line" data-r="line"></div><div data-r="keys"></div></div>
      <div class="kpis">
        <div class="kpi"><span class="v" data-k="anker"></span><span class="l">Vorschlag für deine erste Zahl</span></div>
        <div class="kpi"><span class="v" data-k="plus"></span><span class="l">Ziel im Vergleich zu heute</span></div>
      </div>
      <p class="verdict" data-k="say" aria-live="polite"></p>
      <div class="ikigai-grid">
        ${field("argumente", "Deine drei stärksten Argumente", "z. B. Projekt X geleitet, neue Kundin gewonnen, Abläufe verbessert")}
        ${field("plan", "Dein Plan B, falls es kein Ja gibt", "z. B. Weiterbildung verhandeln, Termin in 6 Monaten, Stellenangebote ansehen")}
      </div>
    </div>`;
    const round500 = (x) => Math.round(x / 500) * 500;
    const update = () => {
      const v = readInputs(host);
      host.querySelectorAll("[data-t]").forEach((t) => (v[t.dataset.t] = t.value));
      const anker = round500(v.ziel * 1.06);
      const box = host.querySelector('[data-r="line"]');
      const W2 = Math.max(300, Math.round(box.clientWidth) || 600), H2 = 74, pad = 14;
      const vals = [v.heute, v.von, v.bis, v.ziel, v.grenze, anker].filter((x) => x > 0);
      const lo = Math.min(...vals) * 0.97, hi = Math.max(...vals) * 1.03;
      const x = (val) => pad + ((W2 - 2 * pad) * (val - lo)) / (hi - lo || 1);
      const marks = [
        { val: v.heute, name: "Heute", color: "var(--ink-2)" },
        { val: v.grenze, name: "Untergrenze", color: "var(--bad)" },
        { val: v.ziel, name: "Ziel", color: "var(--good)" },
        { val: anker, name: "Erste Zahl", color: "var(--gold)" }
      ].filter((mk) => mk.val > 0).sort((a, b) => a.val - b.val);
      const anchorOf = (px) => (px < 70 ? "start" : px > W2 - 70 ? "end" : "middle");
      let svg = `<line x1="${pad}" x2="${W2 - pad}" y1="22" y2="22" style="stroke:var(--line);stroke-width:2"/>`;
      if (v.bis > v.von) {
        svg += `<rect x="${x(v.von)}" y="12" width="${x(v.bis) - x(v.von)}" height="20" rx="5" style="fill:var(--accent);fill-opacity:.22"/>`;
        const mid = (x(v.von) + x(v.bis)) / 2;
        svg += `<text x="${mid}" y="54" text-anchor="${anchorOf(mid)}" style="fill:var(--accent)">Marktspanne ${num(v.von / 1000)}–${num(v.bis / 1000)} T €</text>`;
      }
      marks.forEach((mk) => {
        svg += `<circle cx="${x(mk.val)}" cy="22" r="7" style="fill:${mk.color};stroke:var(--surface);stroke-width:2"><title>${mk.name}: ${eur(mk.val)}</title></circle>`;
      });
      box.innerHTML = `<svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="Deine Zahlen auf einer Gehaltsskala">${svg}</svg>`;
      host.querySelector('[data-r="keys"]').innerHTML = `<div class="legend">${marks
        .map((mk) => `<span><i style="background:${mk.color};border-radius:50%"></i>${mk.name} <b class="num">${eur(mk.val)}</b></span>`)
        .join("")}</div>`;
      host.querySelector('[data-k="anker"]').textContent = eur(anker);
      host.querySelector('[data-k="plus"]').textContent = v.heute ? (v.ziel >= v.heute ? "+" : "") + num(((v.ziel - v.heute) / v.heute) * 100, 1) + " %" : "–";
      const notes = [];
      if (v.grenze > v.ziel) notes.push("Deine Untergrenze liegt über deinem Ziel. Prüfe die beiden Zahlen noch einmal.");
      if (v.bis > v.von && anker > v.bis * 1.1) notes.push("Deine erste Zahl liegt deutlich über der Marktspanne. Dafür brauchst du sehr gute Argumente.");
      if (v.bis > v.von && v.ziel < v.von) notes.push("Dein Ziel liegt unter der Marktspanne. Du darfst mehr verlangen.");
      host.querySelector('[data-k="say"]').innerHTML = notes.length
        ? notes.join(" ")
        : `<b>Dein Einstieg:</b> „Mit Blick auf meine Ergebnisse und die Marktlage halte ich ${eur(anker)} für angemessen.“ Danach: schweigen und zuhören.`;
      K().setData("salary", v);
    };
    host.addEventListener("input", update);
    update();
    redrawOnResize(host.querySelector('[data-r="line"]'), update);
  };

  window.Widgets = W;
  window.WidgetParts = { radar, wheel, venn, DIMS, WHEEL_AREAS, strengthScores, topStrengths, QUESTIONS, ikigaiOverlaps, IKI, esc, eur };
})();
