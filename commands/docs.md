---
description: Create, maintain, and update project documentation for clarity and consistency. Keep docs synchronized with codebase.
---

# Docs Command

This command manages project documentation using the **docs-manager** skill.

## What This Command Does

1. **Create Documentation** - Generate new documentation files
2. **Update Existing** - Sync docs with codebase changes
3. **Maintain Structure** - Organize documentation logically
4. **Ensure Consistency** - Follow documentation standards
5. **Track Completeness** - Identify documentation gaps

## When to Use

Use `/docs` when:
- Creating new documentation files
- Updating docs after code changes
- Need to document new features
- Reorganizing documentation structure
- Ensuring docs are current
- Identifying documentation gaps

## Documentation Types

Available templates in `~/.claude/docs/templates/`:

**Project Documentation:**
- **PROJECT_OVERVIEW.md** - High-level project description
- **ARCHITECTURE.md** - System design and structure
- **SETUP.md** - Installation and configuration

**API Documentation:**
- **API_DOCS.md** - API endpoints and usage
- **CONTRIBUTING.md** - Contribution guidelines

**Operational:**
- **DEPLOYMENT.md** - Deployment procedures
- **TROUBLESHOOTING.md** - Common issues and solutions
- **CHANGELOG.md** - Version history

**Decision Records:**
- **DECISIONS.md** - Architecture Decision Records (ADRs)

## How It Works

**Create New Documentation:**
1. Identify documentation type needed
2. Use appropriate template from `docs/templates/`
3. Customize with project-specific information
4. Place in correct location
5. Update documentation index

**Update Existing Documentation:**
1. Identify what changed in codebase
2. Find affected documentation files
3. Update outdated sections
4. Verify accuracy
5. Mark as updated

**Maintain Structure:**
1. Review documentation organization
2. Identify gaps or duplicates
3. Reorganize if needed
4. Update cross-references
5. Ensure discoverability

## Documentation Standards

**Quality Requirements:**
- Clear and concise language
- Code examples where relevant
- Up-to-date with current codebase
- Properly formatted markdown
- Working links and references
- Logical organization

**Language Style for Documentation:**
- Use natural, simple, informal language
- Write like you're explaining to a colleague
- Be direct and clear, avoid corporate or overly formal tone
- Use "you" and "we" naturally
- Example: "Run this command to start" not "The command should be executed to initiate"
- Example: "This fixes the bug where..." not "This addresses the issue whereby..."

**Maintenance:**
- Update docs with code changes
- Review quarterly for staleness
- Mark generated sections with `<!-- AUTO-GENERATED -->`
- Preserve manual sections during updates

## Integration with Other Commands

- Use `/docs` after completing features
- Use `/update-docs` to sync from codebase
- Use `/plan` to plan documentation structure
- Use `/review` to check documentation quality

## Related Skills

- **docs-manager** - Documentation management system
- **dev-flow** - Documentation in development workflow
