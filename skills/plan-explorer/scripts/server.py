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
