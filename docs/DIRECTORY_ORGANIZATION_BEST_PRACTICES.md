# Claude Code Directory Organization Best Practices

**Compiled:** 2026-02-15
**Purpose:** Guidelines for organizing the `.claude` directory structure effectively

## Executive Summary

Your current `.claude` directory has overlapping concepts (agents, skills, commands) that create confusion. Modern Claude Code best practices (2026) consolidate these into a cleaner **Skills-first** architecture where commands and agents are just different invocation patterns for skills.

## Current State Analysis

### Your Current Structure
```
~/.claude/
├── agents/           # 8 agent files (review-code, merge-request-writer, etc.)
├── commands/         # 4 command files (commit, mr, qa-steps, humanize)
├── skills/           # 12 skill directories (TDD, deep-research, etc.)
├── projects/         # Project-specific memory
├── plans/            # Saved implementation plans
├── CLAUDE.md         # Global instructions
└── settings.json     # Configuration
```

### Problems Identified

1. **Concept Overlap**: Commands in `/commands/` duplicate skills in `/skills/` (e.g., both have "commit" functionality)
2. **Inconsistent Naming**: Some agents use prefixes (`reviewer-*`), others don't
3. **Unclear Boundaries**: When to use agents vs skills vs commands?
4. **Flat Organization**: Skills aren't grouped by domain/purpose
5. **Legacy Structure**: Using older patterns that have been superseded

## Best Practices (2026)

### 1. Skills-First Architecture

**Key Principle**: Skills are the primary building block. Commands and agents are just invocation mechanisms.

