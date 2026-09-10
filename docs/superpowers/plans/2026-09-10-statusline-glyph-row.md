# Statusline Glyph Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the statusline's emoji-and-block-bar rendering with a labelled glyph row that shows where the session is running.

**Architecture:** Two new pure POSIX shell libraries — one mapping a percentage to a circle, one turning a path plus git's answers into a location string — sourced by `statusline.sh`. The statusline keeps its two-line shape and gains no subprocesses: a single `git rev-parse` replaces the existing `git branch --show-current` and returns the branch, the worktree root and the main repository's git directory together.

**Tech Stack:** POSIX `sh` (the statusline runs under `#!/bin/sh`), `jq` for payload parsing, `node` for the existing budget ledger, Python 3 for the test runner.

## Global Constraints

- Target shell is POSIX `sh`; no bashisms (no `[[ ]]`, no arrays, no `local`).
- The statusline must render even when every optional part fails. A cosmetic field never breaks the line.
- No emoji anywhere on the line.
- Circles are never coloured. Colour is reserved for identity: cyan model, green branch, magenta worktree branch, dim labels, separators and countdowns. Figures use the default foreground, including at 100%.
- The spend always shows its cap: `879 / 2000`, never `879` alone.
- Location cap is 28 characters, measured without the `▸ ` prefix.
- Circle ramp: `○ ◔ ◑ ◕ ●`, defined in exactly one function.
- Worktree glyph is `↳`. Model `◆`, location `▸`, branch `⑂`, reset `↻`.
- `git rev-parse --path-format=absolute` requires git 2.31; older git must fall back, not error.

---

### Task 1: The circle ramp

**Files:**
- Create: `hooks/scripts/lib/meter.sh`
- Create: `tests/hooks/assert.sh`
- Create: `tests/hooks/meter_test.sh`
- Modify: `tests/run_all_tests.py` (add a section after `_test_supporting_files`)
- Modify: `docs/superpowers/specs/2026-09-10-statusline-design.md` (correct one example)

**Interfaces:**
- Consumes: nothing.
- Produces: `meter_circle <percent>` — writes one of `○ ◔ ◑ ◕ ●` to stdout, no newline. Accepts integers, decimals (`45.7`), empty string and junk; clamps out-of-range values.

- [x] **Step 1: Write the shared assertion helper**

Create `tests/hooks/assert.sh`:

```sh
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
```

- [x] **Step 2: Write the failing test**

Create `tests/hooks/meter_test.sh`:

```sh
#!/bin/sh
# Every band boundary of the circle ramp, plus the inputs that should not crash it.
here=$(dirname "$0")
. "$here/assert.sh"
. "$here/../../hooks/scripts/lib/meter.sh"

# Nearest quarter: 45% is closer to 50 than to 25, so it reads as half full.
assert_eq "$(meter_circle 0)"   "○" "0 is empty"
assert_eq "$(meter_circle 1)"   "○" "1 is empty"
assert_eq "$(meter_circle 12)"  "○" "12 is the top of the empty band"
assert_eq "$(meter_circle 13)"  "◔" "13 rounds up to a quarter"
assert_eq "$(meter_circle 25)"  "◔" "25 is a quarter"
assert_eq "$(meter_circle 37)"  "◔" "37 is the top of the quarter band"
assert_eq "$(meter_circle 38)"  "◑" "38 rounds up to a half"
assert_eq "$(meter_circle 45)"  "◑" "45 is a half"
assert_eq "$(meter_circle 50)"  "◑" "50 is a half"
assert_eq "$(meter_circle 62)"  "◑" "62 is the top of the half band"
assert_eq "$(meter_circle 63)"  "◕" "63 rounds up to three quarters"
assert_eq "$(meter_circle 75)"  "◕" "75 is three quarters"
assert_eq "$(meter_circle 87)"  "◕" "87 is the top of the three-quarter band"
assert_eq "$(meter_circle 88)"  "●" "88 rounds up to full"
assert_eq "$(meter_circle 100)" "●" "100 is full"

assert_eq "$(meter_circle 45.7)" "◑" "a decimal is truncated, not rejected"
assert_eq "$(meter_circle -5)"   "○" "below zero clamps to empty"
assert_eq "$(meter_circle 250)"  "●" "above one hundred clamps to full"
assert_eq "$(meter_circle '')"   "○" "an empty value is empty, not blank output"
assert_eq "$(meter_circle abc)"  "○" "junk is empty, not blank output"

assert_done "meter"
```

