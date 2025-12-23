#!/usr/bin/env python3
from flask import Flask, jsonify
from pathlib import Path

ROOT = Path.home() / "mongoose.os" / "infinity_tokens"
app = Flask(__name__)

@app.route("/tokens")
def tokens():
    return jsonify(sorted(p.stem for p in ROOT.glob("INF-RES-*.txt")))

@app.route("/token/<tid>")
def token(tid):
    txt = ROOT / f"{tid}.txt"
    md = ROOT / f"{tid}.md"
    if not txt.exists():
        return {"error": "not found"}, 404
    return {
        "id": tid,
        "token": txt.read_text(),
        "research": md.read_text() if md.exists() else None
    }

if __name__ == "__main__":
    app.run(port=8081)
