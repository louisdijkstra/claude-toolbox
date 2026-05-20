# Plan Explorer Skill — Design

**Status:** Draft for implementation
**Date:** 2026-05-20
**Author:** louisdijkstra (with Claude)

## 1. Purpose

A skill that opens any markdown plan/spec/design doc in a beautiful, Notion-like browser UI for interactive exploration and editing. Round-trips edits to disk so the markdown file remains the source of truth.

Two modes, auto-detected from content:

- **Plan mode** — file contains `- [ ]` checkboxes. UI shows phase status badges, progress bar, sidebar with completion counts per phase.
- **Doc mode** — no checkboxes. UI hides badges and progress. Sidebar becomes a nested TOC (H2 + H3).

Both modes share: collapsible H2 phases/sections, click-to-edit blocks, syntax-highlighted code with copy buttons, GitHub-style callouts, dark/light toggle, hot reload on external edits.

## 2. Non-goals

- Multi-file project explorer (one file per session)
- Real-time collaboration / multi-user
- Version control / history viewer (git already does this)
- WYSIWYG editing — click-to-edit raw markdown per block is enough
- Browsers other than Chromium-based and Firefox (Safari ok if it works, but not a target)
- Conversion to other formats (PDF, HTML export)

## 3. Invocation

User types: `/plan-explore <path-to-md>`

Claude runs: `~/.claude/skills/plan-explorer/scripts/plan-explore <path>`

Launcher:

1. Validates `<path>` exists and ends in `.md`
2. Picks free port in 51000–51100
3. Generates random hex token (32 chars)
4. Spawns `server.py <path> <token> <port>` as subprocess
5. Opens browser to `http://127.0.0.1:<port>/?t=<token>`
6. Writes pidfile to `/tmp/plan-explore-<port>.pid`
7. On Ctrl-C: SIGTERM server, remove pidfile

## 4. Architecture

### Layout

```
~/.claude/skills/plan-explorer/
├── SKILL.md                 # frontmatter + invocation guide
├── scripts/
│   ├── plan-explore         # python launcher (entrypoint, executable)
│   └── server.py            # http + sse server (imported by launcher)
└── static/
    ├── index.html           # single-page shell (Design B)
    ├── app.js               # client logic
    ├── styles.css           # Design B theme + dark mode
    └── vendor/
        ├── marked.min.js    # vendored markdown parser (~50KB)
        └── mermaid.min.js   # vendored diagram renderer (~600KB, Tier 3)
```

### Stack (Approach 1: thin server, fat client)

- **Server:** Python stdlib only (`http.server.ThreadingHTTPServer`). ~180 LOC. No pip installs.
- **Client:** Vanilla JS, single bundled file. Markdown parsing via vendored `marked.min.js`. No build step.
- **Transport:** Plain HTTP for read/write, Server-Sent Events for file-change push.

Server binds **127.0.0.1 only** and is **token-protected** — every request must carry `?t=<token>`. Token regenerated per launch.

## 5. Visual Design

Design Direction B (locked) — Soft Notion + Arc:

- **Background:** `#fbfaf7` (warm off-white), dark mode `#1a1a1a`
- **Font:** Inter (system fallback), JetBrains Mono for code
- **Sidebar:** 240px, transparent (matches bg), numbered phase pills (1, 2, 3…) colored by status
- **Main column:** 820px max-width, 56px top / 72px side padding
- **Phase card:** white surface with 1px border, 14px radius, 24×26px padding, generous 16px gap
- **Badges:** pill-shaped (radius 20px), pastel — `done` mint, `wip` amber, `todo` neutral
- **Headline:** 40px bold, -0.02em letter-spacing
- **Theme toggle:** bottom-left of sidebar; persisted to localStorage; respects `prefers-color-scheme` on first load

Reference mockups produced during brainstorming live in `.superpowers/brainstorm/` (gitignored).

## 6. Components

### Server (`server.py`)

`ThreadingHTTPServer` subclass with these routes:

| Method | Path             | Behavior                                                             |
|--------|------------------|----------------------------------------------------------------------|
| GET    | `/`              | Serve `index.html`                                                   |
| GET    | `/static/*`      | Serve files under `static/` (mime-typed by extension)                |
| GET    | `/plan`          | Return raw markdown body + `ETag: <mtime_ns>`                        |
| PUT    | `/plan`          | Atomic write: write `.md.tmp` then `os.replace`. Returns new ETag.   |
| GET    | `/events`        | SSE stream; polls file mtime every 500ms; emits `change` on shift    |

All routes require `?t=<token>` query parameter or `X-Auth-Token` header. Mismatch → 401.

Path-traversal guard: every served static path must `Path.resolve()` to inside `static/`. Outside → 403.

