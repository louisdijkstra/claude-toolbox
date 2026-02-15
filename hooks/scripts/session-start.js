#!/usr/bin/env node

/**
 * SessionStart Hook: Session Start
 *
 * Runs when Claude Code session starts.
 * Loads previous context and detects environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get project root from environment or current directory
const projectRoot = process.env.PWD || process.cwd();
const claudeDir = path.join(process.env.HOME, '.claude');
const sessionsDir = path.join(claudeDir, 'sessions');
const projectClaudeDir = path.join(projectRoot, '.claude');

// Detect package manager
function detectPackageManager() {
  const lockfiles = {
    'package-lock.json': 'npm',
    'yarn.lock': 'yarn',
    'pnpm-lock.yaml': 'pnpm',
    'bun.lockb': 'bun',
    'uv.lock': 'uv',
    'Pipfile.lock': 'pipenv',
    'poetry.lock': 'poetry',
  };

  for (const [lockfile, manager] of Object.entries(lockfiles)) {
    if (fs.existsSync(path.join(projectRoot, lockfile))) {
      return manager;
    }
  }

  return 'unknown';
}

// Get latest session summary
function getLatestSession() {
  if (!fs.existsSync(sessionsDir)) {
    return null;
  }

  const sessions = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  if (sessions.length === 0) {
    return null;
  }

  const latestFile = path.join(sessionsDir, sessions[0]);
  try {
    const content = fs.readFileSync(latestFile, 'utf8');
    const firstLines = content.split('\n').slice(0, 10).join('\n');
    return { file: sessions[0], preview: firstLines };
  } catch (err) {
    return null;
  }
}

// Get git branch if in git repo
function getGitBranch() {
  try {
    const branch = execSync('git branch --show-current', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    return branch || 'main';
  } catch {
    return null;
  }
}

// Detect environment
const packageManager = detectPackageManager();
const gitBranch = getGitBranch();
const latestSession = getLatestSession();
const hasProjectClaude = fs.existsSync(projectClaudeDir);

// Build context summary
const context = [];

context.push('[Hook] Session starting...');
context.push(`  Project: ${path.basename(projectRoot)}`);

if (packageManager !== 'unknown') {
  context.push(`  Package Manager: ${packageManager}`);
}

if (gitBranch) {
  context.push(`  Git Branch: ${gitBranch}`);
}

if (hasProjectClaude) {
  context.push(`  Project Config: .claude/ detected`);
}

if (latestSession) {
  context.push(`  Last Session: ${latestSession.file}`);
}

// Output context summary to stderr (visible to user)
console.error(context.join('\n'));

// Success
process.exit(0);
