# ~/.claude Setup Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut `~/.claude` from 35 skills / 13 agents / 16 commands down to 4 skills / 0 agents / 3 commands, and repair the references left dangling by the deletions.

**Architecture:** Pure configuration cleanup — no application code. Work proceeds as deletion first (largest, lowest risk), then the worktree tool move, then reference repair, then the two skill rewrites. Each task ends with a commit so any step can be reverted alone. Git history is the archive; nothing is copied to an `_archive/` directory.

**Tech Stack:** git, bash, zsh, markdown. `pytest` only as a regression guard for the kept `plan-explorer` skill.

## Global Constraints

- Branch: `feature/simplify-skills` in `/Users/you/.claude`. Never commit on `main`.
- Deletion is `git rm -r`. No `_archive/` directory, no file copies.
- Skills kept: exactly `plan-explorer`, `graphify`, `setup-testing`, `setup-langfuse-tracing`.
- Commands kept: exactly `commit`, `mr`, `qa-steps`.
- Agents kept: none.
- Every kept skill's frontmatter `name:` must equal its directory name.
- Commit messages: conventional commits, single line, ending with the Co-Authored-By line shown in each commit step.
- `skills/graphify/` is currently untracked. Do not `git rm` it and do not stage it as part of these tasks.
- The working tree has unrelated pre-existing modifications (`hooks/scripts/session-end.js`, `hooks/scripts/statusline.sh`, `settings.json`, and untracked daemon files). Never `git add -A`; stage only the exact paths each step names.

---

### Task 1: Delete the 30 unused skills

**Files:**
- Delete: 30 directories under `skills/` (listed in Step 1)
- Test: shell assertion on remaining directory count

**Interfaces:**
- Consumes: nothing
- Produces: a `skills/` directory containing only `plan-explorer`, `graphify`, `setup-testing`, `setup-langfuse-tracing`, `worktree`, and `README.md`. Task 3 removes `worktree`.

- [ ] **Step 1: Delete the skill directories**

```bash
cd /Users/you/.claude
git rm -r -q \
  skills/ai-framework-build-langgraph \
  skills/ai-framework-select \
  skills/ai-framework-setup-anthropic \
  skills/ai-framework-setup-langchain \
  skills/ai-framework-setup-pydanticai \
  skills/appstore-check \
  skills/compliance-check \
  skills/dev-workflow-debug \
  skills/dev-workflow-flow \
  skills/dev-workflow-patterns \
  skills/dev-workflow-tdd \
  skills/dev-workflow-test-driven \
  skills/docs-bigger-picture \
  skills/docs-context \
  skills/docs-manager \
  skills/playstore-check \
  skills/project-brainstorm \
  skills/project-determine-goal \
  skills/project-handle-ticket \
  skills/project-inception \
  skills/research-deep \
  skills/review-critical \
  skills/review-plan \
  skills/review-system \
  skills/setup-logging \
  skills/setup-payments \
  skills/setup-repository-structure \
  skills/setup-uv \
  skills/skill-create \
  skills/ui-design-options
```

- [ ] **Step 2: Verify exactly the right directories remain**

Run:

```bash
ls -1 /Users/you/.claude/skills
```

Expected output, exactly these six lines in this order:

```
graphify
plan-explorer
README.md
setup-langfuse-tracing
setup-testing
worktree
```

If any other directory is listed, delete it. If one of these six is missing, restore it with `git checkout HEAD -- skills/<name>`.

- [ ] **Step 3: Verify the kept skills are intact**

Run:

```bash
cd /Users/you/.claude/skills/plan-explorer && uv run pytest -q 2>&1 | tail -3
```

Expected: `57 passed`.

If the run errors on a missing file, a wrong path was deleted — restore with `git checkout HEAD -- skills/plan-explorer` and re-check Step 1's list.

- [ ] **Step 4: Commit**

