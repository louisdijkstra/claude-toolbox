const TOKEN = new URLSearchParams(location.search).get("t");

let SRC = "";
let ETAG = null;

const RESOLVE_CACHE = new Map();
const IDE_LINK_RE = /\b([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{1,8})(?::(\d+))?\b/g;
const IDE_LINK_SCOPE = ".phase-body p, .phase-body li";

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

function setView(view, phases) {
  document.querySelectorAll(".view-toggle button").forEach(b => {
    b.classList.toggle("active", b.dataset.view === view);
  });
  if (view === "list") {
    renderPhases(phases);
    attachCheckboxes(); attachCollapse(); attachScrollSpy(); attachPhaseEdit(phases);
    attachAnchors(); wireCopyButtons();
  } else if (view === "kanban") {
    renderKanban(phases);
  } else if (view === "timeline") {
    renderTimeline(phases);
  }
}

function renderKanban(phases) {
  const content = document.getElementById("content");
  const cols = { todo: [], wip: [], done: [] };
  phases.forEach(p => {
    const text = p.body.join("");
    [...text.matchAll(/^\s*-\s*\[([ xX])\]\s*(.*)$/gm)].forEach(m => {
      const status = m[1].trim().toLowerCase() === "x" ? "done" : "todo";
      cols[status].push({ title: m[2], phase: p.title });
    });
  });
  content.innerHTML = `
    <div class="kanban-board">
      ${["todo","wip","done"].map(k => `
        <div class="kanban-col">
          <h5>${k}</h5>
          ${cols[k].map(c => `<div class="kanban-card"><div class="card-phase">${escapeHtml(c.phase)}</div>${escapeHtml(c.title)}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderTimeline(phases) {
  const content = document.getElementById("content");
  const rows = phases.map((p, i) => {
    const s = phaseStatus(p);
    const flex = Math.max(1, s.total || 1);
    const donePct = s.total ? Math.round(100 * s.done / s.total) : 0;
    const fillClass = s.kind === "done" ? "done" : s.kind === "wip" ? "wip" : "todo";
    const count = s.total ? `${s.done} / ${s.total}` : "—";
    return `<div class="timeline-row" data-phase-idx="${i}">
      <span class="timeline-label">${escapeHtml(p.title)}</span>
      <div class="timeline-bar" style="flex:${flex}">
        <span class="timeline-fill ${fillClass}" style="width:${donePct}%"></span>
      </div>
      <span class="timeline-count">${count}</span>
    </div>`;
  }).join("");
  content.innerHTML = `<div class="timeline">${rows}</div>`;
  document.querySelectorAll(".timeline-row").forEach(row => {
    row.addEventListener("click", () => {
      const idx = parseInt(row.dataset.phaseIdx, 10);
      setView("list", phases);
      setTimeout(() => {
        document.getElementById(`phase-${idx}`)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
  });
}

function extractDeps() {
  const edges = [];
  const depRe = /(?:depends on|requires)\s+Task\s+(\d+)/gi;
  const taskHeadRe = /^###\s+Task\s+(\d+)/gm;
  const headings = [...SRC.matchAll(taskHeadRe)].map(m => ({
    num: parseInt(m[1], 10),
    start: m.index,
  }));
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].start;
    const end = i + 1 < headings.length ? headings[i + 1].start : SRC.length;
    const block = SRC.slice(start, end);
    const num = headings[i].num;
    for (const m of block.matchAll(depRe)) {
      edges.push({ from: parseInt(m[1], 10), to: num });
    }
  }
  return edges;
}

function renderDepGraph(edges) {
  if (edges.length === 0) return "";
  const lines = ["graph LR"];
  for (const e of edges) lines.push(`  T${e.from} --> T${e.to}`);
  return `<div class="dep-graph-card"><header class="dep-graph-head">Task dependencies</header><div class="mermaid">${escapeHtml(lines.join("\n"))}</div></div>`;
}

function attachDepGraphNodes() {
  document.querySelectorAll(".dep-graph-card .mermaid g.node").forEach(node => {
    const label = (node.textContent || "").trim();
    const m = label.match(/^T(\d+)$/);
    if (!m) return;
    node.style.cursor = "pointer";
    node.addEventListener("click", () => {
      const target = document.getElementById(`task-${m[1]}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function extractCrossRefs(phases) {
  const refs = [];
  phases.forEach((p, idx) => {
    const text = p.body.join("");
    for (const m of text.matchAll(/\[\[(Phase|Task)\s+(\d+)\]\]/g)) {
      refs.push({ fromPhaseIdx: idx, toKind: m[1], toNum: parseInt(m[2], 10) });
    }
  });
  return refs;
}

function renderCrossRefMiniGraph(refs, phases) {
  const side = document.getElementById("sidebar");
  side.querySelector(".cross-ref-graph")?.remove();
  if (refs.length === 0) return;
  const n = phases.length;
  if (n === 0) return;
  const w = 200, h = 100, pad = 14;
  const xStep = (w - 2 * pad) / Math.max(1, n - 1);
  const cy = h - 18;
  const dotsHtml = phases.map((p, i) => {
    const cx = pad + i * xStep;
    return `<circle class="mini-dot" cx="${cx}" cy="${cy}" r="4" data-idx="${i}"><title>${escapeHtml(p.title)}</title></circle>`;
  }).join("");
  const arcs = refs
    .filter(r => r.toKind === "Phase" && (r.toNum - 1) !== r.fromPhaseIdx && (r.toNum - 1) >= 0 && (r.toNum - 1) < n)
    .map(r => {
      const a = pad + r.fromPhaseIdx * xStep;
      const b = pad + (r.toNum - 1) * xStep;
      const mid = (a + b) / 2;
      const lift = 22 + Math.abs(b - a) / 6;
      return `<path class="mini-arc" d="M${a},${cy} Q${mid},${cy - lift} ${b},${cy}" fill="none" />`;
    }).join("");
  const svg = `<svg class="cross-ref-graph" viewBox="0 0 ${w} ${h}" aria-label="Phase cross references">${arcs}${dotsHtml}</svg>`;
  side.insertAdjacentHTML("beforeend", svg);
  side.querySelectorAll(".cross-ref-graph .mini-dot").forEach(d => {
    d.addEventListener("click", () => {
      const idx = parseInt(d.dataset.idx, 10);
      const target = document.getElementById(`phase-${idx}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderProgressBar(phases) {
  if (!document.body.classList.contains("plan-mode")) return;
  let done = 0, total = 0;
  for (const p of phases) { const s = phaseStatus(p); done += s.done; total += s.total; }
  const pct = total ? Math.round(100 * done / total) : 0;
  document.getElementById("meta").innerHTML = `
    <span>${done} of ${total} tasks</span>
    <div id="progress-bar" class="progress-bar"><div style="width:${pct}%"></div></div>
    <div class="view-toggle">
      <button data-view="list" class="active">List</button>
      <button data-view="kanban">Kanban</button>
      <button data-view="timeline">Timeline</button>
    </div>
  `;
  document.querySelectorAll(".view-toggle button").forEach(b => {
    b.addEventListener("click", () => setView(b.dataset.view, phases));
  });
}

function attachCheckboxes() {
  const checkboxes = document.querySelectorAll(".phase-body li > input[type='checkbox']");
  checkboxes.forEach(cb => {
    cb.removeAttribute("disabled");
    cb.classList.add("task-cb");
    cb.addEventListener("change", () => onCheckboxToggle(cb));
  });
}

async function onCheckboxToggle(cb) {
  const li = cb.closest("li");
  const text = li.textContent.trim();
  const lines = SRC.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*-\s*)\[([ xX])\]\s*(.*)$/);
    if (!m) continue;
    if (m[3].trim() === text || stripMd(m[3]) === text) {
      const newMark = cb.checked ? "x" : " ";
      lines[i] = `${m[1]}[${newMark}] ${m[3]}`;
      const newSrc = lines.join("\n");
      const ok = await savePlan(newSrc);
      if (ok) {
        SRC = newSrc;
        const { phases } = parsePhases(SRC);
        renderPhases(phases);
        renderSidebar(phases);
        renderProgressBar(phases);
        attachCheckboxes();
        attachCollapse();
        attachScrollSpy();
      }
      return;
    }
  }
}

function stripMd(s) {
  return s.replace(/[*_`]/g, "").trim();
}

async function savePlan(newSrc) {
  const headers = { "Content-Type": "text/markdown; charset=utf-8" };
  if (ETAG) headers["If-Match"] = ETAG;
  try {
    const r = await fetch(`/plan?t=${TOKEN}`, { method: "PUT", body: newSrc, headers });
    if (r.status === 412) { stashDraft(newSrc); showConflict(); return false; }
    if (!r.ok) { stashDraft(newSrc); toast(`save failed: ${r.status}`); return false; }
    ETAG = r.headers.get("ETag");
    clearDraft();
    return true;
  } catch (e) {
    stashDraft(newSrc);
    toast("save failed, kept local draft");
    return false;
  }
}

function stashDraft(src) { localStorage.setItem(draftKey(), src); }
function clearDraft() { localStorage.removeItem(draftKey()); }
function draftKey() { return "plan-explorer:draft:" + location.pathname; }

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function showConflict() {
  const modal = document.getElementById("conflict-modal");
  modal.hidden = false;
  modal.innerHTML = `
    <div class="conflict-card">
      <h3>File changed on disk</h3>
      <p>Someone (or another editor) modified this file while you were editing.</p>
      <div class="conflict-actions">
        <button id="conflict-reload">Reload from disk</button>
        <button id="conflict-force">Force-save mine</button>
      </div>
    </div>
  `;
  modal.querySelector("#conflict-reload").addEventListener("click", async () => {
    modal.hidden = true;
    const { body, etag } = await fetchPlan();
    SRC = body; ETAG = etag;
    const { preludeRaw, phases } = parsePhases(body);
    window.PRELUDE_RAW = preludeRaw;
    const { terms, glossaryPhaseIdx } = parseGlossary(phases);
    window.GLOSSARY_TERMS = terms;
    const renderedPhases = glossaryPhaseIdx === -1
      ? phases
      : phases.filter((_, i) => i !== glossaryPhaseIdx);
    renderAll(renderedPhases);
  });
  modal.querySelector("#conflict-force").addEventListener("click", async () => {
    modal.hidden = true;
    const r = await fetch(`/plan?t=${TOKEN}`, {
      method: "PUT", body: SRC,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
    if (r.ok) {
      ETAG = r.headers.get("ETag");
      toast("forced save");
    }
  });
}

function attachPhaseEdit(phases) {
  document.querySelectorAll(".phase").forEach((el, i) => {
    const body = el.querySelector(".phase-body");
    body.addEventListener("click", (e) => {
      if (e.target.matches("input, a, button")) return;
      enterEdit(el, i, phases);
    });
  });
}

function enterEdit(phaseEl, index, phases) {
  if (phaseEl.classList.contains("editing")) return;
  phaseEl.classList.add("editing");
  const body = phaseEl.querySelector(".phase-body");
  const raw = phases[index].body.join("");
  const ta = document.createElement("textarea");
  ta.className = "editor";
  ta.value = raw;
  body.replaceChildren(ta);
  ta.focus();
  ta.style.height = ta.scrollHeight + "px";
  ta.addEventListener("input", () => {
    ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px";
  });
  ta.addEventListener("blur", async () => {
    const newBody = ta.value;
    const newSrc = rebuildSource(phases, index, newBody);
    SRC = newSrc;
    const ok = await savePlan(newSrc);
    if (ok) {
      const { preludeRaw, phases: fresh } = parsePhases(SRC);
      window.PRELUDE_RAW = preludeRaw;
      renderAll(fresh);
    } else {
      body.innerHTML = marked.parse(raw);
    }
    phaseEl.classList.remove("editing");
  });
}

function rebuildSource(phases, idx, newBody) {
  let out = "";
  out += window.PRELUDE_RAW || "";
  phases.forEach((p, i) => {
    const body = i === idx ? newBody : p.body.join("");
    out += `## ${p.title}\n${body.startsWith("\n") ? body : "\n" + body}`;
  });
  return out;
}

function renderMinimap(phases) {
  const map = document.getElementById("minimap");
  if (!map) return;
  map.replaceChildren();
  if (phases.length === 0) { map.hidden = true; return; }
  const docH = document.documentElement.scrollHeight;
  if (docH <= window.innerHeight + 40) { map.hidden = true; return; }
  map.hidden = false;
  const isPlan = document.body.classList.contains("plan-mode");
  phases.forEach((p, i) => {
    const el = document.getElementById(`phase-${i}`);
    if (!el) return;
    const h = (el.offsetHeight / docH) * 100;
    const sk = isPlan ? phaseStatus(p).kind : "neutral";
    const cls = sk === "none" ? "todo" : sk;
    const strip = document.createElement("div");
    strip.className = `mini-strip ${cls}`;
    strip.style.height = `${h}%`;
    strip.dataset.phaseIdx = String(i);
    map.appendChild(strip);
  });
  const viewport = document.createElement("div");
  viewport.className = "mini-viewport";
  viewport.style.top = `${(window.scrollY / docH) * 100}%`;
  viewport.style.height = `${(window.innerHeight / docH) * 100}%`;
  map.appendChild(viewport);
}

function attachMinimap() {
  const map = document.getElementById("minimap");
  if (!map || map.dataset.bound === "true") return;
  map.dataset.bound = "true";
  let frame = null;
  const sync = () => {
    frame = null;
    const docH = document.documentElement.scrollHeight;
    const v = map.querySelector(".mini-viewport");
    if (!v) return;
    v.style.top = `${(window.scrollY / docH) * 100}%`;
    v.style.height = `${(window.innerHeight / docH) * 100}%`;
  };
  window.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  }, { passive: true });
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderMinimap(window.LAST_PHASES || []), 100);
  });
  map.addEventListener("click", (e) => {
    const rect = map.getBoundingClientRect();
    const frac = (e.clientY - rect.top) / rect.height;
    const docH = document.documentElement.scrollHeight;
    window.scrollTo({ top: frac * docH, behavior: "smooth" });
  });
}

function parseGlossary(phases) {
  const idx = phases.findIndex(p => p.title.toLowerCase().trim() === "glossary");
  if (idx === -1) return { terms: [], glossaryPhaseIdx: -1 };
  const body = phases[idx].body.join("");
  const terms = [];
  for (const m of body.matchAll(/\*\*([^*]+)\*\*\s*[—\-:]\s*(.+)/g)) {
    terms.push({ term: m[1].trim(), definition: m[2].trim() });
  }
  return { terms, glossaryPhaseIdx: idx };
}

function buildGlossRegex(terms) {
  if (terms.length === 0) return null;
  const escaped = terms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
}

function walkAndWrap(root, regex, defs, wrapClass) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    if (insideExcludedAncestor(node)) continue;
    const text = node.nodeValue;
    regex.lastIndex = 0;
    const matches = [...text.matchAll(regex)];
    if (matches.length === 0) continue;
    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const m of matches) {
      const start = m.index;
      const end = start + m[0].length;
      if (start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, start)));
      const span = document.createElement("span");
      span.className = wrapClass;
      span.tabIndex = 0;
      span.textContent = m[0];
      span.dataset.definition = defs.get(m[1]) || defs.get(m[0]) || "";
      frag.appendChild(span);
      cursor = end;
    }
    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(frag, node);
  }
}

