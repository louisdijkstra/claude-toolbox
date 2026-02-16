# Claude Code Configuration

Production-ready configuration for Claude Code CLI with skills, agents, hooks, and MCP integrations. Provides structured workflows for development, review, debugging, and deployment.

## Features

- **30+ Production Skills** - Structured workflows for development, AI frameworks, compliance, and deployment
- **16 Shorthand Commands** - Quick access to frequently used skills
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

# Get project context
/docs

# Begin development
/flow
```

### 2. Implementing a Feature

```bash
# Understand project context
docs-bigger-picture (via Skill tool)

# Discover existing patterns
dev-workflow-patterns (via Skill tool)

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
review-critical (via Skill tool)
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

30+ production-ready skills organized by category:

### Context & Understanding (3 skills)
- `docs-bigger-picture` - Provides project context (goals, users, architecture, constraints) by reading docs/
- `dev-workflow-patterns` - Discovers how features are implemented to maintain consistency
- `research-deep` - Validates technical decisions against 2026 industry standards

### Planning & Inception (4 skills)
- `project-determine-goal` - Interactive brainstorming to define production-ready project goals
- `project-inception` - Launch new projects from scratch with proper planning and structure
- `project-brainstorm` - Generate creative and diverse feature ideas aligned with project goals
- `review-plan` - Review and validate work plans before implementation

### Development Workflows (4 skills)
- `dev-workflow-flow` - Execute efficient daily development workflow with clear stages
- `dev-workflow-tdd` - Accelerated test-driven development for rapid feature delivery
- `dev-workflow-test-driven` - Complete TDD workflow with patterns for unit, integration, and E2E tests
- `dev-workflow-debug` - Investigate and resolve complex bugs through structured analysis

### Quality & Review (2 skills)
- `review-critical` - Perform rigorous security-focused code review
- `review-system` - Execute comprehensive multi-tier code and design review process

### Specialized Workflows (3 skills)
- `project-handle-ticket` - Execute end-to-end ticket workflow from intake to delivery
- `docs-context` - Manage conversation context, document state, and shared information
- `docs-manager` - Create, maintain, and update project documentation

### AI Frameworks (5 skills)
- `ai-framework-select` - Select the best AI/LLM framework for your specific use case
- `ai-framework-setup-anthropic` - Set up and use Anthropic's Python SDK for Claude API integration
- `ai-framework-setup-langchain` - Set up LangChain (auto-routes to LangGraph when needed)
- `ai-framework-setup-pydanticai` - Set up PydanticAI for production-grade AI agents
- `ai-framework-build-langgraph` - Build production-ready stateful AI agents using LangGraph

### Setup & Infrastructure (4 skills)
- `setup-logging` - Set up production logging with FREE services and 5-minute setup
- `setup-langfuse-tracing` - Set up Langfuse v3 observability for all LLM calls
- `setup-uv` - Package and version management with uv for Python projects
- `setup-payments` - Set up secure payment processing for web and mobile platforms

### Compliance & App Store (3 skills)
- `compliance-check` - Audit AI applications for GDPR, EU AI Act, and US privacy law compliance
- `playstore-check` - Validate Android app against Google Play Store requirements
- `appstore-check` - Validate iOS/iPadOS apps against Apple App Store submission requirements

### Repository & Tools (2 skills)
- `setup-repository-structure` - Propose production-ready repository structure
- `skill-create` - Create new Claude Code skills following 2026 best practices
- `keybindings-help` - Customize keyboard shortcuts and keybindings

See [skills/README.md](skills/README.md) for detailed documentation.

## Commands (Shortcuts)

16 shorthand commands for quick access:

| Command | Skill | Purpose |
|---------|-------|---------|
| `/flow` | dev-workflow-flow | Daily development workflow |
| `/tdd` | dev-workflow-test-driven | Test-driven development |
| `/debug` | dev-workflow-debug | Systematic debugging |
| `/review` | review-system | Comprehensive code review |
| `/research` | research-deep | Best practices research |
| `/plan` | review-plan | Create and validate plan |
| `/inception` | project-inception | Start new project |
| `/ticket` | project-handle-ticket | Handle tickets end-to-end |
| `/docs` | docs-manager | Documentation management |
| `/commit` | - | Generate commit message |
| `/mr` | - | Generate merge request description |
| `/qa-steps` | - | Generate QA testing steps |
| `/humanize` | - | Rewrite to sound human |
| `/checkpoint` | - | Create workflow checkpoint |
| `/build-fix` | - | Fix build/type errors |
| `/update-docs` | - | Sync documentation with codebase |

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

**Current Version**: 2.0

- 30+ production-ready skills
- 16 shorthand commands
- 11 specialized agents
- 7 event hooks
- 15 MCP integrations
- AI framework setup automation
- Compliance and app store validation
- Full development lifecycle coverage

---

For detailed documentation, see:
- [Skills Guide](skills/README.md)
- [MCP Configuration](docs/phase-2-mcp-configuration-guide.md)
- [MCP Quick Reference](docs/mcp-quick-reference.md)
- [Directory Best Practices](docs/DIRECTORY_ORGANIZATION_BEST_PRACTICES.md)