```bash
cd /Users/you/.claude
git commit -q -m "chore(skills): remove 30 unused skills superseded by superpowers

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Delete all agents and 13 commands

**Files:**
- Delete: `agents/` (all 13 files)
- Delete: 13 files under `commands/`
- Test: shell assertion on remaining files

**Interfaces:**
- Consumes: nothing from Task 1
- Produces: `commands/` containing exactly `commit.md`, `mr.md`, `qa-steps.md`. Task 5 strips their dangling footer references.

- [ ] **Step 1: Delete every agent**

```bash
cd /Users/you/.claude
git rm -r -q agents
```

- [ ] **Step 2: Delete the 13 superseded commands**

```bash
cd /Users/you/.claude
git rm -q \
  commands/build-fix.md \
  commands/checkpoint.md \
  commands/debug.md \
  commands/docs.md \
  commands/flow.md \
  commands/humanize.md \
  commands/inception.md \
  commands/plan.md \
  commands/research.md \
  commands/review.md \
  commands/tdd.md \
  commands/ticket.md \
  commands/update-docs.md
```

- [ ] **Step 3: Verify**

Run:

```bash
ls -1 /Users/you/.claude/commands; ls -d /Users/you/.claude/agents 2>/dev/null || echo "agents/ gone"
```

Expected output, exactly:

```
commit.md
mr.md
qa-steps.md
agents/ gone
```

- [ ] **Step 4: Commit**

```bash
cd /Users/you/.claude
git commit -q -m "chore(agents,commands): remove unused review agents and superseded commands

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Move wt.sh out of skills, delete the worktree skill

**Files:**
- Create: `scripts/wt.sh` (moved, content unchanged)
- Delete: `skills/worktree/SKILL.md`, `skills/worktree/scripts/wt.sh`
- Modify: `~/.zshrc` (append one line)
- Test: sourcing the script in a fresh shell

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `wt` shell function available at `~/.claude/scripts/wt.sh`. Task 6's MEMORY.md update documents this new path.

- [ ] **Step 1: Move the script, preserving history**

```bash
cd /Users/you/.claude
mkdir -p scripts
git mv skills/worktree/scripts/wt.sh scripts/wt.sh
```

- [ ] **Step 2: Delete the rest of the skill**

```bash
cd /Users/you/.claude
git rm -r -q skills/worktree
```

- [ ] **Step 3: Verify the move**

Run:

```bash
ls -l /Users/you/.claude/scripts/wt.sh; ls -d /Users/you/.claude/skills/worktree 2>/dev/null || echo "worktree skill gone"
```

Expected: `wt.sh` exists at the new path (483 lines), and `worktree skill gone`.

- [ ] **Step 4: Verify the script still works from its new path**

Run:

```bash
zsh -c 'source /Users/you/.claude/scripts/wt.sh && cd /Users/you/.claude && wt ls'
```

Expected: a worktree listing, or a clean "no worktrees" message. Not a syntax error and not "command not found: wt".

If sourcing fails because the script referenced `${CLAUDE_SKILL_DIR}`, grep for that variable and replace it with a path relative to the script's own location:

```bash
grep -n 'CLAUDE_SKILL_DIR' /Users/you/.claude/scripts/wt.sh
```

- [ ] **Step 5: Source it from .zshrc**

Append to `~/.zshrc` — do not reorganize the file, add these two lines at the end:

```bash
cat >> ~/.zshrc <<'EOF'

source ~/.claude/scripts/wt.sh
EOF
```

- [ ] **Step 6: Verify .zshrc loads cleanly**

Run:

```bash
zsh -i -c 'type wt' 2>&1 | tail -2
```

Expected: `wt is a shell function`.

- [ ] **Step 7: Commit**

```bash
cd /Users/you/.claude
git add scripts/wt.sh
git commit -q -m "refactor(worktree): move wt.sh to scripts, drop skill superseded by superpowers

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

`~/.zshrc` sits outside the repo and is not committed.

---

### Task 4: Update CLAUDE.md — retarget TDD line, add the .env worktree rule

**Files:**
- Modify: `CLAUDE.md:39` (TDD skill pointers), and the end of the `## Git` section (new worktree rule)
- Test: grep assertions

