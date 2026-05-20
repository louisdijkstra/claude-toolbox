---
name: plan-explorer
description: Open a markdown plan, spec, or design doc in a beautiful browser UI for interactive exploration and editing. Round-trips edits to disk. Use when the user types /plan-explore <path>, asks to "open this plan in a browser", or wants to visually navigate phases of an implementation plan.
user-invocable: true
allowed-tools: Bash
argument-hint: <path> [--port N] [--no-open]
---

# Plan Explorer

When user invokes `/plan-explore <path>` or asks to open a plan/spec visually:

1. Validate `<path>` is an absolute path to an existing `.md` file
2. Run: `~/.claude/skills/plan-explorer/scripts/plan-explore <path>`
3. The launcher prints a URL; share it with the user
4. The launcher runs until the user Ctrl-Cs it

The UI auto-detects mode:
- **Plan mode** — file contains `- [ ]` checkboxes → shows phase badges + progress
- **Doc mode** — no checkboxes → shows nested TOC + clean reading view

User can edit blocks click-to-edit; changes save to the original `.md` file.

## Limitations

- One file per session
- Chromium-based browsers and Firefox supported (Safari best-effort)
- Server binds 127.0.0.1 only; not for remote access