- [x] **Step 3: Run it to make sure it fails**

Run: `sh tests/hooks/meter_test.sh`
Expected: fails to source `hooks/scripts/lib/meter.sh` — "No such file or directory".

- [x] **Step 4: Write the minimal implementation**

Create `hooks/scripts/lib/meter.sh`:

```sh
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
```

- [x] **Step 5: Run the test and make sure it passes**

Run: `sh tests/hooks/meter_test.sh`
Expected: `meter: 20 assertions, 0 failed`, exit 0.

- [x] **Step 6: Wire it into the suite**

In `tests/run_all_tests.py`, add a call inside `run_all_tests` after the "Supporting Files" section:

```python
        # Test 4: Shell libraries used by the statusline
        self._run_test_section("Shell Libraries", self._test_shell_libraries)
```

And add the method after `_test_supporting_files`:

```python
    def _test_shell_libraries(self) -> bool:
        """Test the POSIX shell libraries the statusline sources."""
        print("Running shell library tests...")

        hooks_tests = sorted((self.tests_dir / 'hooks').glob('*_test.sh'))
        if not hooks_tests:
            print("❌ No shell tests found in tests/hooks/")
            return False

        passed = True
        for script in hooks_tests:
            result = subprocess.run(
                ['sh', str(script)],
                capture_output=True,
                text=True
            )
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            passed = passed and result.returncode == 0

        return passed
```

- [x] **Step 7: Run the whole suite**

Run: `python3 tests/run_all_tests.py`
Expected: four sections, all passing, including "Shell Libraries".

- [x] **Step 8: Correct the spec example**

The spec renders `7d ◕ 61%`. Nearest-quarter rounding puts 61 in the half band, because 61 is 11 from 50 and 14 from 75. In `docs/superpowers/specs/2026-09-10-statusline-design.md`, change both occurrences of `7d ◕ 61%` to `7d ◑ 61%`.

Run: `grep -n "61%" docs/superpowers/specs/2026-09-10-statusline-design.md`
Expected: every hit reads `◑ 61%`.

- [x] **Step 9: Commit**

```bash
git add hooks/scripts/lib/meter.sh tests/hooks/assert.sh tests/hooks/meter_test.sh tests/run_all_tests.py docs/superpowers/specs/2026-09-10-statusline-design.md
git commit -m "feat(statusline): add the circle meter ramp"
```

---

### Task 2: The location field

**Files:**
- Create: `hooks/scripts/lib/location.sh`
- Create: `tests/hooks/location_test.sh`

**Interfaces:**
- Consumes: nothing from Task 1 — the libraries are independent.
- Produces:
  - `location_shorten <path> <max>` — elides from the left as `…/`, keeping the last two segments. Returns the path unchanged when it already fits.
  - `format_location <cwd> <toplevel> <common_dir>` — the display string, without the `▸ ` prefix. `toplevel` empty means "not a repository". Reads `$HOME` to render `~`.

- [x] **Step 1: Write the failing test**

Create `tests/hooks/location_test.sh`:

```sh
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

# 29 characters: the subpath elides, the repo name survives.
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

assert_done "location"
```

- [x] **Step 2: Run it to make sure it fails**

Run: `sh tests/hooks/location_test.sh`
Expected: fails to source `hooks/scripts/lib/location.sh` — "No such file or directory".

- [x] **Step 3: Write the minimal implementation**

Create `hooks/scripts/lib/location.sh`:

