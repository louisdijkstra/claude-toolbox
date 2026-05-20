# Plan Explorer v1.2 — Structured Blocks

**Status:** Draft for implementation
**Date:** 2026-05-20
**Parent skill:** Plan Explorer (v1.0 + v1.1)

## 1. Purpose

Add four structured-content fence renderers to the existing client:

1. **Endpoint cards** — ` ```endpoint ` fence with method, path, and key:value metadata
2. **Env block** — ` ```env ` fence with masked secret-looking values and reveal/copy controls
3. **Risk matrix** — ` ```risk ` fence with likelihood/impact YAML-ish list rendered as a 3×3 grid
4. **Dependency badges** — ` ```deps ` fence with `name@version` lines rendered as clickable ecosystem-colored pills

All four are opt-in via explicit fence language. Zero new runtime dependencies. Plain markdown fence content stays readable as-is when viewed in a plain editor.

## 2. Non-goals

- Real YAML parsing (line-based subset is enough)
- Editing the blocks in-browser (read-only render)
- Auto-detecting endpoints from tables, or env from `.env` files on disk
- Per-dependency vulnerability data or version checks (just static rendering)
- Sortable / filterable risk lists

## 3. User-visible behavior

### 3.1 Endpoint cards

Body format:

```
GET /users
description: list users
params: id (uuid, optional), include (string, optional)
response: 200 {users: []}
```

First non-blank line: `METHOD PATH`. Subsequent lines: `key: value` pairs.

Rendered as a card with:
- Colored method badge (GET green, POST blue, PUT amber, PATCH purple, DELETE red, HEAD/OPTIONS neutral)
- Monospace path next to badge
- Optional `description` line as larger prose
- Remaining `key: value` pairs in a definition list

Multiple endpoints in one fence are allowed: separated by a blank line. Each renders as a separate card.

### 3.2 Env block

Body format: standard `.env` syntax — `KEY=VALUE` per line, lines starting with `#` are comment captions above the next row, blank lines are skipped.

Mask rule: any KEY matching `/SECRET|TOKEN|PASS|KEY|CREDENTIAL|PRIVATE/i` is masked. Mask appears as `••••••••`. Each row gets:
- Reveal toggle (`👁`) — click to flip mask/plain state (sets `data-revealed="true"` on row)
- Copy button (`📋`) — copies the *actual* value to clipboard regardless of mask state

Rendered as a 3-column table: key, value, actions.

### 3.3 Risk matrix

Body format: YAML-ish list, line-based parser (no real YAML library):

```
- title: SQL injection
  likelihood: high
  impact: high
  mitigation: use parameterized queries
- title: Stale cache
  likelihood: low
  impact: med
  mitigation: TTL + manual purge
```

Each item must have `title`, `likelihood`, `impact`. Optional: `mitigation`, `owner`, `notes`. Unknown keys are tolerated and shown in the popover.

Likelihood and impact values normalized to one of `low` / `med` / `high` (synonyms `medium`/`mid` → `med`; `mid`/`moderate` → `med`).

Rendered as a 3×3 grid:
- Columns: low / med / high impact
- Rows: high / med / low likelihood (top-down so "highest risk" sits top-right)
- Each cell holds zero or more chips with the risk title
- Cell tint by severity (likelihood × impact): green/yellow/red gradient
- Click a chip → opens a popover with all key:value pairs from that risk

### 3.4 Dependency badges

Body format: `name@version` per line. Optional inline ecosystem prefix:

```
react@18.3.0
@radix-ui/react-tooltip@1.0.7
ecosystem:pypi
fastapi@0.110
sqlalchemy@2.0
ecosystem:crates
serde@1.0
```

Default ecosystem: pypi. `ecosystem:<name>` lines set the default for subsequent lines until another `ecosystem:` line appears. Names beginning with `@` always force `npm`.

Each badge rendered as an anchor `<a>` with:
- `target="_blank"` and `rel="noopener"`
- Color by ecosystem (npm red, pypi blue, crates orange, go cyan)
- Hover tooltip with version

URL templates:
- npm → `https://npmjs.com/package/<name>`
- pypi → `https://pypi.org/project/<name>/`
- crates → `https://crates.io/crates/<name>`
- go → `https://pkg.go.dev/<name>`

## 4. Architecture

