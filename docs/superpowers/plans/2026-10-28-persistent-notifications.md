# Persistent Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `permission_prompt` and `idle_prompt` hooks show a native notification with an icon that stays until the user clicks "Seen".

**Architecture:** `scripts/notify.js` gets a `--sticky` flag. `buildCommands` (pure) emits per-platform sticky banner commands first, then the existing plain banner as fallback. The runner takes the first banner command that launches. Commands marked `detach: true` keep running after notify.js exits.

**Tech Stack:** Node (built-ins only, `node --test`), `alerter` (macOS), PowerShell WinRT toast (Windows), `notify-send` (Linux), headless Chrome for the one-off PNG render.

## Global Constraints

- No npm dependencies; Node built-ins only.
- notify.js never fails a caller: every failure is a silent no-op and the exit code is 0.
- Message text is passed as argv or an encoded command, never interpolated into a shell string.
- Only `permission_prompt` and `idle_prompt` hooks get `--sticky`; `Stop` stays a plain banner.
- Icon is our own drawing; no Anthropic mark.
- Spec: `docs/superpowers/specs/2026-10-28-persistent-notifications-design.md`.
- Do not commit; the user decides on commits.

---

### Task 1: Icon asset

**Files:**
- Create: `scripts/notify-icon.svg`
- Create: `scripts/notify-icon.png`

**Interfaces:**
- Produces: `scripts/notify-icon.png` (256x256 PNG) that Task 2 resolves via `path.join(__dirname, "notify-icon.png")`.

- [ ] **Step 1: Copy the approved SVG source**

The approved icon was rendered to `/tmp/icon-n3.svg` (256px, viewBox 0 0 64 64). Copy it:

```bash
cp /tmp/icon-n3.svg ~/.claude/scripts/notify-icon.svg
```

- [ ] **Step 2: Render the PNG**

ImageMagick and QuickLook both render this SVG wrong (no gradient, white padding). Headless Chrome does it right, with a transparent background. The SVG needs `xmlns="http://www.w3.org/2000/svg"` on the root element.

```bash
cd ~/.claude/scripts && D=$(mktemp -d) && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$D" --default-background-color=00000000 --window-size=256,256 --screenshot=notify-icon.png "file://$PWD/notify-icon.svg"
```

- [ ] **Step 3: Verify**

Run: `file ~/.claude/scripts/notify-icon.png`
Expected: `PNG image data, 256 x 256`. Open it with the Read tool and confirm the coral tile shows white linked nodes and rounded corners.

---

### Task 2: Sticky banners in notify.js

**Files:**
- Modify: `scripts/notify.js`
- Test: `scripts/notify.test.js`

**Interfaces:**
- Consumes: `opts` from `parseArgs`, `SOUNDS`, existing `powerShellBalloon`, `encodePowerShell`.
- Produces:
  - `parseArgs(argv)` result gains `sticky: boolean` (flag `--sticky`) and `icon: string` (default `""`).
  - `buildCommands(opts, platform)` banner commands may have `detach: true`.
  - Sticky order of banner commands (first launch wins): darwin `[alerter, osascript]`; win32 `[toast, balloon]`; linux `[notify-send --wait, notify-send critical, notify-send plain]`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/notify.test.js`:

```js
const stickyOpts = (overrides) => opts({ message: "needs you", subtitle: "proj", sticky: true, ...overrides });

test("sticky darwin tries alerter first, then falls back to osascript", () => {
  const [first, second] = buildCommands(stickyOpts({ icon: "/x/icon.png" }), "darwin");
  assert.equal(first.bin, "alerter");
  assert.equal(first.detach, true);
  assert.deepEqual(first.args.slice(0, 8), ["--title", "Claude Code", "--message", "needs you", "--subtitle", "proj", "--actions", "Seen"]);
  assert.ok(first.args.includes("--close-label"));
  assert.deepEqual(first.args.slice(-2), ["--app-icon", "/x/icon.png"]);
  assert.equal(second.bin, "osascript");
});

test("sticky darwin without an icon omits --app-icon", () => {
  const [first] = buildCommands(stickyOpts(), "darwin");
  assert.ok(!first.args.includes("--app-icon"));
});

