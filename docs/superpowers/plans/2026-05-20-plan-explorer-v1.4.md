# Plan Explorer v1.4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four reading-polish features to the Plan Explorer client — glossary popovers, footnote popovers, image gallery + lightbox, and smooth animations.

**Architecture:** Pure client-side. All new code in `static/app.js` and `static/styles.css`. No server changes, no HTML changes. Reuse the existing `insideExcludedAncestor` helper (introduced in v1.1 for IDE links) for both glossary and footnote text-node walking.

**Tech Stack:** Vanilla JS (parsers, popovers, lightbox), Marked extensions (footnotes), CSS animations + `@media (prefers-reduced-motion)`, pytest + Playwright.

**Spec:** `docs/superpowers/specs/2026-05-20-plan-explorer-v1.4-design.md`

---

## File Structure

```
~/.claude/skills/plan-explorer/
├── static/
│   ├── app.js     # MODIFY: parseGlossary, walkAndWrap, attachGlossaryPopovers, ensureGlossPopover,
│   │              #         footnote marked extensions, attachFootnoteHovers, ensureFootnotePopover,
│   │              #         attachImageGallery, openLightbox/closeLightbox.
│   │              #         Glossary phase filtering inside DOMContentLoaded.
│   │              #         renderAll calls the new attach helpers.
│   └── styles.css # MODIFY: .gloss-term, #gloss-popover, .fn-ref, .fn-def, #fn-popover,
│                  #         p.gallery, #lightbox, prefers-reduced-motion block
└── tests/
    ├── test_client.py    # MODIFY: 4 new tests
    └── fixtures/
        └── rich.md       # MODIFY: add Glossary section, footnote pair, 3-image gallery
```

Each task = one feature = one commit. Same shape as v1.2 and v1.3.

---

## Task 1: Glossary popovers

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

Append to `tests/test_client.py`:

```python
def test_glossary_wraps_terms_and_hides_section(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Intro\n\nThe SSE stream uses mtime polling.\n\n"
        "## Glossary\n\n**SSE** — server-sent events.\n**mtime** — file modification time.\n"
    )
    page.reload()
    page.wait_for_selector(".gloss-term")
    assert page.locator(".gloss-term").count() == 2
    titles = page.locator(".phase h2").all_text_contents()
    assert "Glossary" not in " ".join(titles)
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_glossary_wraps_terms_and_hides_section -v
```

- [ ] **Step 3: Add glossary functions to `static/app.js`**

Add these near the other render helpers (after the diff/tree renderers, before `renderAll`):

```javascript
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
```

- [ ] **Step 4: Filter the glossary phase before rendering**

Locate the `DOMContentLoaded` async handler. Find the line that calls `renderAll(phases)`. Replace the surrounding block so it filters the glossary phase first and stores terms on `window` for the attach pass:

```javascript
  const { preludeRaw, prelude, phases } = parsePhases(body);
  window.PRELUDE_RAW = preludeRaw;
  const h1 = prelude.find(t => t.type === "heading" && t.depth === 1);
  document.getElementById("title").textContent = h1 ? h1.text : "Plan";
  const { terms, glossaryPhaseIdx } = parseGlossary(phases);
  window.GLOSSARY_TERMS = terms;
  const renderedPhases = glossaryPhaseIdx === -1
    ? phases
    : phases.filter((_, i) => i !== glossaryPhaseIdx);
  renderAll(renderedPhases);
```

(Exact placement: the existing handler currently does
`const { preludeRaw, prelude, phases } = parsePhases(body);` /
`window.PRELUDE_RAW = preludeRaw;` /
`const h1 = ...` /
`document.getElementById("title").textContent = ...;` /
`renderAll(phases);`. Insert the new lines between the `title` assignment and the `renderAll` call, and rename the argument passed to `renderAll`.)

- [ ] **Step 5: Wire `attachGlossaryPopovers` into `renderAll`**

Inside `renderAll`, add `attachGlossaryPopovers(window.GLOSSARY_TERMS || []);` after the existing `attachIdeLinks();` call (and before `attachEnvControls();` to keep textual passes grouped). The relevant section becomes:

