# ~/.claude/skills/plan-explorer/tests/conftest.py
import socket
import subprocess
import tempfile
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
