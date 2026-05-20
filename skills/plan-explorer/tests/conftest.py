# ~/.claude/skills/plan-explorer/tests/conftest.py
import socket
import subprocess
import sys
import tempfile
import time as _time
from pathlib import Path

import pytest

SKILL_DIR = Path(__file__).resolve().parent.parent
LAUNCHER = SKILL_DIR / "scripts" / "plan-explore"
SERVER = SKILL_DIR / "scripts" / "server.py"


@pytest.fixture
def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture
def tmp_md(tmp_path):
    f = tmp_path / "plan.md"
    f.write_text("# Title\n\n## Phase 1\n\n- [ ] task\n")
    return f


playwright = pytest.importorskip("playwright.sync_api")


@pytest.fixture
def page_loader(tmp_md, free_port):
    """Start server, return (page, etag, cleanup)."""
    from playwright.sync_api import sync_playwright
    token = "p" * 32
    proc = subprocess.Popen(
        [sys.executable, str(SERVER), str(tmp_md), token, str(free_port)],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    _time.sleep(0.3)
    pw = sync_playwright().start()
    browser = pw.chromium.launch()
    page = browser.new_page()
    page.goto(f"http://127.0.0.1:{free_port}/?t={token}")
    yield page, tmp_md
    browser.close(); pw.stop()
    proc.terminate(); proc.wait(timeout=2)
