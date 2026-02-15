#!/usr/bin/env python3
"""Extract project context from documentation."""

import os
import sys
from pathlib import Path


def find_docs_directory():
    """Find docs/ directory in project."""
    current = Path.cwd()
    for _ in range(3):  # Search up to 3 levels
        docs_path = current / "docs"
        if docs_path.exists():
            return docs_path
        current = current.parent
    return None


def read_doc(docs_path, filename):
    """Read a documentation file."""
    file_path = docs_path / filename
    if file_path.exists():
        return file_path.read_text()
    return None


def extract_context(docs_path):
    """Extract context from documentation files."""
    context = {}

    # Read core documents
    context['overview'] = read_doc(docs_path, 'PROJECT_OVERVIEW.md')
    context['architecture'] = read_doc(docs_path, 'ARCHITECTURE.md')
    context['tech_stack'] = read_doc(docs_path, 'TECH_STACK.md')
    context['deployment'] = read_doc(docs_path, 'DEPLOYMENT.md')

    return context


def main():
    docs_path = find_docs_directory()

    if not docs_path:
        print("No docs/ directory found in project")
        return 1

    context = extract_context(docs_path)

    # Print available context
    for key, value in context.items():
        if value:
            print(f"\n{'='*60}")
            print(f"{key.upper()}")
            print('='*60)
            print(value[:500])  # First 500 chars
            if len(value) > 500:
                print(f"\n... ({len(value) - 500} more characters)")

    return 0


if __name__ == '__main__':
    sys.exit(main())