```javascript
  attachIdeLinks();
  attachGlossaryPopovers(window.GLOSSARY_TERMS || []);
  attachEnvControls();
  attachRiskChips();
```

- [ ] **Step 6: Append glossary styles to `static/styles.css`**

```css
.gloss-term {
  border-bottom: 1px dotted var(--muted);
  cursor: help;
}
#gloss-popover, #fn-popover {
  position: absolute;
  transform: translate(-50%, -100%);
  max-width: 320px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 6px 20px rgba(0,0,0,.12);
  z-index: 200;
  pointer-events: none;
}
#gloss-popover[hidden], #fn-popover[hidden] { display: none; }
```

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_glossary_wraps_terms_and_hides_section -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 54 passed (53 prior + 1 new).

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): glossary popovers from dedicated section"
```

---

## Task 2: Footnote popovers (marked extensions + hover popover)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_footnote_renders_ref_and_def(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\nSpec §11 requires token auth[^1] everywhere.\n\n"
        "[^1]: see security section for details\n"
    )
    page.reload()
    page.wait_for_selector("sup.fn-ref a")
    href = page.locator("sup.fn-ref a").first.get_attribute("href")
    assert href == "#fn-1"
    assert page.locator("#fn-1").count() == 1
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_footnote_renders_ref_and_def -v
```

- [ ] **Step 3: Add footnote marked extensions inside `configureMarked()`**

Locate the existing `configureMarked()` function. After the existing `marked.use({ renderer })` call, append another `marked.use({ extensions: [...] })` call:

```javascript
  marked.use({
    extensions: [
      {
        name: "footnoteRef",
        level: "inline",
        start(src) {
          const i = src.indexOf("[^");
          return i < 0 ? undefined : i;
        },
        tokenizer(src) {
          const m = src.match(/^\[\^([A-Za-z0-9_-]+)\]/);
          if (!m) return;
          const after = src.slice(m[0].length);
          if (after.startsWith(":")) return;
          return { type: "footnoteRef", raw: m[0], id: m[1] };
        },
        renderer(t) {
          return `<sup class="fn-ref"><a href="#fn-${escapeHtml(t.id)}" data-fn-id="${escapeHtml(t.id)}">${escapeHtml(t.id)}</a></sup>`;
        },
      },
      {
        name: "footnoteDef",
        level: "block",
        start(src) {
          return src.indexOf("[^");
        },
        tokenizer(src) {
          const m = src.match(/^\[\^([A-Za-z0-9_-]+)\]:\s*(.+)/);
          if (!m) return;
          return { type: "footnoteDef", raw: m[0], id: m[1], text: m[2].trim() };
        },
        renderer(t) {
          return `<div class="fn-def" id="fn-${escapeHtml(t.id)}"><sup>${escapeHtml(t.id)}</sup> ${escapeHtml(t.text)}</div>`;
        },
      },
    ],
  });
```

If a `wikilink` `marked.use` call already exists (added in v1.3), keep it; the new `marked.use` is independent.

- [ ] **Step 4: Add `attachFootnoteHovers` + `ensureFootnotePopover` to `static/app.js`**

Place next to `ensureGlossPopover`:

```javascript
function ensureFootnotePopover() {
  if (document.getElementById("fn-popover")) return;
  const pop = document.createElement("div");
  pop.id = "fn-popover";
  pop.hidden = true;
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);
}

function attachFootnoteHovers() {
  ensureFootnotePopover();
  const pop = document.getElementById("fn-popover");
  document.querySelectorAll("sup.fn-ref a").forEach(a => {
    const show = () => {
      const def = document.getElementById(`fn-${a.dataset.fnId}`);
      if (!def) return;
      pop.textContent = def.textContent.trim();
      pop.hidden = false;
      const r = a.getBoundingClientRect();
      pop.style.left = `${window.scrollX + r.left + r.width / 2}px`;
      pop.style.top = `${window.scrollY + r.top - 8}px`;
    };
    const hide = () => { pop.hidden = true; };
    a.addEventListener("mouseenter", show);
    a.addEventListener("mouseleave", hide);
    a.addEventListener("focus", show);
    a.addEventListener("blur", hide);
  });
}
```

