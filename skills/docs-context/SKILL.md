---
name: context-manager
description: Manage conversation context, document state, and shared information. Maintain consistent understanding across multiple work sessions. Use to prevent context loss and ensure coherent multi-step workflows.
---

# Context Manager

## Purpose

Maintain, organize, and transfer conversation context effectively. Ensure information isn't lost between work sessions, coordinate shared state across multiple parallel workflows, and keep documentation synchronized with actual codebase state.

## When to Use This Skill

Use this skill when:
- Starting new work session (load context from previous sessions)
- Documenting decisions for future reference
- Coordinating changes across multiple files/modules
- Handing off work to different agent or person
- Tracking state changes during complex multi-step tasks
- Context exceeds token limits (need to compress/archive)
- Work pauses and resumes later

**Do NOT use for:**
- Simple single-step tasks
- Code implementation (use task-specific skills)
- Real-time editing (use direct code tools)
- Short tasks completing in single session
- Documenting obvious or trivial changes
- Creating documentation that won't be referenced

**If uncertain:** Use this skill when work spans multiple sessions or requires coordination across parallel efforts. Skip for quick, contained tasks.

## Process

### Step 1: Assess Current Context State

Check what context exists:

```bash
# Check for task list
ls -la ~/.claude/sessions/ 2>/dev/null
cat ~/.claude/sessions/current-task.md 2>/dev/null

# Check for decision log
ls -la docs/DECISIONS.md 2>/dev/null

# Check for state documentation
ls -la docs/STATE.md 2>/dev/null
```

### Step 2: Document Current State

Before pausing work, create context snapshot:

```markdown
# Work Session Context: [Date/Time]

## Current Objective
[What are we trying to accomplish?]

## Progress So Far
- [What's been completed]
- [What's in progress]
- [What's blocked]

## Key Decisions Made
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

## Files Modified
- [file1.py]: [Changes made]
- [file2.md]: [Changes made]

## Next Steps
1. [Immediate next action]
2. [Follow-up action]
3. [Final validation]

## Open Questions
- [What needs clarification?]
- [What needs user input?]

## Assumptions Made
- [Assumption 1]: [Why we made it]
- [Assumption 2]: [Why we made it]

## Context for Next Session
- [What to know before resuming]
- [Files to read first]
- [Dependencies to verify]
```

### Step 3: Load and Review Previous Context

When resuming work:

```bash
# Find previous session notes
find docs -name "*-context.md" -o -name "STATE.md" | sort -r | head -5

# Read most recent
cat [most recent file]
```

Extract:
- Current objective
- What's completed/blocked
- Key decisions
- Next steps
- Open questions

### Step 4: Synchronize with Actual State

Compare documented state with actual codebase:

```bash
# Check git status to see what changed
git status

# Review recent commits
git log --oneline -20

# If major divergence, update documentation
```

Update context if:
- Files were modified differently than documented
- Decisions changed based on new information
- Blockers were resolved
- New issues discovered

### Step 5: Coordinate Multi-Step Workflows

For complex tasks spanning multiple steps:

```markdown
# Multi-Step Workflow: [Task Name]

## Phase 1: [Name]
- [ ] Step 1.1: [Action]
- [ ] Step 1.2: [Action]
- Dependencies: [What must complete first]

## Phase 2: [Name]
- [ ] Step 2.1: [Action]
- [ ] Step 2.2: [Action]
- Dependencies: [What must complete first]

## Handoff Points
- After Phase 1: [What to verify before proceeding]
- After Phase 2: [What to verify before proceeding]

## Context to Maintain
- [Shared state between phases]
- [Files to keep in sync]
- [Decisions affecting later phases]
```

## Context Organization

### Session Notes
Store in: `docs/sessions/YYYY-MM-DD-hhmm-description.md`

**Purpose:** Record what happened in a specific work session
**Lifespan:** Keep for reference, archive after completion
**Key content:** Progress, decisions, blockers, next steps

### Decision Log
Store in: `docs/DECISIONS.md`

**Purpose:** Document all major decisions and rationale
**Lifespan:** Permanent (append-only)
**Key content:** Decision, alternatives considered, chosen approach, rationale

### State Snapshot
Store in: `docs/STATE.md`

**Purpose:** Track current state of project at key checkpoints
**Lifespan:** Updated as state changes
**Key content:** Completed work, in-progress items, known issues

## Response Pattern

When asked to manage context:

```
**Current State:**
- Completed: [list]
- In Progress: [list]
- Blocked: [list]

**Key Context:**
- [Important decision]
- [File state]
- [Configuration]

**Next Steps:**
1. [What to do]
2. [What to do]

**To Resume Later:**
1. Read: [key files]
2. Check: [state files]
3. Verify: [assumptions]
```

## Examples

### Example: Complex Feature Implementation

**Initial Session Context:**
```markdown
# Brainstorming Analytics Feature - Feb 15

## Objective
Add SQL query builder to analytics dashboard

## Progress
- [x] Read project requirements
- [x] Identified tech stack (DuckDB + FastAPI)
- [ ] Design query builder UI
- [ ] Implement query execution
- [ ] Add result display

## Decisions
- Using DuckDB for in-process SQL execution
- Query builder will be React component
- Results will cache for 5 minutes

## Files Touched
- docs/REQUIREMENTS.md: Read only
- design/query-builder-wireframe.md: Created

## Next Session
Should start with UI design. SQL execution can leverage existing DuckDB integration in analytics-agent.
```

**Resume Session (Next Day):**
```
Read previous context from docs/sessions/2026-02-15-analytics.md

Verify:
- DuckDB dependency still available
- Previous decision still valid
- No conflicting changes in main branch

Continue with: "Start UI design for query builder"
```

### Example: Coordinating Parallel Changes

**Shared State Document:**
```markdown
# Coordinating: Auth Refactor + API Update

## Shared Dependencies
- models/user.py: Being modified by both tasks
- api/routes.py: Needs updates from both

## Task 1: Auth Refactor
- [ ] Update User model
- [ ] Update auth endpoints
- Blocks: Task 2 (needs new User schema)

## Task 2: API Update
- [ ] Update route signatures
- [ ] Update response schemas
- Blocked by: Task 1 (needs updated User model)

## Sync Points
- After Task 1 done: Task 2 can review updated User model
- After Task 2 done: Both merged to main
```

## Integration with Development

This skill coordinates with:
- **dev-workflow-test-driven**: Document what tests verify
- **review-plan**: Load context before reviewing plans
- **dev-workflow-debug**: Maintain state as debugging progresses
- **project-inception**: Load context from planning phase
- **docs-manager**: Coordinate context documentation with project docs

## Common Pitfalls to Avoid

**Don't:**
- Lose context by not documenting before pausing
- Assume state hasn't changed (always verify)
- Create context documents and never use them
- Over-document trivial work (causes clutter)
- Forget to update context when direction changes

**Do:**
- Create context checkpoint before long pauses
- Sync documented state with actual codebase
- Review previous context before resuming work
- Update decisions as new information arrives
- Archive completed context for historical reference
