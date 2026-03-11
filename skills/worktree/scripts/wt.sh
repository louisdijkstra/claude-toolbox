#!/usr/bin/env bash
# wt - Git Worktree Manager
# Source in your shell: source ~/.claude/skills/worktree/scripts/wt.sh
#
# Usage: wt <command> [args]
#
# Configuration (optional, set before sourcing):
#   WT_DIR          Worktree directory name (default: .worktrees)
#   WT_COPY_FILES   Space-separated files to copy (default: .env .env.local)

WT_DIR="${WT_DIR:-.worktrees}"
WT_COPY_FILES="${WT_COPY_FILES:-.env .env.local}"

# --- Helpers ---
_wt_repo_root() { git rev-parse --show-toplevel 2>/dev/null; }

_wt_ensure_repo() {
    local root=$(_wt_repo_root)
    if [[ -z "$root" ]]; then
        echo "\033[0;31mError:\033[0m not inside a git repository" >&2
        return 1
    fi
    echo "$root"
}

_wt_has_changes() { git -C "$1" status --porcelain 2>/dev/null | grep -q .; }

_wt_branch_of() { git -C "$1" rev-parse --abbrev-ref HEAD 2>/dev/null; }

_wt_detect_base() {
    local root="$1"
    for candidate in dev develop main master; do
        if git -C "$root" rev-parse --verify "$candidate" >/dev/null 2>&1; then
            echo "$candidate"
            return 0
        fi
    done
    return 1
}

_wt_confirm() {
    printf "%s [y/N] " "$1"
    local r; read -r r
    [[ "$r" =~ ^[Yy]$ ]]
}

_wt_copy_env_files() {
    local root="$1" dest="$2" copied=0
    for f in $WT_COPY_FILES; do
        if [[ -f "${root}/${f}" && ! -f "${dest}/${f}" ]]; then
            cp "${root}/${f}" "${dest}/${f}" 2>/dev/null && copied=$((copied + 1))
        fi
    done
    [[ $copied -gt 0 ]] && echo "  Copied $copied env file(s)"
}

_wt_check_gitignore() {
    local root="$1"
    if [[ -f "${root}/.gitignore" ]]; then
        if ! grep -q "^${WT_DIR}/" "${root}/.gitignore" 2>/dev/null && \
           ! grep -q "^${WT_DIR}$" "${root}/.gitignore" 2>/dev/null; then
            echo "  \033[0;33mWarning:\033[0m '${WT_DIR}/' is not in .gitignore"
            echo "  Consider adding it: echo '${WT_DIR}/' >> ${root}/.gitignore"
        fi
    fi
}

# --- Commands ---

_wt_new() {
    local name="$1" base="$2"
    if [[ -z "$name" ]]; then
        echo "Usage: wt new <name> [base-branch]"
        echo "  Creates worktree + new branch named <name>"
        echo "  Base auto-detected: dev → develop → main → master"
        return 1
    fi

    local root
    root=$(_wt_ensure_repo) || return 1
    local wt_path="${root}/${WT_DIR}/${name}"

    if [[ -d "$wt_path" ]]; then
        echo "\033[0;31mError:\033[0m worktree '$name' already exists"
        echo "  wt cd $name  |  wt rm $name"
        return 1
    fi

    # Detect base branch
    if [[ -z "$base" ]]; then
        base=$(_wt_detect_base "$root")
        if [[ -z "$base" ]]; then
            echo "\033[0;31mError:\033[0m could not detect base branch (tried dev, develop, main, master)"
            echo "  Specify explicitly: wt new $name <base-branch>"
            return 1
        fi
        echo "  Using \033[1m$base\033[0m as base branch"
    fi

    if ! git -C "$root" rev-parse --verify "$base" >/dev/null 2>&1; then
        echo "\033[0;31mError:\033[0m branch '$base' does not exist"
        return 1
    fi

    # Check if branch name already exists
    if git -C "$root" rev-parse --verify "$name" >/dev/null 2>&1; then
        echo "\033[0;31mError:\033[0m branch '$name' already exists"
        echo "  Use 'wt co $name' to check out the existing branch"
        return 1
    fi

    # Warn if base may be stale
    local tracking
    tracking=$(git -C "$root" rev-parse --abbrev-ref "${base}@{upstream}" 2>/dev/null)
    if [[ -n "$tracking" ]]; then
        local behind
        behind=$(git -C "$root" rev-list --count "${base}..${tracking}" 2>/dev/null)
        if [[ "${behind:-0}" -gt 0 ]]; then
            echo "  \033[0;33mNote:\033[0m local $base is $behind commit(s) behind $tracking"
            echo "  Consider: git fetch origin && git merge origin/$base (in main repo)"
        fi
    fi

    echo "  Path:   ${WT_DIR}/$name"
    echo "  Branch: $name (new, from $base)"

    mkdir -p "${root}/${WT_DIR}"
    local wt_output
    wt_output=$(git -C "$root" worktree add -b "$name" "$wt_path" "$base" 2>&1)
    if [[ $? -ne 0 ]]; then
        echo "\033[0;31mFailed to create worktree:\033[0m"
        echo "$wt_output"
        return 1
    fi

    _wt_copy_env_files "$root" "$wt_path"
    _wt_check_gitignore "$root"
    echo ""
    echo "\033[0;32mDone.\033[0m  wt cd $name"
}