**Interfaces:**
- Consumes: the deletions from Tasks 1 and 3
- Produces: a CLAUDE.md with no references to deleted skills, plus the `.env`-copy instruction that neither superpowers nor `EnterWorktree` provides.

`CLAUDE.md` currently has unstaged modifications unrelated to this work. Stage only `CLAUDE.md` in this task's commit, and read the file before editing so those edits are preserved.

`CLAUDE.md` was edited by the user after this plan was written. Locate both edit sites by content, not by line number.

- [ ] **Step 1: Retarget the TDD line**

Replace the line in the `## Testing` section (currently line 39) which reads:

```markdown
- Use `setup-testing` skill to bootstrap test infrastructure; use `tdd` / `dev-workflow-tdd` for day-to-day TDD cycles
```

with:

```markdown
- Use `setup-testing` skill to bootstrap test infrastructure; use `superpowers:test-driven-development` for day-to-day TDD cycles
```

- [ ] **Step 2: Add the .env worktree rule**

Append to the end of the `## Git` section — after the last bullet (`- No cost estimates; careful with time estimates`) and before the `## Testing` heading — insert:

```markdown
### Worktrees
- `superpowers:using-git-worktrees` owns worktree setup; prefer the native `EnterWorktree` tool over `git worktree add`.
- After creating a worktree, copy `.env` and `.env.local` from the repo root into it if they exist. Never overwrite a file already there. Neither the native tool nor the skill does this, and its absence breaks the new worktree silently.
```

- [ ] **Step 3: Verify no dangling references remain**

Run:

```bash
grep -niE "dev-workflow|review-system|review-critical|reviewer-|merge-request-writer|deep-research|docs-manager|skill-create|ui-design-options|project-inception|handle-ticket" /Users/you/.claude/CLAUDE.md
```

Expected: no output.

Then confirm the new rule landed:

```bash
grep -n "EnterWorktree" /Users/you/.claude/CLAUDE.md
```

Expected: one match inside the `### Worktrees` block.

- [ ] **Step 4: Commit**

```bash
cd /Users/you/.claude
git add CLAUDE.md
git commit -q -m "docs(claude): retarget TDD pointer to superpowers, add worktree env rule

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Strip dangling references from the three kept commands

**Files:**
- Modify: `commands/commit.md:164`, `commands/mr.md:108-109`, `commands/qa-steps.md:96-97`
- Test: grep assertion

**Interfaces:**
- Consumes: the deletions from Tasks 1 and 2
- Produces: three commands with no pointers to deleted skills.

Each file ends with a "related skills" footer listing skills that no longer exist. Remove only the dead lines; leave the rest of each file alone.

- [ ] **Step 1: Remove the dead footer lines**

In `commands/commit.md`, delete line 164:

```markdown
- **review-system** - Review before commit
```

In `commands/mr.md`, delete lines 108-109:

```markdown
- **docs-manager** - Documentation creation
- **review-system** - Pre-MR code review
```

In `commands/qa-steps.md`, delete lines 96-97:

```markdown
- **docs-manager** - Documentation creation and maintenance
- **review-system** - Code review before QA
```

If removing these lines leaves an empty section heading (for example a trailing `## Related Skills` with nothing under it), delete the heading too.

- [ ] **Step 2: Verify**

Run:

