# Statusline location field — design

**Date:** 2026-09-10
**Status:** approved, ready for implementation plan

## Problem

The statusline's first line reads `🤖 Opus (1M) | main | ▓▓▓▓▓░░░░░ 37%`. It names
the model, the branch and the context window, but never says *where* the session is
running. With several sessions open at once across `~/.claude`, `~/projects/my-app`
and their worktrees, a bare branch name does not identify the session — two
sessions on `main` in different repositories look identical.

## Goal

Show the repository and the position inside it, in a field narrow enough to sit
beside the fields already on line 1.

## Display rules

A single field, prefixed `📁 `, placed between the model and the branch.

| Situation | Output |
|---|---|
| Repo root | `my-app` |
| Repo subdirectory | `my-app/libs/my-app-core` |
| Worktree | `my-app 🌳 feature-x` |
| Worktree subdirectory | `my-app 🌳 feature-x/libs/my-app-core` |
| Native worktree under `.claude/worktrees/` | `.claude 🌳 budget-ledger` |
| Repo subdirectory over the cap | `my-app/…/parser/tests` |
| Not a repository | `~/Downloads` |
| Not a repository, deep path | `…/2026-planning/Documents` |
| Home directory | `~` |

Rules behind the table:

- **Repository name** is the basename of the main repository root, never the
  worktree root — a worktree of `my-app` still reads `my-app`.
- **Worktrees** collapse their plumbing: `~/projects/my-app/.worktrees/feature-x/libs`
  renders `my-app 🌳 feature-x/libs`, not the literal `.worktrees/` path. The tree
  icon marks the worktree, because a worktree is not the same thing as a branch.
- **Non-repository paths** render home-relative (`~/Downloads`).
- **Truncation** caps the rendered location at 28 characters, measured without the
  `📁 ` prefix. Only the subpath is elided, from the left, as `…/` — the repository
  name and worktree name are identity, never truncated, so `my-app 🌳 feature-x/…/my-app-core`
  is correct and `…/feature-x/libs/my-app-core` is not. If the repository and
  worktree names alone exceed the cap they are still shown in full and the subpath
  is dropped. For non-repository paths, where there is no name to protect, the
  whole path elides from the left and the last two segments survive.

### Interaction with the branch field

The branch field currently renders `🌳 <branch>` in magenta for worktree sessions.
The tree icon moves to the location field, which is the thing that is actually a
worktree; the branch keeps its magenta colour and drops the icon. One tree per
line.

## Architecture

Two components.

**`hooks/scripts/lib/location.sh`** — pure shell functions, no side effects, no
I/O, safe to source:

- `location_shorten <path> <max>` — elide from the left, preserving the last two
  segments.
- `format_location <cwd> <toplevel> <common_dir>` — the whole rendering decision.
  Takes strings, returns a string. Knows nothing about git or the filesystem.

**`hooks/scripts/statusline.sh`** — sources the library and renders the field.

Splitting the pure formatting out of the statusline is what makes the fiddly part
— the truncation and worktree rules — testable without constructing a payload or
a git repository.

## Data flow

The location is resolved from the cheapest source that has it:

1. `.workspace.current_dir` from the hook payload — always present.
2. `.worktree.name` and `.worktree.branch` from the payload, when the session is
   in a native worktree — free, no subprocess.
3. Otherwise one call:
   `git -C "$cwd" rev-parse --path-format=absolute --show-toplevel --git-common-dir --abbrev-ref HEAD`

That call returns the worktree root, the main repository's git directory and the
branch, in three lines. It **replaces** the existing `git branch --show-current`
call rather than adding to it, so the change costs no extra subprocess per render.

`--path-format=absolute` matters: without it `--git-common-dir` is relative in a
normal checkout (`.git`, `../../.git`) but absolute inside a worktree, which makes
the comparison below unreliable. The flag requires git 2.31 (2021).

**Worktree detection:** `main_root` is `dirname(common_dir)` when `common_dir` ends
in `/.git`. The session is in a worktree when `toplevel != main_root`.

## Error handling

Every failure degrades to the basename of `current_dir`, and the statusline
renders regardless:

- git absent, or older than 2.31 and rejecting `--path-format`
- directory is not a repository
- `location.sh` missing — the source is guarded, so a partial install still renders
- `current_dir` absent from the payload — the field is omitted entirely

This follows the rule already applied to the budget field: a cosmetic field must
never break the line.

## Testing

`tests/hooks/location_test.sh` sources `location.sh` and asserts against fixture
strings. No git, no filesystem, no payload — fast and deterministic.

Cases:

- repository root, and a subdirectory
- worktree root, and a subdirectory inside a worktree
- the nested `.claude/.claude/worktrees/<name>` shape this repo produces
- non-repository, shallow (`~/Downloads`) and deep (elided)
- home directory itself
- exactly at the 28-character cap, and one character over
- an over-cap repository path, asserting the repo name survives and only the
  subpath elides
- a repository name longer than the cap on its own
- a path containing spaces

Wired into `tests/run_all_tests.py` so it runs with the rest of the suite.

## Out of scope

- Configurable field width or a user-supplied format string. One cap, one layout,
  changed by editing the constant if it turns out wrong.
- Showing the location on line 2, or a second line for long paths.
- Any change to the model, context, rate-limit or budget fields.
