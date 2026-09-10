#!/bin/sh
# Claude Code statusline script — two-line layout
input=$(cat)
val() { echo "$input" | jq -r "$1 // empty"; }

# Guarded so a partial install still renders a line.
_lib="$(dirname "$0")/lib"
[ -f "$_lib/meter.sh" ] && . "$_lib/meter.sh"
[ -f "$_lib/location.sh" ] && . "$_lib/location.sh"

model=$(val '.model.display_name')
model_id=$(val '.model.id')
ctx_size=$(val '.context_window.context_window_size')
used=$(val '.context_window.used_percentage')
worktree=$(val '.worktree.name')
wt_branch=$(val '.worktree.branch')
workspace=$(val '.workspace.current_dir')
five_h=$(val '.rate_limits.five_hour.used_percentage')
seven_d=$(val '.rate_limits.seven_day.used_percentage')
reset_5h=$(val '.rate_limits.five_hour.resets_at')
reset_7d=$(val '.rate_limits.seven_day.resets_at')
cost=$(val '.cost.total_cost_usd')
session_id=$(val '.session_id')

# ANSI colours. Identity only: the meters are deliberately uncoloured, so fill
# alone carries the value and nothing depends on telling red from green.
C="\033[36m"   # cyan — model
G="\033[32m"   # green — branch
M="\033[35m"   # magenta — branch in a worktree
D="\033[2m"    # dim — labels, separators, countdowns
B="\033[1m"    # bold
X="\033[0m"    # reset

# Countdown string from unix timestamp
countdown() {
  now=$(date +%s)
  diff=$(($1 - now))
  if [ "$diff" -le 0 ]; then printf "now"; return; fi
  days=$((diff / 86400))
  hours=$(( (diff % 86400) / 3600 ))
  mins=$(( (diff % 3600) / 60 ))
  if [ "$days" -gt 0 ]; then
    printf "%dd%dh%dm" "$days" "$hours" "$mins"
  elif [ "$hours" -gt 0 ]; then
    printf "%dh%dm" "$hours" "$mins"
  else
    printf "%dm" "$mins"
  fi
}

# Persist current session cost for SessionEnd hook (which has no cost data)
# Keyed per session id — concurrent sessions/background jobs must not share one file.
# The payload's session_id is always present; the env var is not, so it is only a fallback.
if [ -n "$cost" ]; then
  COSTS_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.session_costs"
  mkdir -p "$COSTS_DIR" 2>/dev/null
  echo "$cost" > "$COSTS_DIR/${session_id:-${CLAUDE_CODE_SESSION_ID:-current}}" 2>/dev/null
fi

# Persist rate limits for the dashboard
if [ -n "$five_h" ] || [ -n "$seven_d" ]; then
  echo "$input" | jq '{five_hour: .rate_limits.five_hour, seven_day: .rate_limits.seven_day}' > ~/.claude/rate_limits.json 2>/dev/null
fi

# Caveman mode badge — only if caveman plugin is installed
caveman_badge=""
CAVEMAN_HOOK="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/plugins/marketplaces/caveman/hooks/caveman-activate.js"
CAVEMAN_FLAG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.caveman-active"
if [ -f "$CAVEMAN_HOOK" ] && [ ! -L "$CAVEMAN_FLAG" ] && [ -f "$CAVEMAN_FLAG" ]; then
  cm=$(head -c 64 "$CAVEMAN_FLAG" 2>/dev/null | tr -d '\n\r' | tr -cd 'a-z0-9-')
  case "$cm" in
    off|lite|full|ultra|wenyan-lite|wenyan|wenyan-full|wenyan-ultra|commit|review|compress)
      CM_UP=$(printf '%s' "$cm" | tr '[:lower:]' '[:upper:]')
      caveman_badge="🗿 ${CM_UP}"
      ;;
  esac
fi

# --- Line 1: Model | branch | context bar ---

# Model label
ctx_label=""
if [ -n "$ctx_size" ]; then
  if [ "$ctx_size" -ge 1000000 ] 2>/dev/null; then ctx_label=" (1M)"
  elif [ "$ctx_size" -ge 200000 ] 2>/dev/null; then ctx_label=" (200k)"
  fi
