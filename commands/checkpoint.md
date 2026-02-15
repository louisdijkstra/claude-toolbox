---
description: Create or verify a checkpoint in your workflow. Track progress and enable rollback to known-good states.
---

# Checkpoint Command

This command creates and manages workflow checkpoints.

## Usage

`/checkpoint [create|verify|list] [name]`

## What This Command Does

1. **Create Checkpoint** - Save current state as named checkpoint
2. **Verify Checkpoint** - Compare current state to checkpoint
3. **List Checkpoints** - Show all saved checkpoints

## Create Checkpoint

When creating a checkpoint:

1. Run quick verification to ensure current state is clean
2. Create git commit or stash with checkpoint name
3. Log checkpoint to `.claude/checkpoints.log`:

**Language Style for Checkpoint Messages:**
- Use natural, simple, informal language
- Write like you're talking to a teammate
- Be direct and clear
- Example: "auth working" not "authentication subsystem successfully implemented"

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. Report checkpoint created

Example:
```
/checkpoint create "feature-auth-complete"

✓ Checkpoint created: feature-auth-complete
  Time: 2026-02-15 14:30
  Commit: a3b2c1d
  Status: All tests passing, build successful
```

## Verify Checkpoint

When verifying against a checkpoint:

1. Read checkpoint from log
2. Compare current state to checkpoint:
   - Files added since checkpoint
   - Files modified since checkpoint
   - Test pass rate now vs then
   - Coverage now vs then
   - Build status

3. Report comparison:

```
CHECKPOINT COMPARISON: feature-auth-complete
============================================
Created: 2026-02-15 14:30 (2 hours ago)
Commit: a3b2c1d → e4f5g6h

Changes Since Checkpoint:
- Files changed: 12
- Tests: +5 passed / -0 failed
- Coverage: +2.3% (now 87.5%)
- Build: PASS

Status: ✓ Progress maintained, no regressions
```

## List Checkpoints

Show all checkpoints with:
- Name
- Timestamp
- Git SHA
- Status (current, behind, ahead)

```
/checkpoint list

CHECKPOINTS
===========
✓ feature-auth-complete    2026-02-15 14:30  a3b2c1d  [2 commits behind]
✓ api-v2-milestone         2026-02-14 16:45  x9y8z7w  [15 commits behind]
→ feature-start            2026-02-14 09:00  m1n2o3p  [current]

Total: 3 checkpoints
```

## Workflow

Typical checkpoint flow:

```
[Start] → /checkpoint create "feature-start"
  |
[Implement Core] → /checkpoint create "core-done"
  |
[Add Tests] → /checkpoint verify "core-done"
  |
[Refactor] → /checkpoint create "refactor-done"
  |
[PR Ready] → /checkpoint verify "feature-start"
```

## Use Cases

**During Development:**
- Save progress before risky refactoring
- Mark feature milestones
- Track test coverage improvements
- Document stable states

**Before Deployment:**
- Verify against last stable checkpoint
- Ensure no regressions since milestone
- Confirm test coverage maintained

**After Issues:**
- Compare to last known-good state
- Identify what changed since stable checkpoint
- Plan rollback if needed

## Arguments

- `create <name>` - Create named checkpoint
- `verify <name>` - Verify against named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keeps last 5)

## Integration with Other Commands

- Use `/checkpoint create` after `/review` passes
- Use `/checkpoint verify` before `/mr` creation
- Use `/flow` with checkpoints at stage boundaries

## Storage

Checkpoints are logged in:
- `.claude/checkpoints.log` - Checkpoint metadata
- Git commits/stashes - Actual code states
