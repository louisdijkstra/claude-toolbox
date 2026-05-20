# Plan Explorer v1.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four visualization features to the Plan Explorer client — auto task-dependency graph, `[[Phase N]]`/`[[Task N]]` cross-reference links with sidebar mini-graph, timeline view, and a right-side scroll minimap.

**Architecture:** Pure client-side additions in `static/app.js`. Each feature is a small extension to existing helpers — `configureMarked` gains a wikilink token extension, `renderProgressBar` gains a third view button, `renderAll` gains four new post-render calls. One new HTML slot (`<aside id="minimap">`) in `index.html`. No server changes.

**Tech Stack:** Vanilla JS (renderers + DOM events), Mermaid (reused for dep graph, already vendored), CSS Grid (timeline rows), inline SVG (mini-graph), `requestAnimationFrame` (minimap scroll sync), pytest + Playwright (tests).

**Spec:** `docs/superpowers/specs/2026-05-20-plan-explorer-v1.3-design.md`

---

## File Structure

```
~/.claude/skills/plan-explorer/
├── static/
│   ├── index.html  # MODIFY: add <aside id="minimap"> next to <main>
│   ├── app.js      # MODIFY: extractDeps, renderDepGraph, attachDepGraphNodes;
│   │               #         wikilink marked extension + attachAnchors alias + xref click delegation;
│   │               #         extractCrossRefs + renderCrossRefMiniGraph;
│   │               #         renderTimeline + setView extension + view-toggle 3rd button;
│   │               #         renderMinimap + attachMinimap
│   └── styles.css  # MODIFY: append .dep-graph-card, a.xref, .cross-ref-graph, .timeline*, #minimap
└── tests/
    ├── test_client.py    # MODIFY: 4 new tests
    └── fixtures/
        └── rich.md       # MODIFY: add cross-refs + dep references
```

Each task = one feature = one commit. Same shape as v1.2.

---

## Task 1: Auto task-dependency graph

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

Append to `tests/test_client.py`:

```python
def test_dep_graph_auto_extracts(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Phase 1\n\n### Task 1\nbase work\n\n"
        "### Task 2\ndepends on Task 1\n\n"
        "### Task 3\nrequires Task 2\n"
    )
    page.reload()
    page.wait_for_selector(".dep-graph-card .mermaid")
    page.wait_for_selector(".dep-graph-card svg", timeout=4000)
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_dep_graph_auto_extracts -v
```

- [ ] **Step 3: Add `extractDeps`, `renderDepGraph`, `attachDepGraphNodes` to `static/app.js`**

Add near other `render*Block` helpers:

```javascript
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
```

- [ ] **Step 4: Patch `attachAnchors` to add `task-<N>` alias spans**

Locate the existing `attachAnchors` function. Inside the `forEach` loop over H2/H3 headings, add after the existing `h.id = slug(...)` assignment:

```javascript
    const taskMatch = h.textContent.match(/^Task\s+(\d+)/);
    if (taskMatch && !document.getElementById(`task-${taskMatch[1]}`)) {
      const alias = document.createElement("span");
      alias.id = `task-${taskMatch[1]}`;
      alias.style.position = "absolute";
      alias.style.top = "-80px";
      h.parentElement.insertBefore(alias, h);
    }
```

- [ ] **Step 5: Wire into `renderAll`**

Locate the existing mermaid block at the end of `renderAll`. Replace it with:

```javascript
  const edges = document.body.classList.contains("plan-mode") ? extractDeps() : [];
  if (edges.length > 0) {
    document.getElementById("content").insertAdjacentHTML("afterbegin", renderDepGraph(edges));
  }

  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains("dark") ? "dark" : "default" });
    mermaid.run({ querySelector: ".mermaid" });
    if (edges.length > 0) attachDepGraphNodes();
  }
```

- [ ] **Step 6: Append dep-graph styles to `static/styles.css`**

```css
.dep-graph-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  margin: 0 0 18px;
}
.dep-graph-head {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 8px;
}
.dep-graph-card .mermaid {
  background: transparent;
  padding: 0;
  display: flex;
  justify-content: center;
}
.dep-graph-card .mermaid g.node {
  transition: opacity .12s;
}
.dep-graph-card .mermaid g.node:hover {
  opacity: .75;
}
```

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_dep_graph_auto_extracts -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 49 passed (48 prior + 1 new).

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): auto task-dependency graph from depends on phrases"
```

---

## Task 2: Wikilink cross-references with click delegation

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_xref_renders_link_and_jumps(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Phase 1\n\nsee [[Phase 2]] for details\n\n## Phase 2\n\nx\n"
    )
    page.reload()
    page.wait_for_selector("a.xref")
    href = page.locator("a.xref").first.get_attribute("href")
    assert href == "#phase-2"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_xref_renders_link_and_jumps -v
```

- [ ] **Step 3: Add the wikilink extension inside `configureMarked()`**

