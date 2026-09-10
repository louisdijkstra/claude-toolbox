# Hooks

Eight scripts the Claude Code harness runs on events. Wiring lives in
[`settings.json`](../settings.json) under `hooks.*`; each row names the event
that fires it.

| Script | Event | What it does |
|---|---|---|
| `session-start.js` | `SessionStart` | Detects package manager, git branch and project config, prints them as context, and refreshes the spend ledger |
| `session-end.js` | `SessionEnd` | Writes a session summary, appends an observation, folds the session's cost into the ledger |
| `pre-compact.js` | `PreCompact` | Snapshots context before compression |
| `suggest-compact.js` | `PreToolUse` (`Edit`, `Write`) | Suggests compaction once context passes a threshold |
| `block-dev-without-tmux.js` | `PreToolUse` (dev servers) | Refuses `npm/pnpm/yarn/bun dev` outside tmux, so a long-running server cannot block the session |
| `block-random-md.js` | `PreToolUse` (`Write` `*.md`) | Blocks stray markdown files, exempting `README` and `CLAUDE` |
| `log-pr-url.js` | `PostToolUse` (`gh pr create`) | Captures the URL of a pull request just opened |
| `statusline.sh` | `StatusLine` | Renders the two-line status |

Sound and desktop notifications are not hooks of their own: the `Notification`
and `Stop` events call [`scripts/notify.js`](../scripts/README.md), which is
cross-platform.

## The statusline

```
◆ Opus (1M)  ▸ my-app ↳ feature-x  ⑂ main
ctx ◑ 45%  $ ◑ 879 / 2000 ↻20d11h
```

Identity above, resources below.

| Glyph | Marks |
|---|---|
| `◆` | model, with its context window size |
| `▸` | where the session is running |
| `↳` | a git worktree, inside the location |
| `⑂` | branch — green normally, magenta in a worktree |
| `○ ◔ ◑ ◕ ●` | a meter, filling in five steps |
| `↻` | when that meter resets |

The location collapses worktree plumbing: a session in
`~/projects/my-app/.worktrees/feature-x/libs` reads `my-app ↳ feature-x/libs`.
Outside a repository it renders home-relative (`~/Downloads`), eliding from the
left when long. It is capped at 28 characters; repository and worktree names are
identity and are never cut, only the subpath elides.

Meters are never coloured — fill alone carries the value, so it survives a
monochrome terminal and does not depend on telling red from green. On a plan
with rolling limits, `$` is replaced by `5h` and `7d`, each with its own
countdown.

Both lines stay inside 80 columns. Long branch names elide from the left
(`…-statusline-location`), since the tail is the distinctive part.

### Libraries

`lib/` holds the pure parts, so the fiddly rules are testable without a payload
or a git repository:

| File | Provides |
|---|---|
| `lib/meter.sh` | `meter_circle <percent>` — the five-step ramp, defined once |
| `lib/location.sh` | `format_location <cwd> <toplevel> <common_dir>`, `location_shorten`, `branch_shorten` |

Tests are in [`tests/hooks/`](../tests/hooks). Run them with
`python3 tests/run_all_tests.py`, or directly:

```bash
sh tests/hooks/meter_test.sh
sh tests/hooks/location_test.sh
```

### Cost

One `git rev-parse` per render yields the branch, the working root and the
shared git directory together — it replaced a narrower `git branch` call, so the
location field costs no extra subprocess. The spend figure comes from
`scripts/budget.js`, about 45 ms, and falls back to the current session's own
cost if anything about the ledger fails. A cosmetic field never breaks the line.
