#!/usr/bin/env node

/**
 * Notification Hook (idle_prompt): TTS summary via macOS `say`
 *
 * Only speaks when git shows uncommitted file changes (something big happened).
 * Summarizes in max 10 words, prefixed with project dir name.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MIN_MESSAGE_LENGTH = 100;
const MAX_WORDS = 10;

function main() {
  const debugLog = path.join(os.tmpdir(), 'tts-idle-debug.log');
  let raw;
  let input;
  try {
    raw = fs.readFileSync(0, 'utf-8');
    fs.appendFileSync(debugLog, `\n--- ${new Date().toISOString()} ---\nraw (${raw.length} chars): ${raw.slice(0, 500)}\n`);
    input = JSON.parse(raw);
  } catch (e) {
    fs.appendFileSync(debugLog, `parse error: ${e.message}\n`);
    process.exit(0);
  }

  const { last_assistant_message, cwd } = input;

  if (!last_assistant_message || last_assistant_message.length < MIN_MESSAGE_LENGTH) {
    fs.appendFileSync(debugLog, `skipped: msg length = ${last_assistant_message?.length ?? 'null'}\n`);
    process.exit(0);
  }
  fs.appendFileSync(debugLog, `proceeding: msg length = ${last_assistant_message.length}, project = ${project}\n`);

  const workDir = cwd || process.cwd();
  const project = path.basename(workDir);
  const prompt = [
    `Summarize what was just done in max ${MAX_WORDS} words.`,
    `Start with "${project}:".`,
    `No markdown, no special characters. Natural spoken English.`,
    ``,
    `Claude's last message:`,
    last_assistant_message.slice(0, 1500),
  ].join('\n');

  const tmpFile = path.join(os.tmpdir(), `tts-idle-${process.pid}.txt`);
  fs.writeFileSync(tmpFile, prompt);

  const child = spawn('sh', ['-c', `claude -p --model haiku < "${tmpFile}" 2>/dev/null | say -v Alex; rm -f "${tmpFile}"`], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

main();