Inside the existing `configureMarked` function, AFTER the existing `marked.use({ renderer })` call (or after the existing `renderer.*` definitions, just before the function's end), add:

```javascript
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
```

- [ ] **Step 4: Add one-time xref click delegation**

Add this top-level function (placed near other `attach*` helpers):

```javascript
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
```

- [ ] **Step 5: Call `ensureXrefClickHandler()` in `renderAll`**

Inside `renderAll`, add the call after `attachAnchors();`:

```javascript
  attachAnchors();
  ensureXrefClickHandler();
```

- [ ] **Step 6: Append xref styles to `static/styles.css`**

```css
a.xref {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px dotted var(--accent);
}
a.xref::after {
  content: "↪";
  font-size: 11px;
  margin-left: 2px;
  opacity: .7;
}
a.xref:hover { border-bottom-style: solid; }
```

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_xref_renders_link_and_jumps -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 50 passed.

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): wikilink cross-references with click-to-scroll"
```

---

## Task 3: Sidebar mini cross-reference graph

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_cross_ref_mini_graph(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Phase 1\n\nlinks [[Phase 3]]\n\n## Phase 2\n\nno refs\n\n## Phase 3\n\nback to [[Phase 1]]\n"
    )
    page.reload()
    page.wait_for_selector("svg.cross-ref-graph")
    assert page.locator("svg.cross-ref-graph .mini-dot").count() == 3
    assert page.locator("svg.cross-ref-graph .mini-arc").count() == 2
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_cross_ref_mini_graph -v
```

- [ ] **Step 3: Add `extractCrossRefs` and `renderCrossRefMiniGraph` to `static/app.js`**

```javascript
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
```

- [ ] **Step 4: Wire into `renderAll`**

Inside `renderAll`, after `ensureXrefClickHandler();` add:

```javascript
  const refs = extractCrossRefs(phases);
  renderCrossRefMiniGraph(refs, phases);
```

- [ ] **Step 5: Append mini-graph styles to `static/styles.css`**

```css
svg.cross-ref-graph {
  display: block;
  width: 100%;
  max-width: 200px;
  margin: 18px auto 0;
  height: auto;
}
svg.cross-ref-graph .mini-dot {
  fill: var(--muted);
  opacity: .75;
  cursor: pointer;
  transition: opacity .12s, r .12s;
}
svg.cross-ref-graph .mini-dot:hover {
  fill: var(--accent);
  opacity: 1;
}
svg.cross-ref-graph .mini-arc {
  stroke: var(--accent);
  stroke-width: 1.4;
  opacity: .5;
  fill: none;
}
```

- [ ] **Step 6: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_cross_ref_mini_graph -v
```

- [ ] **Step 7: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 51 passed.

- [ ] **Step 8: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): sidebar mini-graph of phase cross-references"
```

---

## Task 4: Timeline view (third option in view-toggle)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_timeline_view(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n- [x] one\n- [ ] two\n\n## B\n\n- [ ] three\n"
    )
    page.reload()
    page.wait_for_selector(".view-toggle button[data-view='timeline']")
    page.locator(".view-toggle button[data-view='timeline']").click()
    page.wait_for_selector(".timeline .timeline-row")
    assert page.locator(".timeline-row").count() == 2
    fill_width = page.locator(".timeline-row").first.locator(".timeline-fill").evaluate(
        "el => el.style.width"
    )
    assert fill_width == "50%"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_timeline_view -v
