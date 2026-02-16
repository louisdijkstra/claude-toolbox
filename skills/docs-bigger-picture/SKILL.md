---
name: getting-the-bigger-picture
description: Provides project context (goals, users, architecture, constraints) to all agents by reading docs/
---

# Getting the Bigger Picture

## Purpose

Provide comprehensive project context to ensure informed decision-making. Reads project documentation to extract goals, users, architecture, constraints, and current status. Prevents decisions made in isolation without understanding broader project context.

## When to Use This Skill

Use this skill when:
- Starting work on unfamiliar codebase
- Making architectural decisions
- Evaluating technical approaches
- Planning new features
- Need to understand project constraints
- Assessing scope or feasibility

**Do NOT use for:**
- Projects with no documentation (create docs first)
- Reading specific code implementation details (use code reading tools)
- Understanding code patterns (use dev-workflow-patterns)
- Debugging specific issues (use dev-workflow-debug)
- When project context is already well-understood
- For every minor task or question

**If uncertain:** Use this skill when making decisions that could be affected by project goals, scale, budget, or architecture. Skip when working on well-understood isolated tasks.

## Process

### Step 1: Locate Project Documentation

```bash
# Find project root (look for docs/ directory)
find . -maxdepth 3 -type d -name "docs" 2>/dev/null | head -1
```

### Step 2: Read Core Documents

Read in this order:
1. `docs/PROJECT_OVERVIEW.md` - Goals, users, constraints
2. `docs/ARCHITECTURE.md` - Technical architecture
3. `docs/TECH_STACK.md` - Technology choices
4. `docs/DEPLOYMENT.md` - Deployment strategy

### Step 3: Extract Key Information

**Project Goals:**
- Primary objective
- Success criteria
- Timeline

**Users & Scale:**
- Target users (type, count)
- Expected requests/day
- Data volume

**Constraints:**
- Budget (infrastructure, team)
- Technical stack
- Compliance requirements

**Architecture:**
- System design
- Key components
- Data flow

### Step 4: Return Summary

Format:
```
Project: [Name]
Goal: [1 sentence]
Users: [type and scale]
Budget: [constraints]
Tech Stack: [key technologies]
Architecture: [2-3 sentence summary]
Deployment: [strategy]
Status: [current features/phase]
```

## Example Output

```
Project: Personal Finance Tracker
Goal: Help users categorize expenses and track spending with ML
Users: Personal use, 1-10 users initially
Budget: $0/month infrastructure (local first)
Tech Stack: FastAPI, React, SQLite, Docker Compose
Architecture: REST API backend with React SPA, SQLite for data persistence, local-first with cloud migration path
Deployment: Docker Compose for local dev, easy PostgreSQL + AWS migration
Status: MVP - basic expense tracking complete, working on ML categorization
```

## Response Pattern

When providing project context:

```
**Project**: [Name]

**Goal**: [1-2 sentence primary objective]

**Users & Scale**:
- [User type]: [Expected volume]
- [Requests/day or data size]

**Constraints**:
- Budget: [Infrastructure/team constraints]
- Technical: [Required stack or limitations]
- Compliance: [Requirements if any]

**Architecture**:
[2-3 sentence high-level design]

**Deployment**:
[Strategy and environment]

**Current Status**:
[What's working, what's in progress]

**Key Considerations for This Task**:
- [Relevant constraint or pattern]
- [Relevant goal or requirement]
```

## Error Handling

If docs don't exist:
1. Check for README.md
2. Check for CLAUDE.md
3. Return: "No project docs found. Create docs/PROJECT_OVERVIEW.md to provide context."

## Integration with Development

This skill coordinates with:
- **project-inception**: Creates initial project documentation
- **docs-manager**: Maintains and updates project documentation
- **dev-workflow-flow**: Loads context at start of work sessions
- **review-plan**: Validates plans against project constraints
- **research-deep**: Ensures research aligns with project needs

## Common Pitfalls to Avoid

**Don't:**
- Make architectural decisions without reading project context
- Assume project scale or constraints
- Ignore documented constraints or requirements
- Use outdated cached context (always re-read docs)
- Skip reading docs because task seems simple
- Propose solutions that violate documented constraints

**Do:**
- Read project docs before making architectural decisions
- Verify assumptions against documented reality
- Consider project scale when proposing solutions
- Respect documented budget and technical constraints
- Update project docs when reality changes
- Share context with other agents working on same project
