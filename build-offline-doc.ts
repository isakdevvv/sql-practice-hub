import { PROBLEMS } from "./src/lib/problems/data";
import { writeFileSync } from "fs";

const LEVEL_NAMES: Record<number, string> = {
  0: "Basics",
  1: "Filtering",
  2: "Joins",
  3: "Aggregation",
  4: "Subqueries",
  5: "Advanced",
};

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const grouped = new Map<number, typeof PROBLEMS>();
for (const p of PROBLEMS) {
  if (!grouped.has(p.level)) grouped.set(p.level, [] as any);
  grouped.get(p.level)!.push(p);
}
const levels = [...grouped.keys()].sort((a, b) => a - b);

const tocHtml = levels
  .map((lv) => {
    const list = grouped.get(lv)!;
    const items = list
      .map(
        (p, i) =>
          `<a href="#${p.id}"><span class="num">${i + 1}.</span> ${esc(p.title)}</a>`,
      )
      .join("");
    return `<details open><summary>Nivå ${lv} — ${LEVEL_NAMES[lv]} <span class="cnt">(${list.length})</span></summary><div class="toc-list">${items}</div></details>`;
  })
  .join("");

const cards = PROBLEMS.map((p, idx) => {
  const hints = (p.hints || [])
    .map((h, i) => `<li data-i="${i}" hidden>${esc(h)}</li>`)
    .join("");
  const topics = (p.topics || [])
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");
  return `
<section class="problem" id="${p.id}" data-id="${p.id}" data-level="${p.level}">
  <header>
    <div class="left">
      <span class="badge lv lv-${p.level}">L${p.level}</span>
      <span class="badge diff">★ ${p.difficulty}</span>
      <h2>${idx + 1}. ${esc(p.title)}</h2>
    </div>
    <div class="right">
      <span class="status" data-status></span>
    </div>
  </header>
  <div class="topics">${topics}</div>
  <p class="goal"><em>${esc(p.goal)}</em></p>
  <p class="problem-text">${esc(p.problem)}</p>
  ${p.pre_sql ? `<details class="presql"><summary>Forberedt SQL (kjøres før din kode)</summary><pre>${esc(p.pre_sql)}</pre></details>` : ""}
  <div class="starter-label">Starter:</div>
  <pre class="starter">${esc(p.starter_sql || "-- skriv her --")}</pre>
  <label class="answer-label">Ditt svar:</label>
  <textarea class="answer" spellcheck="false" data-id="${p.id}" placeholder="Skriv SQL-spørringen din her..."></textarea>
  <div class="actions">
    <button data-act="check">Sjekk</button>
    <button data-act="hint">Hint (${(p.hints || []).length})</button>
    <button data-act="solution">Vis fasit</button>
    <button data-act="reset" class="ghost">Nullstill</button>
    <button data-act="done" class="ghost">Marker ferdig</button>
  </div>
  <div class="feedback" hidden></div>
  <ul class="hints">${hints}</ul>
  <details class="solution"><summary>Fasit & forklaring</summary>
    <div class="sol-label">Fasit:</div>
    <pre class="sol">${esc(p.solution)}</pre>
    ${
      p.alt_solutions && p.alt_solutions.length
        ? `<div class="sol-label">Alternative løsninger:</div>${p.alt_solutions
            .map((s) => `<pre class="sol alt">${esc(s)}</pre>`)
            .join("")}`
        : ""
    }
    ${p.verify_sql ? `<div class="sol-label">Verifikasjon:</div><pre class="sol">${esc(p.verify_sql)}</pre>` : ""}
    <div class="sol-label">Forklaring:</div>
    <p class="explanation">${esc(p.explanation)}</p>
  </details>
</section>`;
}).join("");

