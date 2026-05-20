# Plan Explorer v1.1 — Code & Files Enrichments

**Status:** Draft for implementation
**Date:** 2026-05-20
**Parent skill:** Plan Explorer ([v1.0 spec](./2026-05-20-plan-explorer-design.md))

## 1. Purpose

Add four content-rendering enrichments to the v1.0 Plan Explorer skill:

1. **Real syntax highlighting** for code fences via vendored Prism.js
2. **Interactive file-tree blocks** from ` ```tree ` fences (collapsible, file-type icons)
3. **IDE deep-links** — auto-wrap `path/to/file.ext:line` in clickable `vscode://` (or configurable) anchors
4. **Diff blocks** — unified `+`/`-` rendering for ` ```diff ` fences with line-number gutter

All four are opt-in via fence language (except IDE links, which scan rendered text). Zero new runtime dependencies. Plain markdown remains portable.

## 2. Non-goals

- Side-by-side diff view (unified inline only)
- Auto-language detection for code (require explicit ` ```lang `)
- Editing the tree visually (read-only — author writes ASCII)
- Resolving `vscode://` URIs server-side (browser fires the URI; OS dispatches to the editor)
- LSP integration, jump-to-definition, or any code intelligence

## 3. User-visible behavior

### 3.1 Syntax highlighting

` ```python ` (or any supported language) renders with token-level coloring. Theme tracks dark/light mode automatically. Languages supported in v1.1: python, javascript, typescript, bash, sql, json, yaml, toml, css, html, rust, go, markdown.

Unknown languages still get the existing `<pre><code>` wrapper with the `language-<lang>` class but no token coloring.

### 3.2 Tree blocks

Authors write standard ASCII tree inside a ` ```tree ` fence:

```
skills/plan-explorer/
├── SKILL.md
├── scripts/
│   ├── plan-explore
│   └── server.py
└── static/
    ├── app.js
    └── styles.css
```

Renders as an interactive nested tree:

- Directories: chevron toggles expand/collapse children
- Files: typed icon by extension (`.py` → snake, `.md` → page, `.json` → braces, etc.)
- Click a file row → fires IDE deep-link if absolute path resolvable

Plain markdown view (the file on disk) still reads cleanly as ASCII tree.

### 3.3 IDE deep-links

After each render, plain text inside `.phase-body p`, `.phase-body li`, and tree-file rows is scanned for the pattern:

```
\b([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{1,8})(?::(\d+))?\b
```

Matches are wrapped in `<a class="ide-link" href="<scheme>file/<abs>/<match>:<line|1>">`. Skipped if the match is already inside `<a>`, `<code>`, or `<pre>`.

Scheme is selected via URL query `?editor=<name>` on the page URL:

| `editor=` value | Scheme prefix |
|-----------------|---------------|
| `vscode` (default) | `vscode://file/` |
| `cursor` | `cursor://file/` |
| `idea` (JetBrains) | `idea://open?file=` (special format; line via `&line=<N>`) |
| `none` | `file://` (no deep-link; browser opens raw file if supported) |

Absolute paths are resolved server-side: a new endpoint `GET /resolve?path=<rel>` returns the absolute path of `<rel>` relative to the plan's directory. The launcher records the plan's parent dir as `BASE_DIR` at start; server uses that as the root.

The client calls `/resolve` once per unique relative path per render and caches the result in `window.RESOLVE_CACHE`.

### 3.4 Diff blocks

` ```diff ` fence renders each line classified by its leading character:

| Prefix | Class | Visual |
|--------|-------|--------|
| `+` | `.line.add` | green background, monospace |
| `-` | `.line.del` | red background, monospace |
| `@@` | `.line.hunk` | muted, italic, signals "hunk header" |
| ` ` (space) or anything else | `.line.ctx` | neutral, monospace |

Line numbers shown in a gutter on the left when the diff contains a hunk header of the form `@@ -A,B +C,D @@`. The renderer parses the header to compute correct old/new line numbers per row. If no hunk header is present, no gutter is shown (raw diff fallback).

## 4. Architecture

### 4.1 No new architectural layers

All work happens client-side except for one new server endpoint (`/resolve`) needed for IDE-link absolute-path resolution. Server otherwise unchanged.

### 4.2 Files added

```
static/vendor/prism.min.js          # core + bundled languages, ~30 KB
static/vendor/prism.css             # theme styles, light + dark variants
```

### 4.3 Files modified

- `static/index.html` — load `prism.min.js` and `prism.css`
- `static/app.js` — extend `configureMarked()` for `tree`/`diff` fences; add `attachIdeLinks()` and `runPrism()` in `renderAll()`; add `resolvePath()` helper
- `static/styles.css` — tree, diff, ide-link styles
- `scripts/server.py` — add `GET /resolve` endpoint; capture `BASE_DIR` from plan path's parent at startup
- `tests/test_client.py` — four new tests
- `tests/test_server.py` — one new test for `/resolve`
- `tests/fixtures/rich.md` — extend with tree + diff samples

## 5. Components

### 5.1 Prism integration

Vendor `prism.min.js` with these languages bundled (no autoload): python, javascript, typescript, bash, sql, json, yaml, toml, css, markup (covers html), rust, go, markdown.

Theme: ship a single `prism.css` that uses CSS variables tied to the existing `--surface` / `--text` palette, so dark/light theming is automatic.

In `configureMarked()`, the existing `renderer.code` keeps its current shape for non-special languages:

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
  const safe = escapeHtml(code);
  return `<pre><button class="copy-btn" data-code="${encodeURIComponent(code)}">copy</button><code class="language-${lang||'plain'}">${safe}</code></pre>`;
};
```

