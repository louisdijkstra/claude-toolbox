# Plan Explorer v1.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four structured-block renderers to the Plan Explorer client — endpoint cards, env tables with masked secrets, 3×3 risk matrix, and ecosystem-colored dependency badges.

**Architecture:** Pure client-side additions in `static/app.js`. Each fence language gets a `render*Block(raw)` function plumbed into the existing `configureMarked.code` branch; two post-render hooks (`attachEnvControls`, `attachRiskChips`) added to `renderAll()`. No server changes. Same pattern as v1.1.

**Tech Stack:** Vanilla JS (renderers + DOM events), CSS Grid + variables (theming), `<dialog>` element (risk popovers), `navigator.clipboard` (copy buttons), pytest + Playwright (tests).

**Spec:** `docs/superpowers/specs/2026-05-20-plan-explorer-v1.2-design.md`

---

## File Structure

```
~/.claude/skills/plan-explorer/
├── static/
│   ├── app.js       # MODIFY: add 4 renderers + 2 attach helpers + extend configureMarked
│   └── styles.css   # MODIFY: append endpoint, env, risk, deps styles
└── tests/
    ├── test_client.py     # MODIFY: 5 new Playwright tests
    └── fixtures/
        └── rich.md        # MODIFY: add Endpoint / Env / Risk / Deps sample sections
```

Each task adds one renderer + its tests + its styles in a single commit. Same shape as v1.1 tasks 2/3.

---

## Task 1: Endpoint cards (` ```endpoint ` fence)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

Append to `tests/test_client.py`:

```python
def test_endpoint_card_method_color(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```endpoint\n"
        "GET /users\n"
        "description: list users\n"
        "params: id (uuid, optional), include (string, optional)\n"
        "response: 200 {users: []}\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".endpoint .endpoint-method.method-get")
    assert page.locator(".endpoint-path").inner_text() == "/users"
    assert "list users" in page.locator(".endpoint-desc").inner_text()
    assert page.locator(".endpoint-meta dt", has_text="params").count() == 1
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_endpoint_card_method_color -v
```

Expected: FAIL — selector not found.

- [ ] **Step 3: Add endpoint renderer to `static/app.js`**

Add these constants and functions next to the other `render*Block` helpers (after `renderDiffBlock`):

```javascript
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
```

- [ ] **Step 4: Plumb into `configureMarked.code`**

Locate the existing `renderer.code` arrow function inside `configureMarked()`. Insert this branch BEFORE the plain fallback (`escapeHtml(code)` line), and AFTER the `diff` branch:

```javascript
    if (lang === "endpoint") return renderEndpointBlock(code);
```

The full `renderer.code` block becomes:

```javascript
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
    const safe = escapeHtml(code);
    return `<pre><button class="copy-btn" data-code="${encodeURIComponent(code)}">copy</button><code class="language-${lang||'plain'}">${safe}</code></pre>`;
  };
