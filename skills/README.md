# Claude Code Skills

This directory contains 25 skills that provide structured approaches to common development and project management tasks. Each skill is a defined workflow with clear stages, practical patterns, and integration points.

## Using Skills

Skills are invoked using the `/skill-name` syntax in Claude Code:

```
/docs-bigger-picture
/project-brainstorm
/dev-workflow-flow
```

Skills can be chained together in workflows where output from one feeds into another.

## Skills by Category

### Context & Understanding (3 skills)

**Getting Started and Understanding Project Context**

- **docs-bigger-picture**: Read project documentation to contextualize decisions. Use before recommending solutions or making architectural choices.
- **dev-workflow-patterns**: Identify recurring patterns and anti-patterns in codebase. Surface insights and improvement opportunities.
- **research-deep**: Conduct thorough research combining code analysis and external resources. Synthesize findings into actionable insights.

### Planning & Inception (4 skills)

**Planning, Brainstorming, and Project Setup**

- **project-determine-goal**: Define production-ready project goals through interactive brainstorming. Use at project start.
- **project-inception**: Launch new projects with proper planning, structure, and tooling. Handles architecture decisions and initial deliverables.
- **project-brainstorm**: Generate creative feature ideas aligned with project goals. Explore multiple angles and validate feasibility.
- **review-plan**: Validate work plans before implementation through structured, multi-tier review. Catch feasibility issues early.

### Development Workflows (3 skills)

**Executing Development Work Systematically**

- **dev-workflow-flow**: Execute daily development workflow with clear stages and operational modes. Structure multi-step work and maintain momentum.
- **dev-workflow-tdd**: Accelerated test-driven development for rapid feature delivery. Combines planning, testing, and implementation in tight cycles.
- **dev-workflow-test-driven**: Complete TDD workflow with patterns for unit, integration, and end-to-end tests.

### Quality & Review (3 skills)

**Reviewing, Testing, and Ensuring Quality**

- **review-critical**: Perform rigorous security-focused code review. Generates reports for automated remediation. Use for production code.
- **review-system**: Execute comprehensive multi-tier code and design review. Combines critical analysis, architectural validation, and quality assessment.
- **dev-workflow-debug**: Investigate and resolve complex bugs through structured analysis. Combines code analysis, error investigation, and root cause discovery.

### Specialized Workflows (4 skills)

**Handling Specific Development Tasks**

- **project-handle-ticket**: Execute end-to-end ticket workflow from intake to delivery. Handles support tickets, bug reports, and feature requests.
- **docs-context**: Manage conversation context and shared state. Maintain consistent understanding across sessions and coordinate parallel workflows.
- **docs-manager**: Create, maintain, and update project documentation. Ensure docs stay synchronized with codebase.
- **research-deep**: Research production-ready best practices for implementing features. Uses project context to find relevant solutions.

### Setup & Infrastructure (4 skills)

**Setting Up Tools, Languages, and Infrastructure**

- **ai-framework-setup-anthropic**: Set up and use Anthropic's Python SDK. Covers client initialization, streaming, tool use, and best practices.
- **ai-framework-build-langgraph**: Build stateful AI agents using LangGraph. Adapts to project structure, implements streaming, integrates with frontend/backend.
- **setup-logging**: Set up production logging using free services. Structured JSON logging with minimal code changes.
- **setup-langfuse-tracing**: Set up Langfuse v3 observability for all LLM calls. Implements proper structure, naming, metadata, and feedback.

### Repository & Structure (1 skill)

**Organizing Code and Repository Structure**

- **setup-repository-structure**: Propose production-ready repository structure. Supports both local and external deployment.

### Management & Tools (1 skill)

**Package and Dependency Management**

- **setup-uv**: Package and version management with uv for Python. Covers setup, troubleshooting, and dependency management.

## Skill Taxonomy

### By Frequency of Use

**High Frequency** (use frequently during development):
- dev-workflow-flow
- dev-workflow-test-driven
- docs-context
- dev-workflow-debug

**Medium Frequency** (use regularly for specific tasks):
- project-brainstorm
- project-handle-ticket
- review-critical
- docs-manager

**Low Frequency** (use for specific projects/situations):
- project-inception
- project-determine-goal
- setup-repository-structure
- ai-framework-build-langgraph

### By Workflow Stage

**Planning Phase:**
- project-determine-goal
- project-inception
- project-brainstorm
- review-plan

**Development Phase:**
- dev-workflow-flow
- dev-workflow-tdd
- dev-workflow-test-driven
- docs-context

**Quality Phase:**
- review-critical
- review-system
- dev-workflow-debug

**Deployment Phase:**
- setup-logging
- setup-langfuse-tracing
- project-handle-ticket (for validation)

**Documentation Phase:**
- docs-manager

### By Team Role

**Developers:**
- dev-workflow-flow
- dev-workflow-test-driven
- dev-workflow-debug
- docs-context

**Architects:**
- docs-bigger-picture
- project-inception
- research-deep
- dev-workflow-patterns

**Reviewers:**
- review-critical
- review-system
- review-plan

**Team Leads/Managers:**
- project-handle-ticket
- project-determine-goal
- project-brainstorm

**DevOps/Infrastructure:**
- setup-logging
- setup-langfuse-tracing
- setup-repository-structure

## Workflow Examples

### Starting a New Project

```
1. project-determine-goal         (Define what you're building)
2. project-inception              (Set up structure and decisions)
3. setup-repository-structure     (Organize code)
4. project-brainstorm             (Plan initial features)
5. review-plan                    (Validate plan)
6. dev-workflow-flow              (Begin development)
```

### Implementing a New Feature

```
1. docs-bigger-picture            (Understand project context)
2. project-brainstorm             (Explore options)
3. review-plan                    (Validate approach)
4. dev-workflow-flow or dev-workflow-tdd (Implement)
5. review-system                  (Code review)
6. project-handle-ticket          (Validate with user if needed)
```

### Fixing a Complex Bug

```
1. project-handle-ticket          (Understand bug report)
2. dev-workflow-debug             (Debug systematically)
3. dev-workflow-test-driven       (Add test for fix)
4. review-critical                (Review changes)
5. docs-context                   (Document findings)
```

### Production Deployment

```
1. review-critical                (Security review)
2. review-system                  (Comprehensive review)
3. setup-logging                  (Add observability)
4. setup-langfuse-tracing         (Add tracing if LLM-related)
5. docs-manager                   (Update deployment docs)
```

### Code Quality Improvement

```
1. dev-workflow-patterns          (Find patterns and anti-patterns)
2. research-deep                  (Understand issues)
3. project-brainstorm             (Plan improvements)
4. review-plan                    (Validate refactoring plan)
5. dev-workflow-tdd               (Implement improvements)
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
Always start with `/docs-bigger-picture` to understand project goals and constraints before making recommendations.

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
- 25 production-ready skills
- Full lifecycle coverage (planning through deployment)
- 6 main categories
- Multi-tier review processes
- Integrated debugging workflow

## Support

For questions about a specific skill, refer to its SKILL.md file for detailed documentation, examples, and troubleshooting guidance.