Mtime-suppress: after each successful `PUT /plan`, server records timestamp and skips SSE events for the next 1 second (avoid echoing own writes back to the client).

Size cap: `PUT /plan` body > 5MB → 413.

### Client (`app.js`)

Single-file, no module bundler, ~400 LOC. Modules conceptually:

- `Parser` — wraps `marked.lexer()` to produce a tree of `Block` objects grouped by their owning H2.
- `Renderer` — converts tree → DOM. Recognizes:
  - `> [!NOTE|TIP|WARNING|RISK|IMPORTANT]` → callout component
  - `- [ ]` / `- [x]` → checkbox line with click handler
  - ` ``` ` fences → code block + copy button + syntax highlight (minimal regex-based highlight; no heavy library)
  - `| ... | ... |` tables → styled table
  - `mermaid` fenced blocks → render via vendored `mermaid.min.js` *(Tier 3 — see §7)*
- `Sidebar` — builds TOC from H2 nodes. In doc mode also nests H3 under their H2 parent. Scroll-spy via `IntersectionObserver` to highlight active section.
- `Editor` — click a block → replace its rendered node with a `<textarea>` containing the original markdown source for that block range. On blur (or Ctrl+Enter): re-parse the changed block, splice updated markdown into source, `PUT /plan`.
- `Sync` — handles SSE messages. On `change` event with new ETag != local: GET `/plan`, diff against current source, patch only changed phases (avoid full re-render flicker).
- `Mode` — detect plan vs doc:
  - If any `^\s*-\s*\[[ x]\]` regex match anywhere → plan mode
  - Else → doc mode (hide progress bar, hide phase badges, sidebar nests H3)

### Launcher (`plan-explore`)

Python script (shebang `#!/usr/bin/env python3`), ~60 LOC.

Args: `<path>` (required), `--port N` (override), `--no-open` (skip browser).

Behavior described in §3.

## 7. Feature Set (Tier 2 + Tier 3)

**Tier 2 (baseline):**

- Inter font, generous typography
- Pretty tables with zebra rows
- Syntax-highlighted code blocks with hover-revealed copy button
- Callouts (NOTE / TIP / WARNING / RISK / IMPORTANT)
- Status badges per phase (plan mode only)
- Live checkboxes (click toggles `[x]` ↔ `[ ]`, saves to disk)
- Anchor links on hover for each H2/H3

**Tier 3 (rich visuals):**

- Mermaid diagrams rendered from ```` ```mermaid ```` blocks
- Per-phase Kanban view toggle (list ↔ kanban; columns = Todo / Doing / Done; cards = top-level checkboxes)
- Drag-reorder of phases (and top-level checkboxes within a phase)
- Progress bar in header (computed from total checkbox completion)
- Mini scroll indicator on sidebar showing current viewport position

Mermaid library (`mermaid.min.js`, ~600KB minified) vendored under `static/vendor/`.

## 8. Data Flow

### Load
```
browser open ─► GET / (token) ─► index.html
            ─► GET /plan ─► markdown + ETag (store as localETag)
            ─► client parses + renders
            ─► open EventSource /events
```

### Edit in browser
```
user clicks block
  └─► block <div> swapped for <textarea> containing block's raw md
user types + blurs
  └─► client builds full updated markdown
      └─► PUT /plan  body=<md>  If-Match=<localETag>
          ├─ server atomic-writes file
          ├─ server returns new ETag
          ├─ server starts 1s mtime-suppress window
          └─ client updates localETag, re-renders that block
```

### Checkbox toggle
```
click checkbox
  └─► flip [ ]↔[x] in that exact line of source
      └─► same PUT path as above
          └─► progress bar + phase badge recompute client-side
```

### External edit (IDE)
```
IDE saves file ─► mtime changes
            ─► server SSE poll detects (outside suppress window)
            ─► emit  data: {"type":"change","etag":"<new>"}
            ─► client receives
                ├─ if ETag == localETag: no-op (own echo)
                └─ if differs:
                     ├─ GET /plan
                     ├─ diff against current
                     ├─ patch changed phases
                     └─ if user mid-editing a changed block:
                         toast "external change, discard your edits?"
```

### Conflict (rare race: simultaneous browser + IDE edit)
```
client PUT with If-Match=<staleETag>
server compares to current mtime ─► mismatch ─► 412 Precondition Failed
client shows modal:
  "File changed on disk while you were editing.
   [Reload from disk]  [Force save mine]"
