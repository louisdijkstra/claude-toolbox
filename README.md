# Claude Code Configuration

Production-ready configuration for Claude Code CLI with skills, agents, hooks, and MCP integrations. Provides structured workflows for development, review, debugging, and deployment.

## Features

- **23 Production Skills** - Structured workflows for common development tasks
- **15 Shorthand Commands** - Quick access to frequently used skills
- **11 Specialized Agents** - Multi-tier code review and automation
- **Event-Driven Hooks** - Automated workflows for session management
- **15 MCP Integrations** - Package registries, docs, deployment tools
- **Context Management** - Persistent memory and conversation state
- **Development Philosophy** - Clear principles for code quality and simplicity

## Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.com/code) installed
- Node.js 22+ (for hooks)
- Git configured

### Installation

1. **Clone or copy this repository to `~/.claude`**:
   ```bash
   # If starting fresh
   git clone <your-repo-url> ~/.claude

   # Or if you have existing config, back it up first
   mv ~/.claude ~/.claude.backup
   git clone <your-repo-url> ~/.claude
   ```

2. **Install hook dependencies**:
   ```bash
   cd ~/.claude/hooks
   npm install  # If package.json exists
   ```

3. **Configure MCPs** (optional but recommended):

   Edit `~/.claude.json` (user-level config) to add MCP servers:
   ```bash
   # See docs/phase-2-mcp-configuration-guide.md for full instructions
   vi ~/.claude.json
   ```

4. **Set up API keys** (if using external MCPs):
   ```bash
   # GitHub
   export GITHUB_TOKEN="your-token"

   # Other services as needed (Supabase, Firecrawl, etc.)
   ```

5. **Restart Claude Code**:
   ```bash
   # Restart to load configuration
   claude-code
   ```

### Verification

Check that everything loaded correctly:

```bash
# In Claude Code session
/help

# Should show all available skills and commands
```

## Directory Structure

```
~/.claude/
├── README.md                   # This file
├── CLAUDE.md                   # Global development guidelines
├── settings.json               # User preferences and MCP config
├── .gitignore                  # Version control exclusions
│
├── skills/                     # 23 structured workflow skills
│   ├── README.md              # Skills catalog and usage guide
│   ├── dev-flow/              # Daily development workflow
│   ├── test-driven-development/  # TDD workflow
│   ├── review-system/         # Multi-tier code review
│   ├── systematic-debugging/  # Structured debugging
│   └── ... (19 more)
│
├── commands/                   # 15 shorthand command aliases
│   ├── flow.md               # → dev-flow skill
│   ├── tdd.md                # → test-driven-development skill
│   ├── review.md             # → review-system skill
│   ├── debug.md              # → systematic-debugging skill
│   └── ... (11 more)
│
├── agents/                     # 11 specialized review agents
│   ├── review-code.md        # Orchestrator for multi-tier review
│   ├── reviewer-security.md  # Security vulnerability scanning
│   ├── reviewer-performance.md  # Performance analysis
│   └── ... (8 more)
│
├── hooks/                      # Event-driven automation
│   ├── scripts/
│   │   ├── session-start.js  # Initialize session
│   │   ├── session-end.js    # Cleanup and save state
│   │   ├── pre-compact.js    # Before context compression
│   │   └── ... (4 more)
│
├── plugins/                    # Plugin marketplace integration
│   ├── config.json
│   ├── installed_plugins.json
│   └── marketplaces/
│
├── docs/                       # Documentation and guides
│   ├── mcp-quick-reference.md           # MCP overview
│   ├── phase-2-mcp-configuration-guide.md  # Setup guide
│   ├── DIRECTORY_ORGANIZATION_BEST_PRACTICES.md
│   └── examples/                        # Example configurations
│       ├── python-backend-settings.json
│       ├── frontend-react-settings.json
│       ├── fullstack-saas-settings.json
│       └── quick-prototype-settings.json
│
└── projects/                   # Project-specific overrides (gitignored)
    └── <project-path>/
        └── .claude/
            └── settings.json   # Project MCP/skill overrides
```

## Development Workflow

### 1. Starting a New Project

```bash
# Define goals and architecture
/inception

# Set up repository structure
/structuring-repository

# Begin development
/flow
```

### 2. Implementing a Feature

