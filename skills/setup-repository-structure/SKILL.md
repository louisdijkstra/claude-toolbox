---
name: structuring-repository
description: Reads project documentation and researches best practices to propose a production-ready repository structure supporting both local and external deployment. Use when starting a project or restructuring code.
---

# Structuring Repository

## Purpose
Propose a sensible, production-ready repository structure based on project requirements, tech stack, and deployment needs. Supports both local development and external deployment.

## When to Use This Skill

Use this skill when:
- Starting a new project
- Restructuring existing code
- Preparing for production deployment
- Project structure feels chaotic or unclear
- Need to support both local and external deployment
- Organizing monorepo or microservices architecture

**Do NOT use for:**
- Adding single files to existing structure (use Write or Edit directly)
- Simple scripts or one-off utilities (no structure needed)
- Well-organized projects with clear patterns (follow existing structure)
- Minor reorganization within a directory (direct file operations)
- Documentation-only projects (simpler structure sufficient)
- Quick prototypes or experiments (structure can come later)

**If uncertain:** Use this skill when starting from scratch or when the project lacks clear organization and deployment support. Skip for minor file additions or when working within an established structure.

## Process

### Step 1: Read Project Documentation

```bash
# Read project overview
cat docs/PROJECT_DESCRIPTION.md 2>/dev/null || cat docs/FULL_PROJECT_DESCRIPTION.md
```

**Extract key information:**
- Application type (web, API, CLI, microservices)
- Tech stack (languages, frameworks, databases)
- Deployment targets (cloud, on-premise, local)
- Testing approach (unit, integration, E2E)
- CI/CD requirements

### Step 2: Research Best Practices

**CRITICAL**: Use the `deep-research` skill to find production standards for the specific tech stack.

**Search queries:**
- Python: "Python production repository structure for [API/CLI] with Docker deployment"
- JavaScript/TypeScript: "Node.js production repository structure for [Express/NestJS] with Docker"
- Other: "[Language/Framework] production repository structure best practices"

**Focus on:**
- Standard directory layouts for the ecosystem
- Docker best practices (dev vs prod images)
- Configuration management patterns
- Testing organization
- CI/CD integration

### Step 3: Design Structure

**Core principles:**
- Separate source from infrastructure
- Support both local (docker-compose) and external (K8s, cloud) deployment
- Environment-specific configs (dev/staging/prod)
- Clear testing organization

**Base template (adapt to project):**
```
project-root/
├── src/              # Source code
├── tests/            # Tests (unit, integration, e2e)
├── infra/            # Infrastructure as code
│   └── docker/       # Dockerfiles and compose
├── config/           # Config templates (.env.example)
├── docs/             # Documentation
├── .gitignore
├── README.md
└── Makefile          # Common commands
```

**For microservices:**
```
project-root/
├── services/
│   ├── service-a/
│   └── service-b/
├── shared/           # Shared code
├── infra/
└── docs/
```

**For frontend + backend:**
```
project-root/
├── frontend/
├── backend/
├── infra/
└── docs/
```

### Step 4: Present to User

**IMPORTANT**: Always present the proposed structure and wait for approval before creating anything.

**Present as:**
```markdown
# Proposed Repository Structure for [Project Name]

## Context
Based on your project:
- **Type**: [Application type]
- **Tech Stack**: [Technologies]
- **Deployment**: [Local + External targets]

## Research Summary
[Brief summary of best practices found]

## Proposed Structure

[Directory tree with explanations]

## Key Design Decisions

1. **[Decision]**: [Rationale based on project needs]
2. **[Decision]**: [Rationale based on best practices]
3. **[Decision]**: [Deployment support reasoning]

## Local vs External Deployment

**Local Development**:
- docker-compose.yml with hot reload
- Volume mounts for code
- Dev databases and services

**External Deployment**:
- Production Dockerfile (multi-stage, optimized)
- K8s manifests or cloud configs
- Environment-specific configs

## Key Files

Will create:
- Makefile (make dev, make test commands)
- README.md (setup instructions)
- docker-compose.yml (local dev)
- Dockerfile + Dockerfile.dev
- .gitignore
- config/*.env.example

**Does this structure work for you? Any changes needed?**
```