fi
model_label=""
if [ -n "$model_id" ]; then
  base=$(echo "$model_id" | sed 's/^claude-//;s/-[0-9].*$//')
  base=$(echo "$base" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
  ver=$(echo "$model_id" | sed -n 's/.*-\([0-9]*-[0-9]*\).*/\1/p' | tr '-' '.')
  model_label="${base}${ver:+ ${ver}}"
elif [ -n "$model" ]; then
  model_label=$(echo "$model" | sed 's/ *([^)]*context[^)]*)//;s/ *([^)]*[kKmM][^)]*)$//')
fi

# Git branch and location, resolved before the line is built.
# One rev-parse yields the working root, the shared git directory and the
# branch. It replaces the old `git branch --show-current`, so the render costs
# no extra subprocess. Older git rejects --path-format and falls through to the
# payload values, which is why nothing here is fatal.
git_top=""
git_common=""
branch=""
if [ -n "$workspace" ]; then
  git_out=$(git -C "$workspace" rev-parse --path-format=absolute \
              --show-toplevel --git-common-dir --abbrev-ref HEAD 2>/dev/null)
  if [ -n "$git_out" ]; then
    git_top=$(printf '%s\n' "$git_out" | sed -n '1p')
    git_common=$(printf '%s\n' "$git_out" | sed -n '2p')
    branch=$(printf '%s\n' "$git_out" | sed -n '3p')
  fi
fi
[ -z "$branch" ] && branch="$wt_branch"

location=""
if [ -n "$workspace" ]; then
  if command -v format_location > /dev/null 2>&1; then
    location=$(format_location "$workspace" "$git_top" "$git_common")
  else
    location=$(basename "$workspace")
  fi
fi

line1=""
[ -n "$model_label" ] && line1="${B}${C}◆ ${model_label}${ctx_label}${X}"

# Location: ▸ marks the place, ↳ inside it marks a worktree.
if [ -n "$location" ]; then
  loc_field="${D}▸${X} ${location}"
  [ -n "$line1" ] && line1="$line1  $loc_field" || line1="$loc_field"
fi

# The tree moved to the location field, which is the thing that is actually a
# worktree. The branch keeps its colour and drops the icon.
if [ -n "$branch" ]; then
  in_worktree=""
  [ -n "$worktree" ] && in_worktree=yes
  [ -n "$git_top" ] && [ -n "$git_common" ] && \
    [ "$git_top" != "${git_common%/.git}" ] && in_worktree=yes
  branch_label=$branch
  command -v branch_shorten > /dev/null 2>&1 && branch_label=$(branch_shorten "$branch")
  if [ -n "$in_worktree" ]; then git_info="${M}⑂ ${branch_label}${X}"
  else git_info="${G}⑂ ${branch_label}${X}"
  fi
  [ -n "$line1" ] && line1="$line1  $git_info" || line1="$git_info"
fi

# Caveman badge (appended after context bar)
if [ -n "$caveman_badge" ]; then
  [ -n "$line1" ] && line1="$line1 ${D}|${X} $caveman_badge" || line1="$caveman_badge"
fi

# --- Line 2: account-type-aware ---
# Max account: rate_limits present → show 5h + week windows
# Enterprise account: rate_limits absent, cost present → show budget bar

line2=""

# Context window, always first.
if [ -n "$used" ]; then
  ctx_pct=$(printf "%.0f" "$used" 2>/dev/null || echo 0)
  line2="${D}ctx${X} $(meter_circle "$ctx_pct") ${ctx_pct}%"
fi

if [ -n "$five_h" ]; then
  # Rolling windows: each meter carries its own countdown.
  five_pct=$(printf "%.0f" "$five_h" 2>/dev/null || echo 0)
  five_field="${D}5h${X} $(meter_circle "$five_pct") ${five_pct}%"
  [ -n "$reset_5h" ] && five_field="$five_field ${D}↻$(countdown "$reset_5h")${X}"
  [ -n "$line2" ] && line2="$line2  $five_field" || line2="$five_field"

  if [ -n "$seven_d" ]; then
    seven_pct=$(printf "%.0f" "$seven_d" 2>/dev/null || echo 0)
    seven_field="${D}7d${X} $(meter_circle "$seven_pct") ${seven_pct}%"
    [ -n "$reset_7d" ] && seven_field="$seven_field ${D}↻$(countdown "$reset_7d")${X}"
    line2="$line2  $seven_field"
  fi
elif [ -n "$cost" ]; then
  # Enterprise: month-to-date spend across every session, live ones included.
  # budget.js merges the per-session cost files with the transcript ledger and
  # keys on session id, so nothing is counted twice and nothing is dropped when
  # a session ends without its hook firing. The cost file for this session was
  # written further up, so the total already includes the current turn.
  CLAUDE_HOME="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  BUDGET=2000
  total_cost=""
  budget_out=$(node "$CLAUDE_HOME/scripts/budget.js" --statusline 2>/dev/null)
  if [ -n "$budget_out" ]; then
    total_cost=${budget_out% *}
    BUDGET=${budget_out#* }
  fi
  # Never lose the statusline to an accounting failure: fall back to this session.
  case "$total_cost" in
    ''|*[!0-9.]*) total_cost=$(echo "$cost" | awk '{printf "%.4f", $1}') ;;
  esac
  spend_pct=$(echo "$total_cost $BUDGET" | awk '{printf "%.0f", $1 / $2 * 100}')
  spent_fmt=$(printf '%.0f' "$total_cost")
  # The cap is never omitted: the figure is meaningless without it.
  spend_field="${D}\$${X} $(meter_circle "$spend_pct") ${spent_fmt} / ${BUDGET}"
  next_reset_ts=$(date -v+1m -v1d -v0H -v0M -v0S +%s 2>/dev/null)
  [ -n "$next_reset_ts" ] && spend_field="$spend_field ${D}↻$(countdown "$next_reset_ts")${X}"
  [ -n "$line2" ] && line2="$line2  $spend_field" || line2="$spend_field"
fi

# Output
if [ -n "$line2" ]; then
  printf "%b\n%b" "$line1" "$line2"
elif [ -n "$line1" ]; then
  printf "%b" "$line1"
fi