From the [Claude Code documentation](https://code.claude.com/docs/en/skills):
> "A file at `.claude/commands/review.md` and a skill at `.claude/skills/review/SKILL.md` both create `/review` and work the same way."

**Recommendation**: Migrate everything to skills. Delete `/commands/` and `/agents/` directories.

### 2. Skill Organization Patterns

**Pattern 1: Domain-Based Organization**
```
~/.claude/skills/
├── development/
│   ├── test-driven-development/
│   ├── systematic-debugging/
│   └── code-review/
├── git/
│   ├── commit/
│   ├── merge-request/
│   └── git-worktrees/
├── documentation/
│   ├── writing-docs/
│   └── readme-generator/
└── research/
    ├── deep-research/
    └── getting-the-bigger-picture/
```

**Pattern 2: Flat with Prefixes** (recommended for your setup)
```
~/.claude/skills/
├── dev-tdd/
├── dev-debugging/
├── dev-code-review/
├── git-commit/
├── git-mr/
├── git-worktrees/
├── docs-writing/
├── research-best-practices/
└── research-bigger-picture/
```

From [Daniel Miessler's guide](https://danielmiessler.com/blog/when-to-use-skills-vs-commands-vs-agents):
> "Skills = Domain containers, Workflows = Task procedures, Agents = Parallel workers"

### 3. CLAUDE.md Best Practices

From [Builder.io's guide](https://www.builder.io/blog/claude-md-guide) and [Claude's official blog](https://claude.com/blog/using-claude-md-files):

**Keep it Concise**:
- Frontier models handle ~150-200 instructions consistently
- Every word in CLAUDE.md consumes context window
- Less room for actual task work

**Essential Sections**:
1. **Tech Stack** (what you're using)
2. **Project Structure** (where things are)
3. **Development Commands** (how to run/test/build)
4. **Code Style Preferences** (how to write code)
5. **Workflow Rules** (git, testing, deployment)

**What NOT to Include**:
- Verbose explanations
- Information Claude can infer from code
- Duplicate information
- Long examples (link to examples instead)

**Multi-Level CLAUDE.md**:
From [official best practices](https://code.claude.com/docs/en/best-practices):
> "CLAUDE.md files in subdirectories are automatically picked up when Claude works in that part of the codebase."

Structure for monorepos:
```
~/projects/project/
├── CLAUDE.md                          # Project overview
├── libs/
│   └── core/
│       └── CLAUDE.md                  # Library-specific context
└── apps/
    └── ui/
        ├── frontend/
        │   └── CLAUDE.md              # Frontend-specific
        └── backend/
            └── CLAUDE.md              # Backend-specific
```

### 4. Skills vs Commands vs Agents

From [Young Leaders Tech](https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins):

**Skills**:
- Folders with `SKILL.md` + supporting scripts
- Can be invoked by user (`/skill-name`) OR Claude automatically
- Can bundle deterministic code
- Best for: Reusable workflows with context

**Commands** (legacy, now just skills):
- Simple markdown files in `.claude/commands/`
- User-invoked only
- Migration path: Move to `.claude/skills/command-name/SKILL.md`

**Agents**:
- Defined in `.claude/agents/` OR as skills
- Used for parallel work or read-heavy operations
- Best for: Background tasks, multiple concurrent operations

**Modern Approach**: Everything is a skill. Use frontmatter to control invocation:
```yaml
---
name: commit
description: Write commit message for staged changes
invocation: user-only  # or 'auto' for Claude to invoke
---
```

### 4.1 Decision Matrix: When to Use Each Pattern

| Pattern | Use When | Example |
|---------|----------|---------|
| **Single SKILL.md** | Simple, sequential workflow <br> < 200 lines <br> Single concern | `git-commit/SKILL.md` <br> `setup-langfuse/SKILL.md` |
| **Skill + Subagents** | Multiple independent concerns <br> Benefits from parallelization <br> Each concern is substantial | `dev-code-review/` <br> (security, naming, etc.) |
| **Skill + Scripts** | Needs deterministic code <br> External tool integration <br> Data processing | `analytics/` with Python scripts |
| **Nested Skills** | Hierarchical workflows <br> Optional sub-workflows | `deployment/` with `deployment/staging/`, `deployment/prod/` |

**Anti-Pattern**: Don't create subagents for simple tasks
```bash
# ❌ BAD: Over-engineering
skills/git-commit/
├── SKILL.md
└── subagents/
    ├── check-staged.md
    ├── generate-message.md
    └── format-output.md

# ✅ GOOD: Keep it simple
skills/git-commit/
└── SKILL.md
```

### 5. Project-Specific Memory

From [ClaudeLog FAQs](https://claudelog.com/faqs/what-is-working-directory-in-claude-code/):

**Auto Memory** (new feature):
- Persistent directory at `~/.claude/projects/<project-path>/memory/`
- `MEMORY.md` loaded into system prompt (keep under 200 lines)
- Topic files for detailed notes (`debugging.md`, `patterns.md`)

**Best Practices**:
- Save patterns confirmed across multiple sessions
- Store architectural decisions and project structure
- Record user preferences for workflow
- DON'T save session-specific context
- DON'T save speculative or unverified conclusions

## Recommended Migration Plan

### Phase 1: Consolidate to Skills

**1. Migrate Commands → Skills**
```bash
# For each command in .claude/commands/
mkdir -p ~/.claude/skills/git-commit
mv ~/.claude/commands/commit.md ~/.claude/skills/git-commit/SKILL.md

# Add frontmatter to SKILL.md
cat > ~/.claude/skills/git-commit/SKILL.md << 'EOF'
---
name: commit
description: Write commit message for staged changes
---
Write a commit message for the staged changes (`git diff --cached`).
Use conventional commit format. Subject line under 50 chars.
EOF
```

**2. Migrate Agents → Skills**
```bash
# Review agents - these might be legitimate subagents
# Check if they're called by other skills/agents
# If standalone, convert to skills

mkdir -p ~/.claude/skills/code-review
mv ~/.claude/agents/review-code.md ~/.claude/skills/code-review/SKILL.md
```

**3. Organize by Domain**
```bash
# Use prefixes for flat structure (easier to navigate)
~/.claude/skills/
├── dev-tdd/              # Development: TDD
├── dev-debugging/        # Development: Debugging
├── dev-code-review/      # Development: Code Review
├── git-commit/           # Git: Commit
├── git-mr/               # Git: Merge Request
├── git-worktrees/        # Git: Worktrees
├── setup-langfuse/       # Setup: Langfuse
├── setup-logging/        # Setup: Logging
├── research-practices/   # Research: Best Practices
└── research-context/     # Research: Bigger Picture
```

### Phase 2: Optimize CLAUDE.md

**Current Issues**:
- Too verbose (uses full sentences for simple points)
- Mixes global and project-specific
- Could be more concise

**Recommended Structure**:

**Global** (`~/.claude/CLAUDE.md`):
```markdown
# Global Claude Code Settings

## Defaults
- **Language**: Python | **Package Manager**: uv
- **Testing**: pytest (minimal, focused)
- **Style**: PEP 8, clean, concise

## Git
- Conventional commits (feat/fix/docs/refactor/chore/test)
- Single-line commit messages only
- Atomic commits
- Never mention Claude/Claude Code in commits

## Code Preferences
- Clarity over cleverness
- Small, single-purpose functions
- Comments explain "why", not "what"
- Self-documenting code preferred

## Abbreviations
- DCAC = Don't change any code
- AA = Analytics Agent (context-dependent)
```

**Project-Specific** (`~/projects/project/CLAUDE.md`):
```markdown
# Project - AI Analytics Platform

## Structure
- **Monorepo**: uv workspace with Python libs + React frontend
- **libs/**: Core functionality (core, agents, models, etc.)
- **apps/**: UI (React/TypeScript frontend + FastAPI backend)
- **mcp/**: Standalone MCP servers (analytics, RAG, SAP)

## Tech Stack
- **Backend**: Python 3.13+, FastAPI, LlamaIndex, AWS Bedrock
- **Frontend**: React 18, TypeScript, Webpack 5, TailwindCSS 4
- **Data**: Qdrant (vectors), DuckDB (analytics)
- **Observability**: Langfuse

## Commands
**Python**: `uv sync --all-extras` | `cd libs/core && uv sync`
**Frontend**: `cd apps/ui/frontend && npm start`
**MCP**: `cd mcp/analytics-agent && uv run src/analytics_agent/server.py`

## Patterns
- Workspace dependencies via path references
- Async/await patterns throughout
- Type hints required
- Absolute imports for workspace packages
```

### Phase 3: Clean Up Structure

**Delete**:
```bash
rm -rf ~/.claude/commands/      # Migrated to skills
rm -rf ~/.claude/debug/         # Internal Claude Code data (can be cleaned)
rm -rf ~/.claude/plugins/cache/ # Can rebuild if needed
```

**Keep & Restructure**:
```bash
~/.claude/
├── skills/           # All capabilities (including subagents)
├── projects/         # Per-project memory
├── plans/            # Saved plans
├── CLAUDE.md         # Global settings
└── settings.json     # Configuration
```

**Note on Agents**: Don't delete the `/agents/` directory entirely. Some agents (like specialized reviewers) should become **subagents** within their parent skill's directory.

## Pattern: Skills with Subagents (Hybrid Architecture)

**When to Use:**
- Skill has multiple independent concerns that can run in parallel
- Each concern is complex enough to warrant its own file
- You want single user invocation but parallel execution

**Example: Code Review System**

```
skills/dev-code-review/
├── SKILL.md                    # Orchestrator (user invokes this)
└── subagents/                  # Parallel workers
    ├── security.md             # Security vulnerabilities
    ├── naming.md               # Naming quality
    ├── simplicity.md           # Best practices & simplification
    ├── comments.md             # Comment quality
    └── plan.md                 # Plan review (if applicable)
```

**Orchestrator Pattern** (`dev-code-review/SKILL.md`):
```markdown
---
name: code-review
description: Reviews uncommitted code for quality, security, naming, and simplicity
---

## Step 1: Get Changes
git diff HEAD

## Step 2: Launch Parallel Reviews
Use Task tool to launch subagents in parallel:
- @dev-code-review/subagents/security
- @dev-code-review/subagents/naming
- @dev-code-review/subagents/simplicity
- @dev-code-review/subagents/comments

## Step 3: Compile Results
Merge all findings into single report...
```

**Subagent Pattern** (`dev-code-review/subagents/security.md`):
```markdown
---
name: reviewer-security
description: Security-focused code reviewer
tools: Read, Grep
---

Check for: SQL injection, XSS, command injection, hardcoded secrets...

Return JSON:
{
  "findings": [
    {"id": "SEC-001", "severity": "critical", ...}
  ]
}
```

**Benefits:**
- Single invocation: `/code-review`
- Parallel execution: 4x faster than sequential
- Modular: Edit one reviewer without touching others
- Testable: Can test each reviewer independently
- Scalable: Easy to add new reviewers

## Recommended Final Structure

```
~/.claude/
├── CLAUDE.md                          # Global preferences
├── settings.json                      # Claude Code config
├── settings.local.json                # Local overrides
├── skills/                            # All capabilities
│   ├── dev-tdd/
│   │   └── SKILL.md
│   ├── dev-debugging/
│   │   └── SKILL.md
│   ├── dev-code-review/               # ⭐ Hybrid: Skill + Subagents
│   │   ├── SKILL.md                   # Orchestrator
│   │   └── subagents/
│   │       ├── security.md
│   │       ├── naming.md
│   │       ├── simplicity.md
│   │       └── comments.md
│   ├── git-commit/
│   │   └── SKILL.md
│   ├── git-mr/
│   │   └── SKILL.md
│   ├── setup-langfuse/
│   │   └── SKILL.md
│   └── research-practices/
│       └── SKILL.md
├── projects/                          # Per-project context
│   └── -Users-user-projects-project/
│       └── memory/
│           └── MEMORY.md
└── plans/                             # Implementation plans
    └── *.md
```

## Implementation Checklist

- [ ] **Backup current structure**: `cp -r ~/.claude ~/.claude.backup`
- [ ] **Audit skills**: List all current commands/agents/skills
- [ ] **Create migration mapping**: Document old → new names
- [ ] **Migrate commands**: Move to skills with frontmatter
- [ ] **Migrate agents**: Determine if subagents or skills
- [ ] **Reorganize skills**: Apply consistent naming (prefix-based)
- [ ] **Optimize CLAUDE.md**: Reduce verbosity, split global/project
- [ ] **Test skills**: Verify `/skill-name` works for each
- [ ] **Clean up**: Remove old directories
- [ ] **Document**: Update any personal notes about structure

## Key Principles Summary

1. **Skills-first**: Everything is a skill (commands/agents are invocation patterns)
2. **Flat + Prefixes**: Easier to navigate than deep nesting
3. **Concise CLAUDE.md**: Every word matters for context
4. **Separate Concerns**: Global vs project-specific vs per-directory
5. **Auto Memory**: Let Claude build project memory over time
6. **Evolution**: Structure should evolve with usage

## References

- [Best Practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Extend Claude with Skills](https://code.claude.com/docs/en/skills)
- [Using CLAUDE.MD Files](https://claude.com/blog/using-claude-md-files)
- [How to Write a Good CLAUDE.md](https://www.builder.io/blog/claude-md-guide)
- [Skills vs Commands vs Agents](https://danielmiessler.com/blog/when-to-use-skills-vs-commands-vs-agents)
- [Understanding Claude Code Building Blocks](https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins)
- [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Claude Code Best Practices 2026](https://notes.muthu.co/2026/02/claude-code-cli-best-practices-checklist/)
- [Claude Code Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/)
- [Creating the Perfect CLAUDE.md](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
