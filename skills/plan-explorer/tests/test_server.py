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
