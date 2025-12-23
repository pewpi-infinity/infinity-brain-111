#!/usr/bin/env python3
"""
Infinity Firmware Repo Brain
mongoose.os authoritative cart-brain
"""

import os
import json
import hashlib
import time
from pathlib import Path
from flask import Blueprint, jsonify, request

brain_bp = Blueprint("repo_brain", __name__)

BASE = Path.home()
BRAIN_DIR = BASE / ".infinity_brain"
INDEX_FILE = BRAIN_DIR / "repo_index.json"
TICKET_FILE = BRAIN_DIR / "tickets.json"
TOKEN_FILE = BRAIN_DIR / "tokens.json"

BRAIN_DIR.mkdir(exist_ok=True)

# ----------------------------
# Utilities
# ----------------------------
def sha(x: str) -> str:
    return hashlib.sha256(x.encode()).hexdigest()

def load(p, d):
    return json.loads(p.read_text()) if p.exists() else d

def save(p, o):
    p.write_text(json.dumps(o, indent=2))

# ----------------------------
# Repo scan
# ----------------------------
def scan_repos():
    repos = {}
    for d in BASE.iterdir():
        if d.is_dir() and d.name.startswith("infinity"):
            carts = list(d.rglob("cart_*.py")) + list(d.rglob("cart_*.sh"))
            repos[d.name] = {
                "path": str(d),
                "cart_count": len(carts),
                "carts": [str(c) for c in carts],
                "hash": sha(d.name + str(len(carts)))
            }
    return repos

# ----------------------------
# Tokenize installs
# ----------------------------
def tokenize(repo, cart):
    token = {
        "repo": repo,
        "cart": cart,
        "token": sha(repo + cart + str(time.time())),
        "time": time.time(),
        "status": "valid"
    }
    return token

# ----------------------------
# Ticket bad carts
# ----------------------------
def ticket(repo, cart, reason):
    t = {
        "repo": repo,
        "cart": cart,
        "reason": reason,
        "time": time.time(),
        "status": "open"
    }
    tickets = load(TICKET_FILE, [])
    tickets.append(t)
    save(TICKET_FILE, tickets)

# ----------------------------
# API: refresh brain
# ----------------------------
@brain_bp.route("/brain/refresh", methods=["POST"])
def refresh():
    repos = scan_repos()
    save(INDEX_FILE, repos)

    tokens = load(TOKEN_FILE, [])

    for r, meta in repos.items():
        for c in meta["carts"]:
            try:
                tok = tokenize(r, c)
                tokens.append(tok)
            except Exception as e:
                ticket(r, c, str(e))

    save(TOKEN_FILE, tokens)
    return jsonify({"status": "brain refreshed", "repos": len(repos)})

# ----------------------------
# API: list repos
# ----------------------------
@brain_bp.route("/brain/repos", methods=["GET"])
def list_repos():
    return jsonify(load(INDEX_FILE, {}))

# ----------------------------
# API: list tokens
# ----------------------------
@brain_bp.route("/brain/tokens", methods=["GET"])
def list_tokens():
    return jsonify(load(TOKEN_FILE, []))

# ----------------------------
# API: list tickets
# ----------------------------
@brain_bp.route("/brain/tickets", methods=["GET"])
def list_tickets():
    return jsonify(load(TICKET_FILE, []))

# ----------------------------
# API: cart introspection
# ----------------------------
@brain_bp.route("/brain/introspect", methods=["POST"])
def introspect():
    data = request.json or {}
    repo = data.get("repo")
    cart = data.get("cart")

    if not repo or not cart:
        return jsonify({"error": "repo and cart required"}), 400

    return jsonify({
        "repo": repo,
        "cart": cart,
        "known": True,
        "tokens": [
            t for t in load(TOKEN_FILE, [])
            if t["repo"] == repo and t["cart"] == cart
        ]
    })
