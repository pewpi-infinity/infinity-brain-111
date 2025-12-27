# cart020_unzip_install_strategy.py
"""
Cart 020: Unzip & Install Strategy
Gets research into the index page to be read and interacted with, and wires user actions:
- Reads research artifacts (JSON) and builds a simple index manifest (for your SPA)
- Interaction options: buy, inject & build, build-your-own, upload media
- Color-coded buttons hints for routes (engineering, assimilating)
- Logs provenance

CLI:
  python cart020_unzip_install_strategy.py index --src ./artifacts --out ./artifacts/index_manifest.json
  python cart020_unzip_install_strategy.py add --title "Hydrogen Plan" --path ./artifacts/hydrogen_plan.json --color blue --route engineering
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "install_audit.jsonl")
MANIFEST = os.path.join(ART, "index_manifest.json")

DEFAULT_MANIFEST = {"items": []}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_manifest() -> dict:
    if not os.path.exists(MANIFEST): return DEFAULT_MANIFEST.copy()
    try:
        with open(MANIFEST, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_MANIFEST.copy()

def save_manifest(m: dict):
    with open(MANIFEST, "w", encoding="utf-8") as f: json.dump(m, f, indent=2)

def build_index(src_dir: str, out_path: str = None):
    items = []
    for fn in os.listdir(src_dir):
        if fn.endswith(".json"):
            path = os.path.join(src_dir, fn)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                items.append({
                    "title": data.get("title") or data.get("name") or fn,
                    "path": path,
                    "color": data.get("color", "gray"),
                    "route": "engineering" if "engineer" in (data.get("title","")+data.get("name","")).lower() else "assimilate",
                    "actions": ["buy","inject_build","build_your_own","upload_media"]
                })
            except Exception as e:
                items.append({"title": fn, "path": path, "color": "gray", "route": "assimilate", "error": str(e)})
    manifest = {"items": items, "updated": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}
    target = out_path or MANIFEST
    with open(target, "w", encoding="utf-8") as f: json.dump(manifest, f, indent=2)
    audit({"action":"index","count":len(items)})
    print(json.dumps({"ok": True, "path": target, "count": len(items)}, indent=2))

def add_item(title: str, path: str, color: str, route: str):
    m = load_manifest()
    m["items"].append({
        "title": title, "path": path, "color": color, "route": route,
        "actions": ["buy","inject_build","build_your_own","upload_media"]
    })
    save_manifest(m)
    audit({"action":"add","title":title,"route":route})
    print(json.dumps({"ok": True, "count": len(m['items'])}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: index --src DIR [--out PATH] | add --title \"...\" --path PATH --color blue --route engineering"); return
    cmd = args[0]
    kv = {}
    for i,a in enumerate(args):
        if a == "--src" and i+1 < len(args): kv["src"] = args[i+1]
        if a == "--out" and i+1 < len(args): kv["out"] = args[i+1]
        if a == "--title" and i+1 < len(args): kv["title"] = args[i+1]
        if a == "--path" and i+1 < len(args): kv["path"] = args[i+1]
        if a == "--color" and i+1 < len(args): kv["color"] = args[i+1]
        if a == "--route" and i+1 < len(args): kv["route"] = args[i+1]
    if cmd == "index":
        src = kv.get("src", ART); out = kv.get("out", MANIFEST)
        build_index(src, out); return
    if cmd == "add":
        add_item(kv.get("title","Untitled"), kv.get("path",""), kv.get("color","gray"), kv.get("route","assimilate")); return
    print("Unknown command.")

if __name__ == "__main__":
    main()