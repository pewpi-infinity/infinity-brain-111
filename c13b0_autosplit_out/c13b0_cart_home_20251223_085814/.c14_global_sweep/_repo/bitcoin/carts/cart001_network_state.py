#!/usr/bin/env python3
import json, time, os

os.makedirs("bitcoin/ledger", exist_ok=True)

STATE_FILE = "bitcoin/ledger/HASH_LEDGER.json"

state = {
    "timestamp": int(time.time()),
    "network_hashrate_THs": 650_000_000,
    "difficulty": 83_000_000_000_000,
    "block_time_sec": 600,
    "block_reward_btc": 3.125
}

with open(STATE_FILE, "w") as f:
    json.dump(state, f, indent=2)

print("[BTC] Network state written")
