#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path
import datetime

ROOT = Path(".")
BASE = Path("infinity_storage")
INDEX = BASE / "index"
WEB = BASE / "web"
WEB.mkdir(parents=True, exist_ok=True)

now = datetime.datetime.utcnow().isoformat()

# -----------------------------
# Discover carts
# -----------------------------
carts = {}
cart_files = []

for root, _, files in os.walk(ROOT):
    for f in files:
        if f.startswith("cart_") and (f.endswith(".py") or f.endswith(".sh")):
            path = Path(root) / f
            cart_files.append(path)
            carts[f] = {
                "path": str(path),
                "depends_on": [],
                "produces": []
            }

# -----------------------------
# Regex patterns
# -----------------------------
cart_ref = re.compile(r"(cart_[A-Za-z0-9_\-]+\.(?:py|sh))")
artifact_ref = re.compile(r"infinity_storage/(index|web|logs)/[A-Za-z0-9_\-\.]+")

# -----------------------------
# Analyze dependencies
# -----------------------------
for path in cart_files:
    name = path.name
    try:
        text = path.read_text(errors="ignore")
    except:
        continue

    # cart-to-cart deps
    for ref in cart_ref.findall(text):
        if ref != name and ref in carts:
            carts[name]["depends_on"].append(ref)

    # artifact deps
    for art in artifact_ref.findall(text):
        carts[name]["depends_on"].append(f"infinity_storage/{art}")

    carts[name]["depends_on"] = sorted(set(carts[name]["depends_on"]))

# -----------------------------
# Known artifacts produced
# -----------------------------
produced_map = {
    "cart_INFINITY_PLUS_RESEARCH.py": ["infinity_storage/research/*", "infinity_storage/tokens/*"],
    "cart_INFINITY_PLUS_INDEX_BUILDER.py": ["infinity_storage/index/token_index.json"],
    "cart_INFINITY_PLUS_LINK_TREE.py": ["infinity_storage/index/link_index.json"],
    "cart_INFINITY_PLUS_VALUE_ACCUMULATOR.py": ["infinity_storage/index/value_index.json"],
    "cart_INFINITY_CROSS_MODULE_MESSENGER.py": ["infinity_storage/index/system_state.json"],
    "cart_INFINITY_ARTIFACT_WEB.py": ["infinity_storage/web/infinity_plus.html"],
    "cart_INFINITY_DEPENDENCY_GRAPH.py": [
        "infinity_storage/index/dependency_graph.json",
        "infinity_storage/web/dependency_graph.html"
    ]
}

for cart, outputs in produced_map.items():
    if cart in carts:
        carts[cart]["produces"] = outputs

# -----------------------------
# Write JSON graph
# -----------------------------
graph = {
    "generated": now,
    "cart_count": len(carts),
    "nodes": carts
}

json_out = INDEX / "dependency_graph.json"
with open(json_out, "w") as f:
    json.dump(graph, f, indent=2)

# -----------------------------
# Generate HTML (single-file)
# -----------------------------
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Infinity Dependency Graph</title>
<style>
body {{ background:#0b0b0b; color:#e0e0e0; font-family: monospace; padding:20px; }}
h1 {{ color:#7cffc4; }}
.node {{ margin-bottom:18px; border-bottom:1px solid #222; padding-bottom:10px; }}
.dep {{ color:#9ad; }}
.prod {{ color:#7cffc4; }}
.small {{ color:#888; }}
</style>
</head>
<body>

<h1>∞ Infinity Dependency Graph</h1>
<div class="small">Generated: {now}</div>

{"".join(
    f"<div class='node'><b>{k}</b><br>"
    f"<span class='dep'>depends on:</span> {', '.join(v['depends_on']) or 'none'}<br>"
    f"<span class='prod'>produces:</span> {', '.join(v['produces']) or 'unknown'}"
    f"</div>"
    for k, v in carts.items()
)}

</body>
</html>
"""

html_out = WEB / "dependency_graph.html"
with open(html_out, "w") as f:
    f.write(html)

print("\n[∞] Dependency Graph built")
print(f"[∞] JSON: {json_out}")
print(f"[∞] HTML: {html_out}\n")