All work in `static/app.js` and `static/styles.css`. No server changes. Same extension pattern as v1.1: each fence type gets a `render*Block(raw)` function and a branch inside `configureMarked.code`.

### 4.1 Files modified

- `static/app.js` — four new renderers (`renderEndpointBlock`, `renderEnvBlock`, `renderRiskBlock`, `renderDepsBlock`), one post-render attach (`attachEnvControls`), four new branches in `configureMarked.code`, `renderAll` calls `attachEnvControls()`
- `static/styles.css` — endpoint, env, risk, deps styles + dark variants
- `tests/test_client.py` — five new tests (one per block + reveal interaction)
- `tests/fixtures/rich.md` — four new sample sections

## 5. Components

### 5.1 `renderEndpointBlock(raw)`

```javascript
const METHOD_CLASSES = {
  GET: "method-get", POST: "method-post", PUT: "method-put",
  PATCH: "method-patch", DELETE: "method-delete",
  HEAD: "method-other", OPTIONS: "method-other",
};

function parseEndpointBlock(raw) {
  // Splits on blank lines into multiple endpoints
  return raw.split(/\n\s*\n/).map(parseOneEndpoint).filter(Boolean);
}

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

function renderEndpointBlock(raw) {
  const endpoints = parseEndpointBlock(raw);
  if (endpoints.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `<div class="endpoint-list">${endpoints.map(renderOneEndpoint).join("")}</div>`;
}

function renderOneEndpoint(ep) {
  const cls = METHOD_CLASSES[ep.method] || "method-other";
  const desc = ep.description ? `<p class="endpoint-desc">${escapeHtml(ep.description)}</p>` : "";
  const metaRows = Object.entries(ep.meta).map(
    ([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`
  ).join("");
  const metaBlock = metaRows ? `<dl class="endpoint-meta">${metaRows}</dl>` : "";
  return `
    <div class="endpoint">
      <header class="endpoint-head">
        <span class="endpoint-method ${cls}">${escapeHtml(ep.method)}</span>
        <code class="endpoint-path">${escapeHtml(ep.path)}</code>
      </header>
      <div class="endpoint-body">${desc}${metaBlock}</div>
    </div>
  `;
}
```

### 5.2 `renderEnvBlock(raw)` + `attachEnvControls()`

```javascript
const ENV_SECRET_RE = /SECRET|TOKEN|PASS|KEY|CREDENTIAL|PRIVATE/i;

function parseEnvBlock(raw) {
  // Returns [{ comment, key, value, masked }]
  const rows = [];
  let pendingComment = null;
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line) { pendingComment = null; continue; }
    if (line.startsWith("#")) { pendingComment = line.slice(1).trim(); continue; }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip surrounding quotes
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

function renderEnvBlock(raw) {
  const rows = parseEnvBlock(raw);
  if (rows.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `
    <table class="env">
      <tbody>
        ${rows.map(renderEnvRow).join("")}
      </tbody>
    </table>
  `;
}

function renderEnvRow(r) {
  const comment = r.comment
    ? `<tr class="env-comment"><td colspan="3">${escapeHtml(r.comment)}</td></tr>`
    : "";
  const valueCell = r.masked
    ? `<td class="env-val" data-masked="true">
         <span class="env-mask">••••••••</span>
         <span class="env-plain" hidden>${escapeHtml(r.value)}</span>
       </td>`
    : `<td class="env-val"><span class="env-plain">${escapeHtml(r.value)}</span></td>`;
  const revealBtn = r.masked
    ? `<button class="env-reveal" type="button" aria-label="Reveal value">👁</button>`
    : "";
  return `
    ${comment}
    <tr class="env-row" data-masked="${r.masked}">
      <td class="env-key">${escapeHtml(r.key)}</td>
      ${valueCell}
      <td class="env-actions">
        ${revealBtn}
        <button class="env-copy" type="button" aria-label="Copy value" data-value="${encodeURIComponent(r.value)}">📋</button>
      </td>
    </tr>
  `;
}

function attachEnvControls() {
  document.querySelectorAll("table.env .env-reveal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = btn.closest(".env-row");
      const valCell = row.querySelector(".env-val");
      const revealed = valCell.getAttribute("data-masked") === "false";
      valCell.setAttribute("data-masked", revealed ? "true" : "false");
      valCell.querySelector(".env-mask").hidden = !revealed;
      valCell.querySelector(".env-plain").hidden = revealed;
      btn.textContent = revealed ? "👁" : "🙈";
    });
  });
  document.querySelectorAll("table.env .env-copy").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const v = decodeURIComponent(btn.dataset.value);
      await navigator.clipboard.writeText(v);
      const orig = btn.textContent;
      btn.textContent = "✓";
      setTimeout(() => { btn.textContent = orig; }, 1200);
    });
  });
}
```

`attachEnvControls()` is appended to `renderAll()` after the existing `attachIdeLinks()`.

### 5.3 `renderRiskBlock(raw)`

```javascript
const RISK_LEVELS = ["low", "med", "high"];
const RISK_ALIASES = { medium: "med", mid: "med", moderate: "med", lo: "low", hi: "high" };