function ensureGlossPopover() {
  if (document.getElementById("gloss-popover")) return;
  const pop = document.createElement("div");
  pop.id = "gloss-popover";
  pop.hidden = true;
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);
  const show = (e) => {
    const t = e.target.closest(".gloss-term");
    if (!t) return;
    pop.textContent = t.dataset.definition || "";
    pop.hidden = false;
    const r = t.getBoundingClientRect();
    pop.style.left = `${window.scrollX + r.left + r.width / 2}px`;
    pop.style.top = `${window.scrollY + r.top - 8}px`;
  };
  const hide = (e) => { if (e.target.closest(".gloss-term")) pop.hidden = true; };
  document.addEventListener("mouseover", show);
  document.addEventListener("focusin", show);
  document.addEventListener("mouseout", hide);
  document.addEventListener("focusout", hide);
}

function attachGlossaryPopovers(terms) {
  if (!terms || terms.length === 0) return;
  const regex = buildGlossRegex(terms);
  if (!regex) return;
  const defs = new Map(terms.map(t => [t.term, t.definition]));
  document.querySelectorAll(".phase-body p, .phase-body li").forEach(el => {
    walkAndWrap(el, regex, defs, "gloss-term");
  });
  ensureGlossPopover();
}

function renderAll(phases) {
  renderPhases(phases);
  renderSidebar(phases);
  renderProgressBar(phases);
  attachCheckboxes();
  attachCollapse();
  attachScrollSpy();
  attachPhaseEdit(phases);
  wireCopyButtons();
  attachTreeToggles();
  attachAnchors();
  ensureXrefClickHandler();
  runPrism();
  attachIdeLinks();
  attachGlossaryPopovers(window.GLOSSARY_TERMS || []);
  attachEnvControls();
  attachRiskChips();

  const refs = extractCrossRefs(phases);
  renderCrossRefMiniGraph(refs, phases);

  const edges = document.body.classList.contains("plan-mode") ? extractDeps() : [];
  if (edges.length > 0) {
    document.getElementById("content").insertAdjacentHTML("afterbegin", renderDepGraph(edges));
  }

  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains("dark") ? "dark" : "default" });
    mermaid.run({ querySelector: ".mermaid" });
    if (edges.length > 0) attachDepGraphNodes();
  }

  window.LAST_PHASES = phases;
  renderMinimap(phases);
  attachMinimap();
}

