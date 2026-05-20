# ~/.claude/skills/plan-explorer/tests/test_server.py
import http.client
import subprocess
import sys
import threading
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


def test_put_stale_etag_returns_412(tmp_md, free_port):
    token = "h" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("PUT", f"/plan?t={token}", body="x",
                     headers={"If-Match": '"0"'})
        assert conn.getresponse().status == 412
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_put_size_limit_returns_413(tmp_md, free_port):
    token = "i" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        body = "x" * (6 * 1024 * 1024)
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        try:
            conn.request("PUT", f"/plan?t={token}", body=body)
            assert conn.getresponse().status == 413
        except (ConnectionResetError, BrokenPipeError, http.client.RemoteDisconnected):
            # Server closes connection when body is too large
            pass
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_sse_emits_on_external_change(tmp_md, free_port):
    token = "j" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        events = []

        def reader():
            conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=3)
            conn.request("GET", f"/events?t={token}")
            resp = conn.getresponse()
            for _ in range(20):
                line = resp.fp.readline().decode()
                if line.startswith("data:"):
                    events.append(line)
                    return

        t = threading.Thread(target=reader, daemon=True)
        t.start()
        time.sleep(0.4)
        tmp_md.write_text(tmp_md.read_text() + "\nextra\n")
        t.join(timeout=3)
        assert any("change" in e for e in events), events
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_sse_suppresses_after_own_put(tmp_md, free_port):
    token = "k" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        sub = http.client.HTTPConnection("127.0.0.1", free_port, timeout=3)
        sub.request("GET", f"/events?t={token}")
        resp = sub.getresponse()
        put = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        put.request("PUT", f"/plan?t={token}", body="# new\n")
        assert put.getresponse().status == 200
        time.sleep(0.1)
        # Try to read with short timeout
        import select
        if hasattr(sub, 'sock') and sub.sock:
            sub.sock.settimeout(0.8)
        try:
            line = resp.fp.readline().decode()
        except Exception:
            line = ""
        assert "change" not in line, f"unexpected event: {line}"
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_sse_emits_gone_on_delete(tmp_md, free_port):
    token = "l" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        events = []

        def reader():
            conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=3)
            conn.request("GET", f"/events?t={token}")
            resp = conn.getresponse()
            for _ in range(20):
                line = resp.fp.readline().decode()
                if line.startswith("data:"):
                    events.append(line); return

        t = threading.Thread(target=reader, daemon=True); t.start()
        time.sleep(0.4)
        tmp_md.unlink()
        t.join(timeout=3)
        assert any("gone" in e for e in events), events
    finally:
        proc.terminate(); proc.wait(timeout=2)


def test_static_requires_token(tmp_md, free_port):
    """Static files must not bypass token check."""
    from .conftest import SKILL_DIR
    asset = SKILL_DIR / "static" / "_probe2.txt"
    asset.write_text("secret")
    try:
        token = "m" * 32
        proc = start_server(tmp_md, token, free_port)
        try:
            conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
            conn.request("GET", "/static/_probe2.txt")  # no token
            assert conn.getresponse().status == 401
        finally:
            proc.terminate(); proc.wait(timeout=2)
    finally:
        asset.unlink()


def test_cookie_carries_token_for_static(tmp_md, free_port):
    """First GET sets cookie; subsequent /static/ requests use cookie."""
    token = "n" * 32
    proc = start_server(tmp_md, token, free_port)
    try:
        # initial GET / with token sets cookie
        conn = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn.request("GET", f"/?t={token}")
        resp = conn.getresponse()
        cookie = resp.getheader("Set-Cookie") or ""
        assert "pe_t=" in cookie and token in cookie
        resp.read()
        # second GET /static/* using just the cookie, no query token
        conn2 = http.client.HTTPConnection("127.0.0.1", free_port, timeout=2)
        conn2.request("GET", "/static/styles.css", headers={"Cookie": f"pe_t={token}"})
        assert conn2.getresponse().status == 200
    finally:
        proc.terminate(); proc.wait(timeout=2)