function normalizeLevel(s) {
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
      current[k] = normalizeLevel(v);
    } else {
      current.extras[k] = v;
    }
  }
  if (current) out.push(current);
  return out.filter(r => r.likelihood && r.impact);
}

function renderRiskBlock(raw) {
  const risks = parseRiskBlock(raw);
  if (risks.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  // Build a 3x3 grid; rows = likelihood (high top), cols = impact (high right)
  const cells = {};
  for (const lik of RISK_LEVELS) {
    for (const imp of RISK_LEVELS) cells[`${lik}-${imp}`] = [];
  }
  risks.forEach((r, idx) => {
    cells[`${r.likelihood}-${r.impact}`].push({ ...r, idx });
  });
  const rowsOrder = ["high", "med", "low"];
  const colsOrder = ["low", "med", "high"];
  const html = [`<div class="risk-grid">`];
  // Header row (impact labels)
  html.push(`<div class="risk-cell risk-axis"></div>`);
  for (const c of colsOrder) html.push(`<div class="risk-cell risk-axis">${c}</div>`);
  for (const r of rowsOrder) {
    html.push(`<div class="risk-cell risk-axis">${r}</div>`);
    for (const c of colsOrder) {
      const key = `${r}-${c}`;
      const sev = severityClass(r, c);
      const chips = cells[key].map(risk =>
        `<button type="button" class="risk-chip" data-idx="${risk.idx}">${escapeHtml(risk.title)}</button>`
      ).join("");
      html.push(`<div class="risk-cell ${sev}">${chips}</div>`);
    }
  }
  html.push(`</div>`);
  // Hidden popovers (one per risk)
  html.push(`<div class="risk-details">`);
  risks.forEach((r, idx) => {
    const rows = [
      ["likelihood", r.likelihood], ["impact", r.impact],
      ...Object.entries(r.extras)
    ].map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("");
    html.push(`<dialog class="risk-detail" data-idx="${idx}">
      <h4>${escapeHtml(r.title)}</h4>
      <dl>${rows}</dl>
      <form method="dialog"><button>Close</button></form>
    </dialog>`);
  });
  html.push(`</div>`);
  return html.join("");
}

function severityClass(lik, imp) {
  const score = (RISK_LEVELS.indexOf(lik) + 1) * (RISK_LEVELS.indexOf(imp) + 1);
  if (score >= 6) return "risk-sev-high";
  if (score >= 3) return "risk-sev-med";
  return "risk-sev-low";
}

function attachRiskChips() {
  document.querySelectorAll(".risk-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const dlg = btn.closest(".risk-grid").parentElement.querySelector(`.risk-detail[data-idx="${idx}"]`);
      if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    });
  });
}
```

`attachRiskChips()` added to `renderAll()` after `attachEnvControls()`.

### 5.4 `renderDepsBlock(raw)`

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
    // Handle scoped npm packages like @scope/name@version
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

function renderDepsBlock(raw) {
  const deps = parseDepsBlock(raw);
  if (deps.length === 0) return `<pre class="block-warning">${escapeHtml(raw)}</pre>`;
  return `<div class="deps">${deps.map(renderDepBadge).join("")}</div>`;
}

function renderDepBadge(d) {
  const url = ECOSYSTEM_URLS[d.ecosystem] ? ECOSYSTEM_URLS[d.ecosystem](d.name) : "#";
  const ver = d.version ? `<span class="dep-ver">@${escapeHtml(d.version)}</span>` : "";
  const tip = d.version ? `${d.name}@${d.version}` : d.name;
  return `<a class="dep" data-eco="${d.ecosystem}" href="${escapeHtml(url)}" target="_blank" rel="noopener" title="${escapeHtml(tip)}">
    <span class="dep-name">${escapeHtml(d.name)}</span>${ver}
  </a>`;
}
```

