#!/usr/bin/env node
/**
 * Cross-platform desktop notification + sound for Claude Code.
 *
 *   node ~/.claude/scripts/notify.js "test suite green: 1247 passed"
 *   node ~/.claude/scripts/notify.js --sound done
 *   node ~/.claude/scripts/notify.js --sound error "build failed: 2 auth tests"
 *
 * Never breaks a caller: unknown platform, missing binary, no display or denied
 * notification permission all degrade to a silent no-op and exit 0. Losing a
 * banner is acceptable; failing a hook or a turn is not.
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { alertFor } = require("./permission-alert.js");

const TITLE = "Claude Code";
const BALLOON_MS = 5000;
// Own drawing, rendered from notify-icon.svg. Optional: notifications work without it.
const ICON_PATH = path.join(__dirname, "notify-icon.png");
// Windows reminder toasts need a registered AppUserModelID; PowerShell's own is.
const POWERSHELL_APP_ID = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";
const SPAWN_TIMEOUT_MS = 5000;
// Long enough for a spawn to fail with ENOENT, short enough that a hook does
// not wait for playback. Sounds are fire-and-forget; only launch failure matters.
const LAUNCH_PROBE_MS = 200;

// Semantic name -> per-platform asset, so callers never name a file.
const SOUNDS = {
  darwin: {
    done: "/System/Library/Sounds/Hero.aiff",
    attention: "/System/Library/Sounds/Glass.aiff",
    error: "/System/Library/Sounds/Basso.aiff",
  },
  win32: {
    done: "C:\\Windows\\Media\\Windows Notify System Generic.wav",
    attention: "C:\\Windows\\Media\\Windows Ding.wav",
    error: "C:\\Windows\\Media\\Windows Critical Stop.wav",
  },
  linux: {
    done: "/usr/share/sounds/freedesktop/stereo/complete.oga",
    attention: "/usr/share/sounds/freedesktop/stereo/message.oga",
    error: "/usr/share/sounds/freedesktop/stereo/dialog-error.oga",
  },
};

function parseArgs(argv) {
  const opts = { message: "", sound: "", title: TITLE, subtitle: "", dryRun: false, fromHook: false, sticky: false, icon: "" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sound") opts.sound = argv[++i] || "";
    else if (arg.startsWith("--sound=")) opts.sound = arg.slice(8);
    else if (arg === "--title") opts.title = argv[++i] || TITLE;
    else if (arg === "--subtitle") opts.subtitle = argv[++i] || "";
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--from-hook") opts.fromHook = true;
    else if (arg === "--sticky") opts.sticky = true;
    else if (!arg.startsWith("--") && !opts.message) opts.message = arg;
  }
  return opts;
}

const MAX_BODY = 140;
// A transcript can be many MB; the last assistant turn is always near the end.
const TRANSCRIPT_TAIL_BYTES = 256 * 1024;

const clip = (value) => (value.length > MAX_BODY ? `${value.slice(0, MAX_BODY - 1).trimEnd()}…` : value);

function transcriptEntries(transcriptText) {
  return transcriptText.split("\n").flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return []; // a partial first line from the tail read, or noise
    }
  });
}

/** Most recent content block of one type in an assistant entry, or null. */
function lastAssistantBlock(entries, type) {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type !== "assistant") continue;
    const blocks = Array.isArray(entries[i].message?.content) ? entries[i].message.content : [];
    for (let j = blocks.length - 1; j >= 0; j--) if (blocks[j].type === type) return blocks[j];
  }
  return null;
}

const MAX_HEADLINE = 70;
const MAX_QUESTION = 60;

const clipTo = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);

