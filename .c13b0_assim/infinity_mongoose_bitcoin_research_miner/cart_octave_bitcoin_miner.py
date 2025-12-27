#!/usr/bin/env python3
"""
Infinity Octave Bitcoin Research Miner
- Read-only Bitcoin observation
- Hash → Octave → INF conversion
- Internal-only ledger & wallet
"""

import os
import json
import time
import hashlib
import math
from datetime import datetime
from pathlib import Path

# ----------------------------
# Paths (mongoose-friendly)
# ----------------------------
BASE = Path.home() / "infinity_miner"
LEDGER = BASE / "LEDGER.json"
WALLET = BASE / "WALLET.json"
HASH_DIR = BASE / "hash_artifacts"

BASE.mkdir(exist_ok=True)
HASH_DIR.mkdir(exist_ok=True)

# ----------------------------
# Internal parameters
# ----------------------------
INF_SYMBOL = "∞"
OCTAVE_BASE = 8
REWARD_SCALE = 0.00000001  # small, safe, internal
SEEN = set()

# ----------------------------
# Helpers
# ----------------------------
def sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text())
    return default

def save_json(path, obj):
    path.write_text(json.dumps(obj, indent=2))

# ----------------------------
# Octave math
# ----------------------------
def hash_to_octave(h):
    n = int(h[:16], 16)
    octave = math.log(n + 1, OCTAVE_BASE)
    return round(octave, 8)

def octave_to_inf(o):
    return round(o * REWARD_SCALE, 12)

# ----------------------------
# Simulated Bitcoin observer
# (replace feed later if desired)
# ----------------------------
def observe_bitcoin():
    ts = str(time.time())
    entropy = sha256(ts + os.urandom(8).hex())
    return {
        "source": "bitcoin-observer",
        "entropy": entropy,
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------------------
# Mining cycle
# ----------------------------
def mine_once():
    obs = observe_bitcoin()
    h = obs["entropy"]

    if h in SEEN:
        return None

    SEEN.add(h)

    octave = hash_to_octave(h)
    inf = octave_to_inf(octave)

    artifact = {
        "hash": h,
        "octave": octave,
        "inf": inf,
        "time": obs["timestamp"]
    }

    artifact_path = HASH_DIR / f"{h}.json"
    save_json(artifact_path, artifact)

    ledger = load_json(LEDGER, [])
    ledger.append(artifact)
    save_json(LEDGER, ledger)

    wallet = load_json(WALLET, {"balance": 0, "history": []})
    wallet["balance"] += inf
    wallet["history"].append(artifact)
    save_json(WALLET, wallet)

    return artifact

# ----------------------------
# Run loop
# ----------------------------
def main():
    print(f"[∞] Infinity Octave Miner started")
    while True:
        a = mine_once()
        if a:
            print(f"[∞] +{a['inf']} INF | octave={a['octave']}")
        time.sleep(2)

if __name__ == "__main__":
    main()
