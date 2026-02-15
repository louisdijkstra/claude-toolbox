#!/usr/bin/env python3
"""Analyze codebase patterns using AST."""

import ast
import sys
from pathlib import Path
from collections import defaultdict


class PatternAnalyzer(ast.NodeVisitor):
    """Analyze Python code patterns."""

    def __init__(self):
        self.imports = []
        self.classes = []
        self.functions = []
        self.decorators = []

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module or ''
        for alias in node.names:
            self.imports.append(f"{module}.{alias.name}")
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        self.classes.append(node.name)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self.functions.append(node.name)
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name):
                self.decorators.append(decorator.id)
        self.generic_visit(node)


def analyze_file(file_path):
    """Analyze a single Python file."""
    try:
        content = Path(file_path).read_text()
        tree = ast.parse(content)
        analyzer = PatternAnalyzer()
        analyzer.visit(tree)
        return analyzer
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}", file=sys.stderr)
        return None


def find_pattern_files(pattern_type):
    """Find files related to a pattern type."""
    patterns = {
        'api': ['router', '@app', '@api', 'FastAPI'],
        'database': ['Session', 'query', 'repository', 'SQLAlchemy'],
        'auth': ['auth', 'token', 'OAuth2', 'JWT'],
        'test': ['pytest', 'unittest', 'test_'],
    }

    search_terms = patterns.get(pattern_type.lower(), [])
    matching_files = []

    for py_file in Path('.').rglob('*.py'):
        if any(term.lower() in py_file.read_text().lower() for term in search_terms):
            matching_files.append(py_file)
            if len(matching_files) >= 10:
                break

    return matching_files


def main():
    """Extract and analyze patterns from codebase."""
    if len(sys.argv) < 2:
        print("Usage: pattern-analyzer.py <pattern_type>")
        print("Pattern types: api, database, auth, test")
        return 1

    pattern_type = sys.argv[1]
    files = find_pattern_files(pattern_type)

    if not files:
        print(f"No files found for pattern: {pattern_type}")
        return 1

    print(f"\nFound {len(files)} files for {pattern_type} pattern:\n")

    all_imports = defaultdict(int)
    all_decorators = defaultdict(int)

    for file_path in files:
        print(f"- {file_path}")
        analyzer = analyze_file(file_path)
        if analyzer:
            for imp in analyzer.imports:
                all_imports[imp] += 1
            for dec in analyzer.decorators:
                all_decorators[dec] += 1

    print(f"\nCommon imports:")
    for imp, count in sorted(all_imports.items(), key=lambda x: -x[1])[:10]:
        print(f"  {imp} ({count} files)")

    print(f"\nCommon decorators:")
    for dec, count in sorted(all_decorators.items(), key=lambda x: -x[1])[:10]:
        print(f"  @{dec} ({count} files)")

    return 0


if __name__ == '__main__':
    sys.exit(main())
