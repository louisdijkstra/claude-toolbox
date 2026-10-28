const test = require("node:test");
const assert = require("node:assert");
const { alertFor, decisionFor, transcriptGrew, MAX_DETAIL } = require("./permission-alert.js");

const request = (tool_name, tool_input) => ({ tool_name, tool_input, cwd: "/p/proj" });

test("Bash command gets an alert that names the tool and the command", () => {
  const alert = alertFor(request("Bash", { command: "git push origin main" }));
  assert.equal(alert.message, "Allow Bash? git push origin main");
  assert.equal(alert.subtitle, "project proj");
});

test("Read, WebFetch, Glob and Grep show their one detail field", () => {
  assert.equal(alertFor(request("Read", { file_path: "/a/b.txt" })).message, "Allow Read? /a/b.txt");
  assert.equal(alertFor(request("WebFetch", { url: "https://x.dev" })).message, "Allow WebFetch? https://x.dev");
  assert.equal(alertFor(request("Glob", { pattern: "**/*.js" })).message, "Allow Glob? **/*.js");
  assert.equal(alertFor(request("Grep", { pattern: "TODO" })).message, "Allow Grep? TODO");
});

test("tools whose request is not fully visible in one line get no alert", () => {
  assert.equal(alertFor(request("Edit", { file_path: "/a", old_string: "x", new_string: "y" })), null);
  assert.equal(alertFor(request("Write", { file_path: "/a", content: "x" })), null);
  assert.equal(alertFor(request("mcp__memory__create_entities", {})), null);
});

test("multi-line or over-long details get no alert", () => {
  assert.equal(alertFor(request("Bash", { command: "echo a\nrm -rf /" })), null);
  assert.equal(alertFor(request("Bash", { command: "x".repeat(MAX_DETAIL + 1) })), null);
  assert.notEqual(alertFor(request("Bash", { command: "x".repeat(MAX_DETAIL) })), null);
});

test("a Bash request that turns the sandbox off gets no alert", () => {
  assert.equal(alertFor(request("Bash", { command: "ls", dangerouslyDisableSandbox: true })), null);
});

test("missing or malformed payload gets no alert", () => {
  assert.equal(alertFor(null), null);
  assert.equal(alertFor({}), null);
  assert.equal(alertFor(request("Bash", {})), null);
  assert.equal(alertFor(request("Bash", { command: 42 })), null);
});

test("Allow and Deny map to the documented decision JSON", () => {
  assert.deepEqual(JSON.parse(decisionFor("Allow")), {
    hookSpecificOutput: { hookEventName: "PermissionRequest", decision: { behavior: "allow" } },
  });
  assert.deepEqual(JSON.parse(decisionFor("Deny")), {
    hookSpecificOutput: {
      hookEventName: "PermissionRequest",
      decision: { behavior: "deny", message: "Denied from the notification", interrupt: false },
    },
  });
});

test("anything but an exact Allow or Deny decides nothing", () => {
  for (const value of ["@CLOSED", "@TIMEOUT", "@CONTENTCLICKED", "", "allow", "Allow ", "Allow,Deny", undefined, null]) {
    assert.equal(decisionFor(value), "", String(value));
  }
});

test("transcript growth means the user answered elsewhere", () => {
  assert.equal(transcriptGrew(10, 10), false);
  assert.equal(transcriptGrew(10, 11), true);
});
