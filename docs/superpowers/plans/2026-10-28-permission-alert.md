# Permission Alert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Spec: `docs/superpowers/specs/2026-10-28-permission-alert-design.md`.

**Goal:** A `PermissionRequest` hook shows an alert with Allow and Deny buttons and answers Claude Code with the click.

**Architecture:** `scripts/permission-alert.js` has pure functions (`alertFor`, `decisionFor`, `transcriptGrew`) plus a thin `main` that runs `alerter`, polls the transcript and prints the decision JSON. Node built-ins only.

## Global Constraints

- Node built-ins only; macOS + `alerter` only, otherwise print nothing.
- Exit code always 0; only an exact `Allow` or `Deny` click prints a decision.
- Buttons only for Bash (command), WebFetch (url), Read (file_path), Glob/Grep (pattern); one line, 140 characters or less; never when `dangerouslyDisableSandbox` is true.
- Do not commit; the user decides.

### Task 1: Pure decision logic (TDD)

**Files:** Create `scripts/permission-alert.js`, `scripts/permission-alert.test.js`

**Produces:** `alertFor(payload) -> null | { message, subtitle }`, `decisionFor(activationValue) -> "" | JSON string`, `transcriptGrew(startSize, currentSize) -> boolean`, `MAX_DETAIL = 140`.

- [ ] Write tests: Bash command gets an alert "Allow Bash? <command>"; Edit/Write/mcp tool gets null; multi-line command null; 141-char command null; `dangerouslyDisableSandbox: true` null; Read/WebFetch/Glob/Grep detail used; `decisionFor("Allow")` and `("Deny")` give the documented JSON; `("@CLOSED")`, `("")`, `(undefined)`, `("allow ")` give `""`; `transcriptGrew(10, 10)` false, `(10, 11)` true.
- [ ] Run `node --test scripts/permission-alert.test.js`; expect FAIL.
- [ ] Implement the functions; run again; expect PASS.

### Task 2: Runner

**Files:** Modify `scripts/permission-alert.js` (add `main`, guarded by `require.main === module`)

- [ ] `main`: read stdin; non-darwin or `alertFor` null exits silently; play sound via `node notify.js --sound attention`; spawn `alerter` with the arguments from the spec; poll `fs.statSync(transcript_path).size` every 500 ms; on growth, SIGTERM or SIGINT, kill `alerter`, run `alerter --remove <group>`, exit with no output; on `alerter` exit parse JSON and print `decisionFor(activationValue)`; on ENOENT or parse error print nothing.
- [ ] Dry check with a fake payload on stdin and `alerter` on PATH.

### Task 3: Wire in and live checks

**Files:** Modify `settings.json` (PermissionRequest), `scripts/README.md`

- [ ] Add the hook entry (matcher `*`, timeout 310) beside the existing one; validate JSON.
- [ ] Live: Allow, Deny, ignore/close, answer in terminal; confirm empty output shows the terminal dialog; look at how Allow/Deny render.
- [ ] README section; run `node --test scripts/*.test.js`.