/** Non-empty lines of Claude's last text, with markdown marks stripped. */
function textLines(entries) {
  const block = lastAssistantBlock(entries, "text");
  return String(block?.text || "")
    .split("\n")
    .map((line) => line.replace(/[*_`#>]/g, "").replace(/^\s*(?:[-•]|\d+\.)\s*/, "").trim())
    .filter(Boolean);
}

/** The last line is usually the question Claude is asking. */
function lastLineOfText(entries) {
  return textLines(entries).at(-1) || "";
}

/** Opening sentence for context plus the closing line, so "Want me to commit it?" says what about. */
function headlineAndQuestion(entries) {
  const lines = textLines(entries);
  if (lines.length === 0) return "";
  if (lines.length === 1) return lines[0];
  const firstSentence = lines[0].split(/(?<=[.!:])\s/)[0];
  return `${clipTo(firstSentence, MAX_HEADLINE)} — ${clipTo(lines.at(-1), MAX_QUESTION)}`;
}

function describeToolUse(entries) {
  const block = lastAssistantBlock(entries, "tool_use");
  const input = block?.input || {};
  const detail = input.command || input.file_path || input.url || input.pattern || "";
  const firstLine = String(detail).split("\n")[0].trim();
  return firstLine ? `Allow ${block.name}? ${firstLine}` : "";
}

/**
 * Banner text for a hook's stdin JSON. The hook's own message is generic
 * ("Claude is waiting for your input"), so the transcript supplies the content.
 * Any gap falls back to the hook's message, then to nothing.
 */
function messageFromHookPayload(raw, transcriptText = "") {
  try {
    const payload = JSON.parse(raw);
    const original = payload.message ? String(payload.message) : "";
    if (payload.hook_event_name === "Stop" && !original) return "Finished, waiting for you";
    if (payload.hook_event_name === "StopFailure") return "Claude stopped because of an error";
    const entries = transcriptEntries(transcriptText);
    const detailed = isIdlePrompt(payload) ? headlineAndQuestion(entries) : isPermissionPrompt(payload) ? describeToolUse(entries) : "";
    return clip(detailed || original);
  } catch {
    // Malformed payload: fall through to no banner rather than failing the hook.
  }
  return "";
}

const isIdlePrompt = (payload) =>
  payload.notification_type === "idle_prompt" || /waiting for your input/i.test(String(payload.message || ""));
const isPermissionPrompt = (payload) =>
  payload.notification_type === "permission_prompt" || /needs your permission/i.test(String(payload.message || ""));

/**
 * True when the alert would only repeat something the user already knows, so it
 * should not be shown at all (not even the sound). Unsure means shown: a missed
 * alert costs more than an extra one.
 */
function shouldStaySilent(raw, transcriptText = "", platform = process.platform) {
  try {
    const payload = JSON.parse(raw);
    const entries = transcriptEntries(transcriptText);
    if (isIdlePrompt(payload)) {
      // A plain "I'm done" is already covered by the sound on every finished turn.
      const lastLine = lastLineOfText(entries);
      return Boolean(lastLine) && !lastLine.endsWith("?");
    }
    if (isPermissionPrompt(payload)) {
      // On macOS the Allow/Deny alert already covers a request it can show buttons for.
      const block = lastAssistantBlock(entries, "tool_use");
      return platform === "darwin" && Boolean(block) && alertFor({ tool_name: block.name, tool_input: block.input }) !== null;
    }
  } catch {
    // Unreadable payload: show rather than miss.
  }
  return false;
}

function transcriptPathFrom(raw) {
  try {
    return String(JSON.parse(raw).transcript_path || "");
  } catch {
    return "";
  }
}

function readTranscriptTail(file) {
  if (!file) return "";
  try {
    const fd = fs.openSync(file, "r");
    try {
      const { size } = fs.fstatSync(fd);
      const length = Math.min(size, TRANSCRIPT_TAIL_BYTES);
      const buffer = Buffer.alloc(length);
      fs.readSync(fd, buffer, 0, length, size - length);
      return buffer.toString("utf8");
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return "";
  }
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

/** Basename of cwd, so parallel sessions are distinguishable in the banner. */
function projectName() {
  try {
    return process.cwd().split(/[\\/]/).filter(Boolean).pop() || "";
  } catch {
    return "";
  }
}

/** AppleScript string literal: only \ and " need escaping. */
function escapeAppleScript(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Base64 UTF-16LE for powershell -EncodedCommand. Sidesteps every layer of
 * cmd.exe/PowerShell quoting, which is the usual source of Windows breakage.
 */
function encodePowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function powerShellBalloon({ title, message }) {
  const literal = psLiteral;
  // NotifyIcon ships with .NET on every Win10/11 host, unlike BurntToast.
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "Add-Type -AssemblyName System.Drawing",
    "$icon = New-Object System.Windows.Forms.NotifyIcon",
    "$icon.Icon = [System.Drawing.SystemIcons]::Information",
    "$icon.Visible = $true",
    `$icon.ShowBalloonTip(${BALLOON_MS}, ${literal(title)}, ${literal(message)}, [System.Windows.Forms.ToolTipIcon]::Info)`,
    `Start-Sleep -Milliseconds ${BALLOON_MS + 1000}`,
    "$icon.Dispose()",
  ].join("; ");
  return {
    kind: "banner",
    bin: "powershell",
    args: ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-EncodedCommand", encodePowerShell(script)],
  };
}

function powerShellSound(file) {
  const script = `(New-Object Media.SoundPlayer ${`'${file.replace(/'/g, "''")}'`}).PlaySync()`;
  return {
    kind: "sound",
    bin: "powershell",
    args: ["-NoProfile", "-NonInteractive", "-EncodedCommand", encodePowerShell(script)],
  };
}

const psLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`;

const xmlEscape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Reminder toasts stay until clicked; Windows requires them to have a button. */
function powerShellToast({ title, message, icon }) {
  const image = icon ? `<image placement="appLogoOverride" src="file:///${icon.replace(/\\/g, "/")}"/>` : "";
  const xml =
    `<toast scenario="reminder"><visual><binding template="ToastGeneric">${image}` +
    `<text>${xmlEscape(title)}</text><text>${xmlEscape(message)}</text></binding></visual>` +
    `<actions><action content="Seen" arguments="dismiss" activationType="system"/></actions></toast>`;
  const script = [
    "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null",
    "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null",
    "$doc = New-Object Windows.Data.Xml.Dom.XmlDocument",
    `$doc.LoadXml(${psLiteral(xml)})`,
    "$toast = [Windows.UI.Notifications.ToastNotification]::new($doc)",
    `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier(${psLiteral(POWERSHELL_APP_ID)}).Show($toast)`,
  ].join("; ");
  return {
    kind: "banner",
    bin: "powershell",
    args: ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-EncodedCommand", encodePowerShell(script)],
  };
}

/** Banners that stay until the user clicks Seen. Tried before the plain banner. */
function stickyBanners(opts, platform) {
  if (platform === "darwin") {
    const args = ["--title", opts.title, "--message", opts.message];
    if (opts.subtitle) args.push("--subtitle", opts.subtitle);
    args.push("--actions", "Seen", "--close-label", "Dismiss");
    // No icon: macOS takes it from the sending app and ignores --app-icon / --content-image.
    // alerter blocks until the click, so it must outlive this process.
    return [{ kind: "banner", bin: "alerter", args, detach: true }];
  }
  if (platform === "win32") {
    const message = opts.subtitle ? `${opts.subtitle}: ${opts.message}` : opts.message;
    return [powerShellToast({ title: opts.title, message, icon: opts.icon })];
  }
  if (platform === "linux") {
    const title = opts.subtitle ? `${opts.title} — ${opts.subtitle}` : opts.title;
    const base = ["-u", "critical", "-t", "0", ...(opts.icon ? ["-i", opts.icon] : [])];
    return [
      { kind: "banner", bin: "notify-send", args: [...base, "--action=seen=Seen", "--wait", title, opts.message], detach: true },
      // Older libnotify has no --wait/--action; keep it critical so it still stays.
      { kind: "banner", bin: "notify-send", args: [...base, title, opts.message] },
    ];
  }
  return [];
}

/** Every command this run should attempt, in order. Pure — the unit under test. */
function buildCommands(opts, platform) {
  const commands = [];
  const soundFile = opts.sound ? (SOUNDS[platform] || {})[opts.sound] : "";

  if (opts.message) {
    if (opts.sticky) commands.push(...stickyBanners(opts, platform));
    if (platform === "darwin") {
      const parts = [`display notification "${escapeAppleScript(opts.message)}"`, `with title "${escapeAppleScript(opts.title)}"`];
      if (opts.subtitle) parts.push(`subtitle "${escapeAppleScript(opts.subtitle)}"`);
      commands.push({ kind: "banner", bin: "osascript", args: ["-e", parts.join(" ")] });
    } else if (platform === "win32") {
      const message = opts.subtitle ? `${opts.subtitle}: ${opts.message}` : opts.message;
      commands.push(powerShellBalloon({ title: opts.title, message }));
    } else if (platform === "linux") {
      const title = opts.subtitle ? `${opts.title} — ${opts.subtitle}` : opts.title;
      const icon = opts.icon ? ["-i", opts.icon] : [];
      commands.push({ kind: "banner", bin: "notify-send", args: [...icon, title, opts.message] });
    }
  }

  if (soundFile) {
    if (platform === "darwin") commands.push({ kind: "sound", bin: "afplay", args: [soundFile] });
    else if (platform === "win32") commands.push(powerShellSound(soundFile));
    else if (platform === "linux") {
      commands.push({ kind: "sound", bin: "paplay", args: [soundFile] });
      commands.push({ kind: "sound", bin: "canberra-gtk-play", args: ["-f", soundFile] });
    }
  }

  return commands;
}

/**
 * Resolves true when the command ran, false on any failure.
 *
 * `awaitExit` false returns as soon as the launch is known to have succeeded,
 * leaving the child running detached — a hook must not block on audio playback.
 */
function run({ bin, args }, { awaitExit = true } = {}) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(bin, args, {
        stdio: "ignore",
        timeout: awaitExit ? SPAWN_TIMEOUT_MS : undefined,
        detached: !awaitExit,
      });
    } catch {
      resolve(false);
      return;
    }
    child.on("error", () => resolve(false));
    if (awaitExit) {
      child.on("exit", (code) => resolve(code === 0));
      return;
    }
    child.unref();
    const probe = setTimeout(() => resolve(true), LAUNCH_PROBE_MS);
    probe.unref?.();
    child.on("exit", (code) => {
      clearTimeout(probe);
      resolve(code === 0);
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.icon && fs.existsSync(ICON_PATH)) opts.icon = ICON_PATH;
  if (opts.fromHook && !opts.message) {
    const raw = await readStdin();
    const transcriptText = readTranscriptTail(transcriptPathFrom(raw));
    if (shouldStaySilent(raw, transcriptText)) return;
    opts.message = messageFromHookPayload(raw, transcriptText);
  }
  if (!opts.subtitle && opts.message) opts.subtitle = `project ${projectName()}`;

  const platform = process.env.NOTIFY_PLATFORM || process.platform;
  const commands = buildCommands(opts, platform);

  if (opts.dryRun) {
    console.log(JSON.stringify(commands, null, 2));
    return;
  }

  // Banner and sound are independent groups. Within a group the entries are
  // alternatives (linux has several sound players), so the first success wins.
  for (const kind of ["banner", "sound"]) {
    for (const command of commands.filter((c) => c.kind === kind)) {
      if (await run(command, { awaitExit: kind === "banner" && !command.detach })) break;
    }
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    () => process.exit(0),
  );
}

module.exports = { buildCommands, parseArgs, messageFromHookPayload, shouldStaySilent, SOUNDS };
