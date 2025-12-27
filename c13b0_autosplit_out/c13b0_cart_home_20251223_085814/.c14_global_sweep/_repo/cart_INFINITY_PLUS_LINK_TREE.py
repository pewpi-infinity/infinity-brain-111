#!/usr/bin/env python3
import json
import os
from pathlib import Path
import datetime
import re

BASE = Path("infinity_storage")
TOKENS = BASE / "tokens"
INDEX = BASE / "index"
INDEX.mkdir(parents=True, exist_ok=True)

now = datetime.datetime.utcnow().isoformat()

tokens = []
links = {}

# Load tokens
for root, _, files in os.walk(TOKENS):
    for f in files:
        if f.endswith(".json"):
            path = Path(root) / f
            try:
                with open(path) as tf:
                    data = json.load(tf)
                    tokens.append(data)
            except:
                continue

# Build link graph
for token in tokens:
    tnum = token.get("token_number")
    links[tnum] = {
        "references": [],
        "keywords": []
    }

    ref = token.get("research_ref", "")
    if ref:
        links[tnum]["references"].append(ref)

    term = token.get("term", "")
    if term:
        words = re.findall(r"[a-zA-Z]{4,}", term.lower())
        links[tnum]["keywords"].extend(words)

# Write link index
link_index = {
    "generated": now,
    "token_count": len(tokens),
    "links": links
}

out = INDEX / "link_index.json"
with open(out, "w") as f:
    json.dump(link_index, f, indent=2)

print(f"\n[∞] Link Tree built")
print(f"[∞] Tokens processed: {len(tokens)}")
print(f"[∞] Output: {out}\n")
