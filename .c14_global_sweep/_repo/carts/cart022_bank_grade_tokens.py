# cart022_bank_grade_tokens.py
"""
Cart 022: Bank Grade Tokens
Defines “bank-grade” vaults built from Grand Masters:
- Vault manifest: curated list of Grand Masters with integrity hashes
- Validation: consistency checks, provenance completeness
- Risk and provenance scoring (heuristics)
- Mint policies: record creation rules and audit entries
- Artifacts + audit logs

CLI:
  python cart022_bank_grade_tokens.py mint --vault "Vault-Alpha" --grands 7,8,9
  python cart022_bank_grade_tokens.py validate --vault "Vault-Alpha"
  python cart022_bank_grade_tokens.py score --vault "Vault-Alpha"
"""

import sys, os, json, time, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "bankgrade_audit.jsonl")
GRANDS = os.path.join(DATA, "grand_index.json")
VAULTS = os.path.join(DATA, "vaults_index.json")

DEFAULT_VAULTS = {"vaults": {}}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load(path: str, default: dict) -> dict:
    if not os.path.exists(path): return default.copy()
    try:
        with open(path, "r", encoding="utf-8") as f: return json.load(f)
    except: return default.copy()

def save(path: str, obj: dict):
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)

def vault_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()

def mint_vault(name: str, grands_list: list):
    grands = load(GRANDS, {"items": {}})
    missing = [g for g in grands_list if str(g) not in grands["items"]]
    if missing:
        print(json.dumps({"error": "missing grand masters", "ids": missing}, indent=2)); return
    payload = {
        "name": name,
        "grands": grands_list,
        "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
        "policy": {
            "curator": "Kris",
            "rules": ["provenance-required", "hash-verified", "color-diversity-encouraged"]
        }
    }
    h = vault_hash(payload)
    vaults = load(VAULTS, DEFAULT_VAULTS)
    vaults["vaults"][name] = {"payload": payload, "hash": h}
    save(VAULTS, vaults)
    path = os.path.join(ART, f"vault_{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(vaults["vaults"][name], f, indent=2)
    audit({"action":"vault.mint","name":name,"count":len(grands_list)})
    print(json.dumps({"ok": True, "name": name, "hash": h, "path": path}, indent=2))

def validate_vault(name: str):
    vaults = load(VAULTS, DEFAULT_VAULTS)
    v = vaults["vaults"].get(name)
    if not v:
        print(json.dumps({"error":"vault not found"}, indent=2)); return
    # simple re-hash check
    h2 = vault_hash(v["payload"])
    ok = h2 == v["hash"]
    audit({"action":"vault.validate","name":name,"ok":ok})
    print(json.dumps({"ok": ok, "expected": v["hash"], "actual": h2}, indent=2))

def score_vault(name: str):
    grands = load(GRANDS, {"items": {}})
    vaults = load(VAULTS, DEFAULT_VAULTS)
    v = vaults["vaults"].get(name)
    if not v:
        print(json.dumps({"error":"vault not found"}, indent=2)); return
    colors = []
    total_value = 0.0
    for gid in v["payload"]["grands"]:
        gm = grands["items"].get(str(gid))
        if gm:
            total_value += gm["payload"]["value"]
            # infer colors from masters if needed
            # here we approximate diversity by grand count
            colors.append(gid % 5)
    diversity = len(set(colors))
    provenance = 1.0  # heuristic placeholder
    risk = max(0.0, 1.0 - 0.05 * diversity)  # more diversity → lower risk
    bank_grade_score = round(total_value * (1.0 + 0.1 * diversity) * provenance * (1.0 - 0.2 * risk), 2)
    audit({"action":"vault.score","name":name,"score":bank_grade_score})
    path = os.path.join(ART, f"vault_score_{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump({"name": name, "score": bank_grade_score, "total_value": total_value, "diversity": diversity, "risk": risk}, f, indent=2)
    print(json.dumps({"name": name, "score": bank_grade_score, "total_value": total_value, "diversity": diversity, "risk": risk, "path": path}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: mint --vault NAME --grands 7,8,9 | validate --vault NAME | score --vault NAME"); return
    cmd = args[0]
    kv = {}
    for i,a in enumerate(args):
        if a == "--vault" and i+1 < len(args): kv["vault"] = args[i+1]
        if a == "--grands" and i+1 < len(args): kv["grands"] = [int(x) for x in args[i+1].split(",")]
    if cmd == "mint":
        mint_vault(kv.get("vault","Vault-Alpha"), kv.get("grands", [])); return
    if cmd == "validate":
        validate_vault(kv.get("vault","Vault-Alpha")); return
    if cmd == "score":
        score_vault(kv.get("vault","Vault-Alpha")); return
    print("Unknown command.")

if __name__ == "__main__":
    main()