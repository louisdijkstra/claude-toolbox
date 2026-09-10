#!/bin/sh
# Minimal assertions for the shell library tests. Sourced, never run directly.
ASSERT_FAILURES=0
ASSERT_RUN=0

assert_eq() {
  ASSERT_RUN=$((ASSERT_RUN + 1))
  if [ "$1" = "$2" ]; then
    printf '  ok   %s\n' "$3"
  else
    ASSERT_FAILURES=$((ASSERT_FAILURES + 1))
    printf '  FAIL %s\n       expected: [%s]\n       actual:   [%s]\n' "$3" "$2" "$1"
  fi
}

assert_done() {
  printf '\n%s: %s assertions, %s failed\n' "$1" "$ASSERT_RUN" "$ASSERT_FAILURES"
  [ "$ASSERT_FAILURES" -eq 0 ]
}
