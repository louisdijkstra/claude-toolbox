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

const { spawn } = require("node:child_process");

const TITLE = "Claude Code";
const BALLOON_MS = 5000;
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
  const opts = { message: "", sound: "", title: TITLE, subtitle: "", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sound") opts.sound = argv[++i] || "";
    else if (arg.startsWith("--sound=")) opts.sound = arg.slice(8);
    else if (arg === "--title") opts.title = argv[++i] || TITLE;
    else if (arg === "--subtitle") opts.subtitle = argv[++i] || "";
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (!arg.startsWith("--") && !opts.message) opts.message = arg;
  }
  return opts;
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
  const literal = (value) => `'${String(value).replace(/'/g, "''")}'`;
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

/** Every command this run should attempt, in order. Pure — the unit under test. */
function buildCommands(opts, platform) {
  const commands = [];
  const soundFile = opts.sound ? (SOUNDS[platform] || {})[opts.sound] : "";

  if (opts.message) {
    if (platform === "darwin") {
      const parts = [`display notification "${escapeAppleScript(opts.message)}"`, `with title "${escapeAppleScript(opts.title)}"`];
      if (opts.subtitle) parts.push(`subtitle "${escapeAppleScript(opts.subtitle)}"`);
      commands.push({ kind: "banner", bin: "osascript", args: ["-e", parts.join(" ")] });
    } else if (platform === "win32") {
      const message = opts.subtitle ? `${opts.subtitle}: ${opts.message}` : opts.message;
      commands.push(powerShellBalloon({ title: opts.title, message }));
    } else if (platform === "linux") {
      const title = opts.subtitle ? `${opts.title} — ${opts.subtitle}` : opts.title;
      commands.push({ kind: "banner", bin: "notify-send", args: [title, opts.message] });
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
  if (!opts.subtitle && opts.message) opts.subtitle = projectName();

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
      if (await run(command, { awaitExit: kind === "banner" })) break;
    }
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    () => process.exit(0),
  );
}

module.exports = { buildCommands, parseArgs, SOUNDS };
