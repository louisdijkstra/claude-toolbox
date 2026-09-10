# Scripts

Three standalone tools. Two are called by hooks, one is sourced by your shell.

| Script | Called by | Purpose |
|---|---|---|
| `budget.js` | statusline, session hooks | Month-to-date spend across every session |
| `notify.js` | `Notification` and `Stop` hooks, and you | Desktop notification and sound |
| `wt.sh` | your `.zshrc` | Git worktree helper |

## budget.js

Keeps a ledger in `budget-ledger.json` keyed by session id, so the statusline
can show what every session has cost this month rather than just the current
one. Full explanation in the [root README](../README.md#what-your-sessions-cost).

```bash
node ~/.claude/scripts/budget.js --report          # per-session breakdown and what is left
node ~/.claude/scripts/budget.js --report 2026-08  # any month
node ~/.claude/scripts/budget.js --reconcile       # rescan both sources
node ~/.claude/scripts/budget.js --statusline      # "<spent> <cap>", for the statusline
```

Set the cap with `CLAUDE_MONTHLY_BUDGET` (default 2000).

Tests: `node --test scripts/budget.test.js`.

## notify.js

A desktop notification with an optional sound, on macOS, Windows and Linux.

```bash
node ~/.claude/scripts/notify.js "test suite green: 1247 passed"
node ~/.claude/scripts/notify.js --sound done
node ~/.claude/scripts/notify.js --sound error "build failed: 2 auth tests"
```

| Flag | Effect |
|---|---|
| `--sound done\|attention\|error` | Plays the platform's sound for that meaning |
| `--title`, `--subtitle` | Override the banner text; the subtitle defaults to the current directory |
| `--dry-run` | Prints the commands it would run, and exits |

It never breaks its caller: an unknown platform, a missing binary, no display or
a denied notification permission all degrade to a silent no-op and exit 0.
Losing a banner is acceptable; failing a hook is not.

Tests: `node --test scripts/notify.test.js`.

## wt.sh

Git worktree management for your shell, not for Claude. Source it from
`.zshrc`:

```bash
source ~/.claude/scripts/wt.sh
```

| Command | Does |
|---|---|
| `wt new <name>` | Create a worktree and branch from the base branch |
| `wt co <branch>` | Worktree for an existing branch (alias `checkout`) |
| `wt ls` | List worktrees (alias `list`) |
| `wt st` | Status of each worktree (alias `status`) |
| `wt cd <name>` | Jump to one |
| `wt cl <name>` | Launch Claude Code in one (alias `claude`) |
| `wt rm <name>` | Remove one, refusing if it has uncommitted changes (alias `remove`) |
| `wt cleanup` | Remove worktrees whose branches are merged |
| `wt prune` | Prune stale worktree metadata |
| `wt help` | The full list |

Base branch is detected in order: `dev`, `develop`, `main`, `master`.
Worktrees live in `.worktrees/` at the repository root, overridable with
`WT_DIR`. It never force-deletes
a branch and confirms before anything destructive.

Claude uses the native `EnterWorktree` tool instead, which puts worktrees under
`.claude/worktrees/`. Both can coexist in one repository.
