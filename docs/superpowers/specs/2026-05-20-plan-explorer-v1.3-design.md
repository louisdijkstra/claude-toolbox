# Plan Explorer v1.3 — Graphs & Timeline

**Status:** Draft for implementation
**Date:** 2026-05-20
**Parent:** Plan Explorer (v1.0 + v1.1 + v1.2)

## 1. Purpose

Four visualization additions, all client-side:

1. **Auto task-dependency graph** — auto-extract `depends on Task N` references and render a Mermaid DAG card at the top of plan-mode content
2. **`[[Phase N]]` / `[[Task N]]` wiki-links** — convert via marked extension into anchor links; collect cross-references into a small SVG mini-graph rendered in the sidebar
3. **Timeline view** — third option in the existing list / kanban view toggle: horizontal proportional bars per phase, colored by completion status
4. **Scroll minimap** — fixed 28 px right column showing one tinted strip per phase plus a viewport-position box, with click-to-jump

## 2. Non-goals

- Editing the graph or timeline in-browser (read-only renderings)
- Dependencies across plans (single-file scope)
- Mini-graph layouts beyond the simple horizontal dot+arc visual
- Resizable minimap

## 3. User-visible behavior

### 3.1 Dep graph card

In **plan mode only**, after fetching and parsing the plan, scan every task block (`### Task N` heading + following text) for the regex `/(?:depends on|requires)\s+Task\s+(\d+)/gi`. If at least one match is found across the document, prepend a card to `#content`:

```html
<div class="dep-graph-card">
  <header class="dep-graph-head">Task dependencies</header>
  <div class="mermaid">graph LR
    T1 --> T2
    T1 --> T3
    T2 --> T4
  </div>
</div>
```

After Mermaid renders the SVG, attach a click handler to each node that calls `document.getElementById("task-<N>").scrollIntoView({ behavior: "smooth" })`.

If no dependency phrases are found, render no card.

### 3.2 Cross-references

Any inline `[[Phase N]]` or `[[Task N]]` token (regex `/\[\[(Phase|Task)\s+(\d+)\]\]/`) renders as a styled anchor:

```html
<a class="xref" href="#task-3" data-xref-kind="Task" data-xref-num="3">Task 3</a>
```

Anchor IDs:
- `phase-<N>` — based on H2 ordinal position (1-indexed by appearance order)
- `task-<N>` — based on the literal `### Task <N>` heading text

`attachAnchors()` (already running in `renderAll`) is extended to assign an `id="task-<N>"` to any `### Task <N>` heading and `id="phase-<N>"` to the corresponding H2 (mapped by position).

**Sidebar mini-graph:** if any cross-references exist, an SVG (200×100, viewBox `0 0 200 100`) is appended at the bottom of the sidebar showing a horizontal row of dots (one per phase) with arcs connecting phases that reference each other. Hover a dot → tooltip with the phase title. Click a dot → jump to that phase. Hidden if zero cross-refs.

### 3.3 Timeline view

The existing view-toggle (`renderProgressBar`) gains a third button:

```
List | Kanban | Timeline
```

`setView("timeline", phases)` replaces `#content` with:

```html
<div class="timeline">
  <div class="timeline-row" data-phase-idx="0">
    <span class="timeline-label">Phase 1 — Setup</span>
    <div class="timeline-bar">
      <span class="timeline-fill done" style="width: 80%"></span>
    </div>
    <span class="timeline-count">4 / 5</span>
  </div>
  ...
</div>
```

