const TOKEN = new URLSearchParams(location.search).get("t");

let SRC = "";
let ETAG = null;

function phaseStatus(phase) {
  const text = phase.body.join("");
  const total = (text.match(/^\s*-\s*\[[ xX]\]/gm) || []).length;
  const done = (text.match(/^\s*-\s*\[[xX]\]/gm) || []).length;
  if (total === 0) return { kind: "none", done: 0, total: 0 };
  if (done === total) return { kind: "done", done, total };
  if (done === 0) return { kind: "todo", done, total };
  return { kind: "wip", done, total };
}

function badgeLabel(s) {
  return ({done:"Done", wip:"In progress", todo:"Todo"})[s.kind];
}

function renderProgressBar(phases) {
  if (!document.body.classList.contains("plan-mode")) return;
  let done = 0, total = 0;
  for (const p of phases) {
    const s = phaseStatus(p); done += s.done; total += s.total;
  }
  const pct = total ? Math.round(100 * done / total) : 0;
  const meta = document.getElementById("meta");
  meta.innerHTML = `
    <span>${done} of ${total} tasks</span>
    <div id="progress-bar" class="progress-bar"><div style="width:${pct}%"></div></div>
  `;
}

function parsePhases(src) {
  // Split source into: prelude (everything before first H2) + array of phases
  // Each phase: { title, level: 2, raw, body, tokens }
  const tokens = marked.lexer(src);
  const phases = [];
  let prelude = [];
  let current = null;
  for (const tok of tokens) {
    if (tok.type === "heading" && tok.depth === 2) {
      if (current) phases.push(current);
      current = { title: tok.text, raw: tok.raw, body: [], tokens: [] };
      continue;
    }
    if (current) {
      current.body.push(tok.raw);
      current.tokens.push(tok);
    } else {
      prelude.push(tok);
    }
  }
  if (current) phases.push(current);
  return { prelude, phases };
}

async function fetchPlan() {
  const r = await fetch(`/plan?t=${TOKEN}`);
  if (!r.ok) throw new Error(`load: ${r.status}`);
  return { body: await r.text(), etag: r.headers.get("ETag") };
}

function renderPhases(phases) {
  const content = document.getElementById("content");
  content.replaceChildren();
  phases.forEach((phase, i) => {
    const el = document.createElement("section");
    el.className = "phase"; el.id = `phase-${i}`;
    const status = phaseStatus(phase);
    const badge = status.kind !== "none"
      ? `<span class="badge ${status.kind}">${badgeLabel(status)}</span>`
      : "";
    el.innerHTML = `
      <header class="phase-head">
        <span class="chev">▾</span>
        <h2>${escapeHtml(phase.title)}</h2>
        ${badge}
      </header>
      <div class="phase-body">${marked.parse(phase.body.join(""))}</div>
    `;
    content.appendChild(el);
  });
}

function renderSidebar(phases) {
  const side = document.getElementById("sidebar");
  side.replaceChildren();
  phases.forEach((p, i) => {
    const s = phaseStatus(p);
    const item = document.createElement("a");
    item.className = "nav-item";
    item.href = `#phase-${i}`;
    const frac = s.total ? `<span class="frac">${s.done}/${s.total}</span>` : "";
    item.innerHTML = `<div class="pill ${s.kind}">${i+1}</div><span>${escapeHtml(p.title)}</span>${frac}`;
    side.appendChild(item);
  });
}

function attachScrollSpy() {
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        document.querySelectorAll(".nav-item.active").forEach(n => n.classList.remove("active"));
        const id = e.target.id;
        document.querySelector(`.nav-item[href="#${id}"]`)?.classList.add("active");
      }
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".phase").forEach(p => obs.observe(p));
}

function attachCollapse() {
  document.querySelectorAll(".phase-head").forEach(h => {
    h.addEventListener("click", () => h.parentElement.classList.toggle("collapsed"));
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { body, etag } = await fetchPlan();
    SRC = body; ETAG = etag;
    const { prelude, phases } = parsePhases(body);
    const h1 = prelude.find(t => t.type === "heading" && t.depth === 1);
    document.getElementById("title").textContent = h1 ? h1.text : "Plan";

    const isPlan = /^\s*-\s*\[[ xX]\]/m.test(body);
    document.body.classList.add(isPlan ? "plan-mode" : "doc-mode");

    renderPhases(phases);
    renderSidebar(phases);
    renderProgressBar(phases);
    attachScrollSpy();
    attachCollapse();
  } catch (e) {
    document.getElementById("title").textContent = "Failed to load";
    console.error(e);
  }
});
