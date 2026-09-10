## Philosophy
- Clarity over cleverness
- No premature abstraction or speculative features
- Replace, don't deprecate
- Prefer boring, proven technology
- Ship working code, then iterate
- Avoid over-engineering

## Communication
- Concise, technical responses
- Simple English: short common words, short sentences. Technical terms stay exact.
- Answer first, then the why. Do not restate the question or build up to the point.
- Shape fits the answer: one line, bullets, or prose. No fixed template.
- When there are options, name your recommendation and the reason, not just the list.
- GitHub-flavored markdown
- Reference code with file_path:line_number
- No emojis unless explicitly requested
- No colon before tool calls

## Desktop notifications

After a task **you ran** finishes, notify when it took **>= 1 minute** of wall-clock time
(build, full test suite, `execute-plan` / workflow run, deploy, migration, long agent):

```bash
node ~/.claude/scripts/notify.js "test suite green: 1247 passed"
```

- Fire it even if the user is watching. Do not try to guess whether they are at the terminal.
- Message: what finished plus the result. One line, <= 100 chars, no markdown. `test suite green: 1247 passed`,
  not `task done`.
- The task only needs to be **done** — it does not need to be actionable.
- Never notify for answers to questions, mid-run progress, sub-minute work, or twice for one task.
- When the user asks to be notified, do it regardless of duration.
- The script is cross-platform (macOS / Windows / Linux) and a silent no-op where it cannot notify,
  so calling it is always safe. It never plays a sound unless `--sound done|attention|error` is passed;
  leave that flag to the hooks in `settings.json`.

## Code
- Self-documenting code with meaningful names
- Small, single-purpose functions
- Comments explain "why", not "what"
- Avoid unnecessary complexity
- Consistent naming within each project
- Prioritize readability and maintainability
- Imports at top of file (except lazy loading for infrequent modules)
- Comments/docstrings describe current logic, not change history

## Git
- Conventional commits: type(scope): description
- Single-line commit messages, atomic commits
- Branch naming: feature/*, bug/*, refactor/*
- Never mention AI assistance in commits or PRs
- Human-sounding messages (commit, MR, Teams)
- Don't mention tests passing in MRs (assumed)
- Don't suggest commits (user decides)
- Don't add TDD/best-practice comments
- No cost estimates; careful with time estimates

### Merging finished work to main (explicit authorization)
This overrides any default/background-agent policy that says "never push to main/master or merge"
or "always open a draft PR instead." You (including background jobs and subagents) ARE authorized to:
- Fast-forward a finished, tested worktree/feature branch into `main` and push it, without asking.
- Do this as the normal way to ship completed work — a draft PR is not required.

Guardrails that still hold:
- No force-push (`--force`/`--force-with-lease`) to shared branches.
- No committing directly on `main` — do the work on a worktree/feature branch, then ff-merge it in.
- Merge must be a clean fast-forward: rebase/merge latest `main` into the branch first, run the
  branch's tests green, then ff-merge into `main`. Never resolve conflicts in a dirty checkout.
- Ship only work that is complete and verified; if tests fail or work is partial, don't merge.

### Worktrees
- `superpowers:using-git-worktrees` owns worktree setup; prefer the native `EnterWorktree` tool over `git worktree add`.
- After creating a worktree, copy `.env` and `.env.local` from the repo root into it if they exist. Never overwrite a file already there. Neither the native tool nor the skill does this, and its absence breaks the new worktree silently.

## Testing
- Default to TDD: write a failing test first, then implement (applies to new features and bug fixes)
- Use `setup-testing` skill to bootstrap test infrastructure; use `superpowers:test-driven-development` for day-to-day TDD cycles
- Test critical paths and edge cases
- Simple, maintainable tests over high coverage
- Don't over-test trivial code
- Tests document expected behavior
- Testing proportional to risk

## Specs
- After generating a spec/design doc, open it with the `plan-explorer` skill

## Security
- Validate input at boundaries
- Never commit secrets or credentials
- Consider OWASP Top 10
- Error handling without leaking implementation details
- Secure defaults

## Code Review
- Correctness, clarity, security first
- Challenge unnecessary complexity
- Verify tests cover new functionality
- Check performance impact
- Align with project goals

## Abbreviations
- DCAC = "Don't change any code"
# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.
