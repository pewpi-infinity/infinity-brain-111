# cart018_zip_hashing.py
"""
Cart 018: Zip Hashing
Builds a “master hash” per token, capturing:
- Token #: sequential index
- Token value: heuristic score (research connectivity)
- Token color: Infinity anchor
- Token datetime + future inputs hint

Also:
- Word-level linkages: each research word links to related tokens (connectivity raises value)
- Research paper + websites: stored as attached references (no inline noise), optionally zipped
- Artifacts: JSON manifests for master hash; optional .zip pointer

CLI:
  python cart018_zip_hashing.py make --id 42 --color blue --title "Hydrogen plan" --words "hydrogen storage compression"
  python cart018_zip_hashing.py link --id 42 --links "token_10,token_11"
"""

import sys, os, json, time, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "ziphash_audit.jsonl")
INDEX = os.path.join(DATA, "ziphash_index.json")

DEFAULT_INDEX = {"tokens": {}}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_index() -> dict:
    if not os.path.exists(INDEX): return DEFAULT_INDEX.copy()
    try:
        with open(INDEX, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_INDEX.copy()

def save_index(idx: dict):
    with open(INDEX, "w", encoding="utf-8") as f: json.dump(idx, f, indent=2)

def score_value(words: list, links: list) -> float:
    """
    Simple heuristic: value rises with unique words and link count.
    """
    uniq = len(set(words))
    return round(uniq * 0.5 + len(links) * 0.8, 2)

def master_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()

def make_token(tid: int, color: str, title: str, words: list):
    idx = load_index()
    links = []
    value = score_value(words, links)
    payload = {"id": tid, "title": title, "color": color, "value": value, "words": words, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()), "future_hint": "expand links, add websites"}
    mh = master_hash(payload)
    idx["tokens"][str(tid)] = {"payload": payload, "hash": mh, "links": links, "websites": []}
    save_index(idx)
    audit({"action":"make","id":tid,"value":value,"color":color})
    path = os.path.join(ART, f"ziphash_{tid}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(idx["tokens"][str(tid)], f, indent=2)
    print(json.dumps({"ok": True, "id": tid, "hash": mh, "value": value, "path": path}, indent=2))

def add_links(tid: int, link_ids: list):
    idx = load_index()
    entry = idx["tokens"].get(str(tid))
    if not entry:
        print(json.dumps({"error":"token not found"}, indent=2)); return
    entry["links"] = sorted(set(entry.get("links", []) + link_ids))
    entry["payload"]["value"] = score_value(entry["payload"]["words"], entry["links"])
    entry["payload"]["future_hint"] = "links updated"
    idx["tokens"][str(tid)] = entry
    save_index(idx)
    audit({"action":"link","id":tid,"count":len(link_ids)})
    path = os.path.join(ART, f"ziphash_{tid}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(entry, f, indent=2)
    print(json.dumps({"ok": True, "id": tid, "value": entry["payload"]["value"], "path": path}, indent=2))

def add_websites(tid: int, sites: list):
    idx = load_index()
    entry = idx["tokens"].get(str(tid))
    if not entry:
        print(json.dumps({"error":"token not found"}, indent=2)); return
    entry["websites"] = sorted(set(entry.get("websites", []) + sites))
    save_index(idx)
    audit({"action":"websites","id":tid,"count":len(sites)})
    path = os.path.join(ART, f"ziphash_{tid}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(entry, f, indent=2)
    print(json.dumps({"ok": True, "id": tid, "websites": entry["websites"], "path": path}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: make --id N --color <key> --title \"...\" --words \"w1 w2 ...\" | link --id N --links \"token_10,token_11\" | sites --id N --urls \"https://...,...\"")
        return
    cmd = args[0]
    kv = {}
    for i,a in enumerate(args):
        if a == "--id" and i+1 < len(args): kv["id"] = int(args[i+1])
        if a == "--color" and i+1 < len(args): kv["color"] = args[i+1]
        if a == "--title" and i+1 < len(args): kv["title"] = args[i+1]
        if a == "--words" and i+1 < len(args): kv["words"] = args[i+1].split()
        if a == "--links" and i+1 < len(args): kv["links"] = [x.strip() for x in args[i+1].split(",")]
        if a == "--urls" and i+1 < len(args): kv["urls"] = [x.strip() for x in args[i+1].split(",")]
    if cmd == "make": make_token(kv.get("id", 1), kv.get("color", "blue"), kv.get("title","Untitled"), kv.get("words", [])); return
    if cmd == "link": add_links(kv.get("id", 1), kv.get("links", [])); return
    if cmd == "sites": add_websites(kv.get("id", 1), kv.get("urls", [])); return
    print("Unknown command.")

if __name__ == "__main__":
    main()