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
    const every = Math.max(1, Math.ceil(n / (W < 520 ? 4 : 7)));
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
    const draw = () => {
      const groups = [
        { name: "1 Aktie", color: "var(--s1)", vals: Array.from({ length: N }, () => investor(1)) },
        { name: "50 Aktien", color: "var(--s2)", vals: Array.from({ length: N }, () => investor(50)) }
      ];
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
  };

  window.Widgets = W;
  window.WidgetParts = { radar, wheel, venn, DIMS, WHEEL_AREAS, strengthScores, topStrengths, QUESTIONS, ikigaiOverlaps, IKI, esc, eur };
})();
