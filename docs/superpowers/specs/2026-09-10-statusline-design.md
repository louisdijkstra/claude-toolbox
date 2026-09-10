# Statusline — location field and glyph-row redesign

**Date:** 2026-09-10
**Status:** approved, ready for implementation plan
**Explorations:** [ten layouts](2026-09-10-statusline-layouts.html) · [glyph row, nine variants](2026-09-10-statusline-glyph-row.html) (variant G chosen)

## Problem

The statusline reads `🤖 Opus (1M) | main | ▓▓▓▓▓▓▓░░░░░░░░░ 45%` over a budget
line. It names the model, the branch, the context window and the spend, but never
says *where* the session is running. With several sessions open at once across
`~/.claude`, `~/projects/my-app` and their worktrees, the branch does not identify
a session — two sessions on `main` in different repositories render identically.

Two changes, decided together because they share the same line: add a location
field, and move from emoji and block bars to a glyph row with circle meters.

## The line

Two lines, as today. Identity above, resources below.

```
◆ Opus 1M  ▸ my-app/libs/my-app-core  ⑂ main
ctx ◑ 45%  $ ◑ 879 / 2000 ↻20d11h
```

Worktree session:

```
◆ Opus 1M  ▸ .claude ↳ budget-ledger  ⑂ feature-x
ctx ◑ 45%  $ ◑ 879 / 2000 ↻20d11h
```

Rolling limits instead of a monthly budget:

```
◆ Opus 1M  ▸ my-app/libs/my-app-core  ⑂ main
ctx ◑ 45%  5h ◔ 22% ↻2h30m  7d ◑ 61% ↻4d6h
```

### Why two lines

Variant G was drawn as one line and does not fit. Measured at the 80-column wrap,
with the location cap below already applied:

| State | Columns |
|---|---|
| Plain repo | 75 |
| Worktree | 84 |
| Rolling limits | 84 |
| Worktree with a long branch | 130 |

Only the simplest state fits. Splitting identity from resources puts both lines
inside 80 in every state, costs no height against today's layout, and needs no
extra truncation of the branch:

| Line | Typical | Worst case measured |
|---|---|---|
| Identity | 40 | 79 — location at its cap, plus a branch at its cap |
| Resources | 33 | 46 — rolling limits, every meter at 100% |

The branch needs a cap of its own to reach that figure. Implementation measured
the real line at 84 columns before one was added: the native worktree tool emits
branch names like `worktree-statusline-location`, and the model field carries a
`(1M)` suffix that the first estimate here missed. `branch_shorten` caps a branch
at 21 characters, eliding from the left as `…-statusline-location` — the tail is
the distinctive part.

## Glyphs

| Glyph | Marks | Note |
|---|---|---|
| `◆` | model | replaces 🤖, one column instead of two |
| `▸` | location | |
| `↳` | worktree | reads as "derived from": `my-app ↳ feature-x` |
| `⑂` | branch | |
| `↻` | reset countdown | attached to the meter it resets |

No emoji anywhere on the line. Every emoji costs two columns and aligns
unreliably across terminals; that width is what pays for the location field.

## Meters

Circles fill in five steps: `○` 0, `◔` 25, `◑` 50, `◕` 75, `●` 100. A circle
reports which quarter a value is in, so the exact figure is always printed
beside it — `◑ 45%`, not `◑`.

**Circles are never coloured.** Fill alone carries the value, which keeps the
meaning intact in a monochrome terminal, in a pipe, and for a reader who cannot
separate red from green. Colour on the line is reserved for identity: cyan for
the model, green for a branch, magenta for a worktree branch, dim for labels,
separators and countdowns. The location and every figure render in the
terminal's default foreground — no colour is assigned to a number anywhere,
including at 100%.

Every meter is labelled, because with colour off nothing else distinguishes them:

| Label | Meter | Always shows |
|---|---|---|
| `ctx` | context window | percentage |
| `$` | monthly spend | **spend and cap**, `879 / 2000` — the cap is never omitted |
| `5h` | five-hour window | percentage and countdown |
| `7d` | weekly window | percentage and countdown |

`$` and the two windows are mutually exclusive: a monthly budget appears when the
payload has `cost` and no `rate_limits`, the windows when it has `rate_limits`.
That branch already exists in the script and does not change.

## Location field

`main_root` is `dirname(common_dir)` when `common_dir` ends in `/.git`. The
session is in a worktree when `toplevel != main_root`.