```bash
# Understand project context
/getting-the-bigger-picture

# Research best practices
/research

# Plan implementation
/plan

# Implement with TDD
/tdd

# Review before committing
/review
```

### 3. Fixing a Bug

```bash
# Systematic investigation
/debug

# Write failing test
/tdd

# Fix and verify
/review
```

### 4. Code Review

```bash
# Comprehensive multi-tier review
/review

# Security-focused review
/review-critically
```

### 5. Committing and Creating PRs

```bash
# Generate commit message
/commit

# Create QA documentation
/qa-steps

# Generate merge request description
/mr
```

## Skills System

23 production-ready skills organized by category:

### Context & Understanding (3 skills)
- `getting-the-bigger-picture` - Read project docs and understand context
- `pattern-discovery` - Find patterns and anti-patterns
- `deep-research` - Research best practices with 2026 validation

### Planning & Inception (4 skills)
- `determining-project-goal` - Interactive goal definition
- `project-inception` - Launch new projects
- `brainstorm-feature` - Generate feature ideas
- `plan-review-system` - Validate plans before implementation

### Development Workflows (3 skills)
- `dev-flow` - Daily development workflow
- `dev-tdd` - Accelerated TDD workflow
- `test-driven-development` - Complete TDD methodology

### Quality & Review (3 skills)
- `review-critically` - Security-focused code review
- `review-system` - Multi-tier comprehensive review
- `systematic-debugging` - Structured bug investigation

### Specialized Workflows (4 skills)
- `handle-ticket` - End-to-end ticket workflow
- `context-manager` - Conversation context management
- `docs-manager` - Documentation maintenance
- `deep-research` - Production-ready research

### Setup & Infrastructure (4 skills)
- `setting-up-anthropic-connection` - Anthropic SDK setup
- `building-langgraph-agents` - LangGraph agent development
- `setting-up-logging` - Production logging setup
- `setting-up-langfuse-for-tracing` - LLM observability

### Repository & Structure (1 skill)
- `structuring-repository` - Repository organization

### Management & Tools (1 skill)
- `uv-management` - Python package management

See [skills/README.md](skills/README.md) for detailed documentation.

## Commands (Shortcuts)

15 shorthand commands for quick access:

| Command | Skill | Purpose |
|---------|-------|---------|
| `/flow` | dev-flow | Daily development workflow |
| `/tdd` | test-driven-development | Test-driven development |
| `/debug` | systematic-debugging | Systematic debugging |
| `/review` | review-system | Comprehensive code review |
| `/research` | deep-research | Best practices research |
| `/plan` | plan-review-system | Create and validate plan |
| `/inception` | project-inception | Start new project |
| `/ticket` | handle-ticket | Handle tickets end-to-end |
| `/docs` | docs-manager | Documentation management |
| `/commit` | - | Generate commit message |
| `/mr` | - | Generate merge request description |
| `/qa-steps` | - | Generate QA testing steps |
| `/humanize` | - | Rewrite to sound human |
| `/checkpoint` | - | Create workflow checkpoint |
| `/build-fix` | - | Fix build/type errors |

## Specialized Agents

11 agents for code review and automation:

### Review System
- `review-code` - Orchestrates multi-tier review process
- `process-review` - Processes and applies review findings

### Review Tiers
- `reviewer-security` - Security vulnerability scanning
- `reviewer-performance` - Performance analysis
- `reviewer-accessibility` - WCAG compliance
- `reviewer-architecture` - Architecture and dependencies
- `reviewer-simplicity` - Code simplification
- `reviewer-naming` - Variable/function naming
- `reviewer-comments` - Comment quality
- `reviewer-testing` - Test coverage and quality
- `reviewer-error-type` - Error handling and type safety

### Utilities
- `merge-request-writer` - Generate MR descriptions

## Hooks

Event-driven automation for session management:

- `session-start.js` - Initialize session environment
- `session-end.js` - Cleanup and save state
- `pre-compact.js` - Before context compression
- `suggest-compact.js` - Suggest when to compress
- `block-dev-without-tmux.js` - Enforce tmux usage
- `block-random-md.js` - Prevent accidental file creation
- `log-pr-url.js` - Track PR creation

## MCP Configuration

15 MCP servers integrated for enhanced capabilities:

