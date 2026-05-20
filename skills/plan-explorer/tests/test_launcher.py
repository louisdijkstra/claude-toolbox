# ~/.claude/skills/plan-explorer/tests/test_launcher.py
import subprocess
from .conftest import LAUNCHER


def test_missing_path_exits_nonzero():
    r = subprocess.run([str(LAUNCHER)], capture_output=True, text=True)
    assert r.returncode != 0
    assert "path" in r.stderr.lower()


def test_nonexistent_path_exits_nonzero():
    r = subprocess.run([str(LAUNCHER), "/no/such/file.md"], capture_output=True, text=True)
    assert r.returncode != 0
    assert "not found" in r.stderr.lower() or "no such" in r.stderr.lower()


def test_wrong_extension_exits_nonzero(tmp_path):
    f = tmp_path / "plan.txt"
    f.write_text("x")
    r = subprocess.run([str(LAUNCHER), str(f)], capture_output=True, text=True)
    assert r.returncode != 0
    assert ".md" in r.stderr
