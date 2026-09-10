#!/bin/sh
# format_location takes strings and returns a string: no git, no filesystem.
here=$(dirname "$0")
. "$here/assert.sh"
. "$here/../../hooks/scripts/lib/location.sh"

HOME=/Users/you
export HOME

# --- plain repository -------------------------------------------------------
assert_eq "$(format_location /Users/you/projects/my-app \
                             /Users/you/projects/my-app \
                             /Users/you/projects/my-app/.git)" \
          "my-app" "repo root is just the repo name"

assert_eq "$(format_location /Users/you/projects/my-app/libs/my-app-core \
                             /Users/you/projects/my-app \
                             /Users/you/projects/my-app/.git)" \
          "my-app/libs/my-app-core" "repo subdirectory keeps its subpath"

# --- worktrees --------------------------------------------------------------
assert_eq "$(format_location /Users/you/projects/my-app/.worktrees/feature-x \
                             /Users/you/projects/my-app/.worktrees/feature-x \
                             /Users/you/projects/my-app/.git)" \
          "my-app ↳ feature-x" "worktree collapses the .worktrees plumbing"

assert_eq "$(format_location /Users/you/projects/my-app/.worktrees/feature-x/libs \
                             /Users/you/projects/my-app/.worktrees/feature-x \
                             /Users/you/projects/my-app/.git)" \
          "my-app ↳ feature-x/libs" "worktree subdirectory keeps its subpath"

assert_eq "$(format_location /Users/you/.claude/.claude/worktrees/budget-ledger \
                             /Users/you/.claude/.claude/worktrees/budget-ledger \
                             /Users/you/.claude/.git)" \
          ".claude ↳ budget-ledger" "native worktree under .claude/worktrees"

# --- truncation -------------------------------------------------------------
# 28 characters exactly: kept whole.
assert_eq "$(format_location /Users/you/projects/my-app/aaaaaaaaaaaaaaaaaaaaaaa \
                             /Users/you/projects/my-app \
                             /Users/you/projects/my-app/.git)" \
          "my-app/aaaaaaaaaaaaaaaaaaaaaaa" "exactly at the cap is untouched"

# Over the cap: the subpath elides, the repo name survives.
assert_eq "$(format_location /Users/you/projects/my-app/libs/parser/tests/fixtures \
                             /Users/you/projects/my-app \
                             /Users/you/projects/my-app/.git)" \
          "my-app/…/tests/fixtures" "over the cap elides only the subpath"

# A repo name longer than the cap is still shown in full, subpath dropped.
assert_eq "$(format_location /Users/you/projects/a-really-very-long-repository-name/libs \
                             /Users/you/projects/a-really-very-long-repository-name \
                             /Users/you/projects/a-really-very-long-repository-name/.git)" \
          "a-really-very-long-repository-name" "a long repo name survives whole"

# --- not a repository -------------------------------------------------------
assert_eq "$(format_location /Users/you/Downloads '' '')" \
          "~/Downloads" "non-repo renders home-relative"

assert_eq "$(format_location /Users/you '' '')" \
          "~" "home itself is a tilde"

assert_eq "$(format_location /Users/you/Documents/Sync/2026-planning/Documents '' '')" \
          "…/2026-planning/Documents" "a deep non-repo path keeps its last two segments"

# --- awkward input ----------------------------------------------------------
assert_eq "$(format_location '/Users/you/projects/my repo/src' \
                             '/Users/you/projects/my repo' \
                             '/Users/you/projects/my repo/.git')" \
          "my repo/src" "a path with spaces survives"

assert_eq "$(location_shorten /a/b/c/d 3)" "…/c/d" "shorten keeps the last two segments"
assert_eq "$(location_shorten /a/b 40)"    "/a/b"  "shorten leaves a short path alone"

# --- branch names -----------------------------------------------------------
# A branch is identity too, but the native worktree tool produces names like
# worktree-statusline-location, which push the identity line past 80 columns.
assert_eq "$(branch_shorten main)" "main" "a short branch is untouched"
assert_eq "$(branch_shorten feature/add-the-thing)" "feature/add-the-thing" \
          "a branch at the cap is untouched"
assert_eq "$(branch_shorten worktree-statusline-location)" "…-statusline-location" \
          "a long branch elides from the left, keeping the distinctive tail"
assert_eq "$(branch_shorten '')" "" "an empty branch stays empty"

assert_done "location"
