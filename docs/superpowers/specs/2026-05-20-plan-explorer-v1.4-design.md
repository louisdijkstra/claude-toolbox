# Plan Explorer v1.4 — Reading Polish

**Status:** Draft for implementation
**Date:** 2026-05-20
**Parent:** Plan Explorer (v1.0 + v1.1 + v1.2 + v1.3)

## 1. Purpose

Four small reading enhancements, all client-side:

1. **Glossary popovers** — a `## Glossary` H2 with `**term** — definition` lines is parsed and hidden; every occurrence of those terms elsewhere in the doc gets a dotted-underline span with a hover/focus popover containing the definition.
2. **Footnote popovers** — standard markdown footnotes (`[^N]` references + `[^N]: ...` definitions); references become small superscript anchors with hover popover; the full footnote list still renders inline where the definitions appear.
3. **Image gallery** — any paragraph that contains 2+ adjacent `<img>` elements and no other meaningful content gets the `.gallery` grid layout; clicking an image opens a fullscreen lightbox.
4. **Smooth animations** — pure CSS: phase entries stagger fade-in on render, smooth scroll behavior, checkbox toggle pop. All gated by `@media (prefers-reduced-motion: no-preference)`.

## 2. Non-goals

- Auto-extracting glossary terms from definitions in callouts or footnotes (only the dedicated section)
- Multi-paragraph footnote definitions
- Image gallery with captions, zoom, or pan
- JS-orchestrated animations (everything CSS-only)
- Persisting popover state between page reloads

## 3. User-visible behavior

### 3.1 Glossary popovers

Authors include a section like:

```markdown
## Glossary

**SSE** — server-sent events: a one-way stream from server to browser.
**mtime** — file modification time, used here for change detection.
**ETag** — opaque version token for HTTP conditional requests.
```

Parser detects the H2 whose lowercased trimmed title equals `glossary`. Each line matching `\*\*([^*]+)\*\*\s*[—\-:]\s*(.+)` becomes a `{term, definition}` entry. The glossary phase is hidden from the rendered phase list and the sidebar.

After rendering, every text node inside `.phase-body p` and `.phase-body li` is walked. Any whole-word occurrence of a registered term (longest-first to handle multi-word terms) is wrapped in a `<span class="gloss-term" tabindex="0" data-definition="...">`. The wrapping skips nodes that are already inside `<a>`, `<code>`, or `<pre>` (same exclusion as the existing IDE-link pass).

On `mouseenter` or `focus`, a singleton popover element (`#gloss-popover`) is positioned above the term and shows the definition. On `mouseleave` or `blur`, the popover hides.

### 3.2 Footnote popovers

Standard markdown footnote syntax:

```markdown
Spec §11 requires token auth[^1] on every route, including `/static/`[^safety].

[^1]: see security section
[^safety]: a path-traversal regression in v1.1 informed this rule
```

Inline references render as:

```html
<sup class="fn-ref"><a href="#fn-1" data-fn-id="1">1</a></sup>
```

Definitions render as:

```html
<div class="fn-def" id="fn-1"><sup>1</sup> see security section</div>
```

On hover/focus of `.fn-ref a`, a popover appears above with the cloned definition text. Click navigates to the in-doc anchor as usual.

### 3.3 Image gallery

After every full render, walk `.phase-body p` elements. For each `<p>`, collect its non-whitespace children. If 2+ are `<img>` and the rest are empty text nodes (and no other elements), add class `gallery` to the paragraph. The CSS grid layout takes over: each image renders as an equal-size square, cropping via `object-fit: cover`.

Clicking any image opens a fullscreen lightbox overlay that displays the full image. The lightbox is created lazily on first use, reused after that. It closes on:
- Click on the `×` button
- Click on the backdrop (any non-image area)
- `Escape` keypress

### 3.4 Smooth animations

All animations wrapped in `@media (prefers-reduced-motion: no-preference)` so users with reduced-motion preferences get instant rendering.

- `html { scroll-behavior: smooth; }` for in-page anchor jumps
- Phase entries stagger fade-in on first render via CSS animation-delay applied to `:nth-child`
- Checkbox toggle: when an `input.task-cb` becomes `:checked`, a quick scale pop (1 → 1.25 → 1)

When reduced motion is requested, none of these apply — content appears instantly.

## 4. Architecture

All client-side, in `static/app.js` and `static/styles.css`. No server changes. No HTML changes.

