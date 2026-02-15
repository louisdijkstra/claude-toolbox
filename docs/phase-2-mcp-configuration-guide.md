# Phase 2: MCP Configuration Guide

## Overview

Configure 13 MCPs at user level (`~/.claude.json`), then disable unused ones per-project (`.claude/settings.json`).

**Strategy**: Have 10-15 MCPs configured, keep under 8 enabled per project, under 80 tools active.

---

## Step 1: Add MCPs to `~/.claude.json`

**Location**: `~/.claude.json` (user-level configuration)

**What to do**: Add these MCP configurations to the `"mcpServers"` section.

**Current state**: You already have `sentry` and `langfuse-docs` configured.

**MCPs to add**:

### Your Core 5 (Always Enable)

```json
"package-registry": {
  "command": "npx",
  "args": ["package-registry-mcp"]
},
"context7": {
  "command": "npx",
  "args": ["@upstash/context7"]
},
"augments": {
  "command": "npx",
  "args": ["augments-mcp-server"]
},
"mdn-lookup": {
  "command": "npx",
  "args": ["mdn-lookup-mcp"]
},
"magg": {
  "command": "npx",
  "args": ["magg-mcp"]
},
```

### Additional (Enable Per-Project)

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"}
},
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
},
"sequential-thinking": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
},
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest"],
  "env": {"SUPABASE_PROJECT_REF": "YOUR_PROJECT_REF_HERE"}
},
"vercel": {
  "type": "http",
  "url": "https://mcp.vercel.com"
},
"railway": {
  "command": "npx",
  "args": ["-y", "@railway/mcp-server"]
},
"firecrawl": {
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {"FIRECRAWL_API_KEY": "fc-YOUR_KEY_HERE"}
},
"cloudflare-docs": {
  "type": "http",
  "url": "https://docs.mcp.cloudflare.com/mcp"
}
```

### Complete Example

After adding all MCPs, your `"mcpServers"` section should look like:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "langfuse-docs": {
      "type": "http",
      "url": "https://langfuse.com/api/mcp"
    },
    "package-registry": {
      "command": "npx",
      "args": ["package-registry-mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["@upstash/context7"]
    },
    "augments": {
      "command": "npx",
      "args": ["augments-mcp-server"]
    },
    "mdn-lookup": {
      "command": "npx",
      "args": ["mdn-lookup-mcp"]
    },
    "magg": {
      "command": "npx",
      "args": ["magg-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"}
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {"SUPABASE_PROJECT_REF": "YOUR_PROJECT_REF_HERE"}
    },
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com"
    },
    "railway": {
      "command": "npx",
      "args": ["-y", "@railway/mcp-server"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {"FIRECRAWL_API_KEY": "fc-YOUR_KEY_HERE"}
    },
    "cloudflare-docs": {
      "type": "http",
      "url": "https://docs.mcp.cloudflare.com/mcp"
    }
  }
}
```

**Total**: 15 MCPs configured at user level.

---

## Step 2: Get API Keys/Tokens

Some MCPs require authentication. Here's how to get them:

### GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Scopes needed: `repo`, `read:org`, `read:user`
4. Copy token starting with `ghp_`

### Supabase Project Reference

1. Go to your Supabase project dashboard
2. Settings → General
3. Copy "Reference ID"

### Firecrawl API Key

1. Go to: https://firecrawl.dev/
2. Sign up and get API key
3. Copy key starting with `fc-`

**Note**: Replace placeholder values (`YOUR_TOKEN_HERE`, etc.) with actual keys.

---

## Step 3: Per-Project Disabling

Create `.claude/settings.json` in each project to disable unused MCPs.

### Example: Python Backend Project

**File**: `~/projects/project/.claude/settings.json`

```json
{
  "disabledMcpServers": [
    "mdn-lookup",      // Not doing frontend
    "vercel",          // Not using Vercel
    "railway",         // Not using Railway
    "github",          // Using gh CLI instead
    "firecrawl",       // Not scraping
    "cloudflare-docs", // Not using Cloudflare
    "context7"         // Not needed for this project
  ]
}
```

**Active**: sentry, langfuse-docs, package-registry, augments, magg, memory, sequential-thinking, supabase
**= 8 MCPs**

### Example: Frontend React Project

**File**: `~/projects/frontend-app/.claude/settings.json`

```json
{
  "disabledMcpServers": [
    "supabase",        // Not using Supabase
    "railway",         // Not using Railway
    "firecrawl",       // Not scraping
    "cloudflare-docs", // Not using Cloudflare
    "sentry",          // Not integrated yet
    "langfuse-docs",   // Not using Langfuse
    "sequential-thinking" // Not needed
  ]
}
```

**Active**: package-registry, context7, augments, mdn-lookup, magg, github, memory, vercel
**= 8 MCPs**

### Example: Quick Prototype

**File**: `~/projects/quick-prototype/.claude/settings.json`

```json
{
  "disabledMcpServers": [
    "github",
    "supabase",
    "vercel",
    "railway",
    "firecrawl",
    "cloudflare-docs",
    "sentry",
    "langfuse-docs",
    "mdn-lookup"
  ]
}
```

**Active**: package-registry, context7, augments, magg, memory, sequential-thinking
**= 6 MCPs** (lighter context for fast prototyping)

---

## Benefits

✅ **Configure once** - All MCPs defined in `~/.claude.json`
✅ **Enable per-project** - Simple `disabledMcpServers` array
✅ **Healthy context** - Keep under 8 MCPs / 80 tools active
✅ **Easy toggling** - Remove from disabled list to re-enable
✅ **Project-specific** - Frontend projects use different MCPs than backend

---

## Verification

After configuration:

1. **Restart Claude Code** - Changes to `~/.claude.json` require restart
2. **Check available tools** - Run `/help` or check tool count
3. **Verify per-project** - cd to project, check which MCPs are active

---

## Rule of Thumb

> **Have 10-15 MCPs configured, keep under 8 enabled per project, under 80 tools active**

This keeps your context window healthy while maintaining flexibility.

---

## Next Steps

After completing MCP configuration:

- [ ] Add API keys/tokens to `~/.claude.json`
- [ ] Restart Claude Code
- [ ] Create `.claude/settings.json` for each project
- [ ] Verify tool count stays under 80
- [ ] Move to **Phase 3: Enhanced Hooks**
