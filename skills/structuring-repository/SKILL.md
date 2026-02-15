---
name: structuring-repository
description: Reads project documentation and researches best practices to propose a production-ready repository structure supporting both local and external deployment. Use when starting a project or restructuring code.
---

# Structuring Repository

## Purpose
Propose a sensible, production-ready repository structure based on project requirements, tech stack, and deployment needs. Supports both local development and external deployment.

## When to Use
- Starting a new project
- Restructuring existing code
- Preparing for production deployment
- Project structure feels chaotic

## Process

### 1. Read Project Documentation

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

### 2. Research Best Practices

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

### 3. Design Structure

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

### 4. Present to User

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

### 5. Create Structure (After Approval)

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

## Integration with Other Skills

- `determining-project-goal` - Creates docs this skill reads
- `getting-the-bigger-picture` - Similar context-gathering approach
- `deep-research` - Essential for finding standards

## Notes

- **Trust the AI**: Sonnet 4.5 can figure out tech-specific details
- **Always get approval**: Present structure before creating
- **Production-first**: Support production deployment from day one
- **Local + External**: Structure must support both deployment modes easily
- **Follow conventions**: Use ecosystem standards from research