const test = require("node:test");
const assert = require("node:assert");
const { buildCommands, parseArgs, messageFromHookPayload, shouldStaySilent } = require("./notify.js");

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

const transcript = (...entries) => entries.map((e) => JSON.stringify(e)).join("\n");
const assistant = (...blocks) => ({ type: "assistant", message: { content: blocks } });
const text = (value) => ({ type: "text", text: value });
const toolUse = (name, input) => ({ type: "tool_use", name, input });
const idlePayload = JSON.stringify({ hook_event_name: "Notification", notification_type: "idle_prompt", message: "Claude is waiting for your input" });
const permissionPayload = JSON.stringify({ hook_event_name: "Notification", notification_type: "permission_prompt", message: "Claude needs your permission to use Bash" });

test("idle prompt shows the last line of Claude's last text, without markdown", () => {
  const log = transcript(
    assistant(text("First part.\n\n**Which do you want?**")),
    assistant(toolUse("Read", { file_path: "/x" })),
  );
  assert.equal(messageFromHookPayload(idlePayload, log), "First part. — Which do you want?");
});

test("idle prompt joins the opening sentence and the closing question", () => {
  const log = transcript(assistant(text("Messages are cut down and tested. I checked each case live, details below.\n\n- point one\n\nWant me to commit it?")));
  assert.equal(messageFromHookPayload(idlePayload, log), "Messages are cut down and tested. — Want me to commit it?");
});

test("idle prompt with a single line shows just that line", () => {
  assert.equal(messageFromHookPayload(idlePayload, transcript(assistant(text("Which do you want?")))), "Which do you want?");
});

test("idle prompt clips a long headline and a long question separately", () => {
  const log = transcript(assistant(text(`${"a".repeat(100)}\n\n${"b".repeat(100)}?`)));
  const out = messageFromHookPayload(idlePayload, log);
  const [headline, question] = out.split(" — ");
  assert.equal(headline.length, 70);
  assert.ok(headline.endsWith("…"));
  assert.equal(question.length, 60);
  assert.ok(question.endsWith("…"));
});

test("idle prompt keeps the original text when there is no transcript", () => {
  assert.equal(messageFromHookPayload(idlePayload, ""), "Claude is waiting for your input");
});

test("idle prompt cuts long text with an ellipsis", () => {
  const out = messageFromHookPayload(idlePayload, transcript(assistant(text("a".repeat(300)))));
  assert.equal(out.length, 140);
  assert.ok(out.endsWith("…"));
});

test("permission prompt names the tool and the command", () => {
  const log = transcript(assistant(toolUse("Bash", { command: "git push origin main" })));
  assert.equal(messageFromHookPayload(permissionPayload, log), "Allow Bash? git push origin main");
});

test("permission prompt for an edit shows the file path", () => {
  const log = transcript(assistant(toolUse("Edit", { file_path: "/a/b.js", old_string: "x" })));
  assert.equal(messageFromHookPayload(permissionPayload, log), "Allow Edit? /a/b.js");
});

test("permission prompt without a usable tool call keeps the original text", () => {
  assert.equal(messageFromHookPayload(permissionPayload, transcript(assistant(text("hi")))), "Claude needs your permission to use Bash");
});

test("transcript lines that are not JSON are skipped", () => {
  const log = "garbage\n" + transcript(assistant(text("Done?")));
  assert.equal(messageFromHookPayload(idlePayload, log), "Done?");
});

test("idle alert stays silent when Claude's last line is not a question", () => {
  const log = transcript(assistant(text("All done. Tests pass.")));
  assert.equal(shouldStaySilent(idlePayload, log), true);
});

test("idle alert shows when Claude's last line ends in a question mark", () => {
  const log = transcript(assistant(text("Done.\n\n**Want me to push?**")));
  assert.equal(shouldStaySilent(idlePayload, log), false);
});

test("idle alert shows when the transcript is unreadable, so nothing is missed", () => {
  assert.equal(shouldStaySilent(idlePayload, ""), false);
});

test("permission alert stays silent when the Allow/Deny alert already covers the request", () => {
  const log = transcript(assistant(toolUse("Bash", { command: "git push origin main" })));
  assert.equal(shouldStaySilent(permissionPayload, log, "darwin"), true);
});

test("permission alert shows for requests the Allow/Deny alert cannot show", () => {
  const edit = transcript(assistant(toolUse("Edit", { file_path: "/a", old_string: "x", new_string: "y" })));
  const longCommand = transcript(assistant(toolUse("Bash", { command: "x".repeat(200) })));
  assert.equal(shouldStaySilent(permissionPayload, edit, "darwin"), false);
  assert.equal(shouldStaySilent(permissionPayload, longCommand, "darwin"), false);
});

test("permission alert shows off macOS, where there is no Allow/Deny alert", () => {
  const log = transcript(assistant(toolUse("Bash", { command: "ls" })));
  assert.equal(shouldStaySilent(permissionPayload, log, "linux"), false);
});

test("other events are never silenced", () => {
  assert.equal(shouldStaySilent(JSON.stringify({ hook_event_name: "StopFailure" }), ""), false);
  assert.equal(shouldStaySilent("not json", ""), false);
});

test("StopFailure gets a fixed error message", () => {
  assert.equal(messageFromHookPayload(JSON.stringify({ hook_event_name: "StopFailure" })), "Claude stopped because of an error");
});