function parsePhases(src) {
  // Split source into: prelude (everything before first H2) + array of phases
  // Each phase: { title, level: 2, raw, body, tokens }
  const tokens = marked.lexer(src);
  const phases = [];
  let preludeTokens = [];
  let current = null;
  let preludeEnd = 0;
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
      preludeTokens.push(tok);
      preludeEnd += tok.raw.length;
    }
  }
  if (current) phases.push(current);
  return { prelude: preludeTokens, preludeRaw: src.slice(0, preludeEnd), phases };
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
  const isDoc = document.body.classList.contains("doc-mode");
  phases.forEach((p, i) => {
    const s = phaseStatus(p);
    const item = document.createElement("a");
    item.className = "nav-item";
    item.href = `#phase-${i}`;
    const frac = s.total ? `<span class="frac">${s.done}/${s.total}</span>` : "";
    item.innerHTML = `<div class="pill ${s.kind}">${i+1}</div><span>${escapeHtml(p.title)}</span>${frac}`;
    side.appendChild(item);
    if (isDoc) {
      const subs = phaseH3s(p);
      subs.forEach(h3 => {
        const sub = document.createElement("a");
        sub.className = "nav-sub";
        sub.href = "#" + slug(h3);
        sub.textContent = h3;
        side.appendChild(sub);
      });
    }
  });
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  toolbar.innerHTML = `
    <span class="filename">${escapeHtml(document.title)}</span>
    <button id="theme-toggle">🌙</button>
  `;
  side.appendChild(toolbar);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    localStorage.setItem("plan-explorer:dark", dark ? "1" : "0");
  });
}

