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

const TREE_ICONS = {
  py:"🐍", js:"📜", ts:"📘", json:"⚙️", yaml:"⚙️", yml:"⚙️", toml:"⚙️",
  md:"📝", html:"🌐", css:"🎨", sh:"🔧", rs:"🦀", go:"🦫",
  png:"🖼", jpg:"🖼", svg:"🖼",
};

function treeFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return TREE_ICONS[ext] || "📄";
}

function parseTreeLines(raw) {
  // Returns an array of { depth, name, isDir }
  // Strips connector chars: ├ └ │ ─ and counts indent based on
  // the column where the leaf name starts.
  const out = [];
  const lines = raw.split("\n").filter(l => l.trim().length > 0);
  for (const line of lines) {
    // Strip everything up to and including the last connector run
    const match = line.match(/^([│\s]*)(?:[├└][─\s]+)?(.+)$/);
    if (!match) continue;
    const prefix = match[1];
    const name = match[2].trim();
    if (!name) continue;
    // Depth = number of `│   ` or 4-space columns in the prefix
    const depth = Math.floor(prefix.replace(/[│]/g, " ").length / 4);
    const isDir = name.endsWith("/");
    out.push({ depth, name: isDir ? name.slice(0, -1) : name, isDir });
  }
  return out;
}

function renderTreeBlock(raw) {
  const entries = parseTreeLines(raw);
  if (entries.length === 0) {
    return `<pre class="tree-warning">${escapeHtml(raw)}</pre>`;
  }
  // Build nested HTML by walking entries and tracking depth stack
  let html = '<ul class="tree" role="tree">';
  let lastDepth = -1;
  const openTags = [];
  for (const e of entries) {
    while (lastDepth >= e.depth) {
      html += openTags.pop() === "li" ? "</li>" : "</ul></li>";
      lastDepth--;
    }
    if (e.isDir) {
      html += `<li class="tree-dir" aria-expanded="true"><span class="tree-toggle"></span><span class="tree-name">${escapeHtml(e.name)}/</span><ul>`;
      openTags.push("li", "ul");
      lastDepth = e.depth;
      continue;
    }
    html += `<li class="tree-file" data-path="${escapeHtml(e.name)}"><span class="tree-icon">${treeFileIcon(e.name)}</span><span class="tree-name">${escapeHtml(e.name)}</span></li>`;
    lastDepth = e.depth;
  }
  while (openTags.length) {
    html += openTags.pop() === "li" ? "</li>" : "</ul></li>";
  }
  html += "</ul>";
  return html;
}

function attachTreeToggles() {
  document.querySelectorAll(".tree-dir > .tree-toggle").forEach(t => {
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      const li = t.parentElement;
      li.setAttribute("aria-expanded", li.getAttribute("aria-expanded") === "true" ? "false" : "true");
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