Bar width is proportional to total task count across all phases (each row's `.timeline-bar` gets `flex: <task-count>`). Fill color tracks status (done = green gradient, wip = amber, todo = grey at 0% — i.e., no fill).

Click anywhere on a row → switch view back to list and scroll to that phase.

Timeline option appears only in plan mode (`body.plan-mode`). In doc mode, only List remains.

### 3.4 Scroll minimap

Always rendered (no toggle in v1.3) when doc height exceeds viewport. Position: fixed right, 28 px wide, full viewport height.

Layout:

```html
<aside id="minimap" aria-hidden="true">
  <div class="mini-strip done"   style="height: 32%" data-phase-idx="0"></div>
  <div class="mini-strip wip"    style="height: 28%" data-phase-idx="1"></div>
  <div class="mini-strip todo"   style="height: 40%" data-phase-idx="2"></div>
  <div class="mini-viewport" style="top: 12%; height: 22%"></div>
</aside>
```

Heights computed from each phase element's `offsetHeight / docHeight * 100%`. Viewport box position from `scrollY / docHeight` and height from `viewportHeight / docHeight`.

Throttled scroll listener (one update per `requestAnimationFrame`) repositions the viewport box. ResizeObserver on `#content` (debounced 100 ms) recomputes strip heights.

Click anywhere on `#minimap` → set `window.scrollY = (clickY / minimapHeight) * docHeight`.

In doc mode, strips use a single muted color (no status tints).

## 4. Architecture

All work in `static/app.js`, `static/styles.css`, and `static/index.html`. No server changes.

Same extension pattern as v1.2: add several `render*` / `attach*` helpers; plumb into `renderAll()` and `configureMarked()`.

## 5. Files modified

- `static/index.html` — add `<aside id="minimap"></aside>` AFTER `<main>` inside the `.app` grid
- `static/app.js`
  - Add `extractDeps(phases)` — returns array of `{from, to}` edges
  - Add `renderDepGraph(edges)` — emits HTML for the dep-graph card
  - Add `attachDepGraphNodes()` — wire Mermaid SVG node clicks to scroll
  - Add `extractCrossRefs(phases)` — returns array of `{fromPhaseIdx, toKind, toNum}`
  - Add `renderCrossRefMiniGraph(refs, phases)` — emits SVG into sidebar
  - Extend `configureMarked` with the `wikilink` extension (tokenizer + renderer)
  - Extend `attachAnchors` to alias `task-<N>` and `phase-<N>` IDs
  - Add `renderTimeline(phases)` — emits timeline HTML
  - Extend `renderProgressBar` to add the third button and route to `setView("timeline", ...)`
  - Extend `setView` with a `"timeline"` branch
  - Add `renderMinimap(phases)` — emits minimap children
  - Add `attachMinimap()` — scroll/resize listeners + click-to-jump
  - Extend `renderAll` to call: `renderDepGraph` (if edges), `renderCrossRefMiniGraph`, `renderMinimap` + `attachMinimap`
- `static/styles.css` — add `.dep-graph-card`, `.xref`, `.cross-ref-graph`, `.timeline*`, `#minimap *`
- `tests/test_client.py` — 4 new tests
- `tests/fixtures/rich.md` — add cross-refs and a `depends on` reference

## 6. Components

### 6.1 `extractDeps(phases)`

```javascript
function extractDeps(phases) {
  const edges = [];
  const depRe = /(?:depends on|requires)\s+Task\s+(\d+)/gi;
  // Walk full source so we can attribute each match to its owning Task N
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
```

(Uses the global `SRC` variable already populated by `fetchPlan()` in v1.0.)

### 6.2 `renderDepGraph(edges)`

```javascript
function renderDepGraph(edges) {
  if (edges.length === 0) return "";
  const lines = ["graph LR"];
  const seen = new Set();
  for (const e of edges) {
    lines.push(`  T${e.from} --> T${e.to}`);
    seen.add(e.from); seen.add(e.to);
  }
  return `<div class="dep-graph-card"><header class="dep-graph-head">Task dependencies</header><div class="mermaid">${escapeHtml(lines.join("\n"))}</div></div>`;
}
```

### 6.3 `attachDepGraphNodes()`

Mermaid v10 renders nodes as `<g class="node">`. After `mermaid.run()`, find each `.node` whose first `<span>` text matches `T<N>` and bind a click handler that scrolls to `#task-<N>`. This runs as a follow-up step inside `renderAll()` after the existing `mermaid.run(...)` call.

```javascript
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

### 6.4 Wikilink marked extension

Added inside `configureMarked()`:

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

### 6.5 Anchor aliasing

`attachAnchors` already gives every H2/H3 a slug ID. Extend it to ALSO set a second ID via a wrapping `<span>` so we don't collide with existing slugs:

```javascript
// inside attachAnchors, after `h.id = slug(...)`:
const taskMatch = h.textContent.match(/^Task\s+(\d+)/);
if (taskMatch && !document.getElementById(`task-${taskMatch[1]}`)) {
  h.setAttribute("data-task-num", taskMatch[1]);
  // Use a hidden anchor sibling for the alias id
  const alias = document.createElement("span");
  alias.id = `task-${taskMatch[1]}`;
  alias.style.position = "absolute";
  alias.style.top = "-80px";  // offset for sticky header
  h.parentElement.insertBefore(alias, h);
}
```

And for `phase-<N>`: H2s are already assigned `phase-<idx>` by `renderPhases` (`el.id = "phase-" + i`). Plan-mode authors typically write `## Phase 1: ...` — `[[Phase 1]]` should map to the first H2 (index 0), not the H2 whose title literally contains "1". Simplest: parse the kind/num at link click time via a delegated handler that scrolls to the Nth H2.

Refined:

```javascript
// inside attachAnchors:
document.addEventListener("click", (e) => {
  const a = e.target.closest("a.xref");
  if (!a) return;
  e.preventDefault();
  const kind = a.dataset.xrefKind, num = parseInt(a.dataset.xrefNum, 10);
  let target = null;
  if (kind === "Task") target = document.getElementById(`task-${num}`);
  else if (kind === "Phase") target = document.querySelectorAll(".phase")[num - 1];
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}, { once: false });
```

(Use a flag to ensure we only register the listener once across `renderAll` re-renders.)

### 6.6 Mini-graph SVG

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
  if (refs.length === 0) return;
  const side = document.getElementById("sidebar");
  // Remove any prior graph
  side.querySelector(".cross-ref-graph")?.remove();
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
    .filter(r => r.toKind === "Phase" && r.toNum - 1 !== r.fromPhaseIdx)
    .map(r => {
      const a = pad + r.fromPhaseIdx * xStep;
      const b = pad + (r.toNum - 1) * xStep;
      if (b < 0 || b > w) return "";
      const mid = (a + b) / 2;
      const lift = 22 + Math.abs(b - a) / 6;
      return `<path class="mini-arc" d="M${a},${cy} Q${mid},${cy - lift} ${b},${cy}" />`;
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

### 6.7 Timeline

```javascript
function renderTimeline(phases) {
  const content = document.getElementById("content");
  const totalTasks = phases.reduce((acc, p) => acc + phaseStatus(p).total, 0);
  const rows = phases.map((p, i) => {
    const s = phaseStatus(p);
    const flex = Math.max(1, s.total);
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
      // After setView re-renders, scroll
      setTimeout(() => {
        document.getElementById(`phase-${idx}`)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
  });
}
```

Extend `setView`:

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

Extend `renderProgressBar` to add the third button:

```javascript
  document.getElementById("meta").innerHTML = `
    <span>${done} of ${total} tasks</span>
    <div id="progress-bar" class="progress-bar"><div style="width:${pct}%"></div></div>
    <div class="view-toggle">
      <button data-view="list" class="active">List</button>
      <button data-view="kanban">Kanban</button>
      <button data-view="timeline">Timeline</button>
    </div>
  `;
```

### 6.8 Minimap

```javascript
function renderMinimap(phases) {
  const map = document.getElementById("minimap");
  if (!map) return;
  map.replaceChildren();
  if (phases.length === 0) return;
  const isPlan = document.body.classList.contains("plan-mode");
  const docH = document.documentElement.scrollHeight;
  if (docH <= window.innerHeight + 40) {
    map.hidden = true;
    return;
  }
  map.hidden = false;
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

`window.LAST_PHASES` is set at the end of `renderAll` so resize can recompute strip heights without re-running the whole pipeline.

### 6.9 Wiring in `renderAll`

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
  runPrism();
  attachIdeLinks();
  attachEnvControls();
  attachRiskChips();

  // v1.3 additions
  const edges = document.body.classList.contains("plan-mode") ? extractDeps(phases) : [];
  if (edges.length > 0) {
    document.getElementById("content").insertAdjacentHTML("afterbegin", renderDepGraph(edges));
  }
  const refs = extractCrossRefs(phases);
  renderCrossRefMiniGraph(refs, phases);

  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains("dark") ? "dark" : "default" });
    mermaid.run({ querySelector: ".mermaid" });
    if (edges.length > 0) attachDepGraphNodes();
  }

  renderMinimap(phases);
  attachMinimap();
}
```

## 7. Visual styling

### 7.1 Dep graph card

- Same surface/border/padding as `.endpoint` card
- Header `font-size: 12px`, uppercase, muted color, letter-spacing 0.06em
- Mermaid SVG fills width with 8 px top margin

### 7.2 Cross-ref anchor

- Color `var(--accent)`, dotted underline like ide-link but distinct trailing arrow
- `::after { content: "↪"; }`
- Hover → solid underline

### 7.3 Mini-graph SVG

- 200×100, stroke `var(--accent)` for arcs, fill `var(--muted)` for dots
- Arc opacity 0.5; dot opacity 0.8
- Hover dot → opacity 1, cursor pointer
- 14 px top/bottom padding inside SVG

### 7.4 Timeline rows

- Each row: 36 px tall, `display: flex; align-items: center; gap: 12px`
- Label: 180 px wide, monospace 13 px, color `var(--text)`
- Bar: 14 px tall, `background: var(--border)`, border-radius 7 px
- Fill: gradient — `done` `linear-gradient(90deg,#34d399,#10b981)`, `wip` `linear-gradient(90deg,#fde047,#eab308)`, `todo` transparent
- Count: 11 px monospace, muted, tabular-nums

### 7.5 Minimap

- `#minimap { position: fixed; right: 0; top: 0; bottom: 0; width: 28px; background: var(--hover); z-index: 50; border-left: 1px solid var(--border); display: flex; flex-direction: column; cursor: pointer; }`
- `.mini-strip` — full-width, status-tinted: `done #d1fae5`, `wip #fef3c7`, `todo #f4f4f5`, `neutral #e5e7eb`
- `.mini-strip:hover` — outline 1 px solid var(--accent)
- `.mini-viewport` — `position: absolute; left: 0; right: 0; background: rgba(74,122,254,.25); pointer-events: none;`
- Dark mode tints scale down to match
- Main content gets `padding-right: 36px` so minimap doesn't overlap

## 8. Error handling

- Empty `phases` array → all renderers no-op
- Mermaid load failure → dep-graph card still renders the text source inside `.mermaid` (Mermaid never converts it); not a regression
- Cross-ref to nonexistent task/phase → anchor still rendered; click handler scrolls to nothing (no error)
- Doc shorter than viewport → minimap hidden via `hidden` attribute
- Invalid `[[...]]` body (e.g., `[[Foo bar]]`) → tokenizer returns undefined → falls through to plain text rendering

## 9. Testing

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
    # Mermaid renders an SVG inside .mermaid after a short delay
    page.wait_for_selector(".dep-graph-card svg", timeout=4000)


def test_xref_renders_link_and_jumps(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Phase 1\n\nsee [[Phase 2]] for details\n\n## Phase 2\n\nx\n"
    )
    page.reload()
    page.wait_for_selector("a.xref")
    href = page.locator("a.xref").first.get_attribute("href")
    assert href == "#phase-2"


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


def test_minimap_strips_match_phases(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n" + ("- [ ] task\n" * 30) + "\n## B\n\nshort\n"
    )
    page.reload()
    page.wait_for_selector("#minimap .mini-strip")
    assert page.locator("#minimap .mini-strip").count() == 2
```

## 10. Security

- Cross-ref anchor href is a fragment, not external URL; no XSS surface
- Mini-graph SVG only receives integer phase indices and the result of `escapeHtml(title)` inside `<title>` tooltips
- Dep graph regex applies to existing `SRC` markdown; output is escaped before being placed into the `.mermaid` block
- No new server endpoints

## 11. Implementation order

1. Dep graph extraction + Mermaid card + click-to-scroll
2. Wikilink marked extension + anchor aliasing + xref click delegation
3. Cross-ref mini-graph SVG
4. Timeline view (extend view-toggle and setView)
5. Minimap render + scroll/resize/click handlers + `#minimap` slot in index.html
6. Extend `rich.md` fixture with `[[Phase X]]` and `depends on Task X` snippets
