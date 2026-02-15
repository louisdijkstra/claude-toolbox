#!/usr/bin/env python3
"""
Skills Structure Verifier
Verifies that skills have proper directory structure and supporting files.
"""

import sys
from pathlib import Path
from typing import Dict, List, Tuple


class StructureVerifier:
    """Verifies skill directory structure and supporting files."""

    EXPECTED_FILES = {
        'SKILL.md': True,  # Required
        'README.md': False,  # Optional
        'examples/': False,  # Optional
        'scripts/': False,  # Optional
        'configs/': False,  # Optional
        'tests/': False,  # Optional
    }

    def __init__(self, skill_path: Path):
        self.skill_path = skill_path
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.info: List[str] = []

    def verify(self) -> Tuple[bool, List[str], List[str], List[str]]:
        """
        Verify the skill structure.

        Returns:
            Tuple of (is_valid, errors, warnings, info)
        """
        # Check required files
        self._check_required_files()

        # Check optional files
        self._check_optional_files()

        # Check for unexpected files
        self._check_unexpected_files()

        # Check directory organization
        self._check_directory_organization()

        return len(self.errors) == 0, self.errors, self.warnings, self.info

    def _check_required_files(self):
        """Check that required files exist."""
        for filename, is_required in self.EXPECTED_FILES.items():
            if not is_required:
                continue

            filepath = self.skill_path / filename
            if not filepath.exists():
                self.errors.append(f"Missing required file: {filename}")

    def _check_optional_files(self):
        """Check optional files and provide info."""
        for filename, is_required in self.EXPECTED_FILES.items():
            if is_required:
                continue

            filepath = self.skill_path / filename
            if filepath.exists():
                if filename.endswith('/'):
                    # Directory
                    count = len(list(filepath.iterdir()))
                    self.info.append(f"Has {filename} directory with {count} items")
                else:
                    # File
                    size = filepath.stat().st_size
                    self.info.append(f"Has {filename} ({size} bytes)")
            else:
                self.info.append(f"No {filename} (optional)")

    def _check_unexpected_files(self):
        """Check for unexpected files in skill directory."""
        expected_names = {
            name.rstrip('/') for name in self.EXPECTED_FILES.keys()
        }
        expected_names.add('.git')  # Git metadata is OK
        expected_names.add('.DS_Store')  # macOS metadata is OK

        for item in self.skill_path.iterdir():
            if item.name not in expected_names:
                if item.is_dir():
                    self.warnings.append(f"Unexpected directory: {item.name}")
                else:
                    self.warnings.append(f"Unexpected file: {item.name}")

    def _check_directory_organization(self):
        """Check directory organization best practices."""
        # Check if scripts directory has executable files
        scripts_dir = self.skill_path / 'scripts'
        if scripts_dir.exists() and scripts_dir.is_dir():
            scripts = list(scripts_dir.glob('*'))
            if not scripts:
                self.warnings.append("scripts/ directory is empty")
            else:
                non_executable = [
                    s for s in scripts
                    if s.is_file() and not s.stat().st_mode & 0o111
                ]
                if non_executable:
                    self.warnings.append(
                        f"{len(non_executable)} script(s) not executable: "
                        f"{', '.join(s.name for s in non_executable[:3])}"
                    )

        # Check if examples directory has files
        examples_dir = self.skill_path / 'examples'
        if examples_dir.exists() and examples_dir.is_dir():
            examples = list(examples_dir.glob('*'))
            if not examples:
                self.warnings.append("examples/ directory is empty")

        # Check if README.md exists and has content
        readme = self.skill_path / 'README.md'
        if readme.exists():
            if readme.stat().st_size < 100:
                self.warnings.append("README.md is very short (< 100 bytes)")


def verify_all_skills(skills_dir: Path) -> Dict[str, Tuple[bool, List[str], List[str], List[str]]]:
    """
    Verify all skills in the skills directory.

    Returns:
        Dictionary mapping skill name to (is_valid, errors, warnings, info)
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

        verifier = StructureVerifier(skill_path)
        is_valid, errors, warnings, info = verifier.verify()
        results[skill_path.name] = (is_valid, errors, warnings, info)

    return results


def main():
    """Main entry point."""
    skills_dir = Path.home() / '.claude' / 'skills'

    print("🔍 Verifying skills directory structure...")
    print(f"📁 Skills directory: {skills_dir}\n")

    results = verify_all_skills(skills_dir)

    if not results:
        print("❌ No skills found to verify")
        return 1

    total_skills = len(results)
    valid_skills = sum(1 for is_valid, _, _, _ in results.values() if is_valid)
    invalid_skills = total_skills - valid_skills

    # Print results
    for skill_name, (is_valid, errors, warnings, info) in results.items():
        status = "✅" if is_valid else "❌"
        print(f"{status} {skill_name}")

        if errors:
            for error in errors:
                print(f"   ❌ ERROR: {error}")

        if warnings:
            for warning in warnings:
                print(f"   ⚠️  WARNING: {warning}")

        if info:
            for info_msg in info:
                print(f"   ℹ️  {info_msg}")

        print()

    # Print summary
    print("=" * 70)
    print(f"📊 Summary:")
    print(f"   Total skills: {total_skills}")
    print(f"   Valid structure: {valid_skills} ✅")
    print(f"   Invalid structure: {invalid_skills} ❌")
    print("=" * 70)

    return 0 if invalid_skills == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
