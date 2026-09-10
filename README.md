# Claude Toolbox

Know what your Claude Code sessions are doing, and what they cost.

```
◆ Opus (1M)  ▸ my-app ↳ feature-x  ⑂ main
ctx ◑ 45%  $ ◑ 879 / 2000 ↻20d11h
```

Which repository this session is in, which worktree, how full the context
window is, and month-to-date spend across **every** session — not just this one.

A complete, working `~/.claude`: statusline, spend ledger, hooks, skills, slash
commands and MCP wiring. The process layer — planning, TDD, code review — comes
from the [superpowers](#superpowers) plugin, not from here.

![stars](https://img.shields.io/github/stars/louisdijkstra/claude-toolbox?style=flat)
![forks](https://img.shields.io/github/forks/louisdijkstra/claude-toolbox?style=flat)
![last commit](https://img.shields.io/github/last-commit/louisdijkstra/claude-toolbox)
![license](https://img.shields.io/github/license/louisdijkstra/claude-toolbox)
![Claude Code](https://img.shields.io/badge/Claude%20Code-2.x-blue)

---

## Install

**Fresh** — no existing config:

```bash
git clone https://github.com/louisdijkstra/claude-toolbox.git ~/.claude
```

**Replacing** an existing config — back it up first:

```bash
mv ~/.claude ~/.claude.backup
git clone https://github.com/louisdijkstra/claude-toolbox.git ~/.claude
```

**Cherry-pick** a single piece into a config you already have:

```bash
git clone https://github.com/louisdijkstra/claude-toolbox.git /tmp/toolbox
cp -r /tmp/toolbox/skills/<name> ~/.claude/skills/
```

Then restart Claude Code. Install [superpowers](#superpowers) too — this config
assumes it.

## What's inside

```
~/.claude/
├── CLAUDE.md          Development philosophy and conventions, loaded every session
├── settings.json      Permissions, hooks, statusline, MCP enablement
├── .mcp.json          MCP servers: filesystem, memory, brave-search, package-registry
├── skills/            4 skills          → skills/README.md
├── commands/          3 slash commands  → /commit, /mr, /qa-steps
├── hooks/             8 event hooks and the statusline → hooks/README.md
├── scripts/           budget.js, notify.js, wt.sh      → scripts/README.md
├── docs/              Specs, implementation plans, research notes
└── tests/             Skill structure, shell libraries, privacy guard
```

| Area | One line | Detail |
|---|---|---|
| **Skills** | Knowledge graphs, plan browsing, test bootstrapping, Langfuse tracing | [skills/README.md](skills/README.md) |
| **Hooks** | Session context, compaction, guardrails, and the statusline | [hooks/README.md](hooks/README.md) |
| **Scripts** | Spend ledger, desktop notifications, worktree helper | [scripts/README.md](scripts/README.md) |
| **Commands** | `/commit`, `/mr`, `/qa-steps` | `commands/` |

Run `python3 tests/run_all_tests.py` to check an install: five sections covering
skill structure, the statusline's shell libraries, and a scan for private names.

## What your sessions cost

The statusline's spend figure is month-to-date across every session, live ones
included. That is harder than it sounds, and the obvious approach gets it wrong.

Claude Code tells a session what *it* has cost, not what the month has cost. The
naive fix — add each session's total to a running file when it ends — loses
every session that ends any other way, and shows nothing for sessions still
running. Here that undercounted a month by 52×.

`scripts/budget.js` keeps a ledger keyed by session id, merged from two
independent sources:

- **live** — `.session_costs/<session_id>`, rewritten by the statusline on every
  render, so sessions still running are counted;
- **transcript** — the `cost-state` record in `projects/<slug>/<session_id>.jsonl`,
  written when a session ends, carrying its exact start time.

Keying on session id makes the merge idempotent: either source can be re-read
any number of times without double counting, and a session is missing only if
neither source ever saw it. Where the two overlap, they agree to the cent.

```bash
node ~/.claude/scripts/budget.js --report          # per-session breakdown and what is left
node ~/.claude/scripts/budget.js --report 2026-08  # any month
node ~/.claude/scripts/budget.js --reconcile       # force a rescan
```

Set the cap with `CLAUDE_MONTHLY_BUDGET`; it defaults to 2000. On a plan with
rolling limits, the statusline shows the five-hour and weekly windows instead,
each with its own countdown.

Months that predate the ledger are carried over from the old running total and
reported frozen at the figure recorded then. That number already includes those
sessions, so the ledger does not re-add the ones it later recovers.

## Superpowers

Brainstorming, writing and executing plans, TDD, systematic debugging, code
review, finishing a branch: none of that is here. It comes from the
**superpowers** plugin, which this config assumes is installed.

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

- Marketplace: https://github.com/obra/superpowers-marketplace
- Plugin source: https://github.com/obra/superpowers

This repository holds only what superpowers does not cover: observability,
project setup, and stack decisions.

**Implementing a feature**, end to end:

```
brainstorming            explore intent and design, then write a spec
writing-plans            turn the spec into bite-sized steps
test-driven-development  red, green, refactor
/commit  /mr             conventional commit, then a merge request description
```

**Fixing a bug:** `systematic-debugging` to find it, `test-driven-development`
to write the failing test before the fix.

## Compatibility

- **Claude Code 2.x** — required. Uses the v2 skills/commands layout and the v2
  hook schema. Verified on 2.1.x.
- **POSIX shell** — the statusline and its libraries run under `/bin/sh`.
- **Node 18+** — for the hook scripts, `budget.js` and `notify.js`. They use
  only `fs`, `path`, `child_process` and `process.env`.
- **macOS, Windows, Linux** — `notify.js` handles all three and degrades to a
  silent no-op where it cannot notify. Nothing else is OS-specific.
- **Python 3** — for the test suite only, not for the config itself.
- **git 2.31+** — the statusline's location field uses
  `rev-parse --path-format`; older git falls back rather than failing.

Hooks reference `$HOME` and `${CLAUDE_CONFIG_DIR}`, so the config is portable
across machines.

## Configuration

`settings.json` ships:

- `defaultMode: auto` — `Read`, `Grep`, `Glob`, `WebSearch`, `WebFetch`
  auto-approved
- `bashSafePatterns` — read-only git, `ls`, `cat` and friends auto-approved
- `bashDangerousPatterns` — blocks `rm -rf`, `git push --force`, `sudo`,
  `chmod 777`, `curl | sh`
- `protectedBranches` — `master`, `production`
- `MAX_THINKING_TOKENS=10000`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50`
- Subagent model: `haiku`

Override per project in `<project>/.claude/settings.json`. Machine-local
overrides go in `settings.local.json`, which is gitignored.

To make it yours: edit `CLAUDE.md` for conventions, `settings.json` for
permissions and hooks, `.mcp.json` for MCP servers. Add a skill by writing
`skills/<name>/SKILL.md`, a command with `commands/<name>.md`.

MCP servers needing API keys — GitHub, Sentry, Atlassian — belong in a project's
own `.claude/settings.json`, not here.

## Philosophy

Full conventions in `CLAUDE.md`. The headlines:

- Clarity over cleverness; no premature abstraction
- Replace, don't deprecate
- Default to TDD
- Validate at boundaries, never commit secrets
- Conventional commits, atomic, no AI attribution

## Contributing

Issues and pull requests welcome. Keep changes project-agnostic — no private
project names, which `tests/privacy_test.py` enforces — documented in the
relevant subdirectory README, and covered by `tests/` where applicable.

## License

MIT — see [LICENSE](LICENSE).

## Related

- [Claude Code](https://claude.com/code) — the CLI this configures
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- [superpowers-marketplace](https://github.com/obra/superpowers-marketplace) — the process layer
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — community marketplace
