# cart007_tokens.py
"""
Cart 007: Tokens Module
Manages Infinity token logic:
- Color anchors (semantic color logic)
- Token kinds: research, whistle (experimental), daily auto-pay
- Wallet balances and payouts (e.g., 48 Infinity/day)
- Provenance: JSON artifacts and audit logs
- CLI:
    python cart007_tokens.py colors
    python cart007_tokens.py make research "Hydrogen lattice storage plan"
    python cart007_tokens.py make whistle "C4 D4 E4"
    python cart007_tokens.py payout daily --user Kris
    python cart007_tokens.py wallet --user Kris
"""

import sys, os, json, time
from typing import Dict, Any, List

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "tokens_audit.jsonl")
WALLET = os.path.join(DATA, "wallets.json")

DEFAULT_WALLETS = {"users": {}}

def load_wallets() -> dict:
    if not os.path.exists(WALLET): return DEFAULT_WALLETS.copy()
    try:
        with open(WALLET, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_WALLETS.copy()

def save_wallets(w: dict):
    with open(WALLET, "w", encoding="utf-8") as f: json.dump(w, f, indent=2)

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

# Color anchors (example palette)
COLOR_ANCHORS = [
    {"key": "gold", "role": "value", "desc": "Value anchor (Octave)"},
    {"key": "blue", "role": "knowledge", "desc": "Knowledge anchor (Infinity)"},
    {"key": "green", "role": "growth", "desc": "Growth anchor (Mongoose)"},
    {"key": "purple", "role": "creativity", "desc": "Creativity anchor"},
    {"key": "gray", "role": "provenance", "desc": "Provenance anchor"}
]

def artifact_path(name: str) -> str:
    p = os.path.join(ART, f"{name}.json")
    return p

def save_artifact(name: str, obj: dict) -> str:
    p = artifact_path(name)
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

def colors():
    audit({"action": "colors"})
    print(json.dumps(COLOR_ANCHORS, indent=2))

def make_research(title: str, user: str = "guest") -> dict:
    token = {
        "kind": "research",
        "title": title,
        "color": "blue",
        "value_hint": "high",
        "author": user,
        "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }
    audit({"action": "make_research", "title": title, "user": user})
    fp = save_artifact(f"token_research_{int(time.time())}", token)
    return {"ok": True, "path": fp, "token": token}

def make_whistle(sequence: str, user: str = "guest") -> dict:
    token = {
        "kind": "whistle",
        "sequence": sequence.split(),
        "color": "purple",
        "value_hint": "experimental",
        "author": user,
        "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }
    audit({"action": "make_whistle", "len": len(token["sequence"]), "user": user})
    fp = save_artifact(f"token_whistle_{int(time.time())}", token)
    return {"ok": True, "path": fp, "token": token}

def ensure_user(wallets: dict, user: str):
    wallets["users"].setdefault(user, {"octave": 0, "infinity": 0, "mongoose": 0})

def payout_daily(user: str = "guest", amount: int = 48) -> dict:
    wallets = load_wallets()
    ensure_user(wallets, user)
    wallets["users"][user]["infinity"] += amount
    save_wallets(wallets)
    audit({"action": "payout_daily", "user": user, "amount": amount})
    return {"ok": True, "user": user, "payout": amount, "wallet": wallets["users"][user]}

def show_wallet(user: str = "guest") -> dict:
    w = load_wallets(); ensure_user(w, user)
    audit({"action": "wallet", "user": user})
    return {"user": user, "wallet": w["users"][user]}

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: colors | make research <title> [--user X] | make whistle <sequence> [--user X] | payout daily [--user X] | wallet [--user X]")
        return
    if args[0] == "colors":
        colors(); return
    if args[0] == "make":
        kind = args[1]
        user = "guest"
        if "--user" in args:
            i = args.index("--user"); user = args[i+1] if i+1 < len(args) else "guest"
        if kind == "research":
            title = " ".join(a for a in args[2:] if a != "--user" and a != user)
            print(json.dumps(make_research(title, user), indent=2)); return
        if kind == "whistle":
            seq = " ".join(a for a in args[2:] if a != "--user" and a != user)
            print(json.dumps(make_whistle(seq, user), indent=2)); return
    if args[0] == "payout" and args[1] == "daily":
        user = "guest"
        if "--user" in args:
            i = args.index("--user"); user = args[i+1] if i+1 < len(args) else "guest"
        print(json.dumps(payout_daily(user), indent=2)); return
    if args[0] == "wallet":
        user = "guest"
        if "--user" in args:
            i = args.index("--user"); user = args[i+1] if i+1 < len(args) else "guest"
        print(json.dumps(show_wallet(user), indent=2)); return
    print("Unknown command.")

if __name__ == "__main__":
    main()