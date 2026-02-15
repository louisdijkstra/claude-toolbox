---
name: project-inception
description: Launch new projects from scratch with proper planning, structure, and tooling. Handles project setup, architecture decisions, and initial deliverables. Use when starting a new project, product, or major initiative.
---

# Project Inception

## Purpose

Successfully launch new projects with clear goals, sound architecture, and proper tooling. Ensure projects start on solid foundation with documented decisions and clear direction.

## When to Use This Skill

Use this skill when:
- Starting a completely new project
- Launching a new product or feature
- Beginning major initiative within existing project
- Restructuring existing project significantly
- Need to establish project foundations

**Do NOT use for:**
- Adding features to existing projects (use feature skills)
- Quick prototyping (iterate first, then formalize)
- Maintenance work (use existing project workflows)

## How It Works

### Stage 1: Visioning (30-60 minutes)

Define what you're building and why:

```markdown
# Project Inception: [Project Name]

## Vision
[What are we building in one sentence?]

## Problem We're Solving
[What pain point or opportunity does this address?]

## Success Criteria
- [ ] [Measurable success metric 1]
- [ ] [Measurable success metric 2]
- [ ] [Measurable success metric 3]

## Key Stakeholders
- [Stakeholder 1]: [Role]
- [Stakeholder 2]: [Role]

## Timeline
- Planning phase: [Days]
- Implementation phase: [Weeks]
- Launch target: [Date]
```

**Use skill:** `/determining-project-goal` for interactive planning if needed

### Stage 2: Scope Definition (30-45 minutes)

Define what's in and out of scope:

```markdown
## Scope

### MVP (Minimum Viable Product)
- [Core feature 1]
- [Core feature 2]
- [Core feature 3]

### Phase 2 (After validation)
- [Feature 1]
- [Feature 2]

### Out of Scope (for now)
- [Feature that won't be in initial launch]
- [Non-essential feature]
- [Complex feature for later]

## Constraints
- Timeline: [How much time?]
- Budget: [How much money?]
- Team: [Who's building it?]
- Technology: [What must we use/avoid?]
- Scale: [How many users initially?]
```

### Stage 3: Architecture Decision (45-90 minutes)

Plan the technical approach:

```markdown
## Architecture

### Technology Stack
- **Backend**: [Technology and why]
- **Frontend**: [Technology and why]
- **Database**: [Technology and why]
- **Infrastructure**: [Deployment target]
- **Observability**: [Monitoring approach]

### Key Architectural Decisions
1. **[Decision 1]**: [Why we chose this]
2. **[Decision 2]**: [Why we chose this]
3. **[Decision 3]**: [Why we chose this]

### Data Model
[Description or diagram of primary entities]

### Integration Points
- [External service 1]: [Why, how it's used]
- [External service 2]: [Why, how it's used]

### Security Considerations
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

### Scalability Approach
[How will this scale as usage grows?]
```

**Use skill:** `/getting-the-bigger-picture` and `/researching-best-practices` for validation

### Stage 4: Repository Structure (30-45 minutes)

Set up project structure:

```markdown
## Repository Structure

### Layout
[Project directory structure]

### Key Directories
- `/src`: Source code
- `/tests`: Test suite
- `/docs`: Documentation
- `/config`: Configuration files
- `/scripts`: Build/deploy scripts

### File Organization
[How code is organized within directories]

### Configuration Management
[How environment/secrets are managed]
```

**Use skill:** `/structuring-repository` for detailed structure

### Stage 5: Initial Deliverables (varies)

Create foundational code and documentation:

```markdown
## Initial Deliverables

### Documentation
- [ ] README.md (overview and quick start)
- [ ] PROJECT_DESCRIPTION.md (detailed vision)
- [ ] ARCHITECTURE.md (technical decisions)
- [ ] CONTRIBUTING.md (how to contribute)
- [ ] SETUP.md (local development setup)

### Code Foundation
- [ ] Project scaffold (directories, basic files)
- [ ] Example/demo code
- [ ] Configuration templates
- [ ] Build/test scripts

### Tooling
- [ ] Package management setup
- [ ] CI/CD pipeline configuration
- [ ] Testing framework setup
- [ ] Linting/formatting configuration
- [ ] Documentation build setup

### Initial Tests
- [ ] Test framework configured
- [ ] Example test written
- [ ] CI/CD running tests
```

