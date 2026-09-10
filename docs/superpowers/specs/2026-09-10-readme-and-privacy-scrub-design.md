# README rewrite and privacy scrub — design

**Date:** 2026-09-10
**Status:** approved, ready for implementation plan

## Problem

Two problems, fixed together because they touch the same files.

**Private names are published.** Tracked files in this public repository carry a
personal project name, a client engagement name, and the author's home directory
path. They arrived as test fixtures and worked examples, copied from real
transcript paths. The repository's own Contributing section already forbids this:
"Project-agnostic (no leak of private project names)."

**The README no longer describes the repository.** Six claims are false or missing:

| Claim | Reality |
|---|---|
| Skills table lists three | Four skills ship; `graphify` is absent from the table while the header count says four |
| Compatibility: macOS-only sound via `afplay` | Replaced by a cross-platform script; no `afplay` reference remains in `settings.json` |
| No mention of the notification script | It ships with its own tests |
| `tests/` is "Skill-structure validation" | It also runs shell-library and JavaScript tests |
| `docs/` is "Research reports and notes" | It also holds specs and implementation plans |
| Layout omits `hooks/scripts/lib/` | Two shell libraries live there |

## Goals

A README that works for three readers at once — a stranger deciding in ten
seconds, the author looking something up in six months, and Claude reading it as
context — and a repository with no private names in it, kept that way by a test.

## Part 1: The scrub

### What gets replaced

A fixed mapping from the private terms to neutral ones. The canonical list of
terms lives in `tests/privacy_test.py` and nowhere else, so there is exactly one
place to update. Replacements:

| Kind | Replacement |
|---|---|
| Personal project name, lowercase | `my-app` |
| Personal project name, capitalised | `My App` |
| Its sub-package names | `my-app-core`, `my-app-ui` |
| Home directory path | `/Users/you` |
| Client engagement folder | `2026-planning` |
| Cloud-sync folder names | `Sync`, `Documents` |

The published GitHub account name stays: it is the real repository URL, and it
does not contain the home directory name as a substring.

### Where

Both statusline HTML explorations, the statusline design spec, the statusline
implementation plan, `tests/hooks/location_test.sh`, and two older documents
under `docs/superpowers/`.

### The length-sensitive fixtures

Three assertions in `tests/hooks/location_test.sh` pin behaviour exactly at the
28-character location cap: one at the cap, one over it, and one where the
repository name alone exceeds it. The replacement name is two characters longer
than the one it replaces, which moves every boundary.

These fixtures are recomputed so each assertion still tests the boundary it was
written for. Passing is not the bar — an assertion that no longer sits on the
cap has stopped testing anything, even while green.

## Part 2: The guard

`tests/privacy_test.py`, wired into `tests/run_all_tests.py` as a fifth section.

- Walks `git ls-files`, reads each tracked file, reports every match with path
  and line number, exits non-zero on any hit.
- Holds the canonical term list, assembled from split string literals so the
  file does not itself contain the terms it searches for. This is what lets the
  guard live in the repository without defeating its own purpose.
- Excludes only itself from the walk.
- Binary files and anything unreadable as UTF-8 are skipped, not fatal.

Demonstrated both ways: failing before the scrub, passing after.

## Part 3: The README

Layered, so each of the three readers finds their level.

```
README.md  (~140 lines)
  pitch + a real statusline sample     stranger, ten seconds
  install, three paths
  what's inside — one line per area    author, scanning
  spend accounting, in full            the differentiator
  superpowers — the dependency
  compatibility · customise · licence

skills/README.md    4 skills   (exists; add the missing one)
hooks/README.md     8 hooks    (new)
scripts/README.md   3 scripts  (new)
```

### Why detail moves out

The root README drifted precisely because it duplicated what lives elsewhere.
Detail placed beside the thing it documents gets updated when that thing changes.
The root keeps one line per area and links down.

### The opening

Leads with what is genuinely uncommon in a Claude Code configuration: knowing
where a session is running and what every session has cost this month. A rendered
statusline sample sits directly under the first sentence — the feature is visual,
so it is shown rather than described.

### What each new file holds

- `hooks/README.md` — the eight hooks: event, trigger, what it does, and the
  settings key that wires it.
- `scripts/README.md` — the worktree helper, the notification script, and the
  spend ledger, each with its invocation and its options.
- `skills/README.md` — gains the fourth skill's row; already exists otherwise.

Full spend-accounting detail stays in the root README rather than moving to
`scripts/README.md`: it is the lead feature, and a reader who came for it should
not have to click.

## Part 4: The history rewrite

Only after parts 1–3 are committed and pushed, so the scrub stands on its own if
the rewrite is abandoned.

```
git clone --mirror <origin> <tmp>
cd <tmp> && git filter-repo --replace-text <mapping>
git push --force
cd ~/.claude && git fetch && git reset --hard origin/main
```

`filter-repo` runs only against the mirror, never against the live directory,
because it refuses a non-fresh clone and strips the remote.

**Authorised explicitly** by the repository owner for this one operation,
overriding the standing rule against force-pushing shared branches.

### What a rewrite does not touch

Everything that makes the configuration run is gitignored and therefore outside
the rewrite: local settings, session cost files, the spend ledger, transcripts,
installed plugins, session summaries. Skills, commands, hooks and MCP load from
files on disk and never read git, so behaviour after the rewrite is unchanged.
The final tree is byte-identical except for the scrubbed strings.

### What it does not achieve

A rewrite does not unpublish. Unreferenced commits stay reachable by hash until
GitHub garbage-collects, forks and existing clones keep their copies, and caches
may persist. The rewrite stops further spread; it does not undo disclosure.
Removing the cached views entirely requires a request to GitHub Support.

## Verification

- The 38 existing shell assertions stay green with recomputed fixtures.
- The guard fails before the scrub and passes after.
- Every link in the rewritten README resolves to a file that exists.
- The statusline still renders after the working directory is reset onto the
  rewritten history.
- `git log -p --all` contains no occurrence of any scrubbed term.

## Out of scope

- Renaming the repository or the GitHub account.
- Rewriting the git history of anything other than this repository.
- Any change to what the hooks, skills or scripts actually do.
