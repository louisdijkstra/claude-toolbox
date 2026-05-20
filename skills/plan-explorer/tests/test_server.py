# ~/.claude/skills/plan-explorer/tests/test_server.py
import http.client
import subprocess
import sys
import time
from .conftest import SERVER


def start_server(path, token, port):
    proc = subprocess.Popen(
        [sys.executable, str(SERVER), str(path), token, str(port)],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    time.sleep(0.3)
    return proc


def test_root_returns_200(tmp_md, free_port):
    token = "a" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/?t={token}")
        resp = conn.getresponse()
        assert resp.status == 200
        body = resp.read().decode()
        assert "<html" in body.lower()
    finally:
        proc.terminate()
        proc.wait(timeout=2)


def test_missing_token_returns_401(tmp_md, free_port):
    token = "b" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", "/")
        assert conn.getresponse().status == 401
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_wrong_token_returns_401(tmp_md, free_port):
    token = "c" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", "/?t=wrong")
        assert conn.getresponse().status == 401
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_static_file_served(tmp_md, free_port, tmp_path):
    from .conftest import SKILL_DIR
    asset = SKILL_DIR / "static" / "_probe.txt"
    asset.write_text("hello")
    try:
        token = "d" * 32
        proc = start_server(tmp_md, token, free_port)
        try:
            conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
            conn.request("GET", f"/static/_probe.txt?t={token}")
            resp = conn.getresponse()
            assert resp.status == 200
            assert resp.read().decode() == "hello"
        finally:
            proc.terminate(); proc.wait(timeout=2)
    finally:
        asset.unlink()


def test_path_traversal_blocked(tmp_md, free_port):
    token = "e" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/static/../../../etc/passwd?t={token}")
        assert conn.getresponse().status in (400, 403, 404)
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_get_plan_returns_body_and_etag(tmp_md, free_port):
    token = "f" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/plan?t={token}")
        resp = conn.getresponse()
        body = resp.read().decode()
        assert resp.status == 200
        assert body == tmp_md.read_text()
        assert resp.getheader("ETag")
        assert resp.getheader("Content-Type", "").startswith("text/markdown")
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_put_plan_writes_atomically(tmp_md, free_port):
    token = "g" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        new_body = "# New\n\n## Phase 2\n\n- [x] changed\n"
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("PUT", f"/plan?t={token}", body=new_body,
                     headers={"Content-Type": "text/markdown; charset=utf-8"})
        resp = conn.getresponse()
        assert resp.status == 200
        new_etag = resp.getheader("ETag")
        assert new_etag
        assert tmp_md.read_text() == new_body
    finally:
        proc.terminate(); proc.wait(timeout=2)
