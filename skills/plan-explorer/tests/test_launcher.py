# ~/.claude/skills/plan-explorer/tests/test_launcher.py
import http.client
import re
import subprocess
import time
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
    proc = subprocess.Popen(
        [str(LAUNCHER), str(tmp_md), "--no-open", "--port", "0"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    )
    try:
        # Launcher spawns and prints URL, then waits for server
        url = None
        deadline = time.time() + 3
        while time.time() < deadline:
            line = proc.stdout.readline()
            output = line
            if re.search(r"http://127\.0\.0\.1:\d+/\?t=[0-9a-f]{32}", line):
                url = line
                break
        assert url, f"URL not found in launcher output"
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()


def test_launcher_serves_index(tmp_md):
    proc = subprocess.Popen(
        [str(LAUNCHER), str(tmp_md), "--no-open"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    )
    try:
        url = None
        deadline = time.time() + 3
        while time.time() < deadline:
            line = proc.stdout.readline()
            if "url:" in line:
                url = line.split("url:")[1].strip()
                break
        assert url, "launcher did not print URL"
        port = int(re.search(r":(\d+)/", url).group(1))
        token = re.search(r"t=([0-9a-f]+)", url).group(1)
        time.sleep(0.3)
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
        conn.request("GET", f"/?t={token}")
        assert conn.getresponse().status == 200
    finally:
        proc.terminate(); proc.wait(timeout=2)
