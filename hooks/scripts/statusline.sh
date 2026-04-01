#!/bin/sh
# Claude Code statusline script
input=$(cat)
val() { echo "$input" | jq -r "$1 // empty"; }

model=$(val '.model.display_name')
model_id=$(val '.model.id')
ctx_size=$(val '.context_window.context_window_size')
used=$(val '.context_window.used_percentage')
worktree=$(val '.worktree.name')
wt_branch=$(val '.worktree.branch')
workspace=$(val '.workspace.current_dir')
reset_at=$(val '.rate_limits.five_hour.resets_at')

# ANSI colors
C="\033[36m"   # cyan
G="\033[32m"   # green
Y="\033[33m"   # yellow
R="\033[31m"   # red
M="\033[35m"   # magenta
D="\033[2m"    # dim
B="\033[1m"    # bold
X="\033[0m"    # reset

# Model with context size shorthand
ctx_label=""
if [ -n "$ctx_size" ]; then
  if [ "$ctx_size" -ge 1000000 ] 2>/dev/null; then
    ctx_label=" (1M)"
  elif [ "$ctx_size" -ge 200000 ] 2>/dev/null; then
    ctx_label=" (200k)"
  fi
fi
out=""
# Build model label from id (e.g. "claude-opus-4-6[1m]" -> "Opus 4.6")
model_label=""
if [ -n "$model_id" ]; then
  # Extract name: strip "claude-" prefix and version/suffix
  base=$(echo "$model_id" | sed 's/^claude-//;s/-[0-9].*$//')
  # Capitalize first letter
  base=$(echo "$base" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
  # Extract version digits
  ver=$(echo "$model_id" | sed -n 's/.*-\([0-9]*-[0-9]*\).*/\1/p' | tr '-' '.')
  model_label="${base}${ver:+ ${ver}}"
elif [ -n "$model" ]; then
  # Fallback: strip any existing context suffix from display_name
  model_label=$(echo "$model" | sed 's/ *([^)]*context[^)]*)//;s/ *([^)]*[kKmM][^)]*)$//')
fi
[ -n "$model_label" ] && out="${B}${C}🤖 ${model_label}${ctx_label}${X}"

# Git branch + worktree indicator
branch=""
if [ -n "$wt_branch" ]; then
  branch="$wt_branch"
elif [ -n "$workspace" ]; then
  branch=$(cd "$workspace" 2>/dev/null && git branch --show-current 2>/dev/null)
fi
if [ -n "$branch" ]; then
  if [ -n "$worktree" ]; then
    git_info="${M}🌳 ${branch}${X}"
  else
    git_info="${G}${branch}${X}"
  fi
  [ -n "$out" ] && out="$out ${D}|${X} $git_info" || out="$git_info"
fi

# Context progress bar
if [ -n "$used" ]; then
  pct=$(printf "%.0f" "$used")
  # Color based on usage
  if [ "$pct" -ge 80 ]; then
    bar_color="$R"
  elif [ "$pct" -ge 60 ]; then
    bar_color="$Y"
  else
    bar_color="$G"
  fi
  filled=$((pct * 16 / 100))
  empty=$((16 - filled))
  bar=""
  i=0; while [ $i -lt $filled ]; do bar="${bar}▓"; i=$((i + 1)); done
  i=0; while [ $i -lt $empty ]; do bar="${bar}░"; i=$((i + 1)); done
  [ -n "$out" ] && out="$out ${D}|${X} ${bar_color}[${bar}] ${pct}%${X}" || out="${bar_color}[${bar}] ${pct}%${X}"
fi

# Token reset countdown
if [ -n "$reset_at" ]; then
  now=$(date +%s)
  diff=$((reset_at - now))
  if [ "$diff" -gt 0 ]; then
    hours=$((diff / 3600))
    mins=$(( (diff % 3600) / 60 ))
    if [ "$hours" -gt 0 ]; then
      reset_str="${hours}h${mins}m"
    else
      reset_str="${mins}m"
    fi
    [ -n "$out" ] && out="$out ${D}| ↻ ${reset_str}${X}"
  fi
fi

[ -n "$out" ] && printf "%b" "$out"
