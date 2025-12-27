#!/usr/bin/env python3
import os
import json
from pathlib import Path
import datetime

ROOT = Path(".")
OUT = ROOT / "mongoose_index.json"

now = datetime.datetime.utcnow().isoformat()
modules = []

for root, _, files in os.walk(ROOT):
    for f in files:
        if f.startswith("cart_") and (f.endswith(".py") or f.endswith(".sh")):
            path = Path(root) / f
            info = {
                "name": f,
                "path": str(path),
                "type": path.suffix.replace(".", ""),
                "description": ""
            }

            try:
                with open(path, errors="ignore") as file:
                    for _ in range(10):
                        line = file.readline()
                        if line.startswith("#") or line.startswith("//"):
                            info["description"] += line.strip("#/ ").strip() + " "
            except:
                pass

            modules.append(info)

with open(OUT, "w") as f:
    json.dump({
        "generated": now,
        "module_count": len(modules),
        "modules": modules
    }, f, indent=2)

print(f"\n[∞] Mongoose master index built")
print(f"[∞] Modules found: {len(modules)}")
print(f"[∞] Output: {OUT}\n")
