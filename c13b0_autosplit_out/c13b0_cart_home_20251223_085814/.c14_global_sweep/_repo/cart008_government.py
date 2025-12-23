# cart008_government.py
"""
Cart 008: Government Module
Provides neutral governance frameworks and safety models for Infinity:
- Safety checklist (user empowerment, transparency, provenance-first)
- Governance models (open councils, consent-based change logging)
- Policy registry (JSON), validator, and exporter
- Impact planner (maps policy to modules)
- CLI:
    python cart008_government.py safety
    python cart008_government.py models
    python cart008_government.py add_policy "Title" "Description"
    python cart008_government.py plan
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "government_audit.jsonl")
POLICIES = os.path.join(DATA, "policies.json")

DEFAULT_POLICIES = {"policies": []}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_policies() -> dict:
    if not os.path.exists(POLICIES): return DEFAULT_POLICIES.copy()
    try:
        with open(POLICIES, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_POLICIES.copy()

def save_policies(p: dict):
    with open(POLICIES, "w", encoding="utf-8") as f: json.dump(p, f, indent=2)

SAFETY_CHECKLIST = [
    {"id": "empowerment", "desc": "Design for non-programmers; clear controls and feedback."},
    {"id": "provenance", "desc": "Every action logged with visible artifacts."},
    {"id": "transparency", "desc": "Explain functionality and limits without jargon."},
    {"id": "privacy", "desc": "Avoid collecting unnecessary personal data."},
    {"id": "fairness", "desc": "Respect all users; avoid stereotypes or discrimination."}
]

GOV_MODELS = [
    {"key": "open_council", "desc": "Open proposals; consensus with public logs."},
    {"key": "consent_change_log", "desc": "Every change requires explicit consent and is logged."},
    {"key": "module_charters", "desc": "Each module has a charter (scope, responsibilities, ethics)."}
]

def add_policy(title: str, desc: str) -> dict:
    p = load_policies()
    policy = {"title": title, "desc": desc, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}
    p["policies"].append(policy)
    save_policies(p); audit({"action": "add_policy", "title": title})
    return {"ok": True, "policy": policy}

MODULE_MAP = {
    "tokens": ["cart007_tokens"],
    "engineering": ["cart002_engineering"],
    "computers": ["cart003_computers"],
    "nuances": ["cart004_nuances"],
    "python": ["cart006_python"]
}

def plan_impacts():
    p = load_policies()
    plans = []
    for policy in p["policies"]:
        touched = [m for mlist in MODULE_MAP.values() for m in mlist]
        plans.append({"policy": policy["title"], "modules": sorted(set(touched))})
    art = {"plans": plans}
    path = os.path.join(ART, "government_plans.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(art, f, indent=2)
    audit({"action": "plan"})
    return {"ok": True, "path": path, "plans": plans}

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: safety | models | add_policy <title> <desc> | plan"); return
    if args[0] == "safety":
        audit({"action": "safety"})
        print(json.dumps(SAFETY_CHECKLIST, indent=2)); return
    if args[0] == "models":
        audit({"action": "models"})
        print(json.dumps(GOV_MODELS, indent=2)); return
    if args[0] == "add_policy":
        if len(args) < 3:
            print("Usage: add_policy <title> <desc>"); return
        title = args[1]; desc = " ".join(args[2:])
        print(json.dumps(add_policy(title, desc), indent=2)); return
    if args[0] == "plan":
        print(json.dumps(plan_impacts(), indent=2)); return
    print("Unknown command.")

if __name__ == "__main__":
    main()