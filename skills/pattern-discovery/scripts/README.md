# Scripts

This directory contains helper scripts for the pattern-discovery skill.

## pattern-analyzer.py

Analyzes codebase patterns using Python AST parsing.

**Usage:**
```bash
python3 pattern-analyzer.py <pattern_type>
```

**Supported pattern types:**
- `api` - API routes and endpoints
- `database` - Database access patterns
- `auth` - Authentication and authorization
- `test` - Testing patterns

**Example:**
```bash
cd ~/projects/myproject
python3 ~/.claude/skills/pattern-discovery/scripts/pattern-analyzer.py api
```

## Status

✅ Implemented in Phase 2