function phaseH3s(phase) {
  const text = phase.body.join("");
  return [...text.matchAll(/^###\s+(.+)$/gm)].map(m => m[1].trim());
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

function runPrism() {
  if (!window.Prism) return;
  Prism.highlightAllUnder(document.getElementById("content"));
}

const TREE_FOLDER_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"/></svg>';

const TREE_FILE_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';

function parseTreeLines(raw) {
  // Each entry: { depth, name, isDir }
  // Depth derived from the column where the connector (├ or └) appears.
  // Lines with no connector are treated as depth 0 (root entries).
  const out = [];
  const lines = raw.split("\n").filter(l => l.trim().length > 0);
  for (const line of lines) {
    const withConnector = line.match(/^([│ ]*?)([├└])[─\s]+(.+)$/);
    let depth, name;
    if (withConnector) {
      depth = Math.floor(withConnector[1].length / 4) + 1;
      name = withConnector[3].trim();
    } else {
      depth = 0;
      name = line.trim();
    }
    if (!name) continue;
    const isDir = name.endsWith("/");
    out.push({ depth, name: isDir ? name.slice(0, -1) : name, isDir });
  }
  return out;
}

function fileExt(name) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function renderTreeBlock(raw) {
  const entries = parseTreeLines(raw);
  if (entries.length === 0) {
    return `<pre class="tree-warning">${escapeHtml(raw)}</pre>`;
  }
  let html = '<ul class="tree" role="tree">';
  const openDepths = [];  // stack of currently-open directory depths
  for (const e of entries) {
    while (openDepths.length > 0 && openDepths[openDepths.length - 1] >= e.depth) {
      html += "</ul></li>";
      openDepths.pop();
    }
    if (e.isDir) {
      html += `<li class="tree-dir" aria-expanded="true"><div class="tree-row"><span class="tree-toggle"></span><span class="tree-icon">${TREE_FOLDER_SVG}</span><span class="tree-name">${escapeHtml(e.name)}/</span></div><ul>`;
      openDepths.push(e.depth);
      continue;
    }
    const ext = fileExt(e.name);
    html += `<li class="tree-file" data-ext="${escapeHtml(ext)}" data-path="${escapeHtml(e.name)}"><div class="tree-row"><span class="tree-icon">${TREE_FILE_SVG}</span><span class="tree-name">${escapeHtml(e.name)}</span></div></li>`;
  }
  while (openDepths.length > 0) {
    html += "</ul></li>";
    openDepths.pop();
  }
  html += "</ul>";
  return html;
}

function editorScheme(name) {
  switch (name) {
    case "cursor": return "cursor://file/";
    case "idea":   return "idea://open?file=";
    case "none":   return "file://";
    default:       return "vscode://file/";
  }
}

function buildIdeHref(scheme, abs, line) {
  const ln = line || "1";
  if (scheme === "idea://open?file=") {
    return `${scheme}${abs}&line=${ln}`;
  }
  return `${scheme}${abs}:${ln}`;
}

async function resolvePath(rel) {
  if (RESOLVE_CACHE.has(rel)) return RESOLVE_CACHE.get(rel);
  let abs = null;
  try {
    const r = await fetch(`/resolve?t=${TOKEN}&path=${encodeURIComponent(rel)}`);
    if (r.ok) {
      const data = await r.json();
      abs = data.abs;
    }
  } catch (e) { /* network — keep null */ }
  RESOLVE_CACHE.set(rel, abs);
  return abs;
}

function insideExcludedAncestor(node) {
  let el = node.parentElement;
  while (el) {
    const t = el.tagName;
    if (t === "A" || t === "CODE" || t === "PRE") return true;
    el = el.parentElement;
  }
  return false;
}

async function wrapMatchesInTextNode(node, scheme) {
  const text = node.nodeValue;
  IDE_LINK_RE.lastIndex = 0;
  const matches = [...text.matchAll(IDE_LINK_RE)];
  if (matches.length === 0) return;
  const frag = document.createDocumentFragment();
  let cursor = 0;
  for (const m of matches) {
    const start = m.index;
    const end = start + m[0].length;
    const rel = m[1];
    const line = m[2];
    if (start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, start)));
    const abs = await resolvePath(rel);
    if (abs) {
      const a = document.createElement("a");
      a.className = "ide-link";
      a.href = buildIdeHref(scheme, abs, line);
      a.textContent = m[0];
      frag.appendChild(a);
    } else {
      frag.appendChild(document.createTextNode(m[0]));
    }
    cursor = end;
  }
  if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
  node.parentNode.replaceChild(frag, node);
}

async function attachIdeLinks() {
  const editor = new URLSearchParams(location.search).get("editor") || "vscode";
  const scheme = editorScheme(editor);
  const scope = document.querySelectorAll(IDE_LINK_SCOPE);
  for (const el of scope) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (const node of nodes) {
      if (insideExcludedAncestor(node)) continue;
      if (!IDE_LINK_RE.test(node.nodeValue)) continue;
      await wrapMatchesInTextNode(node, scheme);
    }
  }
}