- [ ] **Step 5: Call `attachFootnoteHovers()` in `renderAll`**

Add after `attachGlossaryPopovers(...)`:

```javascript
  attachGlossaryPopovers(window.GLOSSARY_TERMS || []);
  attachFootnoteHovers();
```

- [ ] **Step 6: Append footnote styles to `static/styles.css`**

```css
sup.fn-ref {
  font-size: 10px;
  vertical-align: super;
  line-height: 1;
}
sup.fn-ref a {
  color: var(--accent);
  text-decoration: none;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(74, 122, 254, .12);
}
sup.fn-ref a:hover { background: rgba(74, 122, 254, .25); }
.fn-def {
  font-size: 13px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  margin-top: 12px;
  padding-top: 8px;
}
.fn-def sup { color: var(--accent); margin-right: 4px; }
```

- [ ] **Step 7: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_footnote_renders_ref_and_def -v
```

- [ ] **Step 8: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 55 passed.

- [ ] **Step 9: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): footnote popovers via marked extensions"
```

---

## Task 3: Image gallery + lightbox

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/app.js`
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_image_gallery_grids_multi_images(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n![](a.png) ![](b.png) ![](c.png)\n"
    )
    page.reload()
    page.wait_for_selector("p.gallery")
    assert page.locator("p.gallery img").count() == 3
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_image_gallery_grids_multi_images -v
```

- [ ] **Step 3: Add gallery + lightbox functions to `static/app.js`**

```javascript
function attachImageGallery() {
  document.querySelectorAll(".phase-body p").forEach(p => {
    const kids = [...p.childNodes].filter(n => !(n.nodeType === Node.TEXT_NODE && !n.nodeValue.trim()));
    if (kids.length < 2) return;
    const allImgs = kids.every(n => n.nodeType === Node.ELEMENT_NODE && n.tagName === "IMG");
    if (!allImgs) return;
    p.classList.add("gallery");
    kids.forEach(img => {
      img.addEventListener("click", () => openLightbox(img.src, img.alt || ""));
    });
  });
}

function openLightbox(src, alt) {
  let lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.hidden = true;
    lb.innerHTML = '<img class="lightbox-img" alt=""><button class="lightbox-close" type="button" aria-label="Close">×</button>';
    document.body.appendChild(lb);
    lb.addEventListener("click", (e) => {
      if (e.target.classList.contains("lightbox-close") || e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }
  const img = lb.querySelector(".lightbox-img");
  img.src = src;
  img.alt = alt;
  lb.hidden = false;
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.hidden = true;
}
```

- [ ] **Step 4: Call `attachImageGallery()` in `renderAll`**

Insert after `attachFootnoteHovers();`:

```javascript
  attachFootnoteHovers();
  attachImageGallery();
```

- [ ] **Step 5: Append gallery + lightbox styles to `static/styles.css`**

```css
p.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin: 12px 0;
}
p.gallery img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  cursor: zoom-in;
  transition: transform .15s;
}
p.gallery img:hover { transform: scale(1.02); }
#lightbox {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.85);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  cursor: zoom-out;
}
#lightbox[hidden] { display: none; }
.lightbox-img {
  max-width: 92vw; max-height: 92vh;
  border-radius: 4px;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
}
.lightbox-close {
  position: absolute; top: 16px; right: 20px;
  background: transparent; border: none;
  color: #fff; font-size: 32px;
  cursor: pointer; line-height: 1;
}
```

- [ ] **Step 6: Run test, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_image_gallery_grids_multi_images -v
```

- [ ] **Step 7: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 56 passed.

- [ ] **Step 8: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/app.js \
        skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): image gallery grid and fullscreen lightbox"
```

---

## Task 4: Smooth animations (CSS only, reduced-motion aware)

**Files:**
- Modify: `~/.claude/skills/plan-explorer/static/styles.css`
- Modify: `~/.claude/skills/plan-explorer/tests/test_client.py`

- [ ] **Step 1: Failing test**

