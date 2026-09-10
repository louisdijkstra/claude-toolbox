# Simplifying the ~/.claude Setup

**Date:** 2026-09-10
**Status:** Approved for planning

## Problem

`~/.claude` holds 35 user-level skills, 13 agents, and 16 slash commands. Nearly all were
written in one batch on 2026-02-16, before the superpowers plugin was installed, and have
never run since.

Usage evidence, measured across 711 session transcripts by counting real invocation markers
(`"skill":"<name>"` and `<command-name>/<name>`), not plain mentions — every transcript
contains the full skill catalog, so name matches alone prove nothing:

| Skill | Invocations | Source |
|---|---|---|
| superpowers:brainstorming | 87 | plugin |
| finish-branch | 48 | project-level |
| superpowers:writing-plans | 44 | plugin |
| backlog / sap-fiori-ui / artifact-design | 44 / 42 / 30 | project-level |
| superpowers:systematic-debugging | 14 | plugin |
| plan-explorer | 13 | user-level |
| superpowers:executing-plans | 10 | plugin |
| ui-design-options | 4 | user-level |
| research-deep / qa-steps | 2 / 1 | user-level |

Thirty of 35 user-level skills have zero invocations. Of the 13 agents, only `reviewer-plan`
(4) and `reviewer-accessibility` (1) ever ran; the `review-code` orchestrator that drives
them never did. Of 16 commands, only `/debug` ran, once.

Two structural defects explain the silence:

1. **Frontmatter `name` does not match the directory name** in at least seven skills
   (`setup-uv` declares `uv-management`, `research-deep` declares `deep-research`,
   `dev-workflow-patterns` declares `pattern-discovery`, and so on). Commands that
   reference the internal names therefore point at skills the loader cannot resolve.
2. **Vague triggers.** Roughly 40% of each file is "When to Use / Do NOT use" prose with
   conditions like "starting a new project" — too weak to fire against a concrete request.

The superpowers plugin now covers the process layer (brainstorm → plan → TDD → debug →
review → ship), and the harness covers much of the rest natively (`EnterWorktree`,
`/code-review`, `/security-review`, `/simplify`, `/run`, `dataviz`, `claude-api`).

## Goal

Cut `~/.claude` to what actually earns its place: superpowers for process, a small set of
tools and stack decisions that superpowers does not cover, and nothing else.

Target: 35 skills → 4, 13 agents → 0, 16 commands → 3.

## Decisions

### Keep (4 skills)

| Skill | Why |
|---|---|
| `plan-explorer` | Real tool. 57 tests, 13 invocations. Not prose. |
| `graphify` | Real tooling with scripts. Newly built, unproven but not noise. |
| `setup-testing` | Encodes stack decisions the model would not pick unprompted — Testcontainers, VCR, Bedrock stub, Playwright, MSW. |
| `setup-langfuse-tracing` | Pins the Langfuse v3 context-manager pattern. Langfuse is in active use (MCP configured). |

### Rewrite (2 of the 4 kept)

`setup-testing` (528 lines) and `setup-langfuse-tracing` (770 lines) stay, but shrink to
roughly 150 lines each:

- Cut the "When to Use / Do NOT use" boilerplate to a one-line trigger in the description.
- Keep only concrete config: file contents, fixture code, commands, pinned versions.
- Drop narrative explanation the model already knows.
- Fix `name:` to match the directory.
- Verify Langfuse v3 is still current before rewriting; if v4 has shipped, update or drop.

### Delete (31 skills)

Superseded by superpowers: `project-brainstorm`, `review-plan`, `dev-workflow-tdd`,
`dev-workflow-test-driven`, `dev-workflow-debug`, `dev-workflow-flow`, `skill-create`,
`review-system`, `review-critical`, `project-handle-ticket`, `project-inception`,
`project-determine-goal`, `worktree`.

Superseded by built-ins or plugins: `ui-design-options` (frontend-design plugin),
`docs-context` (native compaction), `ai-framework-setup-anthropic` (built-in `claude-api`).

