#!/usr/bin/env python3
"""
SKILL.md Validator
Validates that SKILL.md files in ~/.claude/skills follow the required format.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple, Dict
import yaml


class SkillValidator:
    """Validates SKILL.md files for correct structure and content."""

    REQUIRED_SECTIONS = [
        "Purpose",
        "When Invoked",
        "Process"
    ]

    OPTIONAL_SECTIONS = [
        "Implementation",
        "Example",
        "Output",
        "Best Practices",
        "Troubleshooting",
        "References"
    ]

    def __init__(self, skill_path: Path):
        self.skill_path = skill_path
        self.skill_md = skill_path / "SKILL.md"
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate(self) -> Tuple[bool, List[str], List[str]]:
        """
        Validate the SKILL.md file.

        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        if not self.skill_md.exists():
            self.errors.append(f"SKILL.md not found in {self.skill_path}")
            return False, self.errors, self.warnings

        content = self.skill_md.read_text()

        # Validate YAML frontmatter
        self._validate_frontmatter(content)

        # Validate required sections
        self._validate_sections(content)

        # Validate markdown format
        self._validate_markdown(content)

        # Validate content quality
        self._validate_content_quality(content)

        return len(self.errors) == 0, self.errors, self.warnings

    def _validate_frontmatter(self, content: str):
        """Validate YAML frontmatter exists and has required fields."""
        frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)

        if not frontmatter_match:
            self.errors.append("Missing YAML frontmatter (should start with ---)")
            return

        try:
            frontmatter = yaml.safe_load(frontmatter_match.group(1))
        except yaml.YAMLError as e:
            self.errors.append(f"Invalid YAML frontmatter: {e}")
            return

        # Check required fields
        if 'name' not in frontmatter:
            self.errors.append("Frontmatter missing required field: name")
        elif not isinstance(frontmatter['name'], str) or not frontmatter['name'].strip():
            self.errors.append("Frontmatter 'name' field must be a non-empty string")
        elif frontmatter['name'] != self.skill_path.name:
            self.errors.append(
                f"Frontmatter 'name' ({frontmatter['name']}) doesn't match "
                f"directory name ({self.skill_path.name})"
            )

        if 'description' not in frontmatter:
            self.errors.append("Frontmatter missing required field: description")
        elif not isinstance(frontmatter['description'], str) or not frontmatter['description'].strip():
            self.errors.append("Frontmatter 'description' field must be a non-empty string")
        elif len(frontmatter['description']) < 20:
            self.warnings.append("Description is very short (< 20 characters)")
        elif len(frontmatter['description']) > 200:
            self.warnings.append("Description is very long (> 200 characters)")

    def _validate_sections(self, content: str):
        """Validate that required sections exist."""
        # Remove frontmatter for section checking
        content_without_frontmatter = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

        for section in self.REQUIRED_SECTIONS:
            # Look for section heading (## Section)
            pattern = rf'^##\s+{re.escape(section)}\s*$'
            if not re.search(pattern, content_without_frontmatter, re.MULTILINE):
                self.errors.append(f"Missing required section: {section}")

    def _validate_markdown(self, content: str):
        """Validate markdown formatting."""
        lines = content.split('\n')

        # Check for common markdown issues
        for i, line in enumerate(lines, 1):
            # Check for headings without space after #
            if re.match(r'^#{1,6}[^\s#]', line):
                self.warnings.append(f"Line {i}: Heading should have space after # (e.g., '## Title')")

            # Check for very long lines (except code blocks)
            if len(line) > 120 and not line.strip().startswith('```'):
                self.warnings.append(f"Line {i}: Very long line (> 120 chars)")

    def _validate_content_quality(self, content: str):
        """Validate content quality and completeness."""
        # Check minimum content length
        if len(content) < 200:
            self.warnings.append("SKILL.md is very short (< 200 characters)")

        # Check for placeholder content
        placeholders = ['TODO', 'FIXME', 'XXX', '[TBD]', '[to be determined]']
        for placeholder in placeholders:
            if placeholder.lower() in content.lower():
                self.warnings.append(f"Contains placeholder: {placeholder}")

        # Check for code examples
        if '```' not in content:
            self.warnings.append("No code examples found - consider adding examples")

        # Check for steps in Process section
        process_match = re.search(r'##\s+Process\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
        if process_match:
            process_content = process_match.group(1)
            if 'Step' not in process_content and '###' not in process_content:
                self.warnings.append("Process section should contain steps or subsections")


def validate_all_skills(skills_dir: Path) -> Dict[str, Tuple[bool, List[str], List[str]]]:
    """
    Validate all SKILL.md files in the skills directory.

    Returns:
        Dictionary mapping skill name to (is_valid, errors, warnings)
    """
    results = {}

    if not skills_dir.exists():
        print(f"Skills directory not found: {skills_dir}")
        return results

    for skill_path in sorted(skills_dir.iterdir()):
        if not skill_path.is_dir():
            continue

        # Skip hidden directories
        if skill_path.name.startswith('.'):
            continue

        validator = SkillValidator(skill_path)
        is_valid, errors, warnings = validator.validate()
        results[skill_path.name] = (is_valid, errors, warnings)

    return results


def main():
    """Main entry point."""
    skills_dir = Path.home() / '.claude' / 'skills'

    print("🔍 Validating SKILL.md files...")
    print(f"📁 Skills directory: {skills_dir}\n")

    results = validate_all_skills(skills_dir)

    if not results:
        print("❌ No skills found to validate")
        return 1

    total_skills = len(results)
    valid_skills = sum(1 for is_valid, _, _ in results.values() if is_valid)
    invalid_skills = total_skills - valid_skills

    # Print results
    for skill_name, (is_valid, errors, warnings) in results.items():
        status = "✅" if is_valid else "❌"
        print(f"{status} {skill_name}")

        if errors:
            for error in errors:
                print(f"   ❌ ERROR: {error}")

        if warnings:
            for warning in warnings:
                print(f"   ⚠️  WARNING: {warning}")

        if not errors and not warnings:
            print(f"   ✓ No issues found")

        print()

    # Print summary
    print("=" * 70)
    print(f"📊 Summary:")
    print(f"   Total skills: {total_skills}")
    print(f"   Valid: {valid_skills} ✅")
    print(f"   Invalid: {invalid_skills} ❌")
    print("=" * 70)

    return 0 if invalid_skills == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
