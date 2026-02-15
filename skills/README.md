# Claude Code Skills

This directory contains 23 skills that provide structured approaches to common development and project management tasks. Each skill is a defined workflow with clear stages, practical patterns, and integration points.

## Using Skills

Skills are invoked using the `/skill-name` syntax in Claude Code:

```
/getting-the-bigger-picture
/brainstorm-feature
/dev-flow
```

Skills can be chained together in workflows where output from one feeds into another.

## Skills by Category

### Context & Understanding (3 skills)

**Getting Started and Understanding Project Context**

- **getting-the-bigger-picture**: Read project documentation to contextualize decisions. Use before recommending solutions or making architectural choices.
- **pattern-discovery**: Identify recurring patterns and anti-patterns in codebase. Surface insights and improvement opportunities.
- **deep-research**: Conduct thorough research combining code analysis and external resources. Synthesize findings into actionable insights.

### Planning & Inception (4 skills)

**Planning, Brainstorming, and Project Setup**

- **determining-project-goal**: Define production-ready project goals through interactive brainstorming. Use at project start.
- **project-inception**: Launch new projects with proper planning, structure, and tooling. Handles architecture decisions and initial deliverables.
- **brainstorm-feature**: Generate creative feature ideas aligned with project goals. Explore multiple angles and validate feasibility.
- **plan-review-system**: Validate work plans before implementation through structured, multi-tier review. Catch feasibility issues early.

### Development Workflows (3 skills)

**Executing Development Work Systematically**

- **dev-flow**: Execute daily development workflow with clear stages and operational modes. Structure multi-step work and maintain momentum.
- **dev-tdd**: Accelerated test-driven development for rapid feature delivery. Combines planning, testing, and implementation in tight cycles.
- **test-driven-development**: Complete TDD workflow with patterns for unit, integration, and end-to-end tests.

### Quality & Review (3 skills)

**Reviewing, Testing, and Ensuring Quality**

- **review-critically**: Perform rigorous security-focused code review. Generates reports for automated remediation. Use for production code.
- **review-system**: Execute comprehensive multi-tier code and design review. Combines critical analysis, architectural validation, and quality assessment.
- **systematic-debugging**: Investigate and resolve complex bugs through structured analysis. Combines code analysis, error investigation, and root cause discovery.

### Specialized Workflows (4 skills)

**Handling Specific Development Tasks**

- **handle-ticket**: Execute end-to-end ticket workflow from intake to delivery. Handles support tickets, bug reports, and feature requests.
- **context-manager**: Manage conversation context and shared state. Maintain consistent understanding across sessions and coordinate parallel workflows.
- **docs-manager**: Create, maintain, and update project documentation. Ensure docs stay synchronized with codebase.
- **deep-research**: Research production-ready best practices for implementing features. Uses project context to find relevant solutions.

### Setup & Infrastructure (4 skills)

**Setting Up Tools, Languages, and Infrastructure**

- **setting-up-anthropic-connection**: Set up and use Anthropic's Python SDK. Covers client initialization, streaming, tool use, and best practices.
- **building-langgraph-agents**: Build stateful AI agents using LangGraph. Adapts to project structure, implements streaming, integrates with frontend/backend.
- **setting-up-logging**: Set up production logging using free services. Structured JSON logging with minimal code changes.
- **setting-up-langfuse-for-tracing**: Set up Langfuse v3 observability for all LLM calls. Implements proper structure, naming, metadata, and feedback.

### Repository & Structure (1 skill)

**Organizing Code and Repository Structure**

- **structuring-repository**: Propose production-ready repository structure. Supports both local and external deployment.

### Management & Tools (1 skill)

**Package and Dependency Management**

- **uv-management**: Package and version management with uv for Python. Covers setup, troubleshooting, and dependency management.

## Skill Taxonomy

### By Frequency of Use

**High Frequency** (use frequently during development):
- dev-flow
- test-driven-development
- context-manager
- systematic-debugging

**Medium Frequency** (use regularly for specific tasks):
- brainstorm-feature
- handle-ticket
- review-critically
- docs-manager

**Low Frequency** (use for specific projects/situations):
- project-inception
- determining-project-goal
- structuring-repository
- building-langgraph-agents

