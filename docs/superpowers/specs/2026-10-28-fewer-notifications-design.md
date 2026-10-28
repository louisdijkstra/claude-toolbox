# Fewer notifications

## In plain words

Show a message only when something big happened or Claude needs you. Everything else stays silent.

| Event | Before | Now |
|---|---|---|
| Permission request the Allow/Deny alert can show | Allow/Deny alert, then a second sticky alert about 6 seconds later | Allow/Deny alert only |
| Permission request with no buttons (Edit, Write, MCP, long command) | sticky alert | sticky alert (unchanged) |
| Claude waiting, last message is a question | sticky alert with only the last line | sticky alert with the opening sentence (70 characters) and the closing question (60 characters), so it says what it is about |
| Claude waiting, last message is not a question | sticky alert "waiting for your input" | silent; the sound on every finished turn still plays |
| Turn ended on an error (`StopFailure`) | nothing | banner "Claude stopped because of an error", error sound |
| Task that took a minute or more | banner, by the rule in `CLAUDE.md` | unchanged |
| Failed tool call | nothing | nothing (they are frequent and Claude handles them) |

## Design

`scripts/notify.js` `--from-hook` gets `shouldStaySilent(raw, transcriptText, platform)`. When it is true the
script exits before any banner or sound.

- Idle prompt: silent when the last non-empty line of Claude's last text exists and does not end in `?`.
- Permission prompt: silent on macOS when the last `tool_use` in the transcript would get buttons from
  `permission-alert.js` (`alertFor` is reused, so the two stay in step).
- Anything else, and any doubt (unreadable transcript, bad JSON, no `tool_use`): not silent. A missed alert costs more than an extra one.
- `messageFromHookPayload` returns a fixed message for `StopFailure`.
- `settings.json`: new `StopFailure` hook `node ~/.claude/scripts/notify.js --from-hook --sound error`, next to Orca's.

## Known limits

- If the Allow/Deny alert is ignored for 5 minutes there is no second reminder.
- A question that does not end in `?` is treated as "not a question" and stays silent.
- The silence rule needs the transcript; if it cannot be read, the alert shows.