```bash
grep -rniE "dev-workflow|review-system|review-critical|reviewer-|merge-request-writer|deep-research|docs-manager|skill-create|ui-design-options" /Users/you/.claude/commands/
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/you/.claude
git add commands/commit.md commands/mr.md commands/qa-steps.md
git commit -q -m "fix(commands): drop references to removed skills

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Rewrite setup-testing to ~150 lines

**Files:**
- Modify: `skills/setup-testing/SKILL.md` (528 lines → ~150)
- Test: line count and content assertions

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: a skill whose frontmatter `name` is `setup-testing`, matching its directory.

The failure this fixes: the skill has never fired once in 711 sessions, because its trigger is vague and 40% of its body is prose the model already knows.

**Keep verbatim** — these sections hold decisions the model would not make unprompted, and every code block in them must survive intact:

- `## Step 2: Install Dependencies` (Python and Frontend package lists)
- `## Step 3: Configure pytest` (marker definitions)
- `## Step 4: Root conftest.py` — all four variants: Base/FastAPI async, PostgreSQL, Qdrant, Redis
- `## Step 5: LLM Call Mocking` — both Option A (VCR) and Option B (AWS Bedrock stub)
- `## Step 6: Override FastAPI Dependencies in Tests`
- `## Step 7: Playwright` and `## Step 8: MSW` — config blocks only
- `## Step 9: CI Configuration`

**Cut entirely:**

- `## Purpose` (fold one sentence of it into the frontmatter description)
- `## When to Use This Skill` — replaced by a sharp trigger in the description
- `## Anti-Patterns to Avoid`
- `## Integration with Other Skills` — it names deleted skills
- `## References`
- `## Step 1: Discover Project Stack` — replaced by one line: detect the stack from `pyproject.toml`, `package.json`, and `docker-compose.yml`, then apply only the matching sections below
- All narrative prose introducing each code block; keep a single line of context per block at most

**Frontmatter must become:**

```yaml
---
name: setup-testing
description: Bootstrap Python/React test infrastructure — pytest markers, Testcontainers fixtures for PostgreSQL/Qdrant/Redis, LLM mocking via VCR or a Bedrock stub, Playwright, MSW. Use when a repo has no conftest.py with Testcontainers fixtures, or no Playwright config.
---
```

- [ ] **Step 1: Read the current file in full**

```bash
wc -l /Users/you/.claude/skills/setup-testing/SKILL.md
```

Expected: `528`. Read the whole file before editing so no config block is lost.

- [ ] **Step 2: Rewrite the file**

Apply the keep/cut lists above. Order the kept sections exactly as they appear now. Precede each conditional section with its condition on one line, for example `**If PostgreSQL is in docker-compose.yml:**`.

- [ ] **Step 3: Verify length and content**

Run:

```bash
wc -l /Users/you/.claude/skills/setup-testing/SKILL.md
head -4 /Users/you/.claude/skills/setup-testing/SKILL.md
grep -c '```' /Users/you/.claude/skills/setup-testing/SKILL.md
```

Expected: between 120 and 180 lines; `name: setup-testing` on line 2; an even number of fence markers, at least 20 (10+ code blocks preserved).

Then confirm no config block was dropped:

```bash
grep -ciE "testcontainers|postgres|qdrant|redis|vcr|bedrock|playwright|msw|pytest.ini|markers" /Users/you/.claude/skills/setup-testing/SKILL.md
```

Expected: 15 or more matches.

- [ ] **Step 4: Verify no "When to Use" boilerplate returned**

```bash
grep -niE "^## (When to Use|Purpose|Anti-Patterns|Integration|References)" /Users/you/.claude/skills/setup-testing/SKILL.md
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /Users/you/.claude
git add skills/setup-testing/SKILL.md
git commit -q -m "refactor(setup-testing): trim to config only, sharpen trigger

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Rewrite setup-langfuse-tracing to ~150 lines

**Files:**
- Modify: `skills/setup-langfuse-tracing/SKILL.md` (770 lines → ~150)
- Test: line count and content assertions

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: a skill whose frontmatter `name` is `setup-langfuse-tracing`, matching its directory. Its current `name` is `setting-up-langfuse-for-tracing-llms`, which is why references to it break.

- [ ] **Step 1: Confirm the SDK version is still current**

The skill pins Langfuse v3. Before rewriting, check whether v3 is still the current major:

```bash
# Use the package-registry MCP tool, or:
curl -s https://pypi.org/pypi/langfuse/json | python3 -c "import sys,json; print(json.load(sys.stdin)['info']['version'])"
```

