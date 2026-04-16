#!/bin/sh
# Claude Code statusline script — two-line layout
input=$(cat)
val() { echo "$input" | jq -r "$1 // empty"; }

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

# ANSI colors
C="\033[36m"   # cyan
G="\033[32m"   # green
Y="\033[33m"   # yellow
R="\033[31m"   # red
M="\033[35m"   # magenta
D="\033[2m"    # dim
B="\033[1m"    # bold
X="\033[0m"    # reset

# Progress bar: $1=percentage (0-100), $2=width (chars), $3=color scheme (green|gray|fixed_gray)
make_bar() {
  pct=$(printf "%.0f" "$1")
  width=${2:-12}
  scheme=${3:-green}
  if [ "$scheme" = "fixed_gray" ]; then
    col="$D"
  elif [ "$pct" -ge 80 ]; then col="$R"
  elif [ "$pct" -ge 60 ]; then col="$Y"
  elif [ "$scheme" = "gray" ]; then col="$D"
  else col="$G"
  fi
  filled=$((pct * width / 100))
  empty=$((width - filled))
  bar=""
  i=0; while [ $i -lt $filled ]; do bar="${bar}▓"; i=$((i + 1)); done
  i=0; while [ $i -lt $empty ]; do bar="${bar}░"; i=$((i + 1)); done
  printf "%b" "${col}${bar} ${pct}%${X}"
}

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

# Persist rate limits for the dashboard
if [ -n "$five_h" ] || [ -n "$seven_d" ]; then
  echo "$input" | jq '{five_hour: .rate_limits.five_hour, seven_day: .rate_limits.seven_day}' > ~/.claude/rate_limits.json 2>/dev/null
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

line1=""
[ -n "$model_label" ] && line1="${B}${C}🤖 ${model_label}${ctx_label}${X}"

# Git branch
branch=""
if [ -n "$wt_branch" ]; then branch="$wt_branch"
elif [ -n "$workspace" ]; then branch=$(cd "$workspace" 2>/dev/null && git branch --show-current 2>/dev/null)
fi
if [ -n "$branch" ]; then
  if [ -n "$worktree" ]; then git_info="${M}🌳 ${branch}${X}"
  else git_info="${G}${branch}${X}"
  fi
  [ -n "$line1" ] && line1="$line1 ${D}|${X} $git_info" || line1="$git_info"
fi

# Context window progress bar
if [ -n "$used" ]; then
  ctx_bar=$(make_bar "$used" 16 fixed_gray)
  [ -n "$line1" ] && line1="$line1 ${D}|${X} $ctx_bar" || line1="$ctx_bar"
fi

# --- Line 2: 5h bar + reset | week bar + reset ---

line2=""
if [ -n "$five_h" ]; then
  five_bar=$(make_bar "$five_h" 10)
  line2="5h: ${five_bar}"
  if [ -n "$reset_5h" ]; then
    line2="$line2 ${D}↻$(countdown "$reset_5h")${X}"
  fi
fi
if [ -n "$seven_d" ]; then
  seven_bar=$(make_bar "$seven_d" 10 gray)
  [ -n "$line2" ] && line2="$line2 ${D}|${X} "
  line2="${line2}week: ${seven_bar}"
  if [ -n "$reset_7d" ]; then
    line2="$line2 ${D}↻$(countdown "$reset_7d")${X}"
  fi
fi

# Output
if [ -n "$line2" ]; then
  printf "%b\n%b" "$line1" "$line2"
elif [ -n "$line1" ]; then
  printf "%b" "$line1"
fi
