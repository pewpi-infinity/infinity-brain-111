# cart012_solutes.py
"""
Cart 012: Solutes Module
Solutes ⭐ system indexes scripts/components with quality metrics and flags areas that are “unlikely to need upgrades.”

Purpose in Infinity:
- Protect high-quality areas from churn
- Provide a star index (1–5) across clarity, performance, provenance, user empowerment
- Build a searchable registry and export insight artifacts

Capabilities:
- Registry: add/update entries with metrics
- Scoring: weighted stars and “solidity” score
- Queries: find top entries, list ‘unlikely upgrade’ candidates
- Artifacts: JSON exports; audit logs

CLI:
  python cart012_solutes.py add "cart002_engineering" --clarity 5 --performance 4 --provenance 5 --empower 5
  python cart012_solutes.py score "cart002_engineering"
  python cart012_solutes.py top 10
  python cart012_solutes.py freeze
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "solutes_audit.jsonl")
REG = os.path.join(DATA, "solutes_registry.json")

DEFAULT_REG = {"entries": {}}
WEIGHTS = {"clarity": 0.25, "performance": 0.25, "provenance": 0.25, "empower": 0.25}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_reg() -> dict:
    if not os.path.exists(REG): return DEFAULT_REG.copy()
    try:
        with open(REG, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_REG.copy()

def save_reg(r: dict):
    with open(REG, "w", encoding="utf-8") as f: json.dump(r, f, indent=2)

def add_entry(name: str, clarity: int, performance: int, provenance: int, empower: int):
    r = load_reg()
    r["entries"][name] = {
        "metrics": {"clarity": clarity, "performance": performance, "provenance": provenance, "empower": empower},
        "updated": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }
    save_reg(r); audit({"action": "add", "name": name})
    print(json.dumps({"ok": True, "name": name}, indent=2))

def score(name: str):
    r = load_reg()
    e = r["entries"].get(name)
    if not e:
        print(json.dumps({"error": "not found"}, indent=2)); return
    m = e["metrics"]
    weighted = sum(WEIGHTS[k] * m[k] for k in WEIGHTS)
    solidity = min(1.0, max(0.0, weighted / 5.0))  # normalize to 0–1
    stars = round(weighted, 2)
    out = {"name": name, "stars": stars, "solidity": solidity, "metrics": m}
    audit({"action": "score", "name": name})
    path = os.path.join(ART, f"solutes_score_{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(out, f, indent=2)
    print(json.dumps(out, indent=2)); print(f"Saved: {path}")

def top(n: int):
    r = load_reg()
    rows = []
    for name in r["entries"]:
        m = r["entries"][name]["metrics"]
        stars = sum(WEIGHTS[k] * m[k] for k in WEIGHTS)
        rows.append({"name": name, "stars": round(stars, 2)})
    rows.sort(key=lambda x: x["stars"], reverse=True)
    print(json.dumps({"top": rows[:n]}, indent=2))

def freeze_candidates(threshold: float = 4.2):
    """
    “Unlikely upgrade” candidates:
    - Combined weighted stars >= threshold (default 4.2/5)
    - Provenance and empowerment both >= 4
    """
    r = load_reg()
    cand = []
    for name, e in r["entries"].items():
        m = e["metrics"]
        stars = sum(WEIGHTS[k] * m[k] for k in WEIGHTS)
        if stars >= threshold and m["provenance"] >= 4 and m["empower"] >= 4:
            cand.append({"name": name, "stars": round(stars, 2)})
    audit({"action": "freeze.list"})
    path = os.path.join(ART, "solutes_freeze_candidates.json")
    with open(path, "w", encoding="utf-8") as f: json.dump({"candidates": cand}, f, indent=2)
    print(json.dumps({"candidates": cand}, indent=2)); print(f"Saved: {path}")

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: add <name> --clarity 1-5 --performance 1-5 --provenance 1-5 --empower 1-5 | score <name> | top <n> | freeze")
        return
    cmd = args[0]
    if cmd == "add":
        name = args[1] if len(args) > 1 else "unknown"
        c=p=pr=em=3
        for i,a in enumerate(args):
            if a == "--clarity" and i+1 < len(args): c = int(args[i+1])
            if a == "--performance" and i+1 < len(args): p = int(args[i+1])
            if a == "--provenance" and i+1 < len(args): pr = int(args[i+1])
            if a == "--empower" and i+1 < len(args): em = int(args[i+1])
        add_entry(name, c, p, pr, em); return
    if cmd == "score":
        score(args[1]); return
    if cmd == "top":
        n = int(args[1]) if len(args) > 1 else 10
        top(n); return
    if cmd == "freeze":
        freeze_candidates(); return
    print("Unknown command.")

if __name__ == "__main__":
    main()