If the current major is still 3, proceed unchanged. If a v4 has shipped, use the `mcp__langfuse-docs__searchLangfuseDocs` tool to check whether the context-manager pattern changed, and update the code blocks to the current API before continuing. If v3 is fully deprecated and the patterns no longer apply, stop and report — the skill may be worth deleting instead of rewriting.

- [ ] **Step 2: Read the current file in full**

```bash
wc -l /Users/you/.claude/skills/setup-langfuse-tracing/SKILL.md
```

Expected: `770`. Read it all before editing.

- [ ] **Step 3: Rewrite the file**

**Keep** — the concrete, non-obvious material:

- `## SDK Version` (the version pin)
- `## Step 1: Environment Setup` (env var names, client init)
- `## Step 4: Create Langfuse Module` (the module source — this is the core deliverable)
- `## Step 6: Tracing Patterns` — Pattern 1 (direct call with context manager) and Pattern 2 (nested spans) only
- `## Step 7: Metadata Strategy` (the metadata keys)
- `## Step 11: Production Patterns` — Flush for short-lived processes, and Privacy-Sensitive Data
- `## SSL certification and CA certificates` — condense to the essential note
- `## Troubleshooting` — condense to a 4-row table

**Cut entirely:**

- `## Purpose`, `## When to Use This Skill`, `## Prerequisites`
- `## Docker Setup with uv and Langfuse` including the multi-stage Dockerfile, `### Why this works`, `### Build and run` — this is deployment, not tracing setup
- `## Step 2: Find All LLM Calls` and `## Step 3: Assess Current Tracing` — the model does this natively
- `## Step 5: Naming Convention` and `## Step 8: Real-World Naming Examples` — replace both with a single one-line rule: span names are `verb-noun` in kebab-case, human-readable, stable across runs
- `## Step 6` Patterns 3 (decorator) and 4 (native OpenAI integration) — YAGNI
- `## Step 9: Feedback Setup` and `## Step 10: Prompt Management` — both marked Optional
- `## Step 11` Error Handling subsection — generic
- `## Verification Checklist`, `## Common Patterns`, `## Resources`, `## Integration with Development`, `## Common Pitfalls to Avoid`

**Frontmatter must become:**

```yaml
---
name: setup-langfuse-tracing
description: Instrument LLM calls with Langfuse v3 tracing — client setup, a reusable tracing module, context-manager and nested-span patterns, metadata keys, flush handling. Use when a repo makes LLM calls with no Langfuse spans around them.
---
```

If Step 1 found a newer major version, use that version number in the description instead of v3.

- [ ] **Step 4: Verify length and content**

Run:

```bash
wc -l /Users/you/.claude/skills/setup-langfuse-tracing/SKILL.md
head -4 /Users/you/.claude/skills/setup-langfuse-tracing/SKILL.md
grep -ciE "langfuse|span|trace|flush|metadata" /Users/you/.claude/skills/setup-langfuse-tracing/SKILL.md
```

Expected: between 120 and 180 lines; `name: setup-langfuse-tracing` on line 2; 20 or more keyword matches.

- [ ] **Step 5: Verify the cut sections are gone**

```bash
grep -niE "^#{2,3} (When to Use|Purpose|Prerequisites|Docker Setup|Multi-stage|Real-World Naming|Feedback Setup|Prompt Management|Verification Checklist|Resources|Common Pitfalls)" /Users/you/.claude/skills/setup-langfuse-tracing/SKILL.md
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
cd /Users/you/.claude
git add skills/setup-langfuse-tracing/SKILL.md
git commit -q -m "refactor(setup-langfuse-tracing): trim to tracing config, fix skill name

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Update memory, run final verification

**Files:**
- Modify: `~/.claude/projects/-Users-you--claude/memory/MEMORY.md`
- Test: full verification sweep from the spec

**Interfaces:**
- Consumes: every earlier task
- Produces: the finished branch, ready to fast-forward into `main`.

- [ ] **Step 1: Update the worktree memory entry**

`MEMORY.md` currently opens with a `## Worktree Skill` section describing `~/.claude/skills/worktree/` as a user-level skill. That is now wrong. Replace that whole section with:

