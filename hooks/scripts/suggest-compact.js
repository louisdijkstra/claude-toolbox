#!/usr/bin/env node

/**
 * PreToolUse Enhancement: Suggest Compaction at Logical Intervals
 *
 * Suggests running compaction after significant work.
 */

const fs = require('fs');
const path = require('path');

// Get state directory
const claudeDir = path.join(process.env.HOME, '.claude');
const stateFile = path.join(claudeDir, 'compact-suggestions.json');

// Load state
let state = { lastSuggestion: 0, editsSinceSuggestion: 0 };
if (fs.existsSync(stateFile)) {
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    // Invalid state, reset
  }
}

// Increment edit counter
state.editsSinceSuggestion++;

// Suggest compaction every 20 edits (configurable)
const EDITS_THRESHOLD = 20;
const now = Date.now();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

if (state.editsSinceSuggestion >= EDITS_THRESHOLD &&
    (now - state.lastSuggestion) > COOLDOWN_MS) {
  console.error('[Hook] 💡 Consider compacting context soon (20+ edits)');
  console.error('[Hook] Run: /compact or press Ctrl+L');
  state.lastSuggestion = now;
  state.editsSinceSuggestion = 0;
}

// Save state
try {
  fs.writeFileSync(stateFile, JSON.stringify(state), 'utf8');
} catch {
  // Ignore write errors
}

// Allow edit
process.exit(0);