## 5. Files modified

- `static/app.js`
  - `parseGlossary(phases)` — extracts term list and the glossary phase index
  - `attachGlossaryPopovers(terms)` — wraps mentions; binds popover events
  - `walkAndWrap(root, regex, defs)` — generic text-node wrapper (also used by the glossary pass)
  - Inside `configureMarked`: two new marked extensions (`footnoteRef` and `footnoteDef`)
  - `attachFootnoteHovers()` — hover/focus bindings
  - `attachImageGallery()` — paragraph walker + class addition + click handler
  - `openLightbox(src, alt)` / `closeLightbox()` — singleton overlay
  - Extend `renderAll` to filter the glossary phase before rendering and to call the four new attach functions
- `static/styles.css` — append styles for `.gloss-term`, `#gloss-popover`, `.fn-ref`, `.fn-def`, `#fn-popover`, `p.gallery`, `#lightbox`, the animation block
- `tests/test_client.py` — 4 new tests
- `tests/fixtures/rich.md` — add Glossary, footnote example, image gallery sample

## 6. Components

### 6.1 Glossary

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

function attachGlossaryPopovers(terms) {
  if (terms.length === 0) return;
  const regex = buildGlossRegex(terms);
  if (!regex) return;
  const defs = new Map(terms.map(t => [t.term, t.definition]));
  document.querySelectorAll(".phase-body p, .phase-body li").forEach(el => {
    walkAndWrap(el, regex, defs, "gloss-term");
  });
  ensureGlossPopover();
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
  const hide = () => { pop.hidden = true; };
  document.addEventListener("mouseover", show);
  document.addEventListener("focusin", show);
  document.addEventListener("mouseout", (e) => { if (e.target.closest(".gloss-term")) hide(); });
  document.addEventListener("focusout", (e) => { if (e.target.closest(".gloss-term")) hide(); });
}
```

The glossary phase is filtered out before `renderPhases`/`renderSidebar`:

```javascript
// inside DOMContentLoaded, after parsePhases:
const { terms, glossaryPhaseIdx } = parseGlossary(phases);
window.GLOSSARY_TERMS = terms;
const renderedPhases = glossaryPhaseIdx === -1
  ? phases
  : phases.filter((_, i) => i !== glossaryPhaseIdx);
renderAll(renderedPhases);
```

Inside `renderAll`, after `attachIdeLinks`:

```javascript
  attachGlossaryPopovers(window.GLOSSARY_TERMS || []);
```

### 6.2 Footnotes

```javascript
// Inside configureMarked, after marked.use({ renderer }):
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

Add `attachFootnoteHovers();` to `renderAll` after `attachGlossaryPopovers(...)`.

### 6.3 Image gallery

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

`attachImageGallery();` added to `renderAll` after `attachFootnoteHovers();`.

### 6.4 Animations

Pure CSS, no JS. Goes into `styles.css`.

## 7. Visual styling

### 7.1 Glossary term + popover

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

### 7.2 Footnote ref + def

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

### 7.3 Gallery + lightbox

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

### 7.4 Animations

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

## 8. Error handling

- Glossary section missing → `terms` empty, no popover, no filtering (silent no-op)
- Term containing regex metacharacters → escaped before regex construction
- Footnote reference with no matching definition → anchor still renders; hover popover shows empty content
- Footnote definition with no reference → still rendered inline as `.fn-def` (acts as a labeled note)
- Image gallery click on a missing image src → browser shows broken-image placeholder in lightbox (no crash)
- `prefers-reduced-motion: reduce` → animations skipped automatically (CSS media query)

## 9. Security

- `escapeHtml` applied to all footnote IDs before being placed into `id`/`href` attributes
- Glossary definitions stored in `data-definition` and inserted via `textContent` (no HTML injection)
- Lightbox image `src` comes from existing DOM `<img>` already escaped by marked
- Popovers have `pointer-events: none` to prevent click hijack
- No new server endpoints

## 10. Testing

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


def test_image_gallery_grids_multi_images(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n![](a.png) ![](b.png) ![](c.png)\n"
    )
    page.reload()
    page.wait_for_selector("p.gallery")
    assert page.locator("p.gallery img").count() == 3


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

## 11. Implementation order

1. Glossary parser + popovers + section filtering
2. Footnote marked extensions + popovers
3. Image gallery + lightbox
4. Smooth animations (CSS only)
5. Extend `rich.md` fixture