```

## 9. Error Handling

### Launcher

| Failure                       | Behavior                                       |
|-------------------------------|------------------------------------------------|
| Path missing or not `.md`     | stderr + exit 1                                |
| Port range 51000–51100 full   | stderr + exit 1                                |
| Server fails to start in 3s   | SIGTERM + exit 1                               |
| Ctrl-C                        | SIGTERM server, remove pidfile, exit 0         |

### Server

| Failure                         | Response                                          |
|---------------------------------|---------------------------------------------------|
| Path traversal in URL           | 403                                               |
| Missing/wrong token             | 401                                               |
| `PUT /plan` body > 5MB          | 413                                               |
| Disk full / write fail          | 500 + JSON `{"error":"<short message>"}`          |
| Source file deleted             | SSE emits `{"type":"gone"}`; saves disabled       |
| Any uncaught exception          | 500 + generic message; full trace to launcher log |

### Client

- Network error on fetch → toast "save failed, retrying" + 3-retry exponential backoff (1s, 2s, 4s)
- 412 Precondition Failed → conflict modal (see §8)
- 413 → toast "file too large (>5MB)"
- Parse error in user's markdown → render error block inline at offending location; rest of doc still renders
- SSE disconnect → auto-reconnect with backoff (1s, 2s, 4s, 8s, capped at 30s)
- Unsent edits stored in `localStorage` per file-path; restored on reload after crash

Error messages stay generic to user; full details go to launcher stdout.

## 10. Testing

Server tests use `pytest` + stdlib `http.client`; no extra deps.

| Test                              | Asserts                                                       |
|-----------------------------------|---------------------------------------------------------------|
| `test_round_trip`                 | GET → PUT modified → GET returns modified                     |
| `test_atomic_write`               | Kill server mid-PUT → file unchanged                          |
| `test_auth_missing_token`         | No token → 401                                                |
| `test_auth_wrong_token`           | Wrong token → 401                                             |
| `test_path_traversal`             | `/static/../../../etc/passwd` → 403                           |
| `test_etag_stale`                 | PUT with stale If-Match → 412                                 |
| `test_size_limit`                 | PUT 6MB body → 413                                            |
| `test_sse_external_change`        | Modify file out-of-band → event within 1s                     |
| `test_sse_suppress_own_write`     | PUT → no SSE event in next 1s                                 |
| `test_file_deleted`               | rm file → SSE emits `{"type":"gone"}`                         |

Client tests use Playwright (dev dep only, not shipped in skill):

| Test                              | Asserts                                                       |
|-----------------------------------|---------------------------------------------------------------|
| `test_load_plan_mode`             | Load fixture with checkboxes → sidebar shows 4 phases + badges|
| `test_load_doc_mode`              | Load fixture without checkboxes → no badges, no progress bar  |
| `test_checkbox_toggle`            | Click checkbox → disk file contains `[x]`                     |
| `test_edit_block`                 | Click → type → blur → PUT fired with new content              |
| `test_dark_mode_persist`          | Toggle dark → reload → still dark (localStorage)              |
| `test_sse_pickup`                 | Modify file via fs → UI updates within 2s                     |
| `test_conflict_modal`             | Stale ETag → modal appears                                    |

Fixtures (under `tests/fixtures/`):

- `plan.md` — full plan-mode example with 4 phases, checkboxes, callouts
- `spec.md` — doc-mode, prose only, H2 + H3 hierarchy
- `rich.md` — all features (callouts, code, mermaid, tables, kanban-eligible tasks)

Manual smoke test (documented in SKILL.md as acceptance):

1. `/plan-explore <fixture>`
2. Browser opens, plan renders
3. Edit a block → close browser → reopen file in IDE → edit reflected
4. No orphan Python processes after Ctrl-C in launcher terminal

## 11. Security

- Bind to `127.0.0.1` only — never `0.0.0.0`
- Random 32-char hex token per launch; required on every request
- Path-traversal guard via `Path.resolve()`
- Body size cap on PUT (5MB)
- No CORS — same-origin only, no `Access-Control-Allow-Origin` headers
- No shell-exec on any user input
- File path argument resolved once at launch and pinned; server cannot serve any other file

## 12. Open questions

None — all locked during brainstorming.

## 13. Implementation order

1. Launcher + minimal server (GET / and GET /plan only) — smoke open file
2. Static shell + marked.js parsing, render-only — visual checkpoint
3. PUT /plan + click-to-edit blocks — round-trip checkpoint
4. SSE /events + external-edit handling — hot reload checkpoint
5. Plan mode features: badges, progress bar, sidebar progress, checkbox toggle
6. Doc mode auto-detect + nested H3 TOC
7. Tier 3 visuals: Mermaid, kanban toggle, drag-reorder
8. Dark mode + theme persistence
9. Conflict handling + offline edit recovery
10. Full test suite + fixtures