function attachTreeToggles() {
  document.querySelectorAll(".tree-dir > .tree-row").forEach(row => {
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      const li = row.parentElement;
      li.setAttribute("aria-expanded", li.getAttribute("aria-expanded") === "true" ? "false" : "true");
    });
  });
}

function renderDiffBlock(raw) {
  const lines = raw.split("\n");
  let oldLine = null, newLine = null;
  const hunkRe = /^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/;
  let html = '<pre class="diff">';
  for (const line of lines) {
    if (line.length === 0) continue;
    const hunk = line.match(hunkRe);
    if (hunk) {
      oldLine = parseInt(hunk[1], 10);
      newLine = parseInt(hunk[2], 10);
      html += `<div class="line hunk"><span class="gutter"></span><span class="text">${escapeHtml(line)}</span></div>`;
      continue;
    }
    const head = line.charAt(0);
    let cls, oldNum = "", newNum = "";
    if (head === "+") {
      cls = "add";
      if (newLine !== null) { newNum = String(newLine); newLine++; }
    } else if (head === "-") {
      cls = "del";
      if (oldLine !== null) { oldNum = String(oldLine); oldLine++; }
    } else {
      cls = "ctx";
      if (oldLine !== null && newLine !== null) {
        oldNum = String(oldLine); newNum = String(newLine);
        oldLine++; newLine++;
      }
    }
    const gutter = (oldLine !== null || newLine !== null)
      ? `<span class="gutter">${oldNum.padStart(3," ")} ${newNum.padStart(3," ")}</span>`
      : `<span class="gutter"></span>`;
    html += `<div class="line ${cls}">${gutter}<span class="text">${escapeHtml(line)}</span></div>`;
  }
  html += "</pre>";
  return html;
}

const METHOD_CLASSES = {
  GET: "method-get", POST: "method-post", PUT: "method-put",
  PATCH: "method-patch", DELETE: "method-delete",
  HEAD: "method-other", OPTIONS: "method-other",
};

function parseOneEndpoint(block) {
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  const head = lines[0].match(/^([A-Z]+)\s+(\S.*)$/);
  if (!head) return null;
  const method = head[1].toUpperCase();
  const path = head[2];
  const meta = {};
  let description = null;
  for (const line of lines.slice(1)) {
    const m = line.match(/^([a-zA-Z][\w-]*)\s*:\s*(.+)$/);
    if (!m) continue;
    if (m[1].toLowerCase() === "description") description = m[2];
    else meta[m[1]] = m[2];
  }
  return { method, path, description, meta };
}

