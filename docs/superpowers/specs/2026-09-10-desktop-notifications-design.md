# Desktop notifications for long-running tasks

**Date:** 2026-09-10
**Scope:** `~/.claude` only. No project repository is touched.

## Problem

When Claude runs something long — a full test suite, `execute-plan`, a deploy — the user has
usually switched to another window. Nothing pulls them back. The only existing signal was a
`afplay` sound on the `Stop` hook: audio-only, no content, and macOS-only, so on Windows it
fired a failing command on every turn.

## Why not the built-in tool

Claude Code 2.1.267 ships a `PushNotificationTool` that does exactly this. It is double-gated:
the server flag `tengu_kairos_push_notifications` (default false) **and** the setting
`agentPushNotifEnabled` (default false). It surfaces in background-job harnesses but not in a
normal interactive session, so it cannot be relied on. If both gates ever open by default, this
design becomes redundant and should be deleted rather than kept alongside it.

## Design

Three pieces.

### 1. `~/.claude/scripts/notify.js`

Plain Node, no dependencies, matching the existing `hooks/scripts/*.js` convention.

```bash
node ~/.claude/scripts/notify.js "test suite green: 1247 passed"   # banner, silent
node ~/.claude/scripts/notify.js --sound done                      # sound only, for hooks
node ~/.claude/scripts/notify.js --sound error "build failed"      # both
```

Banner and sound are independent groups. A bare message shows a banner with **no** sound, so a
model-driven notification landing next to the `Stop` hook does not beep twice.

| Platform | Banner | Sound |
|---|---|---|
| darwin | `osascript -e 'display notification'` | `afplay /System/Library/Sounds/*.aiff` |
| win32 | PowerShell `NotifyIcon` balloon | PowerShell `Media.SoundPlayer` on `C:\Windows\Media\*.wav` |
| linux | `notify-send` | `paplay`, falling back to `canberra-gtk-play` |
| anything else | none | none |

Sounds are addressed by semantic name (`done` / `attention` / `error`) mapped to a per-platform
asset, so no caller ever names a file.

Three decisions worth recording:

- **Windows uses `NotifyIcon`, not a toast.** A real Windows toast needs the BurntToast PowerShell
  module or WinRT interop. `NotifyIcon` ships with .NET on every Win10/11 host, so it works with
  nothing installed.
- **PowerShell is invoked via `-EncodedCommand`** (base64 UTF-16LE). This removes every layer of
  `cmd.exe` and PowerShell quoting, which is where cross-platform shell-outs usually break.
- **Sounds are launched detached and not awaited.** The script returns once the launch is known to
  have succeeded (a 200 ms probe that catches `ENOENT`), never after playback. The replaced
  `afplay ... &` was fire-and-forget, and `&` cannot be reintroduced in the hook because it is a
  command separator on `cmd.exe`. Measured: 46 ms on macOS, 94 ms on the all-players-missing path.

**Never breaks a caller.** `stdio: "ignore"`, every error swallowed, 5 s timeout on the banner,
unconditional `exit 0`. Unknown platform, missing binary, no display, SSH session, or denied
notification permission all degrade to a silent no-op. Losing a banner is acceptable; failing a
hook or a turn is not.

Title is `Claude Code`; the subtitle is the current directory's basename, so parallel sessions
are distinguishable.

### 2. Sound hooks in `settings.json`

The three `afplay` hooks are replaced, keeping the same sounds on macOS and going silent elsewhere:

| Hook | Was | Now |
|---|---|---|
| `Stop` / `*` | `afplay Hero.aiff &` | `notify.js --sound done` |
| `Notification` / `idle_prompt` | `afplay Glass.aiff &` | `notify.js --sound attention` |
| `Notification` / `permission_prompt` | `afplay Basso.aiff &` | `notify.js --sound error` |

Hooks stay sound-only. They never show a banner, so they cannot collide with the model-driven one.

`permissions.allow` gains `Bash(node ~/.claude/scripts/notify.js:*)` so the call never prompts.

### 3. Trigger rule in `~/.claude/CLAUDE.md`

A `## Desktop notifications` section: notify after a task **Claude ran** that took **>= 1 minute**
wall-clock; fire even if the user is watching; message is what finished plus the result, one line,
<= 100 chars; done is enough, it need not be actionable; never for answers, mid-run progress,
sub-minute work, or twice for one task; always notify on explicit request.

The model decides. There is deliberately no duration-measuring hook: a hook cannot say *what*
finished, and it would fire on every long turn including ones the user watched end to end.

## Testing

`~/.claude/scripts/notify.test.js` (`node --test ~/.claude/scripts/notify.test.js`, 9 tests) covers
the pure `buildCommands`, with the platform overridable via `NOTIFY_PLATFORM` and `--dry-run`
printing the commands instead of running them: AppleScript escaping of quotes and backslashes,
the decoded PowerShell script including its `''` quote doubling, `notify-send` argument shape,
banner-implies-no-sound, the linux fallback chain, and empty output for an unknown platform or
sound name.

## Known limits

- **macOS banners are attributed to the calling terminal** (or Script Editor) and need notification
  permission granted once in System Settings. Until then the banner silently does not appear.
- **The Windows and Linux paths are untested on a real host.** They are written to fail silent, so
  "does not break Windows" holds by construction, but "the banner actually appears" is verified
  only at the level of the generated command, by the tests above.
- **No detection of whether the user is watching.** Terminal focus is not visible to the script,
  and guessing wrong means the notification silently never arrives. Deliberate: it fires anyway,
  and the OS Do-Not-Disturb setting is the intended mute.
