#!/usr/bin/env node

/**
 * PreToolUse Enhancement: Block Random .md Files
 *
 * Keeps documentation consolidated in README.md and CLAUDE.md.
 */

const path = require('path');

// Get file path from environment
const filePath = process.env.CLAUDE_TOOL_FILE_PATH || '';

// Check if this is a .md file
if (!filePath.endsWith('.md')) {
  process.exit(0);
}

// Allow README.md and CLAUDE.md
const filename = path.basename(filePath);
const allowedFiles = ['README.md', 'CLAUDE.md'];

if (allowedFiles.includes(filename)) {
  process.exit(0);
}

// Allow .md files in docs/ directory
if (filePath.includes('/docs/')) {
  process.exit(0);
}

// Block random .md files
console.error('[Hook] ⚠️  Consider consolidating documentation:');
console.error(`[Hook] - Use README.md for project docs`);
console.error(`[Hook] - Use CLAUDE.md for Claude instructions`);
console.error(`[Hook] - Use docs/ for organized documentation`);
console.error(`[Hook] - Blocked: ${filePath}`);

process.exit(1);