test("sticky win32 is a reminder toast with a Seen button, then the balloon", () => {
  const [toast, balloon] = buildCommands(stickyOpts({ message: "a & b <c>", icon: "C:\\i\\icon.png" }), "win32");
  assert.equal(toast.bin, "powershell");
  assert.notEqual(toast.detach, true);
  const script = Buffer.from(toast.args.at(-1), "base64").toString("utf16le");
  assert.match(script, /scenario="reminder"/);
  assert.match(script, /content="Seen" arguments="dismiss" activationType="system"/);
  assert.match(script, /a &amp; b &lt;c&gt;/);
  assert.match(script, /appLogoOverride" src="file:\/\/\/C:\/i\/icon\.png"/);
  assert.match(Buffer.from(balloon.args.at(-1), "base64").toString("utf16le"), /NotifyIcon/);
});

test("sticky linux waits for the Seen action, then falls back without --wait", () => {
  const [waiting, critical] = buildCommands(stickyOpts({ icon: "/x/icon.png" }), "linux");
  assert.equal(waiting.bin, "notify-send");
  assert.equal(waiting.detach, true);
  assert.deepEqual(waiting.args, ["-u", "critical", "-t", "0", "-i", "/x/icon.png", "--action=seen=Seen", "--wait", "Claude Code — proj", "needs you"]);
  assert.ok(!critical.args.includes("--wait"));
  assert.deepEqual(critical.args.slice(0, 4), ["-u", "critical", "-t", "0"]);
});

test("plain linux banner carries the icon when there is one", () => {
  const [banner] = buildCommands(opts({ message: "done", subtitle: "proj", icon: "/x/icon.png" }), "linux");
  assert.deepEqual(banner.args, ["-i", "/x/icon.png", "Claude Code — proj", "done"]);
});

test("non-sticky darwin never calls alerter", () => {
  const commands = buildCommands(opts({ message: "done" }), "darwin");
  assert.ok(commands.every((c) => c.bin !== "alerter"));
});

test("sticky without a message shows no banner", () => {
  const commands = buildCommands(opts({ sticky: true, sound: "attention" }), "darwin");
  assert.ok(commands.every((c) => c.kind === "sound"));
});

test("parseArgs reads --sticky and defaults icon to empty", () => {
  assert.equal(parseArgs(["--sticky"]).sticky, true);
  assert.equal(parseArgs([]).sticky, false);
  assert.equal(parseArgs([]).icon, "");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/.claude && node --test scripts/notify.test.js 2>&1 | tail -15`
Expected: the new tests FAIL (sticky not implemented); old tests still pass.

- [ ] **Step 3: Implement**

In `scripts/notify.js`:

3a. Top of file, extend requires and add the icon path constant:

```js
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
```

```js
// Own drawing, rendered from notify-icon.svg. Optional: notifications work without it.
const ICON_PATH = path.join(__dirname, "notify-icon.png");
// Windows reminder toasts need an AppUserModelID that is registered; PowerShell's own is.
const POWERSHELL_APP_ID = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";
```

3b. In `parseArgs`, extend the defaults and add the flag:

```js
  const opts = { message: "", sound: "", title: TITLE, subtitle: "", dryRun: false, fromHook: false, sticky: false, icon: "" };
```

```js
    else if (arg === "--sticky") opts.sticky = true;
```

3c. Add helpers after `powerShellSound` (and reuse `psLiteral` in the balloon: replace the local `const literal = ...` line in `powerShellBalloon` with `const literal = psLiteral;`):

```js
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
    if (opts.icon) args.push("--app-icon", opts.icon);
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
```

3d. In `buildCommands`, put sticky banners first, and add the icon to the plain linux banner:

```js
  if (opts.message) {
    if (opts.sticky) commands.push(...stickyBanners(opts, platform));
    if (platform === "darwin") {
```

and in the linux branch:

```js
      const icon = opts.icon ? ["-i", opts.icon] : [];
      commands.push({ kind: "banner", bin: "notify-send", args: [...icon, title, opts.message] });
```

3e. In `main`, resolve the icon and honor `detach`:

```js
  if (!opts.icon && fs.existsSync(ICON_PATH)) opts.icon = ICON_PATH;
```
(place right after `parseArgs`), and change the run call to:

```js
      if (await run(command, { awaitExit: kind === "banner" && !command.detach })) break;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/.claude && node --test scripts/notify.test.js 2>&1 | tail -10`
Expected: all tests pass, 0 fail.

- [ ] **Step 5: Dry-run each platform**

```bash
cd ~/.claude && for p in darwin win32 linux; do NOTIFY_PLATFORM=$p node scripts/notify.js --dry-run --sticky --sound attention "needs you" | head -12; done
```
Expected: darwin lists `alerter` then `osascript` then `afplay`, with `--app-icon` ending in `notify-icon.png`; win32 lists two powershell commands; linux lists three `notify-send` commands.

---

### Task 3: Hook wiring, docs, live check

**Files:**
- Modify: `settings.json` (the `idle_prompt` and `permission_prompt` hook commands)
- Modify: `scripts/README.md`

**Interfaces:**
- Consumes: `--sticky` flag from Task 2.

- [ ] **Step 1: Add `--sticky` to the two Notification hooks**

In `settings.json` change:
- `node ~/.claude/scripts/notify.js --from-hook --sound attention` to `node ~/.claude/scripts/notify.js --from-hook --sticky --sound attention`
- `node ~/.claude/scripts/notify.js --from-hook --sound error` to `node ~/.claude/scripts/notify.js --from-hook --sticky --sound error`

Leave the `Stop` hook (`--sound done`) unchanged.

- [ ] **Step 2: Validate settings.json and the diff**

Run: `cd ~/.claude && python3 -c "import json;json.load(open('settings.json'))" && grep -c -- '--sticky' settings.json`
Expected: no error; count `2`.

- [ ] **Step 3: Document the flag**

In `scripts/README.md`, in the flag table of the `notify.js` section add a row:

| `--sticky` | Banner stays until the user clicks Seen. macOS needs `alerter` (`brew install vjeantet/tap/alerter`), else a plain banner is shown. |

and add a line below the table: `The icon is scripts/notify-icon.png (source: notify-icon.svg).`

- [ ] **Step 4: Live check on macOS**

```bash
echo '{"hook_event_name":"Notification","message":"Claude needs your permission to use Bash"}' | node ~/.claude/scripts/notify.js --from-hook --sticky --sound attention
sleep 8; screencapture -x /tmp/sticky-check.png
```
Open `/tmp/sticky-check.png` with Read. Expected: the notification still shown top right after 8 seconds, with the mesh icon and a Seen button. If macOS asks to allow notifications for the sender, allow it once. Then click Seen and run `pgrep alerter` (expected: no output).

- [ ] **Step 5: Full suite**

Run: `cd ~/.claude && node --test scripts/*.test.js 2>&1 | tail -8`
Expected: 0 fail.
