# Persistent "needs you" notifications

## Goal

When Claude needs the user (permission prompt, idle prompt), show a short native notification
that stays on screen until the user confirms they saw it. The existing sound stays.
Notifications carry a small own icon where the platform allows it.

## In plain words

**What you get.** When Claude stops and waits for you (it asks permission, or it has been idle),
a notification appears at the top right of the screen. It shows what Claude needs, and the
project name. It stays there until you click **Seen**. The sound you already had still plays.
When Claude only finishes a turn, you get a normal short banner and a sound, with no click needed.

**Why a click is needed.** A normal macOS banner disappears after a few seconds, so you can
miss it. The sticky version stays, so you know when something needs you.

**One-time setup (macOS).** macOS decides by itself whether a notification stays or fades.
Open System Settings > Notifications, pick the app Claude Code runs in (Terminal, iTerm2),
and set its style to **Alerts**. Without this, the notification still shows but fades
after a few seconds. Also install the helper once: `brew install vjeantet/tap/alerter`.
Without the helper you get the plain banner.

**Things that can hide it.**
- A Focus mode (Do Not Disturb) holds back every notification until Focus is off.
- If the app's style is Banners instead of Alerts, it fades.
- If the helper is not installed, you get the plain banner.

**Known limits.**
- The icon shows on Windows and Linux only. macOS ignores custom icons from command-line tools.
- Windows and Linux are tested by checking the commands we build, not on a real machine.
- The notification cannot jump to the terminal when you click it.

## Scope

- Persistent: `Notification` hooks (`permission_prompt`, `idle_prompt`).
- Not persistent: `Stop` and long-task notifications. They stay normal banners, or every finished turn would need a click.

## Design

`scripts/notify.js` gets a `--sticky` flag. Hook payload handling (`--from-hook`) already exists.
`buildCommands(opts, platform)` stays pure; sticky changes only the banner commands.
Each banner command may carry `detach: true`: the child keeps running after notify.js exits.

| OS | Sticky banner | Fallback |
|---|---|---|
| macOS | `alerter --title --subtitle --message --actions Seen --close-label Dismiss`, detached, waits for the click. Needs the sending app set to Alerts style (one-time, System Settings) | plain `osascript` banner when `alerter` is not on PATH |
| Windows | PowerShell WinRT toast, `scenario="reminder"`, one "Seen" button, logo override | existing `NotifyIcon` balloon |
| Linux | `notify-send -u critical -t 0 [-i PNG] --action=seen=Seen --wait`, detached | `notify-send -u critical -t 0` if `--wait` is unsupported |

Notes:
- Fallback works because the first banner command that launches wins; a failed launch moves to the next.
- Sound plays immediately as today.
- Every failure degrades to the non-sticky banner, then to a silent no-op. Exit code is always 0.
- Message text is passed as argv or an encoded command, never interpolated into a shell string.
- `alerter` is installed once from `vjeantet/tap/alerter`. It is optional at runtime.

## Icon

- Own drawing: a small mesh of linked nodes, white on a coral tile. No Anthropic mark, so it is safe to commit.
- Source `scripts/notify-icon.svg`, rendered once to `scripts/notify-icon.png` (256px). Both are committed.
- `notify.js` uses the PNG when the file exists. No flag.
- Shown on: Windows sticky toast, Linux banners (`-i`).
  macOS ignores custom icons (`alerter --app-icon` and `--content-image` have no effect on macOS 26), and so do the Windows balloon and plain `osascript` banners.

## Settings

`settings.json`: add `--sticky` to the `idle_prompt` and `permission_prompt` hook commands only.

## Testing

Unit tests on `buildCommands` per platform (sticky vs non-sticky, escaping, fallback order, icon).
One manual check on macOS: trigger a sticky notification, see it top right, click Seen.
Windows and Linux are covered by command-shape tests only; no host here to run them.

## Out of scope

Click actions that focus the terminal, notification history, any npm dependency,
custom icon for plain macOS banners.
