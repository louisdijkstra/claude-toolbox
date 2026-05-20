#!/usr/bin/env python3
# ~/.claude/skills/plan-explorer/scripts/server.py
"""Plan Explorer HTTP server. Bound to 127.0.0.1 only."""

import sys
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


class State:
    plan_path: Path
    token: str


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
        elif url.path.startswith("/static/"):
            self._serve_static(url.path[len("/static/"):])
        else:
            self.send_error(404)

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