Generic prose with no encoded decisions: `setup-uv`, `setup-logging`,
`setup-repository-structure`, `docs-manager`, `docs-bigger-picture`,
`dev-workflow-patterns`, `research-deep`.

Domain one-offs never used: `appstore-check`, `playstore-check`, `setup-payments`,
`compliance-check`, `ai-framework-build-langgraph`, `ai-framework-select`,
`ai-framework-setup-langchain`, `ai-framework-setup-pydanticai`.

### Delete (all 13 agents)

`review-code`, `process-review`, `merge-request-writer`, and the ten `reviewer-*` agents.
The orchestrator never ran. `superpowers:requesting-code-review` plus the built-in
`/code-review` and `/security-review` cover this ground.

### Delete (13 commands), keep 3

Delete every command that delegates to a deleted skill or duplicates a built-in:
`debug`, `docs`, `flow`, `inception`, `plan`, `research`, `review`, `tdd`, `ticket`,
`update-docs`, `checkpoint`, `build-fix`, `humanize`.

Keep `commit`, `mr`, `qa-steps` — self-contained, no delegation to deleted skills.

Deletion is plain `git rm`. Git history is the archive; no `_archive/` directory.

### Git worktrees

`skills/worktree/SKILL.md` loses on every model-facing job because it always shells out to
raw `git worktree add`, unaware that the harness provides `EnterWorktree`. That creates
worktrees the harness cannot track. `superpowers:using-git-worktrees` defers to the native
tool, guards against submodules and nested worktrees, verifies the directory is gitignored,
and runs a baseline test; `superpowers:finishing-a-development-branch` handles ship and
cleanup with a four-option menu.

The only real value is in `scripts/wt.sh` (483 lines) and it is all human-facing: `wt ls`,
`wt cd`, `wt cleanup`, tab completion. Claude cannot use `wt cd` at all, since the working
directory does not persist between tool calls. The script is currently sourced nowhere —
`.zshrc` has no reference to it, so it has never run.

Plan:

1. Delete `skills/worktree/SKILL.md`.
2. Move `skills/worktree/scripts/wt.sh` → `~/.claude/scripts/wt.sh`. Out of the skill
   catalog, so it stops competing with superpowers for triggers.
3. Add `source ~/.claude/scripts/wt.sh` to `.zshrc`.
4. Port the one genuine gap into `~/.claude/CLAUDE.md`: neither superpowers nor
   `EnterWorktree` copies `.env` / `.env.local` into a new worktree, and its absence breaks
   every new worktree silently. Add a short instruction covering it.

### Memory

`~/.claude/projects/-Users-you--claude/memory/MEMORY.md` documents the worktree skill at
its old path and describes it as a user-level skill. That becomes wrong. Update the entry to
describe `scripts/wt.sh` as a shell tool, and note that superpowers owns worktree workflow.

## Non-goals

- No changes to project-level skills (`finish-branch`, `backlog`, `sap-fiori-ui`,
  `artifact-design`, `smoke`, `next-phase`, `close-phase`). They are heavily used and live
  in their own repos.
- No changes to hooks, `settings.json`, or installed plugins.
- No new skills.

## Risks

- **Deleting something later wanted.** Mitigated by git history; every file is recoverable
  by path.
- **`setup-testing` / `setup-langfuse-tracing` rewrites lose useful detail.** Mitigated by
  rewriting on a branch, diffing against the original, and keeping every concrete config
  block.
- **`.zshrc` edit.** User-owned file outside the repo. Append one line; do not reorganize.

## Verification

- `skills/` contains exactly 4 directories plus `README.md`.
- `agents/` is empty or removed; `commands/` contains exactly 3 files.
- Every kept skill's frontmatter `name` matches its directory name.
- `skills/plan-explorer` tests still pass (57 tests).
- No remaining file in `~/.claude` references a deleted skill or agent by name.
- `source ~/.claude/scripts/wt.sh && wt ls` works in a fresh shell.