```sh
#!/bin/sh
# Where the session is running, as one short string.
#
# Pure: every function takes strings and returns a string. Nothing here runs
# git or touches the filesystem, which is what makes the rules testable.

LOCATION_MAX=28

# location_shorten <path> <max> -> path, or …/second-last/last when too long
location_shorten() {
  _path=$1
  _max=${2:-$LOCATION_MAX}
  if [ ${#_path} -le "$_max" ]; then
    printf '%s' "$_path"
    return
  fi
  _tail=$(printf '%s' "$_path" | awk -F/ '{
    if (NF >= 2) printf "%s/%s", $(NF-1), $NF; else printf "%s", $NF
  }')
  printf '…/%s' "$_tail"
}

# format_location <cwd> <toplevel> <common_dir> -> display string
# toplevel empty means the directory is not inside a repository.
format_location() {
  _cwd=$1
  _top=$2
  _common=$3

  if [ -z "$_top" ]; then
    _rel=$(printf '%s' "$_cwd" | sed "s|^$HOME|~|")
    location_shorten "$_rel"
    return
  fi

  # The main repository root is the parent of the shared git directory. When
  # the working root differs from it, this is a linked worktree.
  _main=$_top
  case $_common in
    */.git) _main=${_common%/.git} ;;
  esac

  _repo=$(basename "$_main")
  if [ "$_top" != "$_main" ]; then
    _head="$_repo ↳ $(basename "$_top")"
  else
    _head=$_repo
  fi

  _sub=${_cwd#"$_top"}
  _sub=${_sub#/}
  if [ -z "$_sub" ]; then
    printf '%s' "$_head"
    return
  fi

  if [ $((${#_head} + 1 + ${#_sub})) -le "$LOCATION_MAX" ]; then
    printf '%s/%s' "$_head" "$_sub"
    return
  fi

  # The repo and worktree names are identity and are never cut. Only the
  # subpath elides, and it is dropped entirely when there is no room for it.
  _budget=$((LOCATION_MAX - ${#_head} - 1))
  if [ "$_budget" -lt 6 ]; then
    printf '%s' "$_head"
    return
  fi
  printf '%s/%s' "$_head" "$(location_shorten "$_sub" "$_budget")"
}
```

- [x] **Step 4: Run the test and make sure it passes**

Run: `sh tests/hooks/location_test.sh`
Expected: `location: 14 assertions, 0 failed`, exit 0.

If an assertion about truncation fails, read the actual value printed under it and check the arithmetic in `_budget` rather than adjusting the expectation — the cap is a stated requirement.

- [x] **Step 5: Run the whole suite**

Run: `python3 tests/run_all_tests.py`
Expected: all four sections pass; "Shell Libraries" now runs two files.

- [x] **Step 6: Commit**

```bash
git add hooks/scripts/lib/location.sh tests/hooks/location_test.sh
git commit -m "feat(statusline): add the location formatter"
```

---

### Task 3: Render the new line

**Files:**
- Modify: `hooks/scripts/statusline.sh` (the git/branch block, the line-1 build, and the line-2 build)
- Modify: `README.md` (the statusline row of the hooks table)

**Interfaces:**
- Consumes: `meter_circle <percent>` from Task 1, `format_location <cwd> <toplevel> <common_dir>` from Task 2.
- Produces: the rendered statusline. Nothing else consumes it.

- [x] **Step 1: Source the libraries**

In `hooks/scripts/statusline.sh`, directly after the `val()` definition near the top, add:

```sh
# Guarded so a partial install still renders a line.
_lib="$(dirname "$0")/lib"
[ -f "$_lib/meter.sh" ] && . "$_lib/meter.sh"
[ -f "$_lib/location.sh" ] && . "$_lib/location.sh"
```

- [x] **Step 2: Replace branch detection with one git call**

Find this block:

```sh
branch=""
if [ -n "$wt_branch" ]; then branch="$wt_branch"
elif [ -n "$workspace" ]; then branch=$(cd "$workspace" 2>/dev/null && git branch --show-current 2>/dev/null)
fi
```

Replace it with:

```sh
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
```

- [x] **Step 3: Rebuild line 1**

Find the model label block ending in:

```sh
line1=""
[ -n "$model_label" ] && line1="${B}${C}🤖 ${model_label}${ctx_label}${X}"
```

Replace that pair of lines with:

```sh
line1=""
[ -n "$model_label" ] && line1="${B}${C}◆ ${model_label}${ctx_label}${X}"

# Location: ▸ marks the place, ↳ inside it marks a worktree.
if [ -n "$location" ]; then
  loc_field="${D}▸${X} ${location}"
  [ -n "$line1" ] && line1="$line1  $loc_field" || line1="$loc_field"
fi
```

Then find the branch rendering block:

```sh
if [ -n "$branch" ]; then
  if [ -n "$worktree" ]; then git_info="${M}🌳 ${branch}${X}"
  else git_info="${G}${branch}${X}"
  fi
  [ -n "$line1" ] && line1="$line1 ${D}|${X} $git_info" || line1="$git_info"
fi
```

Replace it with:

```sh
# The tree moved to the location field, which is the thing that is actually a
# worktree. The branch keeps its colour and drops the icon.
if [ -n "$branch" ]; then
  in_worktree=""
  [ -n "$worktree" ] && in_worktree=yes
  [ -n "$git_top" ] && [ -n "$git_common" ] && \
    [ "$git_top" != "${git_common%/.git}" ] && in_worktree=yes
  if [ -n "$in_worktree" ]; then git_info="${M}⑂ ${branch}${X}"
  else git_info="${G}⑂ ${branch}${X}"
  fi
  [ -n "$line1" ] && line1="$line1  $git_info" || line1="$git_info"
fi
```

- [x] **Step 4: Remove the context bar from line 1**

The context window moves to line 2 as a circle. Find and delete this block:

```sh
# Context window progress bar
if [ -n "$used" ]; then
  ctx_bar=$(make_bar "$used" 16 fixed_gray)
  [ -n "$line1" ] && line1="$line1 ${D}|${X} $ctx_bar" || line1="$ctx_bar"
fi
```

Leave the caveman badge block that follows it untouched.

- [x] **Step 5: Rebuild line 2**

Replace the whole `line2` block — from `line2=""` down to and including the `fi` that closes the `elif [ -n "$cost" ]` branch — with:

```sh
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
  # Month-to-date spend across every session; see scripts/budget.js.
  CLAUDE_HOME="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  BUDGET=2000
  total_cost=""
  budget_out=$(node "$CLAUDE_HOME/scripts/budget.js" --statusline 2>/dev/null)
  if [ -n "$budget_out" ]; then
    total_cost=${budget_out% *}
    BUDGET=${budget_out#* }
  fi
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
```

- [x] **Step 6: Check it renders, in a repository**

```bash
printf '%s' '{"session_id":"T","model":{"display_name":"Opus 5","id":"claude-opus-5"},"workspace":{"current_dir":"'"$PWD"'"},"cost":{"total_cost_usd":9.99},"context_window":{"context_window_size":1000000,"used_percentage":45}}' | sh hooks/scripts/statusline.sh; echo
```

Expected: two lines. The first reads `◆ Opus 5 (1M)  ▸ .claude ↳ statusline-location  ⑂ worktree-statusline-location`, with the branch in magenta because this is a worktree. The second reads `ctx ◑ 45%  $ ◑ <spend> / 2000 ↻<countdown>`. No `🤖`, no `🌳`, no block bars.

- [x] **Step 7: Check the rolling-limits branch**

```bash
printf '%s' '{"session_id":"T","model":{"display_name":"Opus 5","id":"claude-opus-5"},"workspace":{"current_dir":"'"$PWD"'"},"context_window":{"context_window_size":1000000,"used_percentage":45},"rate_limits":{"five_hour":{"used_percentage":22,"resets_at":'"$(( $(date +%s) + 9000 ))"'},"seven_day":{"used_percentage":61,"resets_at":'"$(( $(date +%s) + 367200 ))"'}}}' | sh hooks/scripts/statusline.sh; echo
```

Expected line 2: `ctx ◑ 45%  5h ◔ 22% ↻2h30m  7d ◑ 61% ↻4d6h`. Note `◑` for 61%, not `◕`.