### 5.5 Marked routing

`configureMarked.code` gains four branches before the plain fallback:

```javascript
if (lang === "endpoint") return renderEndpointBlock(code);
if (lang === "env")      return renderEnvBlock(code);
if (lang === "risk")     return renderRiskBlock(code);
if (lang === "deps")     return renderDepsBlock(code);
```

`renderAll` gains two new post-render attach calls:

```javascript
attachEnvControls();
attachRiskChips();
```

## 6. Visual styling

### 6.1 Endpoint card

- White surface, 1px border, 12px radius, 14px padding
- Method badge: 11px font, 4px padding, 5px radius, white text on colored background
- Method colors:
  - GET: `#10b981`
  - POST: `#3b82f6`
  - PUT: `#f59e0b`
  - PATCH: `#a855f7`
  - DELETE: `#ef4444`
  - HEAD/OPTIONS: `#6b7280`
- Path: monospace 14px next to badge
- `dt`/`dd`: 13px, dt is muted color and right-aligned in a 100px column

### 6.2 Env table

- Full-width, monospace
- Key column: muted color, padding-right
- Value column: monospace; mask uses `letter-spacing: 2px` to look uniform
- Reveal/copy buttons: emoji, no background, hover shows pointer

### 6.3 Risk grid

- 4×4 CSS grid (3 cells + 1 axis label per row/col)
- Cells 80px tall, 6px gap, 8px radius
- Severity tints:
  - `risk-sev-low`: `#d1fae5` / dark `#0f2417`
  - `risk-sev-med`: `#fef3c7` / dark `#1f1c08`
  - `risk-sev-high`: `#fee2e2` / dark `#2a0e10`
- Chips: pill shape, white background, 1px shadow, 12px font

### 6.4 Deps badges

- Inline-flex container, 6px gap, wrap
- Each badge: 4px radius, 11px font, ecosystem-colored left border (3px solid)
- `dep-name` colored by ecosystem; `dep-ver` always muted
- Hover: subtle scale + box-shadow

## 7. Error handling

- Each `parse*` returns empty list on garbage input → renderer emits `<pre class="block-warning">` with the raw content, surfacing the bad block instead of swallowing it
- Unknown ecosystem in `deps`: `href="#"`, no click action; badge still shown
- Risk with invalid likelihood/impact: filtered out (not rendered in grid)
- Env line that does not match `KEY=VALUE`: silently skipped (matches `.env` parser convention)

## 8. Security

- `target="_blank"` + `rel="noopener"` on all deps anchors
- All user-provided strings pass `escapeHtml` before insertion
- Copy uses `navigator.clipboard.writeText`; no DOM injection
- Reveal toggle only flips `hidden` on already-rendered (escaped) text node; never re-evaluates content
- Risk popover uses `<dialog>` element's `showModal()` — built-in focus trap; no third-party modal lib

## 9. Testing

```python
def test_endpoint_card_method_color(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```endpoint\nGET /users\ndescription: list users\n```\n"
    )
    page.reload()
    page.wait_for_selector(".endpoint .endpoint-method.method-get")
    assert page.locator(".endpoint-path").inner_text() == "/users"
    assert "list users" in page.locator(".endpoint-desc").inner_text()


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


def test_risk_matrix_chip_placement(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```risk\n"
        "- title: SQL injection\n  likelihood: high\n  impact: high\n"
        "- title: Stale cache\n  likelihood: low\n  impact: med\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".risk-grid .risk-chip")
    assert page.locator(".risk-chip").count() == 2
    # SQL chip should be inside a risk-sev-high cell
    assert page.locator(".risk-sev-high .risk-chip", has_text="SQL injection").count() == 1


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

Five client tests total. Fixtures: extend `rich.md` with `## Endpoint`, `## Env`, `## Risk`, `## Deps` sections.

## 10. Implementation order

1. Endpoint renderer + test
2. Env renderer + reveal/copy attach + tests
3. Risk renderer + chip popover attach + test
4. Deps renderer + test
5. Extend `rich.md` fixture
