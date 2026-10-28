const test = require("node:test");
const assert = require("node:assert");
const { buildCommands, parseArgs, messageFromHookPayload } = require("./notify.js");

const opts = (overrides) => ({ message: "", sound: "", title: "Claude Code", subtitle: "", ...overrides });

test("darwin banner escapes quotes and backslashes", () => {
  const [banner] = buildCommands(opts({ message: 'he said "hi" \\ done', subtitle: "proj" }), "darwin");
  assert.equal(banner.bin, "osascript");
  assert.match(banner.args[1], /display notification "he said \\"hi\\" \\\\ done"/);
  assert.match(banner.args[1], /subtitle "proj"/);
});

test("win32 banner is a single encoded powershell command", () => {
  const [banner] = buildCommands(opts({ message: "it's done", subtitle: "proj" }), "win32");
  assert.equal(banner.bin, "powershell");
  const script = Buffer.from(banner.args.at(-1), "base64").toString("utf16le");
  assert.match(script, /NotifyIcon/);
  assert.match(script, /'proj: it''s done'/);
});

test("linux banner uses notify-send with title and message as separate args", () => {
  const [banner] = buildCommands(opts({ message: "done", subtitle: "proj" }), "linux");
  assert.deepEqual(banner, { kind: "banner", bin: "notify-send", args: ["Claude Code — proj", "done"] });
});

test("sound-only emits no banner", () => {
  for (const platform of ["darwin", "win32", "linux"]) {
    const commands = buildCommands(opts({ sound: "done" }), platform);
    assert.ok(commands.length > 0, platform);
    assert.ok(commands.every((c) => c.kind === "sound"), platform);
  }
});

test("banner alone is silent — no sound unless --sound is passed", () => {
  const commands = buildCommands(opts({ message: "done" }), "darwin");
  assert.ok(commands.every((c) => c.kind === "banner"));
});

test("linux offers a fallback sound player", () => {
  const sounds = buildCommands(opts({ sound: "done" }), "linux");
  assert.deepEqual(sounds.map((c) => c.bin), ["paplay", "canberra-gtk-play"]);
});

test("unknown platform yields nothing rather than a broken command", () => {
  assert.deepEqual(buildCommands(opts({ message: "done", sound: "done" }), "aix"), []);
});

test("unknown sound name yields no sound command", () => {
  assert.deepEqual(buildCommands(opts({ sound: "kaboom" }), "darwin"), []);
});

test("parseArgs takes the first positional as the message", () => {
  const parsed = parseArgs(["--sound", "error", "build failed"]);
  assert.equal(parsed.sound, "error");
  assert.equal(parsed.message, "build failed");
});

test("hook payload: Notification message is used as-is", () => {
  const payload = JSON.stringify({ hook_event_name: "Notification", message: "Claude needs your permission to use Bash" });
  assert.equal(messageFromHookPayload(payload), "Claude needs your permission to use Bash");
});

test("hook payload: Stop has no message, so it gets a fixed one", () => {
  assert.equal(messageFromHookPayload(JSON.stringify({ hook_event_name: "Stop" })), "Finished, waiting for you");
});

test("hook payload: garbage or empty input yields no message", () => {
  assert.equal(messageFromHookPayload("not json"), "");
  assert.equal(messageFromHookPayload(""), "");
});

test("parseArgs reads --from-hook", () => {
  assert.equal(parseArgs(["--from-hook"]).fromHook, true);
  assert.equal(parseArgs([]).fromHook, false);
});

const stickyOpts = (overrides) => opts({ message: "needs you", subtitle: "proj", sticky: true, ...overrides });

test("sticky darwin tries alerter first, then falls back to osascript", () => {
  const [first, second] = buildCommands(stickyOpts(), "darwin");
  assert.equal(first.bin, "alerter");
  assert.equal(first.detach, true);
  assert.deepEqual(first.args.slice(0, 8), ["--title", "Claude Code", "--message", "needs you", "--subtitle", "proj", "--actions", "Seen"]);
  assert.ok(first.args.includes("--close-label"));
  assert.deepEqual(first.args.slice(-2), ["--close-label", "Dismiss"]);
  assert.equal(second.bin, "osascript");
});

test("sticky darwin never passes an icon, macOS ignores it", () => {
  const [first] = buildCommands(stickyOpts({ icon: "/x/icon.png" }), "darwin");
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
