---
description: Sync documentation with the codebase, generating from source-of-truth files. Keeps docs current automatically.
---

# Update Docs Command

This command automatically synchronizes documentation with the codebase.

## What This Command Does

1. **Identify Sources of Truth** - Find authoritative source files
2. **Generate Documentation** - Create docs from code
3. **Update Stale Docs** - Refresh outdated documentation
4. **Preserve Manual Content** - Keep hand-written sections
5. **Report Changes** - Show what was updated

## Step 1: Identify Sources of Truth

| Source | Generates |
|--------|-----------|
| `package.json` scripts | Available commands reference |
| `pyproject.toml` scripts | Python commands reference |
| `.env.example` | Environment variable documentation |
| `openapi.yaml` / route files | API endpoint reference |
| Source code exports | Public API documentation |
| `Dockerfile` / `docker-compose.yml` | Infrastructure setup docs |
| `uv` workspace | Python package structure |

## Step 2: Generate Script Reference

1. Read `package.json`, `pyproject.toml`, `Makefile`, etc.
2. Extract all scripts/commands with descriptions
3. Generate reference table:

```markdown
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `uv run pytest` | Run test suite with coverage |
| `npm run build` | Production build with type checking |
```

## Step 3: Generate Environment Documentation

1. Read `.env.example` (or `.env.template`, `.env.sample`)
2. Extract all variables with their purposes
3. Categorize as required vs optional
4. Document expected format and valid values

```markdown
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `LOG_LEVEL` | No | Logging verbosity (default: info) | `debug`, `info`, `warn`, `error` |
```

## Step 4: Update API Documentation

1. Scan for API route definitions
2. Extract endpoints, methods, parameters
3. Document request/response formats
4. Include authentication requirements
5. Add example requests/responses

## Step 5: Staleness Check

1. Find documentation files not modified in 90+ days
2. Cross-reference with recent source code changes
3. Flag potentially outdated docs for manual review
4. Report files that need attention

## Step 6: Show Summary

```
Documentation Update
────────────────────────────────
Updated:  docs/SETUP.md (new environment variables)
Updated:  docs/API_DOCS.md (3 new endpoints)
Flagged:  docs/DEPLOYMENT.md (142 days stale)
Skipped:  docs/ARCHITECTURE.md (no changes detected)
────────────────────────────────
```

## Rules

- **Single source of truth**: Always generate from code
- **Preserve manual sections**: Only update generated sections
- **Mark generated content**: Use `<!-- AUTO-GENERATED -->` markers
- **Don't create unprompted**: Only create new docs if requested
- **Verify accuracy**: Ensure generated docs match current code

## Markers for Generated Sections

```markdown
<!-- AUTO-GENERATED: START -->
... generated content ...
<!-- AUTO-GENERATED: END -->
```

Manual content outside these markers is preserved.

## Integration with Other Commands

- Use `/update-docs` after significant code changes
- Use `/docs` to create new documentation files
- Use `/review` to validate documentation quality
- Use `/commit` to commit documentation updates

## Related Skills

- **docs-manager** - Documentation management
- **dev-flow** - Documentation workflow integration