- [x] **Step 8: Check the fallbacks**

Not a repository:

```bash
printf '%s' '{"session_id":"T","model":{"display_name":"Opus 5"},"workspace":{"current_dir":"'"$HOME"'/Downloads"},"cost":{"total_cost_usd":1},"context_window":{"used_percentage":10}}' | sh hooks/scripts/statusline.sh; echo
```

Expected: location reads `~/Downloads`, no branch field, still two lines.

No payload at all:

```bash
echo '{}' | sh hooks/scripts/statusline.sh; echo
```

Expected: empty or near-empty output, exit 0, no error text.

- [x] **Step 9: Confirm both lines fit 80 columns**

```bash
printf '%s' '{"session_id":"T","model":{"display_name":"Opus 5","id":"claude-opus-5"},"workspace":{"current_dir":"'"$PWD"'"},"cost":{"total_cost_usd":9.99},"context_window":{"context_window_size":1000000,"used_percentage":45}}' \
  | sh hooks/scripts/statusline.sh \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | awk '{ printf "%2d cols  %s\n", length($0), ($0 ~ /./ ? "" : "(blank)") }'
```

Expected: both counts at or under 80.

- [x] **Step 10: Run the whole suite**

Run: `python3 tests/run_all_tests.py`
Expected: all four sections pass.

- [x] **Step 11: Update the README**

In `README.md`, the hooks table row for `statusline.sh` currently reads:

```
| `statusline.sh` | StatusLine | Two-line status with model, context, rate limits, cost |
```

Replace it with:

```
| `statusline.sh` | StatusLine | Two-line status: model and location above, context and spend below |
```

- [x] **Step 12: Commit**

```bash
git add hooks/scripts/statusline.sh README.md
git commit -m "feat(statusline): show the location and render meters as circles"
```

---

## Self-Review

**Spec coverage.** Two lines with the stated shape — Task 3 steps 3–5. Glyph table — step 3 for `◆ ▸ ⑂`, Task 2 for `↳`, step 5 for `↻`. Circles never coloured — no colour variable appears in any meter field in step 5. Every meter labelled — step 5. Spend always with its cap — step 5, `${spent_fmt} / ${BUDGET}`. Budget-versus-windows branch unchanged — step 5 keeps the existing `five_h`/`cost` condition. Location rules and truncation — Task 2. Single `git rev-parse` replacing the branch call — step 2. Error handling — guarded sources in step 1, `2>/dev/null` on the git call, `command -v` guard on `format_location`, budget fallback retained in step 5, verified in step 8. Testing — Tasks 1 and 2, wired into the runner in Task 1 step 6. Known limitation — recorded in the header comment of `meter.sh`.

**Placeholders.** None: every step carries its code or its exact command.

**Type consistency.** `meter_circle` and `format_location` are named identically in their defining tasks and at both call sites. `location_shorten` takes `<path> <max>` in the library, the test and the recursive call in `format_location`. `LOCATION_MAX` is defined once.

**One spec correction, deliberate.** The spec's `7d ◕ 61%` disagrees with nearest-quarter rounding. Task 1 step 8 changes the spec to `◑`, and Task 3 step 7 asserts the new value.


## Deviations during execution

Three, all recorded in the commits:

1. **`hooks/scripts/lib/` was gitignored.** The Python block carried an
   unanchored `lib/`, which swallowed the new source directory — the first
   commit landed without `meter.sh`. Fixed by anchoring the Python artefact
   patterns to the repo root (`/lib/`, `/lib64/`) and amending.

2. **A branch cap was needed.** Task 3 step 9 expected both lines within 80
   columns; the identity line measured 84. `branch_shorten` (cap 21, elided
   from the left) was added to `location.sh` with its own tests, and the spec
   updated. The plan's width estimate had omitted the model's `(1M)` suffix.

3. **Dead code removed.** With the block bars gone, `make_bar` had no callers
   and the `Y` and `R` colours no users. Both deleted rather than left behind.
