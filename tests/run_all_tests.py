#!/usr/bin/env python3
"""
Comprehensive Skills Testing Suite
Runs all validation and verification tests for the Claude Code skills system.
"""

import sys
import subprocess
from pathlib import Path
from typing import Dict, List


class TestRunner:
    """Orchestrates all skills tests."""

    def __init__(self):
        self.tests_dir = Path(__file__).parent
        self.skills_dir = Path.home() / '.claude' / 'skills'
        self.results: Dict[str, bool] = {}

    def run_all_tests(self) -> bool:
        """
        Run all test suites.

        Returns:
            True if all tests pass, False otherwise
        """
        print("=" * 70)
        print("🧪 Claude Code Skills - Comprehensive Test Suite")
        print("=" * 70)
        print()

        # Test 1: Validate directory structure
        self._run_test_section("Directory Structure", self._test_directory_structure)

        # Test 2: Validate SKILL.md files
        self._run_test_section("SKILL.md Files", self._test_skill_md_files)

        # Test 3: Verify supporting files
        self._run_test_section("Supporting Files", self._test_supporting_files)

        # Test 4: Verify dev-flow system
        self._run_test_section("Dev-Flow System", self._test_dev_flow_system)

        # Test 5: Verify documentation
        self._run_test_section("Documentation", self._test_documentation)

        # Print final summary
        self._print_summary()

        return all(self.results.values())

    def _run_test_section(self, name: str, test_func):
        """Run a test section and record results."""
        print(f"\n{'=' * 70}")
        print(f"📋 Testing: {name}")
        print(f"{'=' * 70}\n")

        try:
            success = test_func()
            self.results[name] = success
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"\n{status}: {name}")
        except Exception as e:
            self.results[name] = False
            print(f"\n❌ ERROR: {name}")
            print(f"   Exception: {e}")

    def _test_directory_structure(self) -> bool:
        """Test that skills directory structure exists."""
        print(f"Checking skills directory: {self.skills_dir}")

        if not self.skills_dir.exists():
            print(f"❌ Skills directory not found: {self.skills_dir}")
            return False

        skills = [d for d in self.skills_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
        print(f"✅ Found {len(skills)} skills")

        if len(skills) == 0:
            print("⚠️  Warning: No skills found")
            return False

        # Check for critical skills
        critical_skills = [
            'dev-flow',
            'getting-the-bigger-picture',
            'review-system',
            'plan-review-system'
        ]

        missing_critical = []
        for skill in critical_skills:
            if not (self.skills_dir / skill).exists():
                missing_critical.append(skill)

        if missing_critical:
            print(f"❌ Missing critical skills: {', '.join(missing_critical)}")
            return False

        print(f"✅ All critical skills present")
        return True

    def _test_skill_md_files(self) -> bool:
        """Test SKILL.md files validation."""
        print("Running SKILL.md validation...")

        validator_script = self.tests_dir / 'skills' / 'validate_skill_md.py'
        if not validator_script.exists():
            print(f"❌ Validator script not found: {validator_script}")
            return False

        result = subprocess.run(
            [sys.executable, str(validator_script)],
            capture_output=True,
            text=True
        )

        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)

        return result.returncode == 0

    def _test_supporting_files(self) -> bool:
        """Test supporting files verification."""
        print("Running structure verification...")

        verifier_script = self.tests_dir / 'skills' / 'verify_structure.py'
        if not verifier_script.exists():
            print(f"❌ Verifier script not found: {verifier_script}")
            return False

        result = subprocess.run(
            [sys.executable, str(verifier_script)],
            capture_output=True,
            text=True
        )

        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)

        return result.returncode == 0

    def _test_dev_flow_system(self) -> bool:
        """Test dev-flow system integrity."""
        print("Checking dev-flow system...")

        dev_flow_dir = self.skills_dir / 'dev-flow'
        if not dev_flow_dir.exists():
            print(f"❌ dev-flow directory not found")
            return False

        # Check for modes
        modes_dir = dev_flow_dir / 'modes'
        if not modes_dir.exists():
            print(f"❌ modes directory not found")
            return False

        modes = list(modes_dir.glob('*.md'))
        print(f"✅ Found {len(modes)} modes: {', '.join(m.stem for m in modes)}")

        expected_modes = ['focus', 'explore', 'rapid', 'review']
        missing_modes = []
        for mode in expected_modes:
            if not (modes_dir / f"{mode}.md").exists():
                missing_modes.append(mode)

        if missing_modes:
            print(f"⚠️  Missing modes: {', '.join(missing_modes)}")

        # Check for stages
        stages_dir = dev_flow_dir / 'stages'
        if not stages_dir.exists():
            print(f"❌ stages directory not found")
            return False

        stages = list(stages_dir.glob('*.md'))
        print(f"✅ Found {len(stages)} stages: {', '.join(s.stem for s in stages)}")

        expected_stages = ['1-plan', '2-implement', '3-test', '4-document', '5-review', '6-integrate']
        missing_stages = []
        for stage in expected_stages:
            if not (stages_dir / f"{stage}.md").exists():
                missing_stages.append(stage)

        if missing_stages:
            print(f"⚠️  Missing stages: {', '.join(missing_stages)}")

        return len(missing_modes) == 0 and len(missing_stages) == 0

    def _test_documentation(self) -> bool:
        """Test documentation templates exist."""
        print("Checking documentation templates...")

        docs_dir = Path.home() / '.claude' / 'docs' / 'templates'
        if not docs_dir.exists():
            print(f"❌ Documentation templates directory not found: {docs_dir}")
            return False

        expected_templates = [
            'PROJECT_OVERVIEW.md',
            'ARCHITECTURE.md',
            'API_DOCS.md',
            'SETUP.md',
            'CONTRIBUTING.md',
            'DEPLOYMENT.md',
            'TROUBLESHOOTING.md',
            'DECISIONS.md',
            'CHANGELOG.md'
        ]

        missing_templates = []
        for template in expected_templates:
            if not (docs_dir / template).exists():
                missing_templates.append(template)

        if missing_templates:
            print(f"❌ Missing templates: {', '.join(missing_templates)}")
            return False

        print(f"✅ All {len(expected_templates)} documentation templates present")
        return True

    def _print_summary(self):
        """Print final test summary."""
        print("\n" + "=" * 70)
        print("📊 Test Summary")
        print("=" * 70)

        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results.values() if result)
        failed_tests = total_tests - passed_tests

        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {test_name}")

        print("=" * 70)
        print(f"Total tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success rate: {(passed_tests/total_tests*100):.1f}%")
        print("=" * 70)


def main():
    """Main entry point."""
    runner = TestRunner()
    success = runner.run_all_tests()

    if success:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