### Stage 6: Team Onboarding (15-30 minutes)

Prepare for team to start contributing:

```markdown
## Team Onboarding

### Getting Started
1. Clone repository
2. Follow SETUP.md instructions
3. Run tests locally
4. Review ARCHITECTURE.md
5. Start first task

### Key Resources
- [Project documentation location]
- [Design/planning documents]
- [Communication channels]
- [Decision log]

### First Tasks
- [ ] [Task 1 for developer]
- [ ] [Task 2 for developer]
- [ ] [Task 3 for developer]

### Success Checkpoints
- [ ] Local development environment works
- [ ] Tests pass on developer machine
- [ ] Developer can build/run project
- [ ] Developer understands architecture
```

## Project Templates

### Template 1: Web Application

**Tech Stack:**
- Backend: Python FastAPI (or Node.js Express)
- Frontend: React with TypeScript
- Database: PostgreSQL (or MongoDB)
- Deployment: Docker + cloud platform

**Structure:**
```
project/
├── backend/          # API server
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── frontend/         # Web app
│   ├── src/
│   ├── tests/
│   └── package.json
├── docs/            # Documentation
├── infra/           # Infrastructure as Code
└── README.md
```

### Template 2: Python Library

**Tech Stack:**
- Package manager: uv or poetry
- Testing: pytest
- Documentation: Sphinx or MkDocs
- Distribution: PyPI

**Structure:**
```
project/
├── src/
│   └── mylib/
│       ├── __init__.py
│       └── core.py
├── tests/
├── docs/
├── pyproject.toml
└── README.md
```

### Template 3: Data Analytics Project

**Tech Stack:**
- Language: Python
- Data Processing: Pandas/Polars
- Notebooks: Jupyter
- Visualization: Matplotlib/Plotly
- Database: DuckDB/SQLite

**Structure:**
```
project/
├── notebooks/       # Analysis notebooks
├── src/            # Reusable code
├── data/           # Data files
├── output/         # Results
├── tests/
└── README.md
```

## Response Pattern

When starting project inception:

```
**Project**: [Name and vision]

**Stage 1: Vision** (In Progress)
- Problem: [What we're solving]
- Success criteria: [How we'll know it's successful]
- Timeline: [Duration estimate]

**Stage 2: Scope**
- MVP Features: [What's in initial version]
- Constraints: [Budget, timeline, team]
- Out of scope: [What's not included]

**Stage 3: Architecture**
- Tech stack: [What we're using]
- Key decisions: [Why we chose this approach]
- Integration points: [External services]

**Stage 4: Structure**
- Repository layout: [Directory structure]
- Configuration: [How environment is managed]
- Tooling: [Build, test, deploy tools]

**Stage 5: Initial Deliverables**
- Documentation: [What's created]
- Code foundation: [Scaffold and examples]
- Tooling: [CI/CD, testing, linting]

**Stage 6: Team Onboarding**
- Setup time: [Minutes to get started]
- First tasks: [What developers do first]
- Success criteria: [How to know they're ready]

**Next Steps**:
1. [Immediate action]
2. [Follow-up action]
3. [Validation checkpoint]
```

## Integration with Development

This skill leads to:
- **Structuring Repository**: Create project structure
- **Determining Project Goal**: Define initial goals
- **Getting the Bigger Picture**: Validate architecture decisions
- **Dev Flow**: Start actual development
- **Docs Manager**: Create project documentation

## Common Pitfalls to Avoid

**Don't:**
- Skip the visioning phase (leads to confusion later)
- Build architecture without constraints (over-engineered)
- Create complex structure before understanding scope
- Forget documentation from the start
- Set unrealistic timeline
- Over-commit to features for MVP
- Skip setting up CI/CD and testing early
- Ignore team capacity in planning

**Do:**
- Start with clear vision and success criteria
- Involve stakeholders in planning
- Keep MVP focused and minimal
- Document architectural decisions with rationale
- Set realistic timeline with buffer
- Get architecture feedback before implementation
- Set up testing and CI/CD immediately
- Plan for team onboarding from start
- Iterate on structure as you learn
- Review project status at milestones
