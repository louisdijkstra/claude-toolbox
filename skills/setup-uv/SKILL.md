---
name: uv-management
description: Package and version management with uv for Python projects. Use for initial setup, troubleshooting, or when adding complex dependencies.
---

# uv Package Management

## When to Use This Skill
- Setting up new development environment
- Installing specific Python versions
- Resolving dependency conflicts
- Understanding monorepo package structure
- Questions about dev vs prod dependencies

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

## References
- Full documentation: https://docs.astral.sh/uv/