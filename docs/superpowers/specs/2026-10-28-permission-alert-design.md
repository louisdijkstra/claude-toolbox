# Allow / Deny buttons in the permission alert

## In plain words

When Claude Code is about to ask you for permission (for example to run a shell command), a
notification at the top right shows what it wants to do, with **Allow** and **Deny** buttons.
Click one and Claude continues, with no need to switch to the terminal.

If you ignore it, close it, or answer in the terminal instead, nothing is decided for you:
the normal terminal question stays in charge. Nothing is ever allowed without your click.

## Scope

- macOS with `alerter` only (the same helper and the same one-time "Alerts" setting as the sticky alerts).
  Elsewhere the hook does nothing.
- Buttons only for requests whose whole content fits in the alert (see Safety).

## Design

New script `scripts/permission-alert.js`, run by a new `PermissionRequest` hook (matcher `*`,
timeout 310s) next to Orca's observer hook.

Flow:
1. Read the hook JSON from stdin (`tool_name`, `tool_input`, `transcript_path`).
2. Decide if buttons are safe (below). If not, exit 0 with no output: normal terminal dialog.
3. Play the attention sound, then run `alerter --actions Allow --close-label Deny --timeout 300 --json --group claude-permission-<pid>` (two `--actions` become a dropdown that macOS 26 does not show, so Deny is the close button).
4. Map the result:
   - `activationValue` exactly `Allow` prints `{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"}}}`
   - exactly `Deny` prints the same with `"behavior":"deny","message":"Denied from the notification","interrupt":false`
   - anything else (close, timeout, body click, error) prints nothing. Exit code is always 0.
5. Stop early when you answer in the terminal:
   - SIGTERM / SIGINT (Claude Code cancels the hook): remove the alert, exit.
   - Transcript polling: while Claude waits for permission the transcript file does not grow.
     If its size changes, Claude moved on, so remove the alert (`alerter --remove <group>`) and exit with no output.

## Safety

- Buttons only for tools whose request is fully visible in one short line:
  `Bash` (command), `WebFetch` (url), `Read` (file_path), `Glob` and `Grep` (pattern).
  `Edit`, `Write`, MCP tools and anything else fall back to the terminal (an edit needs its diff).
- No buttons when the detail is multi-line or longer than 140 characters, or when a Bash request sets
  `dangerouslyDisableSandbox` to true.
- Your deny rules still win over a hook "allow" (documented).
- Fail closed: every error path prints nothing, so the terminal dialog decides.

## Settings

`settings.json` `PermissionRequest`: add a second entry
`node ~/.claude/scripts/permission-alert.js` (matcher `*`, timeout 310) beside the existing one.
The sticky `permission_prompt` Notification alert stays as the fallback (it fires after about 6 seconds of an open dialog).

## Testing

Unit tests on the pure functions: which requests get buttons, alert text, result-to-decision mapping.
Live checks on this Mac: empty output shows the terminal dialog; Allow and Deny work; answering in
the terminal closes the alert; that the close button reports `Deny` (verified: `activationType closed`, `activationValue Deny`).

## Out of scope

Windows and Linux, Edit/Write diffs in the alert, a text reply, "always allow" rules.
