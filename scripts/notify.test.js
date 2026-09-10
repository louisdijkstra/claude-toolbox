const test = require("node:test");
const assert = require("node:assert");
const { buildCommands, parseArgs } = require("./notify.js");

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
