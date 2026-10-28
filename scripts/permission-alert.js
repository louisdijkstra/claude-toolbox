#!/usr/bin/env node
/**
 * PermissionRequest hook: shows an alert with Allow / Deny buttons and answers
 * Claude Code with the click. macOS + alerter only.
 *
 * Fails closed. Only an exact "Allow" or "Deny" click prints a decision; a close,
 * a timeout, an error or a request that is not fully visible in the alert prints
 * nothing, and Claude Code then asks in the terminal as usual. Exit code is always 0.
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const MAX_DETAIL = 140;
const WAIT_SECONDS = 300;
const POLL_MS = 500;
const NOTIFY_SCRIPT = path.join(__dirname, "notify.js");

// Only tools whose whole request is one short line we can show. An Edit needs its
// diff, which does not fit, so it stays a terminal decision.
const DETAIL_FIELD = {
  Bash: "command",
  WebFetch: "url",
  Read: "file_path",
  Glob: "pattern",
  Grep: "pattern",
};

/** The alert to show for a request, or null when buttons would not be safe. */
function alertFor(payload) {
  const field = DETAIL_FIELD[payload?.tool_name];
  const input = payload?.tool_input;
  if (!field || !input || typeof input[field] !== "string") return null;
  if (input.dangerouslyDisableSandbox === true) return null;

  const detail = input[field].trim();
  if (!detail || detail.includes("\n") || detail.length > MAX_DETAIL) return null;

  const project = String(payload.cwd || "").split(/[\\/]/).filter(Boolean).pop() || "";
  return { message: `Allow ${payload.tool_name}? ${detail}`, subtitle: `project ${project}` };
}

function decision(behavior, extra = {}) {
  return JSON.stringify({ hookSpecificOutput: { hookEventName: "PermissionRequest", decision: { behavior, ...extra } } });
}

/** Hook output for a clicked action. Anything but an exact label decides nothing. */
function decisionFor(activationValue) {
  if (activationValue === "Allow") return decision("allow");
  if (activationValue === "Deny") return decision("deny", { message: "Denied from the notification", interrupt: false });
  return "";
}

/** While Claude waits for permission the transcript is quiet; growth means it moved on. */
function transcriptGrew(startSize, currentSize) {
  return currentSize > startSize;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function transcriptSize(file) {
  try {
    return fs.statSync(file).size;
  } catch {
    return -1;
  }
}

function activationValueFrom(output) {
  try {
    return JSON.parse(output).activationValue;
  } catch {
    return undefined;
  }
}

/** Shows the alert and resolves to the hook output: a decision JSON, or "" for none. */
function askUser(alert, transcriptPath) {
  return new Promise((resolve) => {
    const group = `claude-permission-${process.pid}`;
    const args = [
      "--title", "Claude Code",
      "--subtitle", alert.subtitle,
      "--message", alert.message,
      // Two --actions render as a dropdown that macOS 26 does not show, so Deny is the close button.
      // Both clicks report their own label as activationValue.
      "--actions", "Allow",
      "--close-label", "Deny",
      "--timeout", String(WAIT_SECONDS),
      "--group", group,
      "--json",
    ];
    const child = spawn("alerter", args, { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    let finished = false;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearInterval(poll);
      resolve(result);
    };
    const dismissAlert = () => {
      child.kill("SIGTERM");
      spawnSync("alerter", ["--remove", group], { stdio: "ignore", timeout: 3000 });
    };
    const giveUpQuietly = () => {
      dismissAlert();
      finish("");
    };

    child.stdout.on("data", (chunk) => (output += chunk));
    child.on("error", () => finish("")); // alerter not installed
    child.on("close", () => finish(decisionFor(activationValueFrom(output))));

    const startSize = transcriptSize(transcriptPath);
    const poll = setInterval(() => {
      if (startSize >= 0 && transcriptGrew(startSize, transcriptSize(transcriptPath))) giveUpQuietly();
    }, POLL_MS);

    process.on("SIGTERM", giveUpQuietly);
    process.on("SIGINT", giveUpQuietly);
  });
}

function playAttentionSound() {
  const child = spawn(process.execPath, [NOTIFY_SCRIPT, "--sound", "attention"], { stdio: "ignore", detached: true });
  child.on("error", () => {});
  child.unref();
}

async function main() {
  if ((process.env.NOTIFY_PLATFORM || process.platform) !== "darwin") return;

  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    return;
  }
  const alert = alertFor(payload);
  if (!alert) return;

  playAttentionSound();
  const output = await askUser(alert, String(payload.transcript_path || ""));
  if (output) process.stdout.write(output);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    () => process.exit(0),
  );
}

module.exports = { alertFor, decisionFor, transcriptGrew, MAX_DETAIL };
