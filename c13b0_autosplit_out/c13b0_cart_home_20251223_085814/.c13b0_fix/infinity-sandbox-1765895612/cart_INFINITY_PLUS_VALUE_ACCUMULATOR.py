#!/usr/bin/env python3
import json
from pathlib import Path
import datetime

BASE = Path("infinity_storage")
INDEX = BASE / "index"

TOKEN_INDEX = INDEX / "token_index.json"
LINK_INDEX = INDEX / "link_index.json"
OUT_INDEX = INDEX / "value_index.json"

now = datetime.datetime.utcnow().isoformat()

if not TOKEN_INDEX.exists():
    print("[!] token_index.json not found")
    exit(1)

if not LINK_INDEX.exists():
    print("[!] link_index.json not found")
    exit(1)

with open(TOKEN_INDEX) as f:
    token_data = json.load(f)

with open(LINK_INDEX) as f:
    link_data = json.load(f)

tokens = token_data.get("tokens", [])
links = link_data.get("links", {})

values = {}

for t in tokens:
    tnum = t["token_number"]
    base = int(t.get("token_value", 1))

    link_info = links.get(tnum, {})
    ref_count = len(link_info.get("references", []))
    keyword_count = len(set(link_info.get("keywords", [])))

    # Monotonic formula (simple + honest)
    derived_value = base + ref_count + keyword_count

    values[tnum] = {
        "base_value": base,
        "references": ref_count,
        "keywords": keyword_count,
        "derived_value": derived_value
    }

out = {
    "generated": now,
    "token_count": len(values),
    "values": values
}

with open(OUT_INDEX, "w") as f:
    json.dump(out, f, indent=2)

print("\n[∞] Value Accumulator complete")
print(f"[∞] Tokens evaluated: {len(values)}")
print(f"[∞] Output: {OUT_INDEX}\n")
