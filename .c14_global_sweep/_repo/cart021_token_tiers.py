# cart021_token_tiers.py
"""
Cart 021: Token Tiers
Defines Master and Grand Master tokens and builds manifests:
- Master: individual tokens with color/value/links
- Grand Master: zipped collections referencing multiple Masters
- Value heuristics: connectivity, color balance, provenance completeness
- Artifacts + audit logs

CLI:
  python cart021_token_tiers.py master --id 101 --title "Hydrogen Lattice" --color blue --words "hydrogen lattice storage"
  python cart021_token_tiers.py grand --id 7 --masters 101,102,103 --title "Hydrogen Stack GM-7"
"""

import sys, os, json, time, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "tiers_audit.jsonl")
MASTERS = os.path.join(DATA, "masters_index.json")
GRANDS  = os.path.join(DATA, "grand_index.json")

DEFAULT_MASTERS = {"items": {}}
DEFAULT_GRANDS  = {"items": {}}

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

def score_master(words: list, links: list, color: str) -> float:
    uniq = len(set(words))
    link_bonus = len(links) * 0.8
    color_bonus = {"blue": 1.0, "gold": 1.2, "green": 0.9, "purple": 0.7, "gray": 0.5}.get(color, 0.6)
    return round(uniq * 0.5 + link_bonus + color_bonus, 2)

def make_master(mid: int, title: str, color: str, words: list):
    masters = load(MASTERS, DEFAULT_MASTERS)
    entry = masters["items"].get(str(mid), {"links": [], "websites": []})
    value = score_master(words, entry["links"], color)
    payload = {
        "id": mid, "title": title, "color": color, "value": value,
        "words": words, "links": entry["links"], "websites": entry["websites"],
        "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }
    hashv = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    masters["items"][str(mid)] = {"payload": payload, "hash": hashv}
    save(MASTERS, masters)
    path = os.path.join(ART, f"master_{mid}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(masters["items"][str(mid)], f, indent=2)
    audit({"action":"master.make","id":mid,"value":value})
    print(json.dumps({"ok": True, "id": mid, "value": value, "hash": hashv, "path": path}, indent=2))

def score_grand(master_ids: list, masters: dict) -> float:
    total = 0.0
    colors = []
    for mid in master_ids:
        m = masters["items"].get(str(mid))
        if m:
            total += m["payload"]["value"]
            colors.append(m["payload"]["color"])
    diversity = len(set(colors))
    return round(total * (1.0 + 0.05 * diversity), 2)

def make_grand(gid: int, title: str, masters_list: list):
    masters = load(MASTERS, DEFAULT_MASTERS)
    grands  = load(GRANDS, DEFAULT_GRANDS)
    value = score_grand(masters_list, masters)
    payload = {"id": gid, "title": title, "masters": masters_list, "value": value, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}
    hashv = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    grands["items"][str(gid)] = {"payload": payload, "hash": hashv}
    save(GRANDS, grands)
    path = os.path.join(ART, f"grand_{gid}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(grands["items"][str(gid)], f, indent=2)
    audit({"action":"grand.make","id":gid,"value":value,"masters":len(masters_list)})
    print(json.dumps({"ok": True, "id": gid, "value": value, "hash": hashv, "path": path}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: master --id N --title \"...\" --color blue --words \"w1 w2 ...\" | grand --id G --masters 1,2,3 --title \"...\"")
        return
    cmd = args[0]
    kv = {}
    for i,a in enumerate(args):
        if a == "--id" and i+1 < len(args): kv["id"] = int(args[i+1])
        if a == "--title" and i+1 < len(args): kv["title"] = args[i+1]
        if a == "--color" and i+1 < len(args): kv["color"] = args[i+1]
        if a == "--words" and i+1 < len(args): kv["words"] = args[i+1].split()
        if a == "--masters" and i+1 < len(args): kv["masters"] = [int(x) for x in args[i+1].split(",")]
    if cmd == "master": make_master(kv.get("id", 1), kv.get("title", "Untitled"), kv.get("color","blue"), kv.get("words", [])); return
    if cmd == "grand": make_grand(kv.get("id", 1), kv.get("title","Untitled Grand"), kv.get("masters", [])); return
    print("Unknown command.")

if __name__ == "__main__":
    main()