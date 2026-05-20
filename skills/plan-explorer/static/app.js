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
  } else {
    renderKanban(phases);
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
    renderAll(phases);
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
  runPrism();
  attachIdeLinks();
  attachEnvControls();
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains("dark") ? "dark" : "default" });
    mermaid.run({ querySelector: ".mermaid" });
  }
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
    const safe = escapeHtml(code);
    return `<pre><button class="copy-btn" data-code="${encodeURIComponent(code)}">copy</button><code class="language-${lang||'plain'}">${safe}</code></pre>`;
  };
  marked.use({ renderer });
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
          return renderAll(freshPhases);
        }
      } else {
        clearDraft();
      }
    }

    const isPlan = /^\s*-\s*\[[ xX]\]/m.test(body);
    document.body.classList.add(isPlan ? "plan-mode" : "doc-mode");

    renderAll(phases);
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
        renderAll(phases);
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