### Core 5 (Always Enabled)
1. **package-registry** - npm, PyPI, Cargo package search
2. **context7** - Semantic code search
3. **augments** - Code patterns and templates
4. **mdn-lookup** - MDN documentation
5. **magg** - Search aggregation

### Additional (Enable Per-Project)
6. **github** - GitHub API integration
7. **memory** - Persistent context across sessions
8. **sequential-thinking** - Step-by-step reasoning
9. **supabase** - Supabase integration
10. **vercel** - Vercel deployment
11. **railway** - Railway deployment
12. **firecrawl** - Web scraping
13. **cloudflare-docs** - Cloudflare documentation
14. **sentry** - Error tracking
15. **langfuse-docs** - LLM observability docs

### Per-Project Configuration

Create `.claude/settings.json` in your project to disable unused MCPs:

```json
{
  "mcpServers": {
    "vercel": {
      "disabled": true
    },
    "railway": {
      "disabled": true
    }
  }
}
```

See [docs/mcp-quick-reference.md](docs/mcp-quick-reference.md) for usage guide.

## Development Philosophy

Core principles from `CLAUDE.md`:

### Code Quality
- Clarity over cleverness
- No premature abstraction
- Replace, don't deprecate
- Prefer boring, proven technology
- Ship working code, then iterate

### Git Workflow
- Conventional commits: `type(scope): description`
- Atomic, focused commits
- Branch naming: `feature/*`, `bug/*`, `refactor/*`
- Never mention AI assistance

### Testing
- Test critical paths and edge cases
- Simple, maintainable tests
- Tests document expected behavior
- Coverage proportional to risk

### Security
- Validate at system boundaries
- Never commit secrets
- Consider OWASP Top 10
- Proper error handling

## Project-Specific Configuration

Override settings per project:

```bash
# Create project-specific config
mkdir -p /path/to/project/.claude
cp ~/.claude/docs/examples/python-backend-settings.json /path/to/project/.claude/settings.json

# Edit to disable/enable MCPs for this project
vi /path/to/project/.claude/settings.json
```

## Extending the System

### Adding a New Skill

1. Create directory: `skills/new-skill-name/`
2. Create `SKILL.md` with:
   - YAML frontmatter (name, description, category)
   - Purpose and when to use
   - How it works (stages)
   - Examples and integration points
3. Add to `skills/README.md`
4. Create command alias in `commands/` if needed

### Adding a New Command

1. Create `commands/new-command.md`
2. Follow structure from existing commands
3. Link to relevant skill or define behavior

### Adding a New Agent

1. Create `agents/agent-name.md`
2. Define purpose, tools, and process
3. Integrate with orchestrator if needed

### Adding a New Hook

1. Create `hooks/scripts/hook-name.js`
2. Follow event handler pattern
3. Test with relevant events

## Examples

Example configurations for different project types in `docs/examples/`:

- **Python Backend** - 8 MCPs for FastAPI/Django projects
- **Frontend React** - 8 MCPs for React/Next.js projects
- **Full-Stack SaaS** - 11 MCPs for comprehensive applications
- **Quick Prototype** - 6 MCPs for rapid development

## Troubleshooting

### Skills Not Loading
```bash
# Check skills directory exists
ls ~/.claude/skills/

# Restart Claude Code
```

### MCPs Not Available
```bash
# Verify MCP configuration
cat ~/.claude.json

# Check MCP server status
# Look for connection errors in Claude Code output
```

### Hooks Not Running
```bash
# Check Node.js installation
node --version

# Verify hook scripts are executable
ls -la ~/.claude/hooks/scripts/
```

## Contributing

To contribute improvements:

1. Test changes in a development branch
2. Document new features in relevant READMEs
3. Follow existing patterns and conventions
4. Keep commits focused and well-described

## License

Personal configuration - adapt as needed for your workflow.

## Version

**Current Version**: 1.0

- 23 production-ready skills
- 15 shorthand commands
- 11 specialized agents
- 7 event hooks
- 15 MCP integrations
- Full development lifecycle coverage

---

For detailed documentation, see:
- [Skills Guide](skills/README.md)
- [MCP Configuration](docs/phase-2-mcp-configuration-guide.md)
- [MCP Quick Reference](docs/mcp-quick-reference.md)
- [Directory Best Practices](docs/DIRECTORY_ORGANIZATION_BEST_PRACTICES.md)
