---
name: uv-management
description: Package and version management with uv for Python projects. Use for initial setup, troubleshooting, or when adding complex dependencies.
---

# uv Package Management

## Purpose
Comprehensive package and version management with uv for Python projects. Covers initial setup, dependency management, monorepo patterns, and troubleshooting.

## When to Use This Skill

Use this skill when:
- Setting up new Python development environment
- Installing or managing Python versions
- Resolving dependency conflicts or lock file issues
- Working with monorepo package structures
- Need to understand dev vs prod dependencies
- Troubleshooting uv-related installation problems

**Do NOT use for:**
- Daily uv commands already documented in CLAUDE.md (use docs directly)
- Simple package additions with no conflicts (use `uv add <package>` directly)
- Projects not using uv (use pip, poetry, or project's tool)
- Non-Python projects (uv is Python-specific)
- When project explicitly uses conda or other environment managers (follow project standards)
- Quick script execution without dependency management (use system Python)

**If uncertain:** Use this skill when setting up a new environment, resolving conflicts, or understanding uv's architecture. Skip for straightforward package additions or when working within established environments.

## Quick Reference
For daily commands, see CLAUDE.md. This skill covers setup and troubleshooting.

## Initial Setup

### Install uv
```bash
brew install uv
```

### Install Python Versions
```bash
uv python install 3.11 3.12
```

## If a Monorepo 
- Multiple pyproject.toml files throughout repo
- Add dependencies in specific directory: cd to that directory, then uv add
- Root sync installs all packages: uv sync --all-extras

## Dependency Groups

### Production vs Development
```bash
uv add <package>           # Production dependency
uv add --dev <package>     # Development only
uv sync                    # Install all (including dev)
uv sync --no-dev          # Production only
```

### Configuration Pattern
```toml
[dependency-groups]
dev = ["pytest", "ipykernel", "ruff"]

[tool.uv.dependency-groups.dev]
optional = true
```

## Troubleshooting

### Merge Conflicts (uv.lock)
When lockfile conflicts occur during merge:
```bash
git checkout <parent> -- uv.lock
uv lock
```

### Installing Specific Extras
For Project evals module:
```bash
uv pip install -r pyproject.toml --extra evals
```

## Editable Mode
uv supports editable installs:
```bash
uv pip install -e .
```

## Version Pinning
IMPORTANT: In production, pin exact versions in pyproject.toml to prevent breaking changes.

## Integration with Development

This skill coordinates with:
- **project-inception**: Set up uv during Stage 5 (Initial Deliverables) for new Python projects
- **setup-repository-structure**: Ensure pyproject.toml and uv.lock are properly placed in repository structure
- **dev-workflow-flow**: Manage dependencies during Stage 2 (Implementation) when adding new packages
- **docs-manager**: Document dependency management conventions and monorepo patterns in project docs
- **research-deep**: Validate dependency choices and version pinning strategies against best practices
- **dev-workflow-debug**: Resolve dependency conflicts and environment issues during debugging

## Common Pitfalls to Avoid

**Don't:**
- Commit uv.lock conflicts without resolving (breaks reproducible builds)
- Mix uv with pip/poetry in same environment (causes conflicts)
- Forget to run `uv sync` after pulling changes (outdated dependencies)
- Add production dependencies with --dev flag (wrong dependency group)
- Skip version pinning in production (unpredictable deployments)
- Use `uv add` at wrong directory level in monorepo (wrong pyproject.toml)
- Ignore dependency conflict warnings (technical debt accumulation)
- Hard-code Python versions in scripts (reduces portability)

**Do:**
- Run `uv lock` after resolving merge conflicts in uv.lock
- Use consistent tool (uv) across all team members
- Always sync after pulling: `uv sync --all-extras`
- Add production deps correctly: `uv add <package>` (no --dev)
- Pin exact versions in production: `package==1.2.3`
- Navigate to correct directory before `uv add` in monorepos
- Resolve conflicts immediately when they appear
- Use `uv python install` to manage Python versions consistently
- Document monorepo structure and dependency patterns
- Keep uv updated: `brew upgrade uv`

## References
- Full documentation: https://docs.astral.sh/uv/