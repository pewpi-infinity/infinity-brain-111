#!/usr/bin/env python3
import json
import datetime
from pathlib import Path
import re

BASE = Path("infinity_storage")
INDEX = BASE / "index"

QUEUE_FILE = INDEX / "topic_queue.json"
TOKEN_INDEX = INDEX / "token_index.json"
LINK_INDEX = INDEX / "link_index.json"
VALUE_INDEX = INDEX / "value_index.json"

OUT_FILE = INDEX / "topic_scores.json"

now = datetime.datetime.utcnow()
now_iso = now.isoformat()

def load(path):
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}

queue = load(QUEUE_FILE)
token_index = load(TOKEN_INDEX)
link_index = load(LINK_INDEX)
value_index = load(VALUE_INDEX)

topics = queue.get("topics", [])

tokens = token_index.get("tokens", [])
links = link_index.get("links", {})
values = value_index.get("values", {})

scores = {}

for topic in topics:
    topic_l = topic.lower()

    # --- coverage: how many tokens mention topic ---
    coverage = 0
    link_depth = 0
    value_sum = 0

    for t in tokens:
        term = (t.get("term") or "").lower()
        if topic_l in term:
            coverage += 1
            tnum = t.get("token_number")
            link_depth += len(links.get(tnum, {}).get("references", []))
            value_sum += values.get(tnum, {}).get("derived_value", 0)

    # --- freshness penalty ---
    last_run = queue.get("last_run")
    freshness = 1.0
    if last_run:
        try:
            last_dt = datetime.datetime.fromisoformat(last_run)
            hours = (now - last_dt).total_seconds() / 3600
            freshness = min(2.0, 0.5 + (hours / 24))
        except:
            pass

    # --- final score ---
    score = (
        (coverage * 2) +
        (link_depth * 1.5) +
        (value_sum * 0.1)
    ) * freshness

    scores[topic] = {
        "coverage": coverage,
        "link_depth": link_depth,
        "value_sum": value_sum,
        "freshness_multiplier": round(freshness, 2),
        "score": round(score, 3)
    }

out = {
    "generated": now_iso,
    "topic_count": len(scores),
    "scores": scores
}

with open(OUT_FILE, "w") as f:
    json.dump(out, f, indent=2)

print("\n[∞] Topic Scoring complete")
for t, s in scores.items():
    print(f"[∞] {t}: score={s['score']}")
print(f"\n[∞] Output: {OUT_FILE}\n")
