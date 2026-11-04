"""Single-user, loopback-only demo. Run python server.py and open the printed URL."""
import json
import math
import sqlite3
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
DB = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "learned.sqlite3"
ASSETS = {"/": ("index.html", "text/html"), "/index.html": ("index.html", "text/html"),
          "/data.js": ("data.js", "text/javascript")}

def connect():
    return sqlite3.connect(DB, timeout=10)

def state(db):
    return {key: json.loads(value) for key, value in db.execute("SELECT id, card FROM library")}

class Handler(BaseHTTPRequestHandler):
    def reply(self, status, content, mime="application/json"):
        data = content if isinstance(content, bytes) else json.dumps(content).encode()
        self.send_response(status)
        self.send_header("Content-Type", mime + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ASSETS:
            name, mime = ASSETS[path]
            self.reply(200, (ROOT / name).read_bytes(), mime)
        elif path == "/api/library":
            with connect() as db:
                self.reply(200, state(db))
        else:
            self.reply(404, {"error": "Unknown resource"})

    def do_POST(self):
        if self.path != "/api/library":
            return self.reply(404, {})
        if self.headers.get("Content-Type") != "application/json":
            return self.reply(415, {})
        try:
            size = int(self.headers.get("Content-Length", 0))
            if not 0 < size <= 8192:
                raise ValueError()
            req = json.loads(self.rfile.read(size))
            key, action = req["id"], req["action"]
            if key not in ("r1", "r2", "r3"):
                raise ValueError()
            now = time.time_ns() // 1000000
            with connect() as db:
                db.execute("BEGIN IMMEDIATE")
                card = state(db).get(key)
                if action == "save":
                    card = card or dict(id=key, savedAt=now, dueAt=now, reps=0, ease=2.5, interval=0, lastReviewedAt=None)
                elif not card:
                    return self.reply(409, {"error": "Save the card first"})
                elif action == "edit":
                    for field in ("question", "answer"):
                        value = req[field].strip()
                        if not 0 < len(value) <= 1000:
                            raise ValueError()
                        card[field] = value
                elif action in ("correct", "forgot"):
                    if req.get("previous") != card["lastReviewedAt"]:
                        return self.reply(409, {"error": "Already reviewed. Reload for current schedule."})
                    correct = action == "correct"
                    card["reps"] = card["reps"] + 1 if correct else 0
                    card["ease"] = max(1.3, card["ease"] + (0.1 if correct else -0.2))
                    card["interval"] = (1 if card["reps"] == 1 else 3 if card["reps"] == 2 else math.floor(card["interval"] * card["ease"] + 0.5)) if correct else 0
                    card.update(lastReviewedAt=now, dueAt=now + 86400000 * max(1, card["interval"]))
                else:
                    raise ValueError()
                db.execute("INSERT INTO library VALUES (?,?) ON CONFLICT(id) DO UPDATE SET card=excluded.card", (key, json.dumps(card)))
                result = state(db)
                db.commit()
            self.reply(200, result)
        except (ValueError, TypeError, KeyError, AttributeError):
            self.reply(400, {"error": "Check your card and try again."})

if __name__ == "__main__":
    with connect() as db:
        db.execute("CREATE TABLE IF NOT EXISTS library(id TEXT PRIMARY KEY, card TEXT NOT NULL)")
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    with ThreadingHTTPServer(("127.0.0.1", port), Handler) as server:
        print(f"Reel Cards is ready at http://127.0.0.1:{server.server_port}", flush=True)
        server.serve_forever()
