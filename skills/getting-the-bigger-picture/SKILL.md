---
name: getting-the-bigger-picture
description: Provides project context (goals, users, architecture, constraints) to all agents by reading docs/
---

# Getting the Bigger Picture

## Purpose
Provide comprehensive project context to ALL agents to ensure informed decision-making.

## When Invoked
Any agent can call `@getting-the-bigger-picture` to understand:
- Project goals & success criteria
- Target users & scale
- Budget constraints
- Technical architecture
- Deployment requirements
- Current features & status

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

## Error Handling

If docs don't exist:
1. Check for README.md
2. Check for CLAUDE.md
3. Return: "No project docs found. Create docs/PROJECT_OVERVIEW.md to provide context."
