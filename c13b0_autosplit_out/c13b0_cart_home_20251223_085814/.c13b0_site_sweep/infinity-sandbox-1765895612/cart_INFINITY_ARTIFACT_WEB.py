#!/usr/bin/env python3
import json
from pathlib import Path
import datetime

BASE = Path("infinity_storage")
INDEX = BASE / "index"
WEB = BASE / "web"
WEB.mkdir(parents=True, exist_ok=True)

def load(name):
    path = INDEX / name
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return None

state = load("system_state.json") or {}
tokens = load("token_index.json") or {}
links = load("link_index.json") or {}
values = load("value_index.json") or {}

now = datetime.datetime.utcnow().isoformat()

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Infinity+ Artifact</title>
<style>
body {{ font-family: monospace; background:#0b0b0b; color:#e0e0e0; padding:20px; }}
h1,h2 {{ color:#7cffc4; }}
pre {{ background:#111; padding:10px; overflow:auto; }}
.section {{ margin-bottom:30px; }}
.small {{ color:#999; }}
.token {{ border-bottom:1px solid #222; padding:6px 0; }}
</style>
</head>
<body>

<h1>∞ Infinity+ Artifact</h1>
<div class="small">Generated: {now}</div>

<div class="section">
<h2>System State</h2>
<pre>{json.dumps(state, indent=2)}</pre>
</div>

<div class="section">
<h2>Tokens</h2>
<div class="small">Count: {tokens.get("count", 0)}</div>
<pre>{json.dumps(tokens.get("tokens", []), indent=2)}</pre>
</div>

<div class="section">
<h2>Links</h2>
<pre>{json.dumps(links.get("links", {}), indent=2)}</pre>
</div>

<div class="section">
<h2>Values</h2>
<pre>{json.dumps(values.get("values", {}), indent=2)}</pre>
</div>

</body>
</html>
"""

out = WEB / "infinity_plus.html"
with open(out, "w") as f:
    f.write(html)

print("\n[∞] Artifact Web generated")
print(f"[∞] Output: {out}\n")
