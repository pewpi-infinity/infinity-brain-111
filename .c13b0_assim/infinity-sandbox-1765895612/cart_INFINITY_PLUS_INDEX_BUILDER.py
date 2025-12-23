#!/usr/bin/env python3
import json
import os
from pathlib import Path
import datetime

BASE = Path("infinity_storage")
TOKENS = BASE / "tokens"
INDEX = BASE / "index"

INDEX.mkdir(parents=True, exist_ok=True)

token_index = []
now = datetime.datetime.utcnow().isoformat()

for root, _, files in os.walk(TOKENS):
    for f in files:
        if f.endswith(".json"):
            path = Path(root) / f
            try:
                with open(path) as tf:
                    data = json.load(tf)
                    token_index.append({
                        "token_number": data.get("token_number"),
                        "token_color": data.get("token_color"),
                        "token_value": data.get("token_value"),
                        "datetime": data.get("datetime"),
                        "path": str(path)
                    })
            except Exception as e:
                print(f"[!] Skipped corrupt token: {path}")

index_file = INDEX / "token_index.json"

with open(index_file, "w") as f:
    json.dump({
        "generated": now,
        "count": len(token_index),
        "tokens": token_index
    }, f, indent=2)

print(f"\n[∞] Token index built")
print(f"[∞] Tokens indexed: {len(token_index)}")
print(f"[∞] Index file: {index_file}\n")
