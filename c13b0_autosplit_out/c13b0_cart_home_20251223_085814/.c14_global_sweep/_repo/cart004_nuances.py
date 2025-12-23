# cart004_nuances.py
"""
Cart 004: Nuances Module
Scans emerging tech/design/color trends and upgrades carts with structured intelligence.

Features:
- Local corpus loader (JSON files under corpus/)
- Diff engine to compare old vs new trend sets
- Upgrade planner that maps trends to affected carts
- Commit writer that logs planned upgrades
- CLI: scan, plan, commit
"""

import os, json, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CORPUS_DIR = os.path.join(ROOT, "corpus")
LOGS_DIR = os.path.join(ROOT, "logs")
OUT_DIR = os.path.join(ROOT, "artifacts")
os.makedirs(CORPUS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

AUDIT = os.path.join(LOGS_DIR, "nuances_audit.jsonl")

def audit(entry):
    entry = dict(entry)
    entry["t"] = __import__("time").strftime("%Y-%m-%dT%H:%M:%S", __import__("time").gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def load_corpus() -> list:
    topics = []
    for fn in os.listdir(CORPUS_DIR):
        if fn.endswith(".json"):
            try:
                with open(os.path.join(CORPUS_DIR, fn), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    topics.extend(data.get("topics", []))
            except Exception as e:
                print(f"[WARN] corpus load {fn}: {e}")
    return sorted(list(set(topics)))

def scan_local() -> list:
    # Placeholder for web/API scans; currently uses local corpus.
    return load_corpus()

def diff(old: list, new: list) -> dict:
    old_set, new_set = set(old), set(new)
    added = sorted(list(new_set - old_set))
    removed = sorted(list(old_set - new_set))
    common = sorted(list(old_set & new_set))
    return {"added": added, "removed": removed, "common": common}

CART_MAP = {
    "quantum": ["cart003_computers"],
    "ai": ["cart005_code", "cart003_computers"],
    "hydrogen": ["cart002_engineering", "cart041_hydrogen_expansion"],
    "color": ["cart004_nuances", "cart001A_infinity_runcommands"]
}

def plan_upgrades(trends: list) -> dict:
    plan = {"trends": trends, "upgrades": {}}
    for t in trends:
        for key, carts in CART_MAP.items():
            if key in t:
                plan["upgrades"].setdefault(key, {"trend": t, "carts": []})
                plan["upgrades"][key]["carts"].extend([c for c in carts if c not in plan["upgrades"][key]["carts"]])
    return plan

def save_artifact(name, obj):
    path = os.path.join(OUT_DIR, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return path

def main():
    args = sys.argv[1:]
    if not args:
        old = ["ai-materials", "color-logic", "hydrogen-storage"]
        new = scan_local()
        d = diff(old, new)
        plan = plan_upgrades(new)
        bundle = {"diff": d, "plan": plan}
        audit({"action": "bundle"})
        path = save_artifact("nuances_bundle", bundle)
        print(json.dumps(bundle, indent=2)); print(f"Saved: {path}")
        return
    cmd = args[0]
    audit({"action": "cli", "cmd": cmd})
    if cmd == "scan":
        res = scan_local(); print(json.dumps({"trends": res}, indent=2))
    elif cmd == "plan":
        trends = scan_local(); print(json.dumps(plan_upgrades(trends), indent=2))
    elif cmd == "commit":
        trends = scan_local(); plan = plan_upgrades(trends)
        path = save_artifact("nuances_commit", {"plan": plan})
        print(json.dumps({"ok": True, "path": path}, indent=2))
    else:
        print("Unknown. Try: scan | plan | commit")

if __name__ == "__main__":
    main()