#!/bin/sh
# The circle ramp, defined once.
#
# These glyphs are East Asian Ambiguous width: most terminals draw them one
# column, one configured with a CJK font draws them two. If that ever bites,
# swap the five values below for the block ramp ░ ▒ ▓ █ and nothing else moves.

# meter_circle <percent> -> one of ○ ◔ ◑ ◕ ●
# Rounds to the nearest quarter, so 45% reads as half full rather than a quarter.
meter_circle() {
  pct=$1
  pct=${pct%%.*}                                  # 45.7 -> 45
  case $pct in ''|*[!0-9-]*) pct=0 ;; esac        # junk and empty read as zero
  [ "$pct" -lt 0 ] 2>/dev/null && pct=0
  [ "$pct" -gt 100 ] 2>/dev/null && pct=100
  if   [ "$pct" -lt 13 ]; then printf '○'
  elif [ "$pct" -lt 38 ]; then printf '◔'
  elif [ "$pct" -lt 63 ]; then printf '◑'
  elif [ "$pct" -lt 88 ]; then printf '◕'
  else                         printf '●'
  fi
}