const html = `<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SQL øvingsdokument — offline (${PROBLEMS.length} oppgaver)</title>
<style>
  :root {
    --bg: #0f1620;
    --panel: #161e2a;
    --panel2: #1c2532;
    --border: #2a3344;
    --text: #e6ecf3;
    --muted: #8a96a8;
    --accent: #4ea1ff;
    --good: #34c98e;
    --bad: #ff6b81;
    --warn: #f0c36d;
    --code: #0b1018;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px; line-height: 1.45; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code, pre, textarea { font-family: "Menlo", "Consolas", monospace; }
  pre { background: var(--code); border: 1px solid var(--border); padding: 8px 10px;
    border-radius: 6px; overflow-x: auto; font-size: 12.5px; margin: 4px 0; white-space: pre-wrap; }
  textarea { width: 100%; min-height: 90px; resize: vertical; padding: 8px 10px;
    background: var(--code); color: var(--text); border: 1px solid var(--border);
    border-radius: 6px; font-size: 13px; line-height: 1.4; }
  textarea:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
  button { background: var(--panel2); color: var(--text); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover { background: #232d3e; }
  button.ghost { background: transparent; color: var(--muted); }

  /* Header */
  .top {
    position: sticky; top: 0; z-index: 10;
    background: rgba(15, 22, 32, 0.95); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border); padding: 10px 16px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  .top h1 { font-size: 16px; margin: 0; font-weight: 600; }
  .top .stats { color: var(--muted); font-size: 13px; }
  .top .stats b { color: var(--good); }
  .top .filter { display: flex; gap: 4px; flex-wrap: wrap; }
  .top .filter button { padding: 4px 8px; font-size: 12px; }
  .top .filter button.on { border-color: var(--accent); color: var(--accent); }
  .top .search { flex: 1; min-width: 180px; max-width: 320px; }
  .top input[type=search] { width: 100%; padding: 6px 10px; border-radius: 6px;
    background: var(--panel2); color: var(--text); border: 1px solid var(--border); font-size: 13px; }

  .layout { display: grid; grid-template-columns: 280px 1fr; gap: 0; }
  @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } aside { display: none; } }

  aside {
    background: var(--panel); border-right: 1px solid var(--border);
    padding: 12px; height: calc(100vh - 50px); overflow-y: auto; position: sticky; top: 50px;
  }
  aside details { margin-bottom: 6px; }
  aside summary { cursor: pointer; padding: 4px 0; font-weight: 600; font-size: 13px; }
  aside summary .cnt { color: var(--muted); font-weight: 400; font-size: 12px; }
  aside .toc-list { display: flex; flex-direction: column; gap: 1px; padding: 4px 0 4px 8px; }
  aside .toc-list a { font-size: 12.5px; padding: 3px 6px; border-radius: 4px; color: var(--text); }
  aside .toc-list a:hover { background: var(--panel2); text-decoration: none; }
  aside .toc-list a.done { color: var(--good); }
  aside .toc-list a.done::after { content: " ✓"; }
  aside .toc-list a .num { color: var(--muted); margin-right: 6px; font-variant-numeric: tabular-nums; }

  main { padding: 16px 24px 80px; max-width: 980px; }
  .intro { background: var(--panel); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px 16px; margin: 0 0 18px 0; font-size: 13.5px; color: var(--muted); }
  .intro b { color: var(--text); }
  .intro ul { margin: 6px 0 0 18px; padding: 0; }

  .problem {
    background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
    padding: 14px 16px; margin: 0 0 16px 0; scroll-margin-top: 60px;
  }
  .problem.done { border-color: rgba(52, 201, 142, 0.5); }
  .problem header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .problem header .left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .problem h2 { font-size: 15.5px; margin: 0; font-weight: 600; }

  .badge { font-size: 11px; padding: 2px 7px; border-radius: 999px; background: var(--panel2);
    border: 1px solid var(--border); color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .badge.lv-0 { color: #8ab4f8; border-color: #8ab4f880; }
  .badge.lv-1 { color: #34c98e; border-color: #34c98e80; }
  .badge.lv-2 { color: #f0c36d; border-color: #f0c36d80; }
  .badge.lv-3 { color: #f08a5d; border-color: #f08a5d80; }
  .badge.lv-4 { color: #ff6b81; border-color: #ff6b8180; }
  .badge.lv-5 { color: #c084fc; border-color: #c084fc80; }
  .badge.diff { color: #f0c36d; }

  .topics { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0 4px 0; }
  .tag { font-size: 11px; background: #232d3e; color: #aab8cc; padding: 1px 7px; border-radius: 4px; }

  .goal { color: var(--muted); margin: 4px 0 6px 0; font-size: 13px; }
  .problem-text { margin: 6px 0 8px 0; }
  .starter-label, .answer-label, .sol-label { font-size: 11.5px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 2px 0; }
  pre.starter { background: #0a1322; opacity: 0.85; }
  .actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }

  .feedback { margin-top: 10px; padding: 10px 12px; border-radius: 6px;
    border: 1px solid var(--border); font-size: 13px; }
  .feedback.good { background: rgba(52, 201, 142, 0.1); border-color: var(--good); color: #b4f0d4; }
  .feedback.bad  { background: rgba(255, 107, 129, 0.08); border-color: var(--bad); color: #ffc4cd; }
  .feedback.warn { background: rgba(240, 195, 109, 0.1); border-color: var(--warn); color: #ffe2a8; }
  .feedback .diff { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; }
  .feedback .diff > div > .sol-label { margin-top: 0; }
  .feedback pre { margin: 2px 0; }

  .hints { padding: 0; margin: 8px 0 0 0; list-style: none; }
  .hints li { background: rgba(240, 195, 109, 0.08); border: 1px solid rgba(240, 195, 109, 0.4);
    padding: 6px 10px; border-radius: 6px; margin: 4px 0; font-size: 13px; color: #ffe2a8; }
  .hints li::before { content: "💡 "; }

  .solution { margin-top: 10px; }
  .solution summary { cursor: pointer; color: var(--muted); font-size: 13px;
    padding: 4px 0; user-select: none; }
  .solution[open] summary { color: var(--text); }
  .solution pre.sol { background: rgba(52, 201, 142, 0.06); border-color: rgba(52, 201, 142, 0.4); }
  .solution pre.sol.alt { background: rgba(78, 161, 255, 0.06); border-color: rgba(78, 161, 255, 0.4); }
  .explanation { font-size: 13px; color: #c8d3e0; margin: 4px 0 0 0; }

  .status { font-size: 13px; }
  .status.ok { color: var(--good); }
  .status.no { color: var(--bad); }

  .presql summary { cursor: pointer; color: var(--muted); font-size: 12.5px; }
  .presql pre { font-size: 11.5px; }

  .level-section { margin: 28px 0 14px 0; padding-bottom: 4px;
    border-bottom: 1px solid var(--border); font-size: 17px; font-weight: 600; }

  /* Hidden filter state */
  .problem.filtered-out { display: none; }

  /* Print friendliness */
  @media print {
    .top, aside, .actions, button { display: none !important; }
    .problem { break-inside: avoid; border: 1px solid #999; }
    .layout { grid-template-columns: 1fr; }
    body { background: #fff; color: #000; }
    pre, textarea { background: #f6f8fa; color: #111; border: 1px solid #ccc; }
  }
</style>
</head>
<body>

<div class="top">
  <h1>SQL øvingsdokument <span class="stats">— offline</span></h1>
  <div class="stats"><b id="stat-done">0</b> / <span id="stat-total">${PROBLEMS.length}</span> ferdig</div>
  <div class="search"><input type="search" id="q" placeholder="Søk i tittel/topic..." /></div>
  <div class="filter" id="lvfilter">
    <button data-lv="all" class="on">Alle</button>
    ${levels.map((lv) => `<button data-lv="${lv}">L${lv}</button>`).join("")}
    <button data-lv="undone">Ikke ferdig</button>
  </div>
  <button id="reset-all" class="ghost" title="Slett all lagret framgang">Nullstill alt</button>
</div>

<div class="layout">
  <aside id="toc">${tocHtml}</aside>
  <main>
    <div class="intro">
      <b>Hvordan bruke:</b>
      <ul>
        <li>Skriv SQL-en din i tekstfeltet og trykk <b>Sjekk</b>. Sjekken kjører <em>ikke</em> SQL — den sammenligner spørringen med fasiten etter normalisering (mellomrom, store/små bokstaver og semikolon ignoreres).</li>
        <li>Det betyr at logisk like, men ulikt skrevet løsninger kan markeres som «avvik». Trykk da <b>Vis fasit</b> og sammenlign selv.</li>
        <li>Trykk <b>Hint</b> for ett hint av gangen, eller <b>Marker ferdig</b> hvis du har løst det på papir.</li>
        <li>Framgangen lagres i nettleseren (localStorage) — bruk <em>Nullstill alt</em> for å starte på nytt.</li>
        <li>Filtrér på nivå eller søk i tittel/topic via toppmenyen.</li>
      </ul>
    </div>

    ${levels
      .map((lv) => {
        const list = grouped.get(lv)!;
        const sectionCards = list
          .map((p) => {
            const idx = PROBLEMS.findIndex((x) => x.id === p.id);
            return cards.split("</section>")[idx] + "</section>";
          })
          .join("");
        // Note: above split-trick is fragile; instead build per-level below
        return "";
      })
      .join("")}

    <!-- All cards rendered in original order, with level dividers injected -->
    <div id="all-cards"></div>
  </main>
</div>

<script id="problems-data" type="application/json">${JSON.stringify(
  PROBLEMS,
).replace(/</g, "\\u003c")}</script>
<script>
(function() {
  // Build cards in DOM (avoids the fragile string split above by re-rendering once at load)
  // We already have cards as static HTML in the variable below — but for clarity & smaller patch
  // surface, we inject the prebuilt HTML here:
  document.getElementById("all-cards").innerHTML = ${JSON.stringify(
    levels
      .map((lv) => {
        const list = grouped.get(lv)!;
        const heading = `<div class="level-section" id="lv${lv}">Nivå ${lv} — ${LEVEL_NAMES[lv]} <span style="color:var(--muted);font-weight:400;font-size:13px;">(${list.length} oppgaver)</span></div>`;
        const sec = list
          .map((p, i) => {
            const idx = PROBLEMS.findIndex((x) => x.id === p.id);
            const card = `<section class="problem" id="${p.id}" data-id="${p.id}" data-level="${p.level}" data-search="${esc(
              (p.title + " " + (p.topics || []).join(" ")).toLowerCase(),
            )}">
  <header>
    <div class="left">
      <span class="badge lv lv-${p.level}">L${p.level}</span>
      <span class="badge diff">★ ${p.difficulty}</span>
      <h2>${idx + 1}. ${esc(p.title)}</h2>
    </div>
    <div class="right"><span class="status" data-status></span></div>
  </header>
  <div class="topics">${(p.topics || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
  <p class="goal"><em>${esc(p.goal)}</em></p>
  <p class="problem-text">${esc(p.problem)}</p>
  ${p.pre_sql ? `<details class="presql"><summary>Forberedt SQL (kjøres før din kode)</summary><pre>${esc(p.pre_sql)}</pre></details>` : ""}
  <div class="starter-label">Starter:</div>
  <pre class="starter">${esc(p.starter_sql || "-- skriv her --")}</pre>
  <label class="answer-label">Ditt svar:</label>
  <textarea class="answer" spellcheck="false" data-id="${p.id}" placeholder="Skriv SQL-spørringen din her..."></textarea>
  <div class="actions">
    <button data-act="check">Sjekk</button>
    <button data-act="hint">Hint (${(p.hints || []).length})</button>
    <button data-act="solution">Vis fasit</button>
    <button data-act="reset" class="ghost">Nullstill</button>
    <button data-act="done" class="ghost">Marker ferdig</button>
  </div>
  <div class="feedback" hidden></div>
  <ul class="hints">${(p.hints || [])
    .map((h, i) => `<li data-i="${i}" hidden>${esc(h)}</li>`)
    .join("")}</ul>
  <details class="solution"><summary>Fasit & forklaring</summary>
    <div class="sol-label">Fasit:</div>
    <pre class="sol">${esc(p.solution)}</pre>
    ${
      p.alt_solutions && p.alt_solutions.length
        ? `<div class="sol-label">Alternative løsninger:</div>${p.alt_solutions
            .map((s) => `<pre class="sol alt">${esc(s)}</pre>`)
            .join("")}`
        : ""
    }
    ${p.verify_sql ? `<div class="sol-label">Verifikasjon:</div><pre class="sol">${esc(p.verify_sql)}</pre>` : ""}
    <div class="sol-label">Forklaring:</div>
    <p class="explanation">${esc(p.explanation)}</p>
  </details>
</section>`;
            return card;
          })
          .join("");
        return heading + sec;
      })
      .join(""),
  )};

  const STORAGE_KEY = "sqlhub_offline_v1";
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function pState(id) { return state[id] || (state[id] = { ans: "", hints: 0, done: false }); }

  // Normalize SQL for comparison: case-insensitive, whitespace-insensitive,
  // ignores comments and trailing semicolons. Preserves case INSIDE string literals.
  function normSql(sql) {
    if (!sql) return "";
    const strings = [];
    let s = String(sql).replace(/'((?:[^']|'')*)'/g, function(_, c) {
      strings.push(c);
      return "\\u0001" + (strings.length - 1) + "\\u0001";
    });
    s = s
      .replace(/--[^\\n]*/g, "")
      .replace(/\\/\\*[\\s\\S]*?\\*\\//g, "")
      .replace(/\\s+/g, " ")
      .replace(/\\s*([(),;])\\s*/g, "$1")
      .replace(/;+\\s*$/, "")
      .trim()
      .toLowerCase();
    s = s.replace(/\\u0001(\\d+)\\u0001/g, function(_, i) {
      return "'" + strings[+i] + "'";
    });
    return s;
  }

  function isCorrect(user, p) {
    const u = normSql(user);
    if (!u) return false;
    const candidates = [p.solution].concat(p.alt_solutions || []);
    return candidates.some(function(c) { return normSql(c) === u; });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const PROBLEMS_DATA = JSON.parse(document.getElementById("problems-data").textContent);
  const PROBLEMS_BY_ID = {};
  PROBLEMS_DATA.forEach(function(p) { PROBLEMS_BY_ID[p.id] = p; });

  function updateStats() {
    const done = Object.values(state).filter(function(v) { return v && v.done; }).length;
    document.getElementById("stat-done").textContent = done;
    document.querySelectorAll("aside .toc-list a").forEach(function(a) {
      const id = a.getAttribute("href").slice(1);
      a.classList.toggle("done", !!(state[id] && state[id].done));
    });
  }

  function setStatus(section, kind) {
    const el = section.querySelector("[data-status]");
    el.classList.remove("ok", "no");
    if (kind === "ok") { el.classList.add("ok"); el.textContent = "✓ ferdig"; section.classList.add("done"); }
    else if (kind === "no") { el.classList.add("no"); el.textContent = "✗"; section.classList.remove("done"); }
    else { el.textContent = ""; section.classList.remove("done"); }
  }

  function restore() {
    document.querySelectorAll(".problem").forEach(function(section) {
      const id = section.dataset.id;
      const ps = pState(id);
      const ta = section.querySelector(".answer");
      ta.value = ps.ans || "";
      const hints = section.querySelectorAll(".hints li");
      hints.forEach(function(li, i) { li.hidden = i >= (ps.hints || 0); });
      if (ps.done) setStatus(section, "ok");
    });
    updateStats();
  }

  function showFeedback(section, kind, html) {
    const fb = section.querySelector(".feedback");
    fb.className = "feedback " + kind;
    fb.innerHTML = html;
    fb.hidden = false;
  }
  function clearFeedback(section) {
    const fb = section.querySelector(".feedback");
    fb.hidden = true; fb.innerHTML = "";
  }

  document.addEventListener("input", function(e) {
    if (e.target.matches("textarea.answer")) {
      const id = e.target.dataset.id;
      pState(id).ans = e.target.value;
      save();
    }
    if (e.target.id === "q") applyFilter();
  });

  document.addEventListener("click", function(e) {
    const btn = e.target.closest("button[data-act]");
    if (btn) {
      const section = btn.closest(".problem");
      const id = section.dataset.id;
      const p = PROBLEMS_BY_ID[id];
      const ps = pState(id);
      const act = btn.dataset.act;

      if (act === "check") {
        const ta = section.querySelector(".answer");
        const ans = ta.value;
        if (!ans.trim()) {
          showFeedback(section, "warn", "Skriv inn et svar først.");
          return;
        }
        if (isCorrect(ans, p)) {
          ps.done = true; save();
          setStatus(section, "ok");
          showFeedback(section, "good", "✓ <b>Riktig!</b> Spørringen din matcher fasiten (etter normalisering).");
        } else {
          setStatus(section, "no");
          const userN = escapeHtml(normSql(ans));
          const solN = escapeHtml(normSql(p.solution));
          showFeedback(
            section, "bad",
            "✗ <b>Avvik fra fasit.</b> Sjekk om noe er stavet/skrevet annerledes — eller om du har en gyldig variant. (Sammenligningen er tekstbasert.) " +
            "<div class=\\"diff\\"><div><div class=\\"sol-label\\">Din (normalisert):</div><pre>" + userN + "</pre></div>" +
            "<div><div class=\\"sol-label\\">Fasit (normalisert):</div><pre>" + solN + "</pre></div></div>"
          );
        }
      }
      else if (act === "hint") {
        const lis = section.querySelectorAll(".hints li");
        if (!lis.length) { showFeedback(section, "warn", "Ingen hint på denne oppgaven."); return; }
        const next = ps.hints || 0;
        if (next >= lis.length) {
          showFeedback(section, "warn", "Ingen flere hint — prøv «Vis fasit».");
          return;
        }
        lis[next].hidden = false;
        ps.hints = next + 1; save();
      }
      else if (act === "solution") {
        section.querySelector(".solution").open = true;
        section.querySelector(".solution").scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      else if (act === "reset") {
        const ta = section.querySelector(".answer");
        ta.value = "";
        ps.ans = ""; ps.hints = 0; ps.done = false; save();
        section.querySelectorAll(".hints li").forEach(function(li){ li.hidden = true; });
        clearFeedback(section);
        setStatus(section, "");
        section.querySelector(".solution").open = false;
        updateStats();
      }
      else if (act === "done") {
        ps.done = !ps.done; save();
        setStatus(section, ps.done ? "ok" : "");
        if (ps.done) showFeedback(section, "good", "Markert som ferdig.");
        else clearFeedback(section);
        updateStats();
      }
    }

    const fbtn = e.target.closest("#lvfilter button");
    if (fbtn) {
      document.querySelectorAll("#lvfilter button").forEach(function(b){ b.classList.remove("on"); });
      fbtn.classList.add("on");
      applyFilter();
    }

    if (e.target.id === "reset-all") {
      if (confirm("Slette all framgang og alle skrevne svar?")) {
        for (const k in state) delete state[k];
        save();
        document.querySelectorAll(".problem").forEach(function(section){
          section.querySelector(".answer").value = "";
          section.querySelectorAll(".hints li").forEach(function(li){ li.hidden = true; });
          clearFeedback(section);
          setStatus(section, "");
          section.querySelector(".solution").open = false;
        });
        updateStats();
      }
    }
  });

  function applyFilter() {
    const lvBtn = document.querySelector("#lvfilter button.on");
    const lv = lvBtn ? lvBtn.dataset.lv : "all";
    const q = (document.getElementById("q").value || "").toLowerCase().trim();
    document.querySelectorAll(".problem").forEach(function(section) {
      const id = section.dataset.id;
      const ps = state[id] || {};
      let show = true;
      if (lv === "undone") show = !ps.done;
      else if (lv !== "all") show = String(section.dataset.level) === String(lv);
      if (show && q) {
        show = (section.dataset.search || "").indexOf(q) !== -1;
      }
      section.classList.toggle("filtered-out", !show);
    });
    document.querySelectorAll(".level-section").forEach(function(h){
      const lvId = h.id.replace("lv", "");
      let any = false;
      let n = h.nextElementSibling;
      while (n && !n.classList.contains("level-section")) {
        if (n.classList.contains("problem") && !n.classList.contains("filtered-out")) { any = true; break; }
        n = n.nextElementSibling;
      }
      h.style.display = any ? "" : "none";
    });
  }

  restore();
})();
</script>
</body>
</html>`;

writeFileSync("sql-oppgaver-offline.html", html);
console.log(`Wrote sql-oppgaver-offline.html with ${PROBLEMS.length} problems`);
