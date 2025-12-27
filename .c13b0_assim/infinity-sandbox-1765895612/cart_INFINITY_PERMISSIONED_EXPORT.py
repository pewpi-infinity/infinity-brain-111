#!/usr/bin/env python3
import json
import shutil
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
INDEX = BASE / "index"
WEB = BASE / "web"
EXPORTS = BASE / "exports"

EXPORTS.mkdir(parents=True, exist_ok=True)

NOW = datetime.datetime.utcnow().isoformat()

# -------------------------------------------------
# EXPORT POLICY (edit this, not the code below)
# -------------------------------------------------
POLICY = {
    "name": "reviewer_basic",
    "include": {
        "system_state": True,
        "token_index": True,
        "link_index": True,
        "value_index": True,
        "topic_scores": True,
        "dependency_graph": True,
        "web_artifact": True
    },
    "exclude_fields": [
        "research_ref",   # hides raw research paths
        "path"            # hides filesystem layout
    ]
}

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def load_json(p):
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return None

def scrub(obj, exclude):
    if isinstance(obj, dict):
        return {
            k: scrub(v, exclude)
            for k, v in obj.items()
            if k not in exclude
        }
    if isinstance(obj, list):
        return [scrub(v, exclude) for v in obj]
    return obj

bundle = {
    "exported": NOW,
    "policy": POLICY["name"],
    "data": {}
}

# -------------------------------------------------
# Collect allowed artifacts
# -------------------------------------------------
ARTIFACTS = {
    "system_state": INDEX / "system_state.json",
    "token_index": INDEX / "token_index.json",
    "link_index": INDEX / "link_index.json",
    "value_index": INDEX / "value_index.json",
    "topic_scores": INDEX / "topic_scores.json",
    "dependency_graph": INDEX / "dependency_graph.json"
}

for key, path in ARTIFACTS.items():
    if POLICY["include"].get(key) and path.exists():
        raw = load_json(path)
        bundle["data"][key] = scrub(raw, POLICY["exclude_fields"])

# -------------------------------------------------
# Write export bundle
# -------------------------------------------------
export_dir = EXPORTS / f"{POLICY['name']}_{NOW.replace(':','-')}"
export_dir.mkdir(parents=True, exist_ok=True)

bundle_file = export_dir / "export_bundle.json"
with open(bundle_file, "w") as f:
    json.dump(bundle, f, indent=2)

# -------------------------------------------------
# Optional: include web artifact
# -------------------------------------------------
if POLICY["include"].get("web_artifact"):
    web_file = WEB / "infinity_plus.html"
    if web_file.exists():
        shutil.copy(web_file, export_dir / "infinity_plus.html")

print("\n[∞] Permissioned export complete")
print(f"[∞] Policy: {POLICY['name']}")
print(f"[∞] Output directory: {export_dir}")
print(f"[∞] Bundle: {bundle_file}\n")
