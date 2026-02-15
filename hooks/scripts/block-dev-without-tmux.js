#!/usr/bin/env node

/**
 * PreToolUse Enhancement: Block Dev Servers Outside Tmux
 *
 * Ensures dev servers run in tmux for log access.
 */

const { execSync } = require('child_process');

// Check if running in tmux
function isInTmux() {
  return !!process.env.TMUX;
}

// Check if this is a dev server command
const command = process.env.CLAUDE_TOOL_COMMAND || '';
const isDevServer = /npm run dev|pnpm dev|yarn dev|bun dev/.test(command);

if (isDevServer && !isInTmux()) {
  console.error('[Hook] ❌ Dev servers should run in tmux for log access');
  console.error('[Hook] Run: tmux new -s dev');
  console.error('[Hook] Then run the dev command inside tmux');
  process.exit(1);
}

// Allow command
process.exit(0);