_wt_checkout() {
    local branch="$1" name="$2"
    if [[ -z "$branch" ]]; then
        echo "Usage: wt co <existing-branch> [worktree-name]"
        echo "  Name defaults to branch (slashes → dashes)"
        return 1
    fi

    local root
    root=$(_wt_ensure_repo) || return 1
    [[ -z "$name" ]] && name="${branch//\//-}"
    local wt_path="${root}/${WT_DIR}/${name}"

    if [[ -d "$wt_path" ]]; then
        echo "\033[0;31mError:\033[0m worktree '$name' already exists"
        echo "  wt cd $name"
        return 1
    fi

    # Resolve branch: local first, then origin
    if ! git -C "$root" rev-parse --verify "$branch" >/dev/null 2>&1; then
        if git -C "$root" rev-parse --verify "origin/$branch" >/dev/null 2>&1; then
            echo "  Tracking from origin/$branch"
            git -C "$root" branch "$branch" "origin/$branch" 2>/dev/null
        else
            echo "\033[0;31mError:\033[0m branch '$branch' not found (local or origin)"
            echo "  Try: git fetch origin"
            return 1
        fi
    fi

    echo "  Path:   ${WT_DIR}/$name"
    echo "  Branch: $branch (existing)"

    mkdir -p "${root}/${WT_DIR}"
    local wt_output
    wt_output=$(git -C "$root" worktree add "$wt_path" "$branch" 2>&1)
    if [[ $? -ne 0 ]]; then
        echo "\033[0;31mFailed:\033[0m"
        echo "$wt_output"
        echo ""
        echo "  If branch is checked out elsewhere: git worktree prune && wt co $branch $name"
        return 1
    fi

    _wt_copy_env_files "$root" "$wt_path"
    _wt_check_gitignore "$root"
    echo ""
    echo "\033[0;32mDone.\033[0m  wt cd $name"
}

_wt_list() {
    local root
    root=$(_wt_ensure_repo) || return 1
    local wt_dir="${root}/${WT_DIR}"
    local count=0

    echo "\033[1mWorktrees:\033[0m"
    echo ""

    # Main worktree
    local mb=$(_wt_branch_of "$root")
    local ms=""; _wt_has_changes "$root" && ms=" \033[0;33m[dirty]\033[0m"
    printf "  \033[0;34m%-30s\033[0m  %s%b\n" "(main repo)" "$mb" "$ms"

    # Linked worktrees
    if [[ -d "$wt_dir" ]]; then
        for wt in "$wt_dir"/*/; do
            [[ -d "$wt" ]] || continue
            local n=$(basename "$wt")
            local b=$(_wt_branch_of "$wt")
            local s=""; _wt_has_changes "$wt" && s=" \033[0;33m[dirty]\033[0m"

            local ab=""
            local tracking=$(git -C "$wt" rev-parse --abbrev-ref '@{upstream}' 2>/dev/null)
            if [[ -n "$tracking" ]]; then
                local a=$(git -C "$wt" rev-list --count '@{upstream}..HEAD' 2>/dev/null)
                local behind=$(git -C "$wt" rev-list --count 'HEAD..@{upstream}' 2>/dev/null)
                [[ "${a:-0}" -gt 0 || "${behind:-0}" -gt 0 ]] && ab=" [+${a}/-${behind}]"
            fi

            printf "  %-30s  %s%b%s\n" "$n" "$b" "$s" "$ab"
            count=$((count + 1))
        done
    fi

    [[ $count -eq 0 ]] && echo "  (no worktrees in ${WT_DIR}/)"
    echo ""
}

_wt_status() {
    local name="$1"
    local root
    root=$(_wt_ensure_repo) || return 1
    if [[ -z "$name" ]]; then _wt_list; return; fi

    local wt_path="${root}/${WT_DIR}/${name}"
    [[ ! -d "$wt_path" ]] && echo "\033[0;31mError:\033[0m '$name' not found" && return 1

    echo "\033[1m$name\033[0m  ($(_wt_branch_of "$wt_path"))"
    echo "  Path: $wt_path"
    echo ""

    local changes=$(git -C "$wt_path" status --short 2>/dev/null)
    if [[ -n "$changes" ]]; then
        echo "  \033[0;33mUncommitted:\033[0m"
        echo "$changes" | sed 's/^/    /'
    else
        echo "  \033[0;32mClean\033[0m"
    fi

    echo ""
    echo "  \033[1mRecent commits:\033[0m"
    git -C "$wt_path" log --oneline -5 2>/dev/null | sed 's/^/    /'
}

_wt_cd() {
    local name="$1"
    local root
    root=$(_wt_ensure_repo) || return 1
    if [[ -z "$name" ]]; then
        echo "Usage: wt cd <name>"
        echo ""
        local wt_dir="${root}/${WT_DIR}"
        if [[ -d "$wt_dir" ]]; then
            echo "Available:"
            for wt in "$wt_dir"/*/; do
                [[ -d "$wt" ]] || continue
                echo "  $(basename "$wt")"
            done
        fi
        return 1
    fi

    local wt_path="${root}/${WT_DIR}/${name}"
    [[ ! -d "$wt_path" ]] && echo "\033[0;31mError:\033[0m '$name' not found" && return 1

    cd "$wt_path" || return 1
    echo "$wt_path  ($(_wt_branch_of "$wt_path"))"
}

