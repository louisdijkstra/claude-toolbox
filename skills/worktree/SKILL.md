---
name: worktree
description: Manage git worktrees for parallel development. Use when the user wants to start work on a ticket, switch between parallel tasks, push/ship work from a worktree, clean up finished worktrees, or asks about worktree lifecycle.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
argument-hint: [new|co|ls|rm|cleanup|status] [name]
---

# Git Worktree Manager

You manage the full lifecycle of git worktrees for parallel development across any project.

## Lifecycle: CREATE → WORK → SHIP → CLEANUP

### Phase 1: CREATE

**Detect the base branch** (unless the user specifies one). Check in order: `dev`, `develop`, `main`, `master`. Use the first one that exists:
```bash
for branch in dev develop main master; do
  git rev-parse --verify "$branch" >/dev/null 2>&1 && echo "$branch" && break
done
```
Always tell the user which base branch you're using: "Using `dev` as base branch."
If none exist, ask the user.

**Fetch before branching** — before creating a new branch, offer to fetch or warn the user that the base branch may be stale:
```bash
git fetch origin <base-branch>
```

**New ticket (new branch):**
```bash
git worktree add .worktrees/<name> -b <branch-name> <base-branch>
```

**Existing branch:**
```bash
git fetch origin
git worktree add .worktrees/<name> <existing-branch>
```
If you get "already checked out", run `git worktree prune` first and retry.

**After creation:**
- Copy `.env` and `.env.local` from repo root if they exist (never overwrite existing)
- Tell the user: the worktree path, the branch name, and how to cd into it
- Ensure `.worktrees/` is in the project's `.gitignore` — if not, warn the user and offer to add it

### Phase 2: WORK

Nothing special. The worktree is a normal git checkout. All regular git commands work.
Commits, staging, diffs — everything is standard.

### Phase 3: SHIP

When the user says "push this", "create MR/PR", or "ship it":
```bash
git push -u origin HEAD
```
Then help create the MR/PR if asked. Remind the user they can now clean up the worktree.

### Phase 4: CLEANUP

**Remove a single worktree:**
1. Check for uncommitted changes first — warn and ask for confirmation if dirty
2. `git worktree remove .worktrees/<name>`
3. Ask if they want to delete the branch: `git branch -d <branch>` (safe delete only, never `-D`)

**Bulk cleanup (merged branches):**
1. List all worktrees in `.worktrees/`
2. For each, check if its branch is merged into the base branch
3. Show the list and ask for confirmation before removing

**Prune stale references:**
```bash
git worktree prune
```

## Commands (when invoked as /worktree)

Parse `$ARGUMENTS` as:

| Input | Action |
|---|---|
| `new <name> [base]` | Create worktree with new branch. Name is used for both directory and branch unless user specifies differently. |
| `co <branch> [name]` | Create worktree for existing branch. Directory name defaults to branch with slashes replaced by dashes. |
| `ls` or `list` | List all worktrees with branch, status (clean/dirty), ahead/behind. |
| `rm <name>` or `remove <name>` | Safely remove worktree. Check for changes first. |
| `cleanup` | Remove all worktrees whose branches are merged. |
| `status [name]` | Detailed status: uncommitted changes, recent commits. |
| (empty) | Show help summary of available commands. |

## Safety Rules

- **NEVER** use `git branch -D` (force delete). Always `-d` (safe delete).
- **NEVER** remove a worktree with uncommitted changes without explicit user confirmation.
- **NEVER** force-remove or force-checkout. If something fails, diagnose and explain.
- **ALWAYS** check `git worktree list` before creating, to avoid conflicts.
- **ALWAYS** run `git worktree prune` if you encounter stale reference errors.
- The shared stash is a trap: all worktrees share the same stash. Don't use `git stash` in worktrees — commit or discard instead.

## Branch Naming

Do not enforce a prefix. Use whatever the user provides or whatever convention the project follows. If the user says "work on PROJ-123", use `PROJ-123` as the branch name. If they say "create feature/auth-fix", use `feature/auth-fix`. Follow the user's lead.

## Helper Script

A shell script is available at `${CLAUDE_SKILL_DIR}/scripts/wt.sh`. You can run commands from it, or the user can source it in their shell for tab-completed `wt` commands:

```bash
source ~/.claude/skills/worktree/scripts/wt.sh
```

## Notes

- Worktrees live in `.worktrees/` at the repo root
- Each worktree is a full working copy — independent staging area, independent HEAD
- All worktrees share: the object database, refs, stash, and hooks
- `git worktree remove` cleans the directory and git reference but NEVER deletes the branch