```markdown
## Worktree Tooling
- `superpowers:using-git-worktrees` owns worktree workflow; prefer native `EnterWorktree` over `git worktree add`
- Human shell helper: `~/.claude/scripts/wt.sh`, sourced from `.zshrc`, gives `wt new|co|ls|cd|rm|cleanup` with zsh completion
- Base branch detection: dev → develop → main → master
- Worktrees stored in `.worktrees/` at repo root
- Copying `.env` / `.env.local` into a new worktree is a gap in superpowers; the rule lives in `~/.claude/CLAUDE.md`
- Safety: never `-D`, checks uncommitted changes, confirms before destructive ops
```

Then, under `## ~/.claude Repo`, append one line:

```markdown
- 2026-09-10: cut 31 skills, 13 agents, 13 commands — superpowers plugin covers the process layer
```

- [ ] **Step 2: Run the full verification sweep**

```bash
cd /Users/you/.claude
echo "--- skills (expect 4 + README) ---"; ls -1 skills
echo "--- commands (expect 3) ---"; ls -1 commands
echo "--- agents (expect gone) ---"; ls -d agents 2>/dev/null || echo "gone"
echo "--- name/dir match ---"; for d in skills/*/; do n=$(basename "$d"); f=$(grep -m1 '^name:' "$d/SKILL.md" 2>/dev/null | sed 's/name: *//'); [ "$n" = "$f" ] && echo "OK   $n" || echo "FAIL $n != $f"; done
echo "--- dangling refs ---"; grep -rniE "dev-workflow|review-system|review-critical|reviewer-|merge-request-writer|deep-research|docs-manager|skill-create|ui-design-options|project-inception|handle-ticket" CLAUDE.md commands/ skills/ 2>/dev/null | grep -v "^docs/" || echo "none"
echo "--- wt.sh ---"; zsh -i -c 'type wt' 2>&1 | tail -1
```

Expected:
- `skills`: `graphify`, `plan-explorer`, `README.md`, `setup-langfuse-tracing`, `setup-testing`
- `commands`: `commit.md`, `mr.md`, `qa-steps.md`
- `agents`: `gone`
- name/dir: `OK` for all four skills (`graphify`, `plan-explorer`, `setup-langfuse-tracing`, `setup-testing`)
- dangling refs: `none`
- `wt is a shell function`

Fix anything that fails before continuing.

- [ ] **Step 3: Re-run the plan-explorer tests**

```bash
cd /Users/you/.claude/skills/plan-explorer && uv run pytest -q 2>&1 | tail -3
```

Expected: `57 passed`.

- [ ] **Step 4: Commit**

`MEMORY.md` lives under `projects/`, which may be gitignored. Check first:

```bash
cd /Users/you/.claude
git check-ignore -q projects/-Users-you--claude/memory/MEMORY.md && echo "ignored, nothing to commit" || git add projects/-Users-you--claude/memory/MEMORY.md
```

If it was staged:

```bash
git commit -q -m "docs(memory): update worktree entry for wt.sh move

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Review the full diff before shipping**

```bash
cd /Users/you/.claude
git diff main...HEAD --stat | tail -20
git log --oneline main..HEAD
```

Expected: 7 or 8 commits, a large negative line count, and no changes to `hooks/`, `settings.json`, or `plugins/`.

Do not merge yet — Task 9 must land first.

---

### Task 9: Update the READMEs and repair the repo test suite

**Files:**
- Modify: `README.md` (227 lines)
- Modify: `skills/README.md` (273 lines)
- Modify: `tests/run_all_tests.py:84-89`
- Test: `python3 tests/run_all_tests.py`

**Interfaces:**
- Consumes: the final state produced by Tasks 1-8
- Produces: documentation matching reality, and a passing repo test suite.

Both READMEs describe the pre-cleanup repo and are now wrong in almost every count. `tests/run_all_tests.py` hardcodes a `critical_skills` list naming four skills, three of which no longer exist.

- [ ] **Step 1: Fix the repo test suite first, and watch it fail**

`tests/run_all_tests.py:84-89` currently reads:

```python
        # Check for critical skills
        critical_skills = [
            'dev-flow',
            'getting-the-bigger-picture',
            'review-system',
            'plan-review-system'
        ]