```

- [ ] **Step 3: Add the timeline button to `renderProgressBar`**

Find the existing `renderProgressBar` function. Replace its innerHTML template so the meta row includes a third button:

```javascript
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
```

- [ ] **Step 4: Add `renderTimeline` and extend `setView`**

Add `renderTimeline` next to `renderKanban`:

```javascript
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
```

Replace `setView` with the three-branch version:

```javascript
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
```

- [ ] **Step 5: Append timeline styles to `static/styles.css`**

```css
.timeline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 14px 0;
}
.timeline-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.timeline-row:hover { background: var(--hover); }
.timeline-label {
  flex: 0 0 180px;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.timeline-bar {
  height: 14px;
  background: var(--border);
  border-radius: 7px;
  overflow: hidden;
  position: relative;
  min-width: 80px;
}
.timeline-fill {
  display: block;
  height: 100%;
  border-radius: 7px;
}
.timeline-fill.done { background: linear-gradient(90deg, #34d399, #10b981); }
.timeline-fill.wip  { background: linear-gradient(90deg, #fde047, #eab308); }
.timeline-fill.todo { background: transparent; }
.timeline-count {
  flex: 0 0 56px;
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

- [ ] **Step 6: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_timeline_view -v
```

- [ ] **Step 7: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 52 passed.

- [ ] **Step 8: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): timeline view with proportional progress bars"
```

---

## Task 5: Scroll minimap

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/index.html`
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_minimap_strips_match_phases(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n" + ("- [ ] task\n" * 30) + "\n## B\n\nshort\n"
    )
    page.reload()
    page.wait_for_selector("#minimap .mini-strip")
    assert page.locator("#minimap .mini-strip").count() == 2
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_minimap_strips_match_phases -v
```

- [ ] **Step 3: Add the minimap slot to `static/index.html`**

Modify the `<body>` so the `.app` grid contains the existing `<aside>` (sidebar) + `<main>` + new `<aside id="minimap">`. The exact patch: locate the line `<main id="main">` (the one that already exists) and add a new `<aside id="minimap" aria-hidden="true"></aside>` immediately AFTER the closing `</main>` of that block. The structure becomes:

```html
<body>
  <div class="app">
    <aside id="sidebar"></aside>
    <main id="main">
      <header class="header">
        <div class="eyebrow" id="eyebrow">Implementation Plan</div>
        <h1 id="title">Loading…</h1>
        <div class="meta" id="meta"></div>
      </header>
      <section id="content"></section>
    </main>
    <aside id="minimap" aria-hidden="true"></aside>
  </div>
  <div id="toast"></div>
  <div id="conflict-modal" hidden></div>
</body>
```

- [ ] **Step 4: Add `renderMinimap` and `attachMinimap` to `static/app.js`**

```javascript
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
```

- [ ] **Step 5: Wire into `renderAll`**

At the top of `renderAll`, add `window.LAST_PHASES = phases;`. At the end of `renderAll` (after the mermaid block from Task 1), add:

```javascript
  renderMinimap(phases);
  attachMinimap();
```

So the final `renderAll` looks like:

```javascript
function renderAll(phases) {
  window.LAST_PHASES = phases;
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

  renderMinimap(phases);
  attachMinimap();
}
```

- [ ] **Step 6: Append minimap styles to `static/styles.css`**

```css
.app {
  grid-template-columns: 240px 1fr 28px;
}
#minimap {
  position: relative;
  background: var(--hover);
  border-left: 1px solid var(--border);
  cursor: pointer;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
#minimap[hidden] { display: none; }
.mini-strip {
  width: 100%;
  transition: outline .1s;
}
.mini-strip.done    { background: #d1fae5; }
.mini-strip.wip     { background: #fef3c7; }
.mini-strip.todo    { background: #f4f4f5; }
.mini-strip.neutral { background: #e5e7eb; }
.mini-strip:hover { outline: 1px solid var(--accent); outline-offset: -1px; }
body.dark .mini-strip.done    { background: #14532d; }
body.dark .mini-strip.wip     { background: #713f12; }
body.dark .mini-strip.todo    { background: #27272a; }
body.dark .mini-strip.neutral { background: #404040; }
.mini-viewport {
  position: absolute;
  left: 0; right: 0;
  background: rgba(74, 122, 254, .25);
  pointer-events: none;
  transition: top .05s linear;
}
```

Note: the change to `.app { grid-template-columns: 240px 1fr 28px; }` overrides the existing `.app { display: grid; grid-template-columns: 240px 1fr; ... }` rule. Append a new rule rather than replacing — CSS source order means the appended rule wins.

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_minimap_strips_match_phases -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 53 passed.

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/index.html \
        skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): scroll minimap with viewport indicator and click-to-jump"
```

---

## Task 6: Extend `rich.md` fixture with cross-refs + dependency phrases

**Files:**
- Modify: `~/.claude/skills/plan-explorer/tests/fixtures/rich.md`

- [ ] **Step 1: Append two sections to `tests/fixtures/rich.md`**

Use the Write tool (the file contains triple-backtick fences). Read the existing content first via `cat ~/.claude/skills/plan-explorer/tests/fixtures/rich.md`, then OVERWRITE with the existing content plus these new sections appended:

```markdown
## Cross-references

This phase references the [[Phase 1]] callouts section and the [[Phase 3]] diagram. See [[Task 2]] for the implementation order.

## Task dependencies

### Task 1

Set up the base.

### Task 2

This depends on Task 1.

### Task 3

This requires Task 2 and Task 1.
```

- [ ] **Step 2: Run full suite to confirm fixture parses without breaking tests**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 53 passed.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/tests/fixtures/rich.md
git commit -m "test(plan-explorer): extend rich.md fixture with v1.3 cross-refs and deps"
```

---

## Self-Review Checklist (run after implementing all tasks)

- [ ] `extractDeps`, `renderDepGraph`, `attachDepGraphNodes`, `extractCrossRefs`, `renderCrossRefMiniGraph`, `renderTimeline`, `renderMinimap`, `attachMinimap`, `ensureXrefClickHandler` are each defined exactly once
- [ ] `renderAll` calls them in the order documented in Task 5 step 5
- [ ] The wikilink marked extension is registered inside `configureMarked()`, not at module top-level (otherwise it runs before marked is loaded)
- [ ] `#minimap` is a direct child of `.app`, not nested inside `<main>`
- [ ] The minimap-aware `.app { grid-template-columns: 240px 1fr 28px; }` rule appears AFTER the original `.app` rule in `styles.css`
- [ ] `grep -rn "TODO\|FIXME" ~/.claude/skills/plan-explorer/static/ ~/.claude/skills/plan-explorer/tests/` returns nothing
- [ ] Final test count: 53 (48 prior + 5 new)