_wt_remove() {
    local name="$1"
    [[ -z "$name" ]] && echo "Usage: wt rm <name>" && return 1

    local root
    root=$(_wt_ensure_repo) || return 1
    local wt_path="${root}/${WT_DIR}/${name}"

    if [[ ! -d "$wt_path" ]]; then
        echo "\033[0;31mError:\033[0m '$name' not found"
        echo "  Tip: wt prune (if directory was manually deleted)"
        return 1
    fi

    local branch=$(_wt_branch_of "$wt_path")

    if _wt_has_changes "$wt_path"; then
        echo "\033[0;31mWARNING:\033[0m '$name' has uncommitted changes:"
        git -C "$wt_path" status --short | sed 's/^/  /'
        echo ""
        _wt_confirm "Remove anyway? Changes will be LOST." || { echo "Aborted."; return 1; }
        git -C "$root" worktree remove --force "$wt_path" || return 1
    else
        git -C "$root" worktree remove "$wt_path" || return 1
    fi

    echo "\033[0;32mWorktree removed:\033[0m $name"

    if [[ -n "$branch" && "$branch" != "HEAD" ]]; then
        echo ""
        echo "Branch '$branch' still exists."
        if _wt_confirm "Delete branch? (safe -d, fails if unmerged)"; then
            if git -C "$root" branch -d "$branch" 2>&1; then
                echo "\033[0;32mBranch deleted.\033[0m"
            else
                echo "\033[0;33mKept\033[0m (unmerged). Force with: git branch -D $branch"
            fi
        fi
    fi
}