```

- [ ] **Step 5: Append endpoint styles to `static/styles.css`**

```css
.endpoint-list { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
.endpoint {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
}
.endpoint-head { display: flex; align-items: center; gap: 12px; }
.endpoint-method {
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 11px; font-weight: 700;
  padding: 3px 9px; border-radius: 5px;
  color: #fff; letter-spacing: .03em;
}
.endpoint-method.method-get    { background: #10b981; }
.endpoint-method.method-post   { background: #3b82f6; }
.endpoint-method.method-put    { background: #f59e0b; }
.endpoint-method.method-patch  { background: #a855f7; }
.endpoint-method.method-delete { background: #ef4444; }
.endpoint-method.method-other  { background: #6b7280; }
.endpoint-path {
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 14px; color: var(--text);
  background: transparent;
}
.endpoint-body { margin-top: 8px; }
.endpoint-desc { margin: 0 0 8px; font-size: 14px; color: var(--text); }
.endpoint-meta {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 4px 12px;
  margin: 0;
  font-size: 13px;
}
.endpoint-meta dt {
  color: var(--muted);
  text-align: right;
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 12px;
  align-self: start;
  padding-top: 1px;
}
.endpoint-meta dd { margin: 0; color: var(--text); }
.block-warning {
  background: #fef2f2; color: #991b1b;
  padding: 8px 12px; border-radius: 6px;
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 12px;
}
body.dark .block-warning { background: #1f0c0c; color: #fca5a5; }
```

- [ ] **Step 6: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_endpoint_card_method_color -v
```

Expected: 1 passed.

- [ ] **Step 7: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 44 passed (43 prior + 1 new).

- [ ] **Step 8: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): endpoint cards with colored method badges"
```

---

## Task 2: Env block (` ```env ` with masked secrets + reveal + copy)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing tests**

Append to `tests/test_client.py`:

```python
def test_env_masks_secret_key(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```env\nPUBLIC=foo\nAPI_SECRET=bar\n```\n"
    )
    page.reload()
    page.wait_for_selector("table.env")
    rows = page.locator(".env-row")
    assert rows.count() == 2
    assert rows.nth(0).get_attribute("data-masked") == "false"
    assert rows.nth(1).get_attribute("data-masked") == "true"


def test_env_reveal_button(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n```env\nAPI_SECRET=hunter2\n```\n")
    page.reload()
    page.wait_for_selector(".env-reveal")
    page.locator(".env-reveal").click()
    plain = page.locator(".env-plain")
    assert plain.is_visible()
    assert plain.inner_text() == "hunter2"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py -k env -v
```

Expected: 2 FAIL.

- [ ] **Step 3: Add env renderer + control attach in `static/app.js`**

Add next to the endpoint helpers:

```javascript
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
```

- [ ] **Step 4: Plumb env into `configureMarked.code`**

Add `if (lang === "env") return renderEnvBlock(code);` next to the other fence branches. Full block:

```javascript
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
```

- [ ] **Step 5: Call `attachEnvControls()` in `renderAll`**

Insert `attachEnvControls();` after the existing `attachIdeLinks();` (or just before the mermaid block, whichever comes last). The relevant portion of `renderAll` becomes:

```javascript
  attachTreeToggles();
  attachAnchors();
  runPrism();
  attachIdeLinks();
  attachEnvControls();
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: document.body.classList.contains("dark") ? "dark" : "default" });
    mermaid.run({ querySelector: ".mermaid" });
  }
```

- [ ] **Step 6: Append env styles to `static/styles.css`**

```css
table.env {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 13px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
table.env td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}
table.env tr:last-child td { border-bottom: none; }
.env-comment td {
  background: var(--hover);
  color: var(--muted);
  font-style: italic;
  font-size: 12px;
}
.env-key { color: var(--muted); width: 200px; }
.env-val { color: var(--text); }
.env-mask { letter-spacing: 2px; opacity: .8; }
.env-actions {
  width: 70px; text-align: right;
  white-space: nowrap;
}
.env-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text);
}
.env-actions button:hover { background: var(--hover); }
```

- [ ] **Step 7: Run tests, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py -k env -v
```

Expected: 2 passed.

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 46 passed (44 prior + 2 new).

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): env block with masked secrets and reveal/copy"
```

---

## Task 3: Risk matrix (` ```risk ` fence → 3×3 likelihood/impact grid)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_risk_matrix_chip_placement(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```risk\n"
        "- title: SQL injection\n  likelihood: high\n  impact: high\n  mitigation: parameterized queries\n"
        "- title: Stale cache\n  likelihood: low\n  impact: med\n  mitigation: TTL + manual purge\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".risk-grid .risk-chip")
    assert page.locator(".risk-chip").count() == 2
    assert page.locator(".risk-sev-high .risk-chip", has_text="SQL injection").count() == 1
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_risk_matrix_chip_placement -v
```

- [ ] **Step 3: Add risk renderer + chip attach in `static/app.js`**

```javascript
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
```

- [ ] **Step 4: Plumb risk into `configureMarked.code`** (alongside other branches):

```javascript
    if (lang === "risk") {
      return renderRiskBlock(code);
    }
```

- [ ] **Step 5: Call `attachRiskChips()` in `renderAll`**

Add after `attachEnvControls();`:

```javascript
  attachRiskChips();
```

- [ ] **Step 6: Append risk styles to `static/styles.css`**

```css
.risk-grid {
  display: grid;
  grid-template-columns: 100px repeat(3, 1fr);
  gap: 6px;
  margin: 12px 0;
}
.risk-cell {
  min-height: 70px;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.risk-axis {
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .06em;
  min-height: auto;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.risk-axis.risk-corner { font-size: 10px; text-align: center; line-height: 1.2; }
.risk-sev-low  { background: #d1fae5; }
.risk-sev-med  { background: #fef3c7; }
.risk-sev-high { background: #fee2e2; }
body.dark .risk-sev-low  { background: #0f2417; }
body.dark .risk-sev-med  { background: #1f1c08; }
body.dark .risk-sev-high { background: #2a0e10; }
.risk-chip {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
  text-align: left;
}
.risk-chip:hover { box-shadow: 0 2px 6px rgba(0,0,0,.1); }
.risk-detail {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 22px;
  background: var(--surface);
  color: var(--text);
  max-width: 480px;
}
.risk-detail h4 { margin: 0 0 10px; font-size: 16px; }
.risk-detail dl {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 4px 12px;
  margin: 0 0 14px;
  font-size: 13px;
}
.risk-detail dt { color: var(--muted); font-family: "JetBrains Mono", Menlo, monospace; font-size: 12px; }
.risk-detail dd { margin: 0; }
.risk-detail::backdrop { background: rgba(0,0,0,.4); }
.risk-detail form button {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
}
```

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_risk_matrix_chip_placement -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 47 passed (46 + 1).

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): risk matrix grid with chip popovers"
```

---

## Task 4: Dependency badges (` ```deps ` fence → ecosystem-colored pills)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_deps_badges_with_links(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```deps\n"
        "ecosystem: npm\n"
        "react@18.3.0\n"
        "ecosystem: pypi\n"
        "fastapi@0.110\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".dep")
    npm_href = page.locator(".dep[data-eco='npm']").first.get_attribute("href")
    pypi_href = page.locator(".dep[data-eco='pypi']").first.get_attribute("href")
    assert npm_href == "https://npmjs.com/package/react"
    assert pypi_href == "https://pypi.org/project/fastapi/"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_deps_badges_with_links -v
```

- [ ] **Step 3: Add deps renderer in `static/app.js`**

```javascript
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
```

- [ ] **Step 4: Plumb deps into `configureMarked.code`**

```javascript
    if (lang === "deps") {
      return renderDepsBlock(code);
    }
```

Final `renderer.code` (for reference):

```javascript
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
```

- [ ] **Step 5: Append deps styles to `static/styles.css`**

```css
.deps {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
  padding: 0;
}
.dep {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 4px 10px 4px 8px;
  border-radius: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left-width: 3px;
  text-decoration: none;
  font-family: "JetBrains Mono", Menlo, monospace;
  font-size: 12px;
  color: var(--text);
  transition: transform .1s, box-shadow .1s;
}
.dep:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,.08); text-decoration: none; }
.dep-name { font-weight: 600; }
.dep-ver { color: var(--muted); font-weight: 400; }
.dep[data-eco='npm']    { border-left-color: #cb3837; }
.dep[data-eco='npm']    .dep-name { color: #cb3837; }
.dep[data-eco='pypi']   { border-left-color: #3776ab; }
.dep[data-eco='pypi']   .dep-name { color: #3776ab; }
.dep[data-eco='crates'] { border-left-color: #c47e3a; }
.dep[data-eco='crates'] .dep-name { color: #c47e3a; }
.dep[data-eco='go']     { border-left-color: #00add8; }
.dep[data-eco='go']     .dep-name { color: #00add8; }
```

- [ ] **Step 6: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_deps_badges_with_links -v
```

- [ ] **Step 7: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 48 passed (47 + 1).

- [ ] **Step 8: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): dependency badges with ecosystem colors and links"
```

---

## Task 5: Extend `rich.md` fixture with samples for all four blocks

**Files:**
- Modify: `~/.claude/skills/plan-explorer/tests/fixtures/rich.md`

- [ ] **Step 1: Append four sections to the existing fixture**

Use the Write tool (the file already contains triple-backtick fences from prior tasks). Read the current fixture first via `cat ~/.claude/skills/plan-explorer/tests/fixtures/rich.md`, then OVERWRITE with the existing content plus these new sections appended at the end:

```markdown
## Endpoint

` ` `endpoint
GET /users
description: list users
params: id (uuid, optional), include (string, optional)
response: 200 {users: []}

POST /users
description: create a user
body: {name: string, email: string}
response: 201 {id: uuid}
` ` `

## Env

` ` `env
# database
DATABASE_URL=postgres://localhost/app
# secrets
API_SECRET=hunter2
JWT_SIGNING_KEY=aabbccdd
# public knobs
LOG_LEVEL=info
PORT=8080
` ` `

## Risk

` ` `risk
- title: SQL injection
  likelihood: med
  impact: high
  mitigation: parameterized queries everywhere
- title: Token leak in logs
  likelihood: low
  impact: high
  mitigation: redact in log formatter
- title: Cache staleness
  likelihood: high
  impact: low
  mitigation: TTL + manual purge
- title: UX regression
  likelihood: med
  impact: med
  mitigation: visual regression tests
` ` `

## Deps

` ` `deps
ecosystem: npm
react@18.3.0
@radix-ui/react-tooltip@1.0.7
ecosystem: pypi
fastapi@0.110
sqlalchemy@2.0
ecosystem: crates
serde@1.0
` ` `
```

**Important:** Replace every `` ` ` ` `` (with spaces) in the snippet above with three literal backticks (no spaces) when writing the file.

- [ ] **Step 2: Run full suite to confirm fixture parses without breaking tests**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 48 passed.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/tests/fixtures/rich.md
git commit -m "test(plan-explorer): extend rich.md fixture with v1.2 block samples"
```

---

## Self-Review Checklist (run after implementing all tasks)

- [ ] Each spec section §3.1–§3.4 has at least one test (endpoint, env mask, env reveal, risk, deps)
- [ ] `grep -rn "TODO\|FIXME" ~/.claude/skills/plan-explorer/static/ ~/.claude/skills/plan-explorer/scripts/ ~/.claude/skills/plan-explorer/tests/` returns nothing
- [ ] `renderEndpointBlock` / `renderEnvBlock` / `renderRiskBlock` / `renderDepsBlock` are each called from exactly one place in `configureMarked.code`
- [ ] `attachEnvControls` and `attachRiskChips` are both called from `renderAll`, in that order, after `attachIdeLinks`
- [ ] `METHOD_CLASSES`, `ENV_SECRET_RE`, `RISK_LEVELS`, `ECOSYSTEM_URLS` are top-level consts (not inside any function)
- [ ] Final test count: 48 (43 prior + 5 new)
