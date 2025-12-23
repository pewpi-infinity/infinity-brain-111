#!/usr/bin/env python3
import json
import datetime
from pathlib import Path
import sys

BASE = Path("infinity_storage")
INDEX = BASE / "index"
INDEX.mkdir(parents=True, exist_ok=True)

FEEDBACK_FILE = INDEX / "feedback_index.json"

NOW = datetime.datetime.utcnow()
NOW_ISO = NOW.isoformat()

# -----------------------------
# Limits (hard safety bounds)
# -----------------------------
MAX_WEIGHT = 1.0        # absolute cap per entry
DECAY_PER_DAY = 0.15    # feedback fades over time
MAX_ENTRIES = 200       # prevents spam

def load_feedback():
    if FEEDBACK_FILE.exists():
        with open(FEEDBACK_FILE) as f:
            return json.load(f)
    return {
        "generated": NOW_ISO,
        "entries": []
    }

def decay(weight, days):
    return max(0.0, weight * (1.0 - (DECAY_PER_DAY * days)))

# -----------------------------
# Input handling
# -----------------------------
if len(sys.argv) < 3:
    print("\nUsage:")
    print("  ./cart_INFINITY_HUMAN_FEEDBACK_INJECTOR.py <topic> <weight 0.0–1.0> [note]")
    print("\nExample:")
    print("  ./cart_INFINITY_HUMAN_FEEDBACK_INJECTOR.py hydrogen 0.6 \"safety review\"")
    sys.exit(1)

topic = sys.argv[1].strip()
try:
    weight = float(sys.argv[2])
except:
    print("[!] Weight must be numeric")
    sys.exit(1)

note = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else ""

weight = max(0.0, min(weight, MAX_WEIGHT))

feedback = load_feedback()
entries = feedback["entries"]

# -----------------------------
# Apply decay to existing entries
# -----------------------------
new_entries = []
for e in entries:
    try:
        t = datetime.datetime.fromisoformat(e["timestamp"])
        days = (NOW - t).total_seconds() / 86400
        e["weight"] = round(decay(e["weight"], days), 4)
        if e["weight"] > 0.01:
            new_entries.append(e)
    except:
        continue

entries = new_entries

# -----------------------------
# Append new feedback
# -----------------------------
entries.append({
    "timestamp": NOW_ISO,
    "topic": topic,
    "weight": weight,
    "note": note
})

# enforce cap
entries = entries[-MAX_ENTRIES:]

feedback["generated"] = NOW_ISO
feedback["entry_count"] = len(entries)
feedback["entries"] = entries

with open(FEEDBACK_FILE, "w") as f:
    json.dump(feedback, f, indent=2)

print("\n[∞] Human feedback injected")
print(f"[∞] Topic: {topic}")
print(f"[∞] Weight: {weight}")
print(f"[∞] Entries stored: {len(entries)}")
print(f"[∞] Output: {FEEDBACK_FILE}\n")
