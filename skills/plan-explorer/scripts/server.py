#!/usr/bin/env python3
# ~/.claude/skills/plan-explorer/scripts/server.py
"""Plan Explorer HTTP server. Bound to 127.0.0.1 only."""

import os
import sys
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


class State:
    plan_path: Path
    token: str
    last_self_write_ns: int = 0


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("[server] " + fmt % args + "\n")

    def _check_token(self) -> bool:
        qs = parse_qs(urlparse(self.path).query)
        provided = (qs.get("t") or [None])[0] or self.headers.get("X-Auth-Token")
        if provided != State.token:
            self.send_error(401, "auth required")
            return False
        return True

    def do_GET(self):
        if not self._check_token():
            return
        url = urlparse(self.path)
        if url.path == "/":
            self._serve_file(STATIC_DIR / "index.html", "text/html; charset=utf-8")
        elif url.path == "/plan":
            self._serve_plan()
        elif url.path == "/events":
            self._stream_events()
        elif url.path.startswith("/static/"):
            self._serve_static(url.path[len("/static/"):])
        else:
            self.send_error(404)

    MAX_BODY = 5 * 1024 * 1024  # 5 MB

    def do_PUT(self):
        if not self._check_token():
            return
        url = urlparse(self.path)
        if url.path != "/plan":
            self.send_error(404)
            return
        if_match = self.headers.get("If-Match")
        if if_match:
            current_etag = f'"{State.plan_path.stat().st_mtime_ns}"'
            if if_match != current_etag:
                self.send_error(412, "etag mismatch")
                return
        length = int(self.headers.get("Content-Length") or 0)
        if length > self.MAX_BODY:
            self.send_error(413, "plan too large")
            return
        body = self.rfile.read(length)
        path = State.plan_path
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_bytes(body)
        os.replace(tmp, path)
        etag = f'"{path.stat().st_mtime_ns}"'
        State.last_self_write_ns = path.stat().st_mtime_ns
        self.send_response(200)
        self.send_header("ETag", etag)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _serve_file(self, path: Path, content_type: str):
        if not path.exists():
            self.send_error(404)
            return
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _serve_plan(self):
        path = State.plan_path
        if not path.exists():
            self.send_error(410, "plan file gone")
            return
        data = path.read_bytes()
        etag = f'"{path.stat().st_mtime_ns}"'
        self.send_response(200)
        self.send_header("Content-Type", "text/markdown; charset=utf-8")
        self.send_header("ETag", etag)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _stream_events(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        path = State.plan_path
        last_ns = path.stat().st_mtime_ns if path.exists() else 0
        try:
            while True:
                time.sleep(0.5)
                if not path.exists():
                    self.wfile.write(b'data: {"type":"gone"}\n\n')
                    self.wfile.flush()
                    return
                cur_ns = path.stat().st_mtime_ns
                if cur_ns != last_ns and cur_ns != State.last_self_write_ns:
                    last_ns = cur_ns
                    etag = f'"{cur_ns}"'
                    self.wfile.write(
                        f'data: {{"type":"change","etag":{etag}}}\n\n'.encode()
                    )
                    self.wfile.flush()
                else:
                    last_ns = cur_ns
        except (BrokenPipeError, ConnectionResetError):
            return

    _MIME = {
        ".html": "text/html; charset=utf-8",
        ".js":   "application/javascript",
        ".css":  "text/css",
        ".json": "application/json",
        ".svg":  "image/svg+xml",
        ".txt":  "text/plain; charset=utf-8",
    }

    def _serve_static(self, rel: str):
        try:
            target = (STATIC_DIR / rel).resolve()
        except OSError:
            self.send_error(400)
            return
        if STATIC_DIR not in target.parents and target != STATIC_DIR:
            self.send_error(403)
            return
        if not target.is_file():
            self.send_error(404)
            return
        ext = target.suffix
        self._serve_file(target, self._MIME.get(ext, "application/octet-stream"))


def main():
    plan_path = Path(sys.argv[1]).resolve()
    State.plan_path = plan_path
    State.token = sys.argv[2]
    port = int(sys.argv[3])
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"[server] listening on 127.0.0.1:{port}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