_wt_cleanup() {
    local root
    root=$(_wt_ensure_repo) || return 1
    local wt_dir="${root}/${WT_DIR}"
    [[ ! -d "$wt_dir" ]] && echo "No worktrees." && return 0

    local base=$(_wt_detect_base "$root")
    [[ -z "$base" ]] && echo "Could not detect base branch." && return 1

    echo "Checking against \033[1m$base\033[0m..."
    echo ""

    local removable=() dirty=()

    for wt in "$wt_dir"/*/; do
        [[ -d "$wt" ]] || continue
        local n=$(basename "$wt")
        local b=$(_wt_branch_of "$wt")

        if _wt_has_changes "$wt"; then
            dirty+=("$n ($b) - dirty")
            continue
        fi

        if git -C "$root" merge-base --is-ancestor "$b" "$base" 2>/dev/null; then
            removable+=("$n:$b")
        fi
    done

    if [[ ${#removable[@]} -eq 0 && ${#dirty[@]} -eq 0 ]]; then
        echo "\033[0;32mAll clean.\033[0m"
        return 0
    fi

    for item in "${dirty[@]}"; do echo "  \033[0;33mSkip:\033[0m $item"; done
    [[ ${#dirty[@]} -gt 0 ]] && echo ""

    if [[ ${#removable[@]} -gt 0 ]]; then
        echo "Merged and removable:"
        for item in "${removable[@]}"; do
            echo "  ${item%%:*} (${item##*:})"
        done
        echo ""
        if _wt_confirm "Remove these and delete their branches?"; then
            for item in "${removable[@]}"; do
                local n="${item%%:*}" b="${item##*:}"
                if git -C "$root" worktree remove "${wt_dir}/${n}" 2>&1; then
                    git -C "$root" branch -d "$b" 2>/dev/null
                    echo "  \033[0;32mRemoved:\033[0m $n ($b)"
                else
                    echo "  \033[0;31mFailed:\033[0m $n — skipping branch delete"
                fi
            done
        fi
    fi
}

_wt_prune() {
    local root
    root=$(_wt_ensure_repo) || return 1
    git -C "$root" worktree prune -v
}

_wt_claude_launch() {
    local name="$1"
    [[ -z "$name" ]] && echo "Usage: wt claude <name>" && return 1

    local root
    root=$(_wt_ensure_repo) || return 1
    local wt_path="${root}/${WT_DIR}/${name}"
    [[ ! -d "$wt_path" ]] && echo "\033[0;31mError:\033[0m '$name' not found" && return 1

    cd "$wt_path" || return 1
    echo "$wt_path  ($(_wt_branch_of "$wt_path"))"
    claude
}

# --- Main ---
wt() {
    local cmd="$1"; shift 2>/dev/null
    case "$cmd" in
        new)            _wt_new "$@" ;;
        co|checkout)    _wt_checkout "$@" ;;
        ls|list)        _wt_list "$@" ;;
        st|status)      _wt_status "$@" ;;
        cd)             _wt_cd "$@" ;;
        cl|claude)      _wt_claude_launch "$@" ;;
        rm|remove)      _wt_remove "$@" ;;
        cleanup)        _wt_cleanup "$@" ;;
        prune)          _wt_prune "$@" ;;
        -h|--help|help) _wt_help_text ;;
        "")             _wt_help_text ;;
        *)              echo "Unknown: $cmd (wt help)" && return 1 ;;
    esac
}

_wt_help_text() {
    cat <<'EOF'
wt - Git Worktree Manager

  wt new <name> [base]       New worktree + new branch (base: dev→develop→main)
  wt co <branch> [name]      Worktree for existing branch
  wt ls                      List worktrees with status
  wt st [name]               Detailed status
  wt cd <name>               Enter worktree
  wt claude <name>           Enter + launch claude
  wt rm <name>               Safe removal (checks for changes)
  wt cleanup                 Remove worktrees with merged branches
  wt prune                   Clean stale references
  wt help                    This help

Config (export before sourcing):
  WT_DIR=".worktrees"                   Worktree directory
  WT_COPY_FILES=".env .env.local"       Files to copy into new worktrees
EOF
}

# --- Zsh completion ---
if [[ -n "$ZSH_VERSION" ]]; then
    _wt_completion() {
        local root=$(_wt_repo_root 2>/dev/null)
        if (( CURRENT == 2 )); then
            local -a cmds=(
                'new:New worktree + branch'
                'co:Worktree for existing branch'
                'ls:List worktrees'
                'st:Worktree status'
                'cd:Enter worktree'
                'claude:Enter + launch claude'
                'rm:Remove worktree'
                'cleanup:Remove merged worktrees'
                'prune:Clean stale refs'
                'help:Show help'
            )
            _describe 'command' cmds
        elif (( CURRENT == 3 )); then
            case "${words[2]}" in
                cd|rm|remove|st|status|claude|cl)
                    if [[ -n "$root" && -d "${root}/${WT_DIR}" ]]; then
                        local -a wts=("${root}/${WT_DIR}"/*(N:t))
                        _describe 'worktree' wts
                    fi ;;
                co|checkout)
                    if [[ -n "$root" ]]; then
                        local -a branches=($(git -C "$root" branch --format='%(refname:short)' 2>/dev/null))
                        _describe 'branch' branches
                    fi ;;
            esac
        elif (( CURRENT == 4 )); then
            case "${words[2]}" in
                new)
                    if [[ -n "$root" ]]; then
                        local -a branches=($(git -C "$root" branch --format='%(refname:short)' 2>/dev/null))
                        _describe 'base branch' branches
                    fi ;;
            esac
        fi
    }
    compdef _wt_completion wt
fi
