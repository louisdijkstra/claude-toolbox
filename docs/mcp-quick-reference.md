# MCP Quick Reference

## Your Core 5 MCPs (Always Keep Enabled)

| MCP | Purpose | Package |
|-----|---------|---------|
| **package-registry** | Search npm/PyPI packages | `package-registry-mcp` |
| **context7** | Semantic code search | `@upstash/context7` |
| **augments** | Code suggestions & patterns | `augments-mcp-server` |
| **mdn-lookup** | MDN Web Docs lookup | `mdn-lookup-mcp` |
| **magg** | AI-powered search aggregation | `magg-mcp` |

## Additional MCPs (Enable Per-Project)

| MCP | Purpose | When to Enable |
|-----|---------|----------------|
| **github** | GitHub API access | When managing repos/PRs/issues |
| **memory** | Persistent context memory | Complex long-term projects |
| **sequential-thinking** | Step-by-step reasoning | Debugging, complex logic |
| **supabase** | Supabase integration | Using Supabase backend |
| **vercel** | Vercel deployment | Deploying to Vercel |
| **railway** | Railway deployment | Deploying to Railway |
| **firecrawl** | Web scraping | Data collection projects |
| **cloudflare-docs** | Cloudflare docs | Using Cloudflare services |
| **sentry** | Error tracking | Production monitoring |
| **langfuse-docs** | Langfuse LLM docs | AI observability |

## Project Type → MCP Selection

### Python Backend
**Enable**: package-registry, context7, augments, magg, memory, sequential-thinking, supabase, sentry, langfuse-docs
**Disable**: mdn-lookup, vercel, railway, github, firecrawl, cloudflare-docs

### Frontend (React/TypeScript)
**Enable**: package-registry, context7, augments, mdn-lookup, magg, github, memory, vercel
**Disable**: supabase, railway, firecrawl, cloudflare-docs, sentry, langfuse-docs, sequential-thinking

### Full-Stack SaaS
**Enable**: Most MCPs (9-11 active)
**Disable**: railway, firecrawl, cloudflare-docs (unless needed)

### Quick Prototype
**Enable**: package-registry, context7, augments, magg, memory, sequential-thinking (6 MCPs)
**Disable**: All deployment/integration MCPs

## Usage

### To Disable MCPs for a Project

1. Create `.claude/settings.json` in project root
2. Add:
```json
{
  "disabledMcpServers": [
    "mcp-name-1",
    "mcp-name-2"
  ]
}
```
3. Restart Claude Code in that project

### To Re-Enable an MCP

Remove it from the `disabledMcpServers` array and restart.

### To Check Active MCPs

Run `/help` and count the available tools.

## Rules

- ✅ **10-15 MCPs** configured at user level
- ✅ **Under 8 MCPs** enabled per project
- ✅ **Under 80 tools** active total
- ✅ **Core 5** always enabled (unless specific reason)

## Configuration Files

- **User-level**: `~/.claude.json` → Configure all MCPs once
- **Project-level**: `.claude/settings.json` → Disable per-project
- **Examples**: `~/.claude/docs/examples/*.json`

## Installation

MCPs are auto-installed on first use via `npx`. Some require API keys:

- `GITHUB_PERSONAL_ACCESS_TOKEN` → github
- `SUPABASE_PROJECT_REF` → supabase
- `FIRECRAWL_API_KEY` → firecrawl

See: `~/.claude/docs/phase-2-mcp-configuration-guide.md` for details.
