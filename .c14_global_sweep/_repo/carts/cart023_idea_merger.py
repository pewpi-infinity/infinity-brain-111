# cart023_idea_merger.py
"""
Cart 023: Idea Merger
Connects tokens to user activities (chat, watch, listen, write, read, tests) and produces composite value streams.

Purpose in Infinity:
- Merge ideas from interactions into token linkages
- Track activities with color-coded intents (engineering, research, CEO, creativity, provenance)
- Score merged outputs and recommend next actions
- Artifacts + audit logs

CLI:
  python cart023_idea_merger.py track --user Kris --kind chat --text "Hydrogen lattice"
  python cart023_idea_merger.py merge --user Kris --token 101
  python cart023_idea_merger.py stream --user Kris
"""

import sys, os, json, time, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "ideamerger_audit.jsonl")
TRACK = os.path.join(DATA, "activity_track.json")
MERGED = os.path.join(DATA, "merged_index.json")

DEFAULT_TRACK = {"events": []}
DEFAULT_MERGED = {"streams": {}}

INTENT_MAP = {
    "chat": "blue",
    "watch": "green",
    "listen": "purple",
    "write": "gold",
    "read": "blue",
    "test": "gray"
}

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

def track_event(user: str, kind: str, text: str = "", meta: dict = None):
    t = load(TRACK, DEFAULT_TRACK)
    color = INTENT_MAP.get(kind, "gray")
    event = {"user": user, "kind": kind, "color": color, "text": text, "meta": meta or {}, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}
    t["events"].append(event); save(TRACK, t)
    audit({"action":"track","user":user,"kind":kind,"color":color})
    path = os.path.join(ART, f"track_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(event, f, indent=2)
    print(json.dumps({"ok": True, "path": path}, indent=2))

def linkage_score(events: list) -> float:
    # heuristic: more diverse colors + more events → higher score
    colors = set(e["color"] for e in events)
    return round(len(events) * (1.0 + 0.1 * len(colors)), 2)

def merge_stream(user: str, token_id: int):
    t = load(TRACK, DEFAULT_TRACK)
    relevant = [e for e in t["events"] if e["user"] == user]
    score = linkage_score(relevant)
    stream = {"user": user, "token_id": token_id, "events": relevant[-50:], "score": score, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}
    m = load(MERGED, DEFAULT_MERGED)
    key = f"{user}:{token_id}"
    m["streams"][key] = stream
    save(MERGED, m)
    path = os.path.join(ART, f"merged_{user}_{token_id}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(stream, f, indent=2)
    audit({"action":"merge","user":user,"token":token_id,"score":score})
    print(json.dumps({"ok": True, "path": path, "score": score}, indent=2))

def stream_summary(user: str):
    m = load(MERGED, DEFAULT_MERGED)
    rows = [v for k,v in m["streams"].items() if k.startswith(f"{user}:")]
    rows.sort(key=lambda x: x["score"], reverse=True)
    path = os.path.join(ART, f"stream_{user}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump({"user": user, "streams": rows[:10]}, f, indent=2)
    audit({"action":"stream","user":user,"count":len(rows)})
    print(json.dumps({"user": user, "top": rows[:10], "path": path}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: track --user U --kind chat|watch|listen|write|read|test --text \"...\" | merge --user U --token N | stream --user U")
        return
    cmd = args[0]
    if cmd == "track":
        user="guest"; kind="chat"; text=""
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
            if a == "--kind" and i+1 < len(args): kind = args[i+1]
            if a == "--text" and i+1 < len(args): text = args[i+1]
        track_event(user, kind, text); return
    if cmd == "merge":
        user="guest"; token=1
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
            if a == "--token" and i+1 < len(args): token = int(args[i+1])
        merge_stream(user, token); return
    if cmd == "stream":
        user="guest"
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
        stream_summary(user); return
    print("Unknown command.")

if __name__ == "__main__":
    main()