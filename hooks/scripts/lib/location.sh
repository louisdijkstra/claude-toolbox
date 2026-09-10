#!/bin/sh
# Where the session is running, as one short string.
#
# Pure: every function takes strings and returns a string. Nothing here runs
# git or touches the filesystem, which is what makes the rules testable.

LOCATION_MAX=28
BRANCH_MAX=21

# branch_shorten <name> <max> -> name, or …tail when too long
# A branch is identity, but the native worktree tool emits names like
# worktree-statusline-location which push the identity line past 80 columns.
# The tail is the distinctive part, so the head is what goes.
branch_shorten() {
  _name=$1
  _max=${2:-$BRANCH_MAX}
  if [ ${#_name} -le "$_max" ]; then
    printf '%s' "$_name"
    return
  fi
  _keep=$((_max - 1))
  printf '…%s' "$(printf '%s' "$_name" | tail -c "$_keep")"
}

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