```python
def test_anim_respects_reduced_motion(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nbody\n")
    page.emulate_media(reduced_motion="reduce")
    page.reload()
    page.wait_for_selector(".phase")
    val = page.locator(".phase").first.evaluate(
        "el => getComputedStyle(el).animationName"
    )
    assert val == "none"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_anim_respects_reduced_motion -v
```

(May actually PASS already because no animation is set; if so, proceed to Step 3 to add the animation and re-run.)

- [ ] **Step 3: Append animation block to `static/styles.css`**

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
  .phase {
    animation: phase-in .35s ease-out both;
  }
  .phase:nth-child(1)   { animation-delay: .02s; }
  .phase:nth-child(2)   { animation-delay: .05s; }
  .phase:nth-child(3)   { animation-delay: .08s; }
  .phase:nth-child(4)   { animation-delay: .11s; }
  .phase:nth-child(5)   { animation-delay: .14s; }
  .phase:nth-child(n+6) { animation-delay: .16s; }
  @keyframes phase-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  input.task-cb:checked { animation: cb-pop .2s ease-out; }
  @keyframes cb-pop {
    50% { transform: scale(1.25); }
  }
}
```

- [ ] **Step 4: Run test under reduced-motion, expect PASS**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest tests/test_client.py::test_anim_respects_reduced_motion -v
```

Expected: 1 passed. (Under reduced motion, `animationName` resolves to `"none"` because the `@media` block doesn't apply.)

- [ ] **Step 5: Full suite green**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 57 passed.

- [ ] **Step 6: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/static/styles.css \
        skills/plan-explorer/tests/test_client.py
git commit -m "feat(plan-explorer): subtle animations with reduced-motion fallback"
```

---

## Task 5: Extend `rich.md` fixture with v1.4 samples

**Files:**
- Modify: `~/.claude/skills/plan-explorer/tests/fixtures/rich.md`

- [ ] **Step 1: Append three sections to the existing fixture**

Use the Write tool (the file contains triple-backtick fences from prior tasks). Read the existing content first via `cat ~/.claude/skills/plan-explorer/tests/fixtures/rich.md`, then OVERWRITE with existing content plus these new sections appended:

```markdown
## Glossary

**SSE** — server-sent events: a one-way stream from server to browser.
**mtime** — file modification time, used here for change detection.
**ETag** — opaque version token for HTTP conditional requests.

## Footnotes demo

Spec §11 requires token auth[^1] on every route, including `/static/`[^safety].

[^1]: see security section for details
[^safety]: a path-traversal regression in v1.1 informed this rule

## Image gallery demo

![](https://placehold.co/300x200?text=A) ![](https://placehold.co/300x200?text=B) ![](https://placehold.co/300x200?text=C)
```

- [ ] **Step 2: Run full suite to confirm fixture parses without breaking tests**

```bash
cd ~/.claude/skills/plan-explorer && .venv/bin/pytest -q
```

Expected: 57 passed.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude
git add skills/plan-explorer/tests/fixtures/rich.md
git commit -m "test(plan-explorer): extend rich.md fixture with v1.4 reading samples"
```

---

## Self-Review Checklist (run after implementing all tasks)

- [ ] `parseGlossary`, `buildGlossRegex`, `walkAndWrap`, `attachGlossaryPopovers`, `ensureGlossPopover`, `attachFootnoteHovers`, `ensureFootnotePopover`, `attachImageGallery`, `openLightbox`, `closeLightbox` are each defined exactly once
- [ ] `walkAndWrap` lives in one place and uses the shared `insideExcludedAncestor` from v1.1 (do NOT redefine the exclusion helper)
- [ ] The glossary phase is filtered out in `DOMContentLoaded`, NOT inside `renderAll` (so re-renders triggered by SSE or conflict-reload re-filter through the same path)
- [ ] `renderAll` calls glossary → footnote → gallery in that order, after `attachIdeLinks`
- [ ] The footnote marked extensions are registered inside `configureMarked()`, not at module top level
- [ ] `grep -rn "TODO\|FIXME" ~/.claude/skills/plan-explorer/static/ ~/.claude/skills/plan-explorer/tests/` returns nothing
- [ ] Final test count: 57 (53 prior + 4 new)
