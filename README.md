# claude

Personal `~/.claude` configuration for [Claude Code](https://claude.com/code) — skills, agents, hooks, slash commands, and MCP wiring built around a TDD + multi-tier-review workflow.

![stars](https://img.shields.io/github/stars/louisdijkstra/claude?style=flat)
![forks](https://img.shields.io/github/forks/louisdijkstra/claude?style=flat)
![last commit](https://img.shields.io/github/last-commit/louisdijkstra/claude)
![license](https://img.shields.io/github/license/louisdijkstra/claude)
![Claude Code](https://img.shields.io/badge/Claude%20Code-2.x-blue)

**Contents:** 33 skills · 16 slash commands · 13 review agents · 8 hooks · MCP integrations

---

## Quick Start

Three install paths.

**Fresh install** (no existing config):
```bash
git clone https://github.com/louisdijkstra/claude.git ~/.claude
```

**Replace existing config** (back up first):
```bash
mv ~/.claude ~/.claude.backup
git clone https://github.com/louisdijkstra/claude.git ~/.claude
```

**Cherry-pick** — copy individual skills/commands into your existing config:
```bash
git clone https://github.com/louisdijkstra/claude.git /tmp/claude
cp -r /tmp/claude/skills/<skill-name> ~/.claude/skills/
```

Then restart Claude Code.

## Compatibility

Tested on:
- Claude Code 2.x
- macOS 14+ (Darwin)
- Node 22.13+ (for hooks)
- Python 3.13+ (for skill-related scripts where present)
- zsh / bash

Most content is shell-agnostic and OS-agnostic; hooks reference `$HOME` and `${CLAUDE_CONFIG_DIR}`.

## Repository Layout

```
~/.claude/
├── CLAUDE.md             Global development philosophy + conventions
├── settings.json         Permissions, hooks, statusline, MCP enablement
├── .mcp.json             MCP server definitions (filesystem, memory, brave, package-registry)
├── skills/               33 reusable workflows (SKILL.md per directory)
├── commands/             16 slash-command shortcuts → skills
├── agents/               13 review agents (orchestrator + tier reviewers)
├── hooks/scripts/        8 event-driven scripts (session start/end, statusline, blockers)
├── docs/                 Research reports and notes
└── tests/                Skill-structure validation
```

Subdirectories carry their own README/SKILL.md with deeper docs.

## Skills

Run via the Skill tool, or invoke a slash command alias.

| Category | Skills |
|---|---|
| Context | `docs-bigger-picture`, `docs-context`, `dev-workflow-patterns` |
| Planning | `project-determine-goal`, `project-inception`, `project-brainstorm`, `review-plan` |
| Daily flow | `dev-workflow-flow`, `dev-workflow-tdd`, `dev-workflow-test-driven`, `dev-workflow-debug` |
| Review | `review-critical`, `review-system` |
| Tickets/docs | `project-handle-ticket`, `docs-manager` |
| Research | `research-deep` |
| AI frameworks | `ai-framework-select`, `ai-framework-setup-anthropic`, `ai-framework-setup-langchain`, `ai-framework-setup-pydanticai`, `ai-framework-build-langgraph` |
| Setup | `setup-logging`, `setup-langfuse-tracing`, `setup-uv`, `setup-testing`, `setup-payments`, `setup-repository-structure` |
| Compliance / store | `compliance-check`, `playstore-check`, `appstore-check` |
| Tooling | `skill-create`, `worktree`, `ui-design-options` |

Full descriptions in [skills/README.md](skills/README.md) and per-skill `SKILL.md`.

## Slash Commands

Most commands proxy to a skill of the same intent.

| Command | Maps to | Purpose |
|---|---|---|
| `/flow` | `dev-workflow-flow` | Daily dev workflow |
| `/tdd` | `dev-workflow-test-driven` | TDD cycle |
| `/debug` | `dev-workflow-debug` | Systematic debugging |
| `/review` | `review-system` | Multi-tier review |
| `/research` | `research-deep` | 2026-standards research |
| `/plan` | `review-plan` | Plan + validate |
| `/inception` | `project-inception` | New project setup |
| `/ticket` | `project-handle-ticket` | End-to-end ticket flow |
| `/docs` | `docs-manager` | Doc maintenance |
| `/commit` | — | Commit message for staged changes |
| `/mr` | — | Merge request description |
| `/qa-steps` | — | QA test steps for current branch |
| `/humanize` | — | De-AI prior response |
| `/checkpoint` | — | Mark workflow checkpoint |
| `/build-fix` | — | Iterative build/type-error fix |
| `/update-docs` | — | Sync docs with code |

## Agents

Multi-tier review orchestrated by `review-code`. Each tier reviewer covers one axis.

| Agent | Axis |
|---|---|
| `review-code` | Orchestrator |
| `process-review` | Apply review findings |
| `reviewer-security` | Security / OWASP |
| `reviewer-performance` | Performance |
| `reviewer-accessibility` | WCAG |
| `reviewer-architecture` | Architecture / dependencies |
| `reviewer-simplicity` | Simplification |
| `reviewer-naming` | Naming quality |
| `reviewer-comments` | Comment quality |
| `reviewer-testing` | Test coverage |
| `reviewer-error-type` | Error handling / types |
| `reviewer-plan` | Plan validation |
| `merge-request-writer` | MR description generation |

## Hooks

| Script | Event | Purpose |
|---|---|---|
| `session-start.js` | SessionStart | Detect package manager, branch, env |
| `session-end.js` | Stop | Persist session state |
| `pre-compact.js` | PreCompact | Snapshot context before compression |
| `suggest-compact.js` | PreToolUse (Edit\|Write) | Suggest compaction at thresholds |
| `block-dev-without-tmux.js` | PreToolUse (dev servers) | Force long-running servers into tmux |
| `block-random-md.js` | PreToolUse (Write \*.md) | Prevent stray markdown file creation |
| `log-pr-url.js` | PostToolUse (gh pr create) | Capture PR URL |
| `statusline.sh` | StatusLine | Two-line status with model, context, rate limits, cost |

Hook config lives in `settings.json` under `hooks.*`.

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

**Implement a feature:**
```
/research       → validate approach against 2026 standards
/plan           → restate requirements, risks, step-by-step
/tdd            → red → green → refactor
/review         → multi-tier review before commit
/commit         → conventional commit message
/mr             → merge request description
```

**Fix a bug:**
```
/debug          → structured hypothesis testing
/tdd            → write failing test that reproduces
                → fix, verify
/review
```

**Start a new project:**
```
/inception      → goals, architecture, structure
/flow           → daily development cadence
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
- **skills/<name>/SKILL.md** — write your own skill (see `skill-create`)
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
