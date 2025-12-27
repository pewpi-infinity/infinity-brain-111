#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path
import datetime

ROOT = Path(".")
OUT = ROOT / "repo_audit.json"

now = datetime.datetime.utcnow().isoformat()

# --- discover carts ---
present_carts = set()
for root, _, files in os.walk(ROOT):
    for f in files:
        if f.startswith("cart_") and (f.endswith(".py") or f.endswith(".sh")):
            present_carts.add(f)

# --- scan references ---
referenced_carts = set()
references = {}

cart_pattern = re.compile(r"(cart_[A-Za-z0-9_\-]+\.(?:py|sh))")

for root, _, files in os.walk(ROOT):
    for f in files:
        if f.endswith(".py") or f.endswith(".sh"):
            path = Path(root) / f
            try:
                text = path.read_text(errors="ignore")
            except:
                continue

            matches = cart_pattern.findall(text)
            if matches:
                references[str(path)] = sorted(set(matches))
                referenced_carts.update(matches)

# --- compute sets ---
missing_carts = sorted(referenced_carts - present_carts)
unused_carts = sorted(present_carts - referenced_carts)

# --- identify likely entry points ---
entry_points = []
for cart in present_carts:
    if any(k in cart.lower() for k in ["orchestrator", "scheduler", "runner", "pipeline", "main"]):
        entry_points.append(cart)

report = {
    "generated": now,
    "summary": {
        "present_carts": len(present_carts),
        "referenced_carts": len(referenced_carts),
        "missing_carts": len(missing_carts),
        "unused_carts": len(unused_carts)
    },
    "present_carts": sorted(present_carts),
    "referenced_carts": sorted(referenced_carts),
    "missing_carts": missing_carts,
    "unused_carts": unused_carts,
    "entry_points": sorted(entry_points),
    "references": references
}

with open(OUT, "w") as f:
    json.dump(report, f, indent=2)

print("\n[∞] Repo Audit Complete")
print(f"[∞] Present carts: {len(present_carts)}")
print(f"[∞] Referenced carts: {len(referenced_carts)}")
print(f"[∞] Missing carts: {len(missing_carts)}")
print(f"[∞] Unused carts: {len(unused_carts)}")
print(f"[∞] Output: {OUT}\n")
