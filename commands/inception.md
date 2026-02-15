---
description: Launch new projects from scratch with proper planning, structure, and tooling. Handles project setup and architecture decisions.
---

# Inception Command

This command launches new projects using the **project-inception** and **determining-project-goal** skills.

## What This Command Does

1. **Define Goals** - Interactive brainstorming for project vision
2. **Plan Architecture** - Design system structure
3. **Setup Structure** - Create repository organization
4. **Configure Tooling** - Initialize build, test, deployment tools
5. **Initial Documentation** - Setup core documentation
6. **First Deliverable** - Create foundational implementation

## When to Use

Use `/inception` when:
- Starting a new project from scratch
- Launching a new product or service
- Beginning a major initiative
- Need structured project setup
- Want production-ready foundation

## Inception Phases

**Phase 1: Goal Definition**
- Use `/inception goals` for interactive brainstorming
- Define project purpose and objectives
- Identify target users
- Establish constraints (scale, timeline, budget)
- Document assumptions

**Phase 2: Architecture Planning**
- Choose technology stack
- Design system architecture
- Define component boundaries
- Plan data models
- Establish patterns and conventions

**Phase 3: Repository Structure**
- Create directory structure
- Setup monorepo or multi-repo
- Organize code by concerns
- Plan module boundaries
- Setup workspace configuration

**Phase 4: Tooling Configuration**
- Initialize build system
- Configure testing framework
- Setup linting and formatting
- Configure CI/CD pipeline
- Setup deployment tools

**Phase 5: Documentation**
- Create PROJECT_OVERVIEW.md
- Write SETUP.md
- Document ARCHITECTURE.md
- Setup CONTRIBUTING.md
- Initialize CHANGELOG.md

**Phase 6: Foundation**
- Implement core abstractions
- Setup authentication/authorization
- Configure logging and observability
- Create initial tests
- Validate build and deployment

## Interactive Goal Definition

```
/inception goals

This will ask targeted questions to define your project:

1. What problem does this solve?
2. Who will use this?
3. What scale are you targeting?
4. What are your constraints?
5. What architecture fits best?
6. What's the MVP scope?

Asks one question at a time, adapts based on answers.
```

## Example Workflow

```
/inception "AI-powered analytics platform"

PROJECT INCEPTION: AI-powered analytics platform
=================================================

[Phase 1: Goals] (Interactive)
Q: What problem does this solve?
A: Businesses need AI-driven insights from their data

Q: Who will use this?
A: Data analysts and business users

Q: What scale are you targeting?
A: 1000 concurrent users, 100GB data

[continues with remaining questions...]

✓ Goals defined and documented

[Phase 2: Architecture]
Stack Recommendation:
- Backend: FastAPI + Python 3.13
- AI: LlamaIndex + AWS Bedrock
- Database: PostgreSQL + Qdrant (vector)
- Frontend: React + TypeScript
- Deployment: Docker + AWS

✓ Architecture designed

[Phase 3: Structure]
Created repository structure:
- apps/ (frontend, backend)
- libs/ (core, models, agents)
- docs/ (templates ready)
- tests/ (framework configured)

✓ Structure created

[Phase 4: Tooling]
Configured:
- uv for Python dependencies
- npm for frontend
- pytest for testing
- GitHub Actions for CI/CD

✓ Tooling configured

[Phase 5: Documentation]
Created:
- PROJECT_OVERVIEW.md
- SETUP.md
- ARCHITECTURE.md
- CONTRIBUTING.md

✓ Documentation initialized

[Phase 6: Foundation]
Implemented:
- Core LLM integration
- Authentication system
- Basic API structure
- Initial tests (passing)

✓ Foundation complete

PROJECT READY FOR DEVELOPMENT
==============================
Next steps:
1. Review architecture decisions
2. Begin feature implementation with /plan
3. Use /tdd for development
4. Maintain docs with /docs
```

## Quality Standards

Inception creates:
- **Production-ready** foundation, not prototypes
- **Well-documented** architecture and decisions
- **Properly structured** repository
- **Tested** foundational code
- **Deployable** initial implementation

## Integration with Other Commands

- Use `/inception` to start project
- Use `/plan` for feature planning
- Use `/research` for architecture decisions
- Use `/tdd` for implementation
- Use `/docs` to maintain documentation

## Related Skills

- **project-inception** - Complete project launch
- **determining-project-goal** - Interactive goal definition
- **structuring-repository** - Repository organization
- **deep-research** - Architecture decisions
