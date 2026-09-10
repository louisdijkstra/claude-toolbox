# Claude Toolbox

Personal `~/.claude` configuration for [Claude Code](https://claude.com/code) — skills, hooks, slash commands, and MCP wiring. The process layer (TDD, review, planning) comes from the superpowers plugin, not this repo.

![stars](https://img.shields.io/github/stars/louisdijkstra/claude-toolbox?style=flat)
![forks](https://img.shields.io/github/forks/louisdijkstra/claude-toolbox?style=flat)
![last commit](https://img.shields.io/github/last-commit/louisdijkstra/claude-toolbox)
![license](https://img.shields.io/github/license/louisdijkstra/claude-toolbox)
![Claude Code](https://img.shields.io/badge/Claude%20Code-2.x-blue)

**Contents:** 4 skills · 3 slash commands · 0 agents · 8 hooks · MCP integrations

---

## Quick Start

Three install paths.

**Fresh install** (no existing config):
```bash
git clone https://github.com/louisdijkstra/claude-toolbox.git ~/.claude
```

**Replace existing config** (back up first):
```bash
mv ~/.claude ~/.claude.backup
git clone https://github.com/louisdijkstra/claude-toolbox.git ~/.claude
```

**Cherry-pick** — copy individual skills/commands into your existing config:
```bash
git clone https://github.com/louisdijkstra/claude-toolbox.git /tmp/claude
cp -r /tmp/claude/skills/<skill-name> ~/.claude/skills/
```

Then restart Claude Code.

## Compatibility

- **Claude Code 2.x** — required. Config uses the v2 skills/agents/commands layout and v2 hook schema in `settings.json`. Verified on 2.1.x.
- **POSIX shell** — `statusline.sh` runs under `/bin/sh`; works on bash and zsh.
- **Node 18+** — for hook scripts. They use only `fs`, `path`, `child_process`, `process.env` — older Node likely works but is untested.
- **macOS** — `Notification` and `Stop` hooks call `afplay` for sound. On Linux/WSL these calls fail silently; everything else is OS-agnostic.
- **Python** — not required by the config itself. A few skills ship illustrative `.py` example scripts.

Hooks reference `$HOME` and `${CLAUDE_CONFIG_DIR}` so the config is portable across machines.

## Superpowers

The process layer — brainstorming, writing and executing plans, TDD, systematic debugging,
code review, finishing a branch — is not in this repo. It comes from the **superpowers**
plugin, which this config assumes is installed.

- Marketplace: https://github.com/obra/superpowers-marketplace
- Plugin source: https://github.com/obra/superpowers

Install from inside Claude Code:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Skills it provides: `brainstorming`, `writing-plans`, `executing-plans`,
`subagent-driven-development`, `test-driven-development`, `systematic-debugging`,
`requesting-code-review`, `receiving-code-review`, `using-git-worktrees`,
`finishing-a-development-branch`, `verification-before-completion`, `writing-skills`,
`dispatching-parallel-agents`, `using-superpowers`.

This repo holds only what superpowers does not cover: project-specific tooling and
stack decisions.

## Repository Layout

```
~/.claude/
├── CLAUDE.md             Global development philosophy + conventions
├── settings.json         Permissions, hooks, statusline, MCP enablement
├── .mcp.json             MCP server definitions (filesystem, memory, brave, package-registry)
├── skills/               4 reusable workflows (SKILL.md per directory)
├── commands/             3 slash-command shortcuts
├── scripts/              wt.sh (git-worktree helper), notify.js (desktop alerts),
│                         budget.js (month-to-date spend ledger)
├── hooks/scripts/        8 event-driven scripts (session start/end, statusline, blockers)
├── docs/                 Research reports and notes
└── tests/                Skill-structure validation
```

Subdirectories carry their own README/SKILL.md with deeper docs.

## Skills

Run via the Skill tool, or invoke a slash command alias.

| Skill | Purpose |
|---|---|
| `plan-explorer` | Open a markdown plan or spec in a browser UI; edits round-trip to disk |
| `setup-testing` | Bootstrap Python/React test infrastructure (Testcontainers, Playwright, MSW) |
| `setup-langfuse-tracing` | Instrument LLM calls with Langfuse v4 tracing |

Full descriptions in [skills/README.md](skills/README.md) and per-skill `SKILL.md`.

## Slash Commands

| Command | Purpose |
|---|---|
| `/commit` | Commit message for staged changes |
| `/mr` | Merge request description |
| `/qa-steps` | QA test steps for the current branch |

## Hooks

| Script | Event | Purpose |
|---|---|---|
| `session-start.js` | SessionStart | Detect package manager, branch, env |
| `session-end.js` | SessionEnd | Persist session state, refresh the spend ledger |
| `pre-compact.js` | PreCompact | Snapshot context before compression |
| `suggest-compact.js` | PreToolUse (Edit\|Write) | Suggest compaction at thresholds |
| `block-dev-without-tmux.js` | PreToolUse (dev servers) | Force long-running servers into tmux |
| `block-random-md.js` | PreToolUse (Write \*.md) | Prevent stray markdown file creation |
| `log-pr-url.js` | PostToolUse (gh pr create) | Capture PR URL |
| `statusline.sh` | StatusLine | Two-line status with model, context, rate limits, cost |

Hook config lives in `settings.json` under `hooks.*`.

### Monthly spend

The statusline's budget bar is month-to-date spend across **every** session, not
just the current one. `scripts/budget.js` keeps a ledger in `budget-ledger.json`
keyed by session id, merged from two independent sources:

- **live** — `.session_costs/<session_id>`, rewritten by the statusline on every
  render, so sessions that are still running are included;
- **transcript** — the `cost-state` record in `projects/<slug>/<session_id>.jsonl`,
  written when a session ends, carrying the exact `startTime`.

Keying on session id makes the merge idempotent: a source can be re-read any
number of times without double counting, and a session is only missing if
neither source ever saw it. Where the two overlap they agree exactly.

```bash
node ~/.claude/scripts/budget.js --report          # per-session breakdown + remaining
node ~/.claude/scripts/budget.js --report 2026-08  # any month
node ~/.claude/scripts/budget.js --reconcile       # force a rescan
```

Set the limit with `CLAUDE_MONTHLY_BUDGET` (default 2000).

Months predating the ledger are carried over from the old `budget.json` and
reported frozen at the figure recorded then — that number already includes those
sessions, so the ledger does not re-add the ones it later recovers. Only months
the ledger owns are summed per session.

## MCP Servers

Defined in `.mcp.json`, enabled in `settings.json` under `enabledMcpjsonServers`.

| Server | Purpose | Auto-approved tools |
|---|---|---|
| `package-registry` | npm / PyPI / Cargo / NuGet / Go lookups | `search`, `get_package_info` |
| `brave-search` | Web search | `brave_web_search` |
| `filesystem` | `${HOME}/.claude` filesystem access | `read_file`, `list_directory`, `get_file_info` |
| `memory` | Persistent observations | `create_memory`, `read_memory`, `search_memories` |

Add API-key-required servers (GitHub, Sentry, Atlassian, etc.) per project in `.claude/settings.json`.

## Workflow Examples

These use skills from the superpowers plugin (see [Superpowers](#superpowers)), plus the
slash commands in this repo.

**Implement a feature:**
```
brainstorming                        → explore intent, requirements, design
writing-plans                        → step-by-step plan
test-driven-development              → red → green → refactor
requesting-code-review               → review before commit
/commit                               → conventional commit message
/mr                                    → merge request description
```

**Fix a bug:**
```
systematic-debugging                 → structured hypothesis testing
test-driven-development              → write failing test that reproduces, then fix
requesting-code-review
```

**Start a new project:**
```
brainstorming                        → goals, architecture, structure
writing-plans                        → step-by-step plan
executing-plans                      → work the plan with review checkpoints
```

## Configuration Highlights

`settings.json` ships:
- `defaultMode: auto` — auto-approve `Read`, `Grep`, `Glob`, `WebSearch`, `WebFetch`
- `bashSafePatterns` — read-only git/ls/cat/etc auto-approved
- `bashDangerousPatterns` — block `rm -rf`, `git push --force`, `sudo`, `chmod 777`, `curl|sh`
- `protectedBranches` — `main`, `master`, `production`
- `MAX_THINKING_TOKENS=10000`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50`
- Subagent model: `haiku`

Override per-project in `<project>/.claude/settings.json`.

## Customization

- **CLAUDE.md** — global philosophy / conventions; edit to your style
- **settings.json** — permissions, hooks, MCP enablement
- **`.mcp.json`** — MCP server definitions
- **skills/<name>/SKILL.md** — write your own skill (see superpowers' `writing-skills`)
- **commands/<name>.md** — alias a skill or define inline behavior

Local-only overrides go in `settings.local.json` (gitignored).

## Development Philosophy

See `CLAUDE.md` for full conventions. Headlines:
- Clarity over cleverness
- Replace, don't deprecate
- Default to TDD
- Validate at boundaries; never commit secrets
- Conventional commits, atomic, no AI attribution

## Contributing

Issues and PRs welcome. Keep changes:
- Project-agnostic (no leak of private project names)
- Documented in the relevant subdirectory README
- Validated via `tests/` where applicable

## License

MIT — see [LICENSE](LICENSE).

## Related

- [Claude Code](https://claude.com/code) — the CLI
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — community marketplace
- [superpowers-marketplace](https://github.com/obra/superpowers-marketplace) — the process-layer plugin this config assumes is installed