function parseEndpointBlock(raw) {
  return raw.split(/\n\s*\n/).map(parseOneEndpoint).filter(Boolean);
}

function renderOneEndpoint(ep) {
  const cls = METHOD_CLASSES[ep.method] || "method-other";
  const desc = ep.description
    ? `<p class="endpoint-desc">${escapeHtml(ep.description)}</p>`
    : "";
  const metaRows = Object.entries(ep.meta)
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`)
    .join("");
  const metaBlock = metaRows ? `<dl class="endpoint-meta">${metaRows}</dl>` : "";
  return `<div class="endpoint"><header class="endpoint-head"><span class="endpoint-method ${cls}">${escapeHtml(ep.method)}</span><code class="endpoint-path">${escapeHtml(ep.path)}</code></header><div class="endpoint-body">${desc}${metaBlock}</div></div>`;
}

function renderEndpointBlock(raw) {
  const endpoints = parseEndpointBlock(raw);
  if (endpoints.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `<div class="endpoint-list">${endpoints.map(renderOneEndpoint).join("")}</div>`;
}

const ENV_SECRET_RE = /SECRET|TOKEN|PASS|KEY|CREDENTIAL|PRIVATE/i;

function parseEnvBlock(raw) {
  const rows = [];
  let pendingComment = null;
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line) { pendingComment = null; continue; }
    if (line.startsWith("#")) { pendingComment = line.slice(1).trim(); continue; }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    const masked = ENV_SECRET_RE.test(m[1]);
    rows.push({ comment: pendingComment, key: m[1], value, masked });
    pendingComment = null;
  }
  return rows;
}

function renderEnvRow(r) {
  const comment = r.comment
    ? `<tr class="env-comment"><td colspan="3">${escapeHtml(r.comment)}</td></tr>`
    : "";
  const valueCell = r.masked
    ? `<td class="env-val" data-masked="true"><span class="env-mask">••••••••</span><span class="env-plain" hidden>${escapeHtml(r.value)}</span></td>`
    : `<td class="env-val"><span class="env-plain">${escapeHtml(r.value)}</span></td>`;
  const revealBtn = r.masked
    ? `<button class="env-reveal" type="button" aria-label="Reveal value">👁</button>`
    : "";
  return `${comment}<tr class="env-row" data-masked="${r.masked}"><td class="env-key">${escapeHtml(r.key)}</td>${valueCell}<td class="env-actions">${revealBtn}<button class="env-copy" type="button" aria-label="Copy value" data-value="${encodeURIComponent(r.value)}">📋</button></td></tr>`;
}

function renderEnvBlock(raw) {
  const rows = parseEnvBlock(raw);
  if (rows.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `<table class="env"><tbody>${rows.map(renderEnvRow).join("")}</tbody></table>`;
}

function attachEnvControls() {
  document.querySelectorAll("table.env .env-reveal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = btn.closest(".env-row");
      const valCell = row.querySelector(".env-val");
      const revealed = valCell.getAttribute("data-masked") === "false";
      valCell.setAttribute("data-masked", revealed ? "true" : "false");
      row.setAttribute("data-masked", revealed ? "true" : "false");
      valCell.querySelector(".env-mask").hidden = !revealed;
      valCell.querySelector(".env-plain").hidden = revealed;
      btn.textContent = revealed ? "👁" : "🙈";
    });
  });
  document.querySelectorAll("table.env .env-copy").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const v = decodeURIComponent(btn.dataset.value);
      try { await navigator.clipboard.writeText(v); } catch (err) { /* ignore */ }
      const orig = btn.textContent;
      btn.textContent = "✓";
      setTimeout(() => { btn.textContent = orig; }, 1200);
    });
  });
}

const RISK_LEVELS = ["low", "med", "high"];
const RISK_ALIASES = { medium: "med", mid: "med", moderate: "med", lo: "low", hi: "high" };

function normalizeRiskLevel(s) {
  const v = (s || "").trim().toLowerCase();
  if (RISK_LEVELS.includes(v)) return v;
  return RISK_ALIASES[v] || null;
}

function parseRiskBlock(raw) {
  const out = [];
  let current = null;
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.replace(/\t/g, "  ");
    if (/^\s*-\s+title\s*:\s*/.test(line)) {
      if (current) out.push(current);
      current = { title: line.replace(/^\s*-\s+title\s*:\s*/, "").trim(), extras: {} };
      continue;
    }
    const m = line.match(/^\s+([a-zA-Z][\w-]*)\s*:\s*(.+)$/);
    if (!m || !current) continue;
    const k = m[1].toLowerCase();
    const v = m[2].trim();
    if (k === "likelihood" || k === "impact") {
      current[k] = normalizeRiskLevel(v);
    } else {
      current.extras[k] = v;
    }
  }
  if (current) out.push(current);
  return out.filter(r => r.likelihood && r.impact);
}

function severityClass(lik, imp) {
  const score = (RISK_LEVELS.indexOf(lik) + 1) * (RISK_LEVELS.indexOf(imp) + 1);
  if (score >= 6) return "risk-sev-high";
  if (score >= 3) return "risk-sev-med";
  return "risk-sev-low";
}

function renderRiskBlock(raw) {
  const risks = parseRiskBlock(raw);
  if (risks.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  const cells = {};
  for (const lik of RISK_LEVELS) for (const imp of RISK_LEVELS) cells[`${lik}-${imp}`] = [];
  risks.forEach((r, idx) => { cells[`${r.likelihood}-${r.impact}`].push({ ...r, idx }); });
  const rowsOrder = ["high", "med", "low"];
  const colsOrder = ["low", "med", "high"];
  const parts = [`<div class="risk-grid">`];
  parts.push(`<div class="risk-cell risk-axis risk-corner">likelihood ↓ / impact →</div>`);
  for (const c of colsOrder) parts.push(`<div class="risk-cell risk-axis">${c}</div>`);
  for (const r of rowsOrder) {
    parts.push(`<div class="risk-cell risk-axis">${r}</div>`);
    for (const c of colsOrder) {
      const key = `${r}-${c}`;
      const sev = severityClass(r, c);
      const chips = cells[key].map(risk =>
        `<button type="button" class="risk-chip" data-idx="${risk.idx}">${escapeHtml(risk.title)}</button>`
      ).join("");
      parts.push(`<div class="risk-cell ${sev}">${chips}</div>`);
    }
  }
  parts.push(`</div>`);
  parts.push(`<div class="risk-details">`);
  risks.forEach((r, idx) => {
    const rows = [["likelihood", r.likelihood], ["impact", r.impact], ...Object.entries(r.extras)]
      .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`)
      .join("");
    parts.push(`<dialog class="risk-detail" data-idx="${idx}"><h4>${escapeHtml(r.title)}</h4><dl>${rows}</dl><form method="dialog"><button>Close</button></form></dialog>`);
  });
  parts.push(`</div>`);
  return parts.join("");
}