After every `renderAll()` call, run `Prism.highlightAllUnder(document.getElementById("content"))`. Prism reads the `language-*` class on `<code>` and applies token spans.

### 5.2 Tree renderer

`renderTreeBlock(raw)` returns HTML for the fence:

1. Split on newlines
2. For each line:
   - Strip the ASCII connector characters (`├`, `└`, `│`, `─`, spaces) but record column count to infer depth
   - Detect if the row is a directory (ends with `/`) or a file
3. Build a flat array of `{depth, name, isDir}` entries
4. Reconstruct nested HTML by walking the flat list:

```html
<ul class="tree" role="tree">
  <li class="tree-dir" aria-expanded="true">
    <span class="tree-toggle"></span>
    <span class="tree-name">skills/plan-explorer/</span>
    <ul>
      <li class="tree-file" data-path="skills/plan-explorer/SKILL.md">
        <span class="tree-icon">📝</span>
        <span class="tree-name">SKILL.md</span>
      </li>
      ...
    </ul>
  </li>
</ul>
```

Click handler on `.tree-toggle` flips `aria-expanded`. Click on `.tree-file` fires `openIdeLink(path)`.

Icon map (extension → emoji):

```javascript
const ICONS = {
  py:"🐍", js:"📜", ts:"📘", json:"⚙️", yaml:"⚙️", yml:"⚙️", toml:"⚙️",
  md:"📝", html:"🌐", css:"🎨", sh:"🔧", rs:"🦀", go:"🦫",
  png:"🖼", jpg:"🖼", svg:"🖼",
};
```

Unknown extension → 📄. Directories → folder icon via CSS (no emoji).

### 5.3 Diff renderer

`renderDiffBlock(raw)`:

1. Split on newlines
2. Detect hunk headers: `^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@`
3. Track old/new line counters; emit them in gutter for context/add/del lines
4. Classify each line by leading char
5. Output:

```html
<pre class="diff">
  <div class="line hunk"><span class="gutter"></span><span class="text">@@ -1,5 +1,6 @@</span></div>
  <div class="line ctx"><span class="gutter">1  1</span><span class="text">unchanged</span></div>
  <div class="line del"><span class="gutter">2   </span><span class="text">- old</span></div>
  <div class="line add"><span class="gutter">  2 </span><span class="text">+ new</span></div>
</pre>
```

Gutter width is fixed; `pre` has no scrollbar wrap (just horizontal overflow).

### 5.4 IDE link pass

`attachIdeLinks()`:

```javascript
async function attachIdeLinks() {
  const editor = new URLSearchParams(location.search).get("editor") || "vscode";
  const scheme = editorScheme(editor);
  const scope = document.querySelectorAll(".phase-body p, .phase-body li, .tree-file .tree-name");
  for (const el of scope) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (const node of nodes) {
      if (insideExcluded(node)) continue;
      await wrapMatches(node, scheme);
    }
  }
}
```

`wrapMatches` runs the regex, calls `resolvePath(relPath)` for each unique relative path (cached), and replaces text node content with a mix of text and `<a class="ide-link">`.

`resolvePath(rel)`:

```javascript
async function resolvePath(rel) {
  if (RESOLVE_CACHE.has(rel)) return RESOLVE_CACHE.get(rel);
  const r = await fetch(`/resolve?t=${TOKEN}&path=${encodeURIComponent(rel)}`);
  const abs = r.ok ? (await r.json()).abs : null;
  RESOLVE_CACHE.set(rel, abs);
  return abs;
}
```

Special editor schemes:

```javascript
function buildIdeHref(scheme, abs, line) {
  if (scheme === "idea://open?file=") return `${scheme}${abs}&line=${line||1}`;
  return `${scheme}${abs}:${line||1}`;
}
```

### 5.5 New server endpoint `GET /resolve`

```python
def _serve_resolve(self):
    qs = parse_qs(urlparse(self.path).query)
    rel = (qs.get("path") or [""])[0]
    if not rel:
        self.send_error(400, "missing path")
        return
    try:
        target = (State.base_dir / rel).resolve()
    except OSError:
        self.send_error(400)
        return
    # Restrict to BASE_DIR to prevent leaking arbitrary filesystem paths
    if State.base_dir not in target.parents and target != State.base_dir:
        self.send_error(403, "outside base dir")
        return
    payload = json.dumps({"abs": str(target)}).encode()
    self.send_response(200)
    self.send_header("Content-Type", "application/json")
    self.send_header("Content-Length", str(len(payload)))
    self.end_headers()
    self.wfile.write(payload)
```