### Step 5: Create Structure (After Approval)

Only after user confirms, create:

```bash
# Create directories
mkdir -p src tests/{unit,integration,e2e} infra/docker config docs

# Create key files
# - Makefile with common commands
# - README.md with setup instructions
# - docker-compose.yml for local dev
# - Dockerfile (production) and Dockerfile.dev
# - .gitignore appropriate for tech stack
# - config/*.env.example templates

# Make scripts executable if any
chmod +x scripts/*.sh
```

**Key files to generate:**

**Makefile** - Common commands:
```makefile
.PHONY: help dev test build

help:  ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-20s %s\n", $$1, $$2}'

dev:  ## Start dev environment
	docker-compose -f infra/docker/docker-compose.yml up

test:  ## Run tests
	[test command]

build:  ## Build production image
	docker build -f infra/docker/Dockerfile -t [name]:latest .
```

**README.md** - Quick start:
```markdown
# [Project Name]

[Description]

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Local Development
```bash
make dev
```

### Running Tests
```bash
make test
```

See [docs/](docs/) for detailed documentation.
```

**docker-compose.yml** - Local dev with hot reload:
```yaml
version: '3.8'
services:
  app:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.dev
    volumes:
      - ../../src:/app/src  # Hot reload
    ports:
      - "[port]:[port]"
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dbname
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

**Dockerfile** - Production (multi-stage):
```dockerfile
FROM [base] AS builder
WORKDIR /app
COPY [deps] .
RUN [install]
COPY src/ ./src/

FROM [base-slim]
WORKDIR /app
COPY --from=builder /app .
USER appuser
CMD [prod command]
```

**Dockerfile.dev** - Development:
```dockerfile
FROM [base]
WORKDIR /app
COPY [deps] .
RUN [install with dev deps]
CMD [dev command with hot reload]
```

## Adaptation Guidelines

**Monorepo vs multi-repo**: Adjust structure accordingly
**Microservices**: Use services/ directory with shared/ for common code
**Frontend included**: Separate frontend/ and backend/ directories
**Orchestration**: Add k8s/ or terraform/ to infra/ as needed
**CI/CD**: Add .github/workflows/ or .gitlab-ci.yml based on platform

## Integration with Development

This skill coordinates with:
- **project-determine-goal**: Creates project documentation that this skill reads (Step 1)
- **project-inception**: Use during Stage 4 (Repository Structure) of project launch
- **docs-bigger-picture**: Similar context-gathering approach for understanding project needs
- **research-deep**: Essential for finding production standards and best practices (Step 2)
- **docs-manager**: Document structure decisions and rationale

## Common Pitfalls to Avoid

**Don't:**
- Create structure without researching tech stack standards
- Copy generic templates without adapting to project needs
- Skip user approval before creating directories
- Over-complicate structure for simple projects
- Ignore deployment requirements (local vs external)
- Forget to create essential files (README, Makefile, docker-compose)
- Mix concerns (put tests in src/, config in code directories)
- Use outdated patterns from old tutorials

**Do:**
- Research current best practices for the specific tech stack
- Present structure and get approval before creating anything
- Keep structure simple and focused on actual project needs
- Support both local development and production deployment from day one
- Follow ecosystem conventions discovered in research
- Create essential supporting files (Makefile, README, .gitignore)
- Separate source, tests, infrastructure, and configuration
- Document structure decisions and their rationale

## Notes

- **Trust the AI**: Sonnet 4.5 can figure out tech-specific details
- **Always get approval**: Present structure before creating
- **Production-first**: Support production deployment from day one
- **Local + External**: Structure must support both deployment modes easily
- **Follow conventions**: Use ecosystem standards from research