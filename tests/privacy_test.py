#!/usr/bin/env python3
"""
Privacy guard: no private names in tracked files.

This repository is public. Personal project names, client engagement names and
the author's home directory have leaked into it before, arriving as test
fixtures and worked examples copied from real paths.

The terms below are assembled from split literals on purpose: the file has to
name what it searches for, and writing them whole would mean this guard is
itself a leak. Add new terms the same way.
"""

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# (term, what to use instead) — terms split so they do not appear literally here.
FORBIDDEN = [
    ("ki" + "ra", "my-app"),
    ("KI" + "RA", "My App"),
    ("/Users/" + "you", "/Users/you"),
    ("CV" + "S-planning", "2026-planning"),
    ("Pre" + "sales", "2026-planning"),
    ("One" + "Drive", "Sync"),
    ("Cloud" + "Storage", "Sync"),
]

# This file names the terms, so it cannot scan itself.
EXCLUDED = {"tests/privacy_test.py"}


def tracked_files():
    """Every file git tracks, as repo-relative paths."""
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return [p for p in result.stdout.split("\0") if p and p not in EXCLUDED]


def scan(path: str):
    """Yield (line number, term, line) for each forbidden term in one file."""
    full = REPO_ROOT / path
    try:
        text = full.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return  # binary or unreadable: not our business
    for number, line in enumerate(text.splitlines(), start=1):
        for term, replacement in FORBIDDEN:
            if term in line:
                yield number, term, replacement, line.strip()


def main() -> int:
    print("Scanning tracked files for private names...")

    hits = 0
    for path in tracked_files():
        for number, term, replacement, line in scan(path):
            hits += 1
            print(f"❌ {path}:{number}")
            print(f"   found '{term}' — use '{replacement}' instead")
            print(f"   {line[:100]}")

    if hits:
        print(f"\n❌ {hits} private name(s) found in tracked files")
        return 1

    print("✅ No private names in tracked files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