function attachRiskChips() {
  document.querySelectorAll(".risk-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const container = btn.closest(".risk-grid").parentElement;
      const dlg = container.querySelector(`.risk-detail[data-idx="${idx}"]`);
      if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    });
  });
}

const ECOSYSTEM_URLS = {
  npm:    name => `https://npmjs.com/package/${name}`,
  pypi:   name => `https://pypi.org/project/${name}/`,
  crates: name => `https://crates.io/crates/${name}`,
  go:     name => `https://pkg.go.dev/${name}`,
};

function parseDepsBlock(raw) {
  const out = [];
  let ecosystem = "pypi";
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eco = line.match(/^ecosystem\s*:\s*(npm|pypi|crates|go)\s*$/i);
    if (eco) { ecosystem = eco[1].toLowerCase(); continue; }
    let m = line.match(/^(@[^/]+\/[A-Za-z0-9_.-]+)(?:@(\S+))?$/);
    let forced = "npm";
    if (!m) {
      m = line.match(/^([A-Za-z0-9_./-]+)(?:@(\S+))?$/);
      forced = null;
    }
    if (!m) continue;
    out.push({ name: m[1], version: m[2] || "", ecosystem: forced || ecosystem });
  }
  return out;
}

function renderDepBadge(d) {
  const url = ECOSYSTEM_URLS[d.ecosystem] ? ECOSYSTEM_URLS[d.ecosystem](d.name) : "#";
  const ver = d.version ? `<span class="dep-ver">@${escapeHtml(d.version)}</span>` : "";
  const tip = d.version ? `${d.name}@${d.version}` : d.name;
  return `<a class="dep" data-eco="${d.ecosystem}" href="${escapeHtml(url)}" target="_blank" rel="noopener" title="${escapeHtml(tip)}"><span class="dep-name">${escapeHtml(d.name)}</span>${ver}</a>`;
}