```

All four are gone (`dev-flow` and `plan-review-system` never existed under those directory names at all — they were frontmatter names). Run the suite first to see it fail:

```bash
cd /Users/you/.claude && python3 tests/run_all_tests.py 2>&1 | tail -15
```

Expected: a failure reporting missing critical skills.

Replace the list with the four skills that actually remain:

```python
        # Check for critical skills
        critical_skills = [
            'plan-explorer',
            'graphify',
            'setup-testing',
            'setup-langfuse-tracing'
        ]
```

- [ ] **Step 2: Verify the suite passes**

```bash
cd /Users/you/.claude && python3 tests/run_all_tests.py 2>&1 | tail -15
```

Expected: all checks pass. If `validate_skill_md.py` or `verify_structure.py` flags one of the four kept skills, fix the skill's frontmatter — the name must match its directory.

- [ ] **Step 3: Rewrite README.md**

Corrections required, with exact new values:

- Line 3 summary and line 11 contents line: the repo is no longer "skills, agents, hooks, slash commands ... built around a TDD + multi-tier-review workflow". It is now **4 skills · 3 slash commands · 0 agents · 8 hooks · MCP integrations**. Verify the hook count with `ls -1 hooks/scripts | wc -l` before writing it.
- `## Repository Layout` (lines 55-57): `skills/` is 4 skills, `commands/` is 3 commands, the `agents/` line is deleted entirely. Add a line for `scripts/` — `wt.sh`, the git-worktree shell helper.
- `## Skills` table: replace the category table with one row per remaining skill — `plan-explorer`, `graphify`, `setup-testing`, `setup-langfuse-tracing` — each with a one-line purpose.
- `## Slash Commands` table: keep only `commit`, `mr`, `qa-steps`. Remove the "Maps to" column if every remaining command is self-contained.
- `## Agents` section: delete it.
- `## Workflow Examples`: rewrite any example that invokes a deleted skill or agent. Examples must use superpowers skills instead.

- [ ] **Step 4: Add the superpowers pointer to README.md**

The single most important thing a reader needs to know is that the process layer lives in a plugin, not this repo. Add a `## Superpowers` section immediately after `## Compatibility`, before `## Repository Layout`:

```markdown
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
```

Before writing the two URLs, verify them:

```bash
cat /Users/you/.claude/plugins/known_marketplaces.json 2>/dev/null | grep -iA3 superpowers
```

Use whatever source URL that file records. If it disagrees with the URLs above, the file wins.

Also add a `## Related` entry pointing at the same marketplace, next to the existing entries.

- [ ] **Step 5: Rewrite skills/README.md**

It is a 273-line catalogue of skills that mostly no longer exist. Replace it with a short index covering only the four kept skills: name, one-line purpose, and when it fires. Target under 60 lines. Add a closing line pointing at the root README's `## Superpowers` section for everything process-related.

- [ ] **Step 6: Verify no stale references survive**

```bash
cd /Users/you/.claude
grep -rniE "dev-workflow|review-system|review-critical|reviewer-|merge-request-writer|deep-research|docs-manager|skill-create|ui-design-options|project-inception|handle-ticket|dev-flow|plan-review-system" README.md skills/README.md tests/ commands/ CLAUDE.md
```

Expected: no output.

```bash
grep -c "superpowers" /Users/you/.claude/README.md
```

Expected: 3 or more matches.

- [ ] **Step 7: Commit**

```bash
cd /Users/you/.claude
git add README.md skills/README.md tests/run_all_tests.py
git commit -q -m "docs(readme): match post-cleanup layout, document superpowers dependency

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Then hand off to `superpowers:finishing-a-development-branch` to merge into `main`.