### By Workflow Stage

**Planning Phase:**
- determining-project-goal
- project-inception
- brainstorm-feature
- plan-review-system

**Development Phase:**
- dev-flow
- dev-tdd
- test-driven-development
- context-manager

**Quality Phase:**
- review-critically
- review-system
- systematic-debugging

**Deployment Phase:**
- setting-up-logging
- setting-up-langfuse-for-tracing
- handle-ticket (for validation)

**Documentation Phase:**
- docs-manager

### By Team Role

**Developers:**
- dev-flow
- test-driven-development
- systematic-debugging
- context-manager

**Architects:**
- getting-the-bigger-picture
- project-inception
- deep-research
- pattern-discovery

**Reviewers:**
- review-critically
- review-system
- plan-review-system

**Team Leads/Managers:**
- handle-ticket
- determining-project-goal
- brainstorm-feature

**DevOps/Infrastructure:**
- setting-up-logging
- setting-up-langfuse-for-tracing
- structuring-repository

## Workflow Examples

### Starting a New Project

```
1. determining-project-goal       (Define what you're building)
2. project-inception              (Set up structure and decisions)
3. structuring-repository         (Organize code)
4. brainstorm-feature             (Plan initial features)
5. plan-review-system             (Validate plan)
6. dev-flow                        (Begin development)
```

### Implementing a New Feature

```
1. getting-the-bigger-picture     (Understand project context)
2. brainstorm-feature             (Explore options)
3. plan-review-system             (Validate approach)
4. dev-flow or dev-tdd            (Implement)
5. review-system                  (Code review)
6. handle-ticket                  (Validate with user if needed)
```

### Fixing a Complex Bug

```
1. handle-ticket                  (Understand bug report)
2. systematic-debugging           (Debug systematically)
3. test-driven-development        (Add test for fix)
4. review-critically              (Review changes)
5. context-manager                (Document findings)
```

### Production Deployment

```
1. review-critically              (Security review)
2. review-system                  (Comprehensive review)
3. setting-up-logging             (Add observability)
4. setting-up-langfuse-for-tracing (Add tracing if LLM-related)
5. docs-manager                   (Update deployment docs)
```

### Code Quality Improvement

```
1. pattern-discovery              (Find patterns and anti-patterns)
2. deep-research                  (Understand issues)
3. brainstorm-feature             (Plan improvements)
4. plan-review-system             (Validate refactoring plan)
5. dev-tdd                         (Implement improvements)
6. review-system                  (Comprehensive review)
```

## Directory Structure

Each skill directory contains:

```
skill-name/
├── SKILL.md              # Skill definition, stages, patterns
├── templates/            # Reusable templates (if applicable)
├── scripts/              # Helper scripts (if applicable)
├── subagents/            # Specialized sub-agents (if applicable)
├── modes/                # Operational modes (if applicable)
└── stages/               # Workflow stages (if applicable)
```

## Key Principles

### 1. Context Matters
Always start with `/getting-the-bigger-picture` to understand project goals and constraints before making recommendations.

### 2. Structured Workflows
Skills break complex tasks into manageable stages with clear inputs/outputs and decision points.

### 3. Integration Points
Skills are designed to chain together—output from one feeds into another. See workflow examples above.

### 4. Actionable Steps
Every skill provides concrete, specific steps rather than general advice.

### 5. Documentation
Each skill documents not just what to do, but why you're doing it and how to know when it's done.

## Extending Skills

To add a new skill:

1. Create directory: `skills/new-skill-name/`
2. Create `SKILL.md` with:
   - Frontmatter (name, description, category)
   - Purpose section
   - When to use section
   - How it works section with stages
   - Examples
   - Integration with other skills
   - Common pitfalls
3. Create subdirectories as needed (templates/, scripts/, etc.)
4. Add discovery info to README.md (this file)

## Version History

**Current Version**: 1.0
- 23 production-ready skills
- Full lifecycle coverage (planning through deployment)
- 6 main categories
- Multi-tier review processes
- Integrated debugging workflow

## Support

For questions about a specific skill, refer to its SKILL.md file for detailed documentation, examples, and troubleshooting guidance.
