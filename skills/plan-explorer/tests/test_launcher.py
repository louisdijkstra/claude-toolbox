# ~/.claude/skills/plan-explorer/tests/test_launcher.py
import re
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


def test_no_open_prints_url(tmp_md):
    r = subprocess.run(
        [str(LAUNCHER), str(tmp_md), "--no-open", "--port", "0"],
        capture_output=True, text=True, timeout=5,
    )
    # Server will be killed by --no-open semantics in a later task;
    # for now we accept either successful exit or timeout, but URL must appear.
    output = r.stdout + r.stderr
    assert re.search(r"http://127\.0\.0\.1:\d+/\?t=[0-9a-f]{32}", output), output