function renderDepsBlock(raw) {
  const deps = parseDepsBlock(raw);
  if (deps.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `<div class="deps">${deps.map(renderDepBadge).join("")}</div>`;
}

function configureMarked() {
  const renderer = new marked.Renderer();
  const origBlockquote = renderer.blockquote.bind(renderer);
  renderer.blockquote = (quote) => {
    const m = quote.match(/^<p>\[!(NOTE|TIP|WARNING|RISK|IMPORTANT)\]\s*(?:<br>)?\s*([\s\S]*?)<\/p>/i);
    if (m) {
      const kind = m[1].toLowerCase();
      return `<div class="callout ${kind}"><strong class="callout-label">${m[1]}</strong><div class="callout-body">${m[2]}</div></div>`;
    }
    return origBlockquote(quote);
  };
  renderer.code = (code, lang) => {
    if (lang === "mermaid") {
      return `<div class="mermaid">${escapeHtml(code)}</div>`;
    }
    if (lang === "tree") {
      return renderTreeBlock(code);
    }
    if (lang === "diff") {
      return renderDiffBlock(code);
    }
    if (lang === "endpoint") {
      return renderEndpointBlock(code);
    }
    if (lang === "env") {
      return renderEnvBlock(code);
    }
    if (lang === "risk") {
      return renderRiskBlock(code);
    }
    if (lang === "deps") {
      return renderDepsBlock(code);
    }
    const safe = escapeHtml(code);
    return `<pre><button class="copy-btn" data-code="${encodeURIComponent(code)}">copy</button><code class="language-${lang||'plain'}">${safe}</code></pre>`;
  };
  marked.use({ renderer });
  marked.use({
    extensions: [{
      name: "wikilink",
      level: "inline",
      start(src) {
        const i = src.indexOf("[[");
        return i < 0 ? undefined : i;
      },
      tokenizer(src) {
        const m = src.match(/^\[\[(Phase|Task)\s+(\d+)\]\]/);
        if (!m) return;
        return { type: "wikilink", raw: m[0], kind: m[1], num: m[2] };
      },
      renderer(t) {
        const slug = `${t.kind.toLowerCase()}-${t.num}`;
        return `<a class="xref" href="#${slug}" data-xref-kind="${t.kind}" data-xref-num="${t.num}">${t.kind} ${t.num}</a>`;
      },
    }],
  });
}

function wireCopyButtons() {
  document.querySelectorAll("pre .copy-btn").forEach(b => {
    b.addEventListener("click", async () => {
      const code = decodeURIComponent(b.dataset.code);
      await navigator.clipboard.writeText(code);
      b.textContent = "copied"; setTimeout(() => b.textContent = "copy", 1200);
    });
  });
}

function ensureXrefClickHandler() {
  if (window.__xrefBound) return;
  window.__xrefBound = true;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.xref");
    if (!a) return;
    e.preventDefault();
    const kind = a.dataset.xrefKind;
    const num = parseInt(a.dataset.xrefNum, 10);
    let target = null;
    if (kind === "Task") target = document.getElementById(`task-${num}`);
    else if (kind === "Phase") target = document.querySelectorAll(".phase")[num - 1];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function attachAnchors() {
  document.querySelectorAll(".phase h2, .phase h3").forEach(h => {
    if (!h.id) {
      h.id = slug(h.textContent.replace(/#$/, "").trim());
    }
    if (!h.querySelector(".anchor")) {
      const a = document.createElement("a");
      a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#";
      h.appendChild(a);
    }
    const taskMatch = h.textContent.match(/^Task\s+(\d+)/);
    if (taskMatch && !document.getElementById(`task-${taskMatch[1]}`)) {
      const alias = document.createElement("span");
      alias.id = `task-${taskMatch[1]}`;
      alias.style.position = "absolute";
      alias.style.top = "-80px";
      h.parentElement.insertBefore(alias, h);
    }
  });
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const saved = localStorage.getItem("plan-explorer:dark");
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "1" || (saved === null && prefersDark)) {
      document.body.classList.add("dark");
    }
    configureMarked();
    const { body, etag } = await fetchPlan();
    SRC = body; ETAG = etag;
    const { preludeRaw, prelude, phases } = parsePhases(body);
    window.PRELUDE_RAW = preludeRaw;
    const h1 = prelude.find(t => t.type === "heading" && t.depth === 1);
    document.getElementById("title").textContent = h1 ? h1.text : "Plan";
    const { terms, glossaryPhaseIdx } = parseGlossary(phases);
    window.GLOSSARY_TERMS = terms;
    const renderedPhases = glossaryPhaseIdx === -1
      ? phases
      : phases.filter((_, i) => i !== glossaryPhaseIdx);

    const draft = localStorage.getItem(draftKey());
    if (draft && draft !== body) {
      if (confirm("Unsaved draft found from a previous session. Restore it?")) {
        SRC = draft;
        const ok = await savePlan(draft);
        if (ok) {
          const fresh = await fetchPlan();
          SRC = fresh.body; ETAG = fresh.etag;
          const { preludeRaw, phases: freshPhases } = parsePhases(fresh.body);
          window.PRELUDE_RAW = preludeRaw;
          const { terms: freshTerms, glossaryPhaseIdx: freshGlossIdx } = parseGlossary(freshPhases);
          window.GLOSSARY_TERMS = freshTerms;
          const freshRenderedPhases = freshGlossIdx === -1
            ? freshPhases
            : freshPhases.filter((_, i) => i !== freshGlossIdx);
          return renderAll(freshRenderedPhases);
        }
      } else {
        clearDraft();
      }
    }

    const isPlan = /^\s*-\s*\[[ xX]\]/m.test(body);
    document.body.classList.add(isPlan ? "plan-mode" : "doc-mode");

    renderAll(renderedPhases);
    connectSSE();
  } catch (e) {
    document.getElementById("title").textContent = "Failed to load";
    console.error(e);
  }
});

let sseBackoff = 1000;
function connectSSE() {
  const es = new EventSource(`/events?t=${TOKEN}`);
  es.onmessage = async (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type === "change" && data.etag !== ETAG) {
        const { body, etag } = await fetchPlan();
        if (document.querySelector(".editing")) {
          if (!confirm("File changed on disk. Discard your edits and reload?")) return;
        }
        SRC = body; ETAG = etag;
        const { preludeRaw, phases } = parsePhases(body);
        window.PRELUDE_RAW = preludeRaw;
        const { terms, glossaryPhaseIdx } = parseGlossary(phases);
        window.GLOSSARY_TERMS = terms;
        const renderedPhases = glossaryPhaseIdx === -1
          ? phases
          : phases.filter((_, i) => i !== glossaryPhaseIdx);
        renderAll(renderedPhases);
      } else if (data.type === "gone") {
        toast("file removed from disk; saves disabled");
        document.body.classList.add("file-gone");
      }
    } catch (e) { console.error("sse", e); }
    sseBackoff = 1000;
  };
  es.onerror = () => {
    es.close();
    setTimeout(connectSSE, sseBackoff);
    sseBackoff = Math.min(sseBackoff * 2, 30000);
  };
}