Added to `do_GET` routing.

`State.base_dir` set in `main()`:

```python
State.base_dir = State.plan_path.parent
```

## 6. Data flow

### Load
```
GET / → index.html (loads marked, mermaid, prism, app.js)
GET /plan → markdown
client renders → runPrism → attachIdeLinks (calls /resolve for each unique relPath)
```

### IDE-link click
```
user clicks <a class="ide-link" href="vscode://file/<abs>:<N>">
  → browser fires URI scheme
  → OS dispatches to the registered handler
  → editor opens (if installed) at file:line
  → if no handler: browser does nothing (silent)
```

### Tree expand/collapse
```
user clicks .tree-toggle
  → aria-expanded flips
  → CSS hides child <ul> when aria-expanded="false"
```

Tree state is NOT persisted across reloads (always opens fully expanded). Skipped for v1.1; revisit if requested.

## 7. Error handling

- Prism missing language → falls back to plain `<pre><code>` (no error)
- `/resolve` 403 (path outside BASE_DIR) → no link wrapping; raw text remains
- `/resolve` network error → cached as `null`, no link wrapping
- Malformed tree (broken indentation) → renders as best-effort flat list with a `.tree-warning` ribbon
- Malformed diff (no hunk header) → renders without gutter, classes still applied
- Editor URI scheme handler missing → browser silently does nothing (expected OS behavior)

No new error toasts; failures degrade silently.

## 8. Security

- `/resolve` enforces the same token check as every other route
- Path-traversal guard: `(BASE_DIR / rel).resolve()` and `BASE_DIR not in parents` reject any path outside the plan's directory
- IDE link `href` is URL-encoded; user content cannot inject JavaScript into the anchor
- Prism does NOT execute user code; it tokenizes statically
- Tree rendering escapes every name before insertion

## 9. Testing

### Client tests (`tests/test_client.py`)

```python
def test_syntax_highlight_python(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n```python\ndef hi(): pass\n```\n")
    page.reload()
    page.wait_for_selector(".language-python .token.keyword")


def test_tree_block_collapsible(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```tree\n"
        "root/\n├── a.py\n└── sub/\n    └── b.md\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".tree-dir")
    assert page.locator(".tree-dir").count() >= 2  # root/ and sub/
    assert page.locator(".tree-file").count() == 2  # a.py and b.md
    # Click toggles
    page.locator(".tree-dir .tree-toggle").nth(1).click()
    expanded = page.locator(".tree-dir").nth(1).get_attribute("aria-expanded")
    assert expanded == "false"


def test_diff_block_classifies_lines(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```diff\n"
        "@@ -1,2 +1,2 @@\n"
        " context\n-old\n+new\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".diff .line.hunk")
    assert page.locator(".diff .line.add").count() == 1
    assert page.locator(".diff .line.del").count() == 1
    assert page.locator(".diff .line.ctx").count() == 1


def test_ide_link_wraps_path(page_loader):
    page, md = page_loader
    # The path must exist relative to the plan file's dir for /resolve to succeed
    (md.parent / "scripts").mkdir(exist_ok=True)
    (md.parent / "scripts" / "x.py").write_text("")
    md.write_text("# P\n\n## A\n\nsee scripts/x.py:42 for details\n")
    page.reload()
    page.wait_for_selector("a.ide-link")
    href = page.locator("a.ide-link").first.get_attribute("href")
    assert href.startswith("vscode://file/") and href.endswith(":42")


def test_ide_link_not_inside_code(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nIn `scripts/x.py:1` we see ...\n")
    page.reload()
    page.wait_for_selector(".phase-body")
    assert page.locator("code a.ide-link").count() == 0
```

### Server tests (`tests/test_server.py`)

```python
def test_resolve_endpoint(tmp_md, free_port):
    token = "r" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        (tmp_md.parent / "foo.md").write_text("hi")
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/resolve?t={token}&path=foo.md")
        resp = conn.getresponse()
        assert resp.status == 200
        body = json.loads(resp.read())
        assert body["abs"].endswith("/foo.md")
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_resolve_blocks_traversal(tmp_md, free_port):
    token = "s" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/resolve?t={token}&path=../../etc/passwd")
        assert conn.getresponse().status == 403
    finally:
        proc.terminate(); proc.wait(timeout=2)
```

### Fixture updates (`tests/fixtures/rich.md`)

Add a `## Tree demo` section with a `tree` fence and a `## Diff demo` section with a `diff` fence.

## 10. Open questions

None — all resolved during brainstorming.

## 11. Implementation order

1. Vendor `prism.min.js` + `prism.css` (light/dark)
2. Load Prism in `index.html`; call `Prism.highlightAllUnder` in `renderAll`; verify token classes on `.language-python`
3. Implement `renderTreeBlock` + tests + styles
4. Implement `renderDiffBlock` + tests + styles
5. Add `State.base_dir` in server and `/resolve` endpoint + tests
6. Implement `attachIdeLinks` + `resolvePath` + cache + tests
7. Extend `rich.md` fixture
8. Manual smoke against the v1 plan file (already long, has code blocks)