| Situation | Output |
|---|---|
| Repo root | `my-app` |
| Repo subdirectory | `my-app/libs/my-app-core` |
| Worktree | `my-app ↳ feature-x` |
| Worktree subdirectory | `my-app ↳ feature-x/libs/my-app-core` |
| Native worktree under `.claude/worktrees/` | `.claude ↳ budget-ledger` |
| Repo subdirectory over the cap | `my-app/…/parser/tests` |
| Not a repository | `~/Downloads` |
| Not a repository, deep path | `…/2026-planning/Documents` |
| Home directory | `~` |

- The **repository name** is the basename of the main repository root, never the
  worktree root — a worktree of `my-app` still reads `my-app`.
- **Worktrees** collapse their plumbing: `~/projects/my-app/.worktrees/feature-x/libs`
  renders `my-app ↳ feature-x/libs`, not the literal `.worktrees/` path.
- **Non-repository paths** render home-relative.
- **Truncation** caps the location at 28 characters, measured without the `▸ `
  prefix. Only the subpath elides, from the left, as `…/`; the repository and
  worktree names are identity and are never truncated. If those names alone
  exceed the cap they are still shown in full and the subpath is dropped. For a
  non-repository path there is no name to protect, so the whole path elides from
  the left and the last two segments survive.

## Architecture

**`hooks/scripts/lib/location.sh`** — pure shell functions, no side effects, no
I/O, safe to source:

- `location_shorten <path> <max>` — elide from the left, keeping the last two segments.
- `format_location <cwd> <toplevel> <common_dir>` — the whole rendering decision.
  Takes strings, returns a string. Knows nothing about git or the filesystem.

**`hooks/scripts/lib/meter.sh`** — `meter_circle <percent>`, mapping 0–100 to one
of the five circles. Pure, and the only place the ramp is defined.

**`hooks/scripts/statusline.sh`** — sources both, renders the two lines.

Splitting the pure formatting out is what makes the fiddly parts — truncation,
worktree collapsing, the ramp boundaries — testable without a payload or a git
repository.

## Data flow

Resolved from the cheapest source that has it:

1. `.workspace.current_dir` from the hook payload — always present.
2. `.worktree.name` and `.worktree.branch` from the payload, when the session is
   in a native worktree — free, no subprocess.
3. Otherwise one call:
   `git -C "$cwd" rev-parse --path-format=absolute --show-toplevel --git-common-dir --abbrev-ref HEAD`

That returns the worktree root, the main repository's git directory and the
branch in three lines, and **replaces** the existing `git branch --show-current`
call rather than adding to it. The change costs no extra subprocess per render.

`--path-format=absolute` matters: without it `--git-common-dir` is relative in a
normal checkout (`.git`, `../../.git`) but absolute inside a worktree, which makes
the comparison unreliable. The flag requires git 2.31 (2021).

## Error handling

Every failure degrades to the basename of `current_dir`, and the line still
renders:

- git absent, or older than 2.31 and rejecting `--path-format`
- directory is not a repository
- either library missing — both sources are guarded
- `current_dir` absent from the payload — the field is omitted entirely

This follows the rule already applied to the budget field: a cosmetic field must
never break the line.

## Testing

`tests/hooks/location_test.sh` sources the libraries and asserts against fixture
strings. No git, no filesystem, no payload — fast and deterministic.

Location cases:

- repository root, and a subdirectory
- worktree root, and a subdirectory inside a worktree
- the nested `.claude/.claude/worktrees/<name>` shape this repo produces
- non-repository, shallow and deep
- home directory itself
- exactly at the 28-character cap, and one character over
- an over-cap repository path, asserting the repo name survives and only the
  subpath elides
- a repository name longer than the cap on its own
- a path containing spaces

Meter cases: 0, 1, 24, 25, 49, 50, 74, 75, 99, 100, and out-of-range values
clamping rather than producing an empty string.

Wired into `tests/run_all_tests.py` so it runs with the rest of the suite.

## Out of scope

- Configurable field width or a user-supplied format string. One cap, one layout,
  changed by editing the constant if it turns out wrong.
- Colour on the circles, in any form.
- Collapsing to a single line, which the width measurements rule out.
- Any change to when the budget branch versus the rolling-limits branch is chosen.

## Known limitation

`○ ◔ ◑ ◕ ●` are East Asian Ambiguous width. Most terminals draw them one column;
one configured with a CJK font draws them two, shifting everything after them. If
that shows up in practice, the block ramp `░ ▒ ▓ █` is unambiguous and the layout
survives the swap — which is why the ramp lives in one function.
