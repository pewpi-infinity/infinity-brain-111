#!/usr/bin/env python3
"""
Minimal HTTP logger service. Place in repo root and run:
  pip install flask flask-cors
  python3 log_server.py

The web UI can POST {"text":"..."} to /log and this server will append to logs/txt.log.
"""
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
LOG_DIR = os.path.join(ROOT_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "txt.log")
os.makedirs(LOG_DIR, exist_ok=True)

app = Flask(__name__, static_folder=ROOT_DIR, static_url_path='')
CORS(app)

def ts():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC"

@app.route("/")
def index():
    return send_from_directory(ROOT_DIR, "index.html")

@app.route("/log", methods=["POST"])
def log():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    kind = data.get("kind", "IN")
    entry = f"[{ts()}] [{kind}] {text}\n"
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(entry)
        return jsonify(status="ok")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)