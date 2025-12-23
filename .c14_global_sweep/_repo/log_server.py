# cart044_log_server.py
"""
Cart 044: Log Server (Serverless-friendly)
Universal, provenance-first logging hub:
- Logs sessions, actions, research events, token grants/grabs, attachments (AI ↔ token)
- Emits JSONL audit streams and JSON artifacts per channel
- Front-end integration: accepts simple inputs (username, action, meta JSON)
- Token awareness: ties logs to tokens and writes token visibility artifacts
- Repo-first design: everything is file-based, ready to commit/push

CLI:
  python cart044_log_server.py session start --user Kris
  python cart044_log_server.py session end --user Kris
  python cart044_log_server.py action --user Kris --channel research --event "push_artifact" --meta '{"path":"artifacts/foo.json"}'
  python cart044_log_server.py token grant --user Kris --token_id 101 --kind "research"
  python cart044_log_server.py token grab --user Guest --token_id 101
  python cart044_log_server.py ai attach --token_id 101 --desc "AI assistant attached for guidance"
  python cart044_log_server.py export overview --user Kris
"""

import os, sys, json, time, hashlib
from typing import Dict, Any

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT  = os.path.join(LOGS, "log_server_audit.jsonl")
STREAM = os.path.join(DATA, "log_stream.jsonl")
SESS   = os.path.join(DATA, "log_sessions.json")
TOKVIS = os.path.join(DATA, "token_visibility.json")

DEFAULT_SESS = {"sessions": []}
DEFAULT_TOKV = {"events": [], "tokens": {}}

def now() -> str: return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

def write_jsonl(path: str, obj: Dict[str, Any]) -> None:
    with open(path, "a", encoding="utf-8") as f: f.write(json.dumps(obj) + "\n")

def audit(entry: Dict[str, Any]) -> None:
    entry = dict(entry); entry["t"] = now()
    write_jsonl(AUDIT, entry)

def load_json(path: str, default: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(path): return default.copy()
    try:
        with open(path, "r", encoding="utf-8") as f: return json.load(f)
    except:
        return default.copy()

def save_json(path: str, obj: Dict[str, Any]) -> None:
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)

def artifact(name: str, obj: Dict[str, Any]) -> str:
    p = os.path.join(ART, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

# ---------- Session ----------
def session_start(user: str) -> Dict[str, Any]:
    s = load_json(SESS, DEFAULT_SESS)
    entry = {"user": user, "start": now(), "end": None}
    s["sessions"].append(entry); save_json(SESS, s)
    write_jsonl(STREAM, {"kind": "session.start", "user": user, "t": now()})
    audit({"action": "session.start", "user": user})
    path = artifact(f"log_session_start_{user}_{int(time.time())}", entry)
    return {"ok": True, "path": path, "session": entry}

def session_end(user: str) -> Dict[str, Any]:
    s = load_json(SESS, DEFAULT_SESS)
    ended = None
    for sess in reversed(s["sessions"]):
        if sess["user"] == user and sess["end"] is None:
            sess["end"] = now()
            ended = sess
            break
    save_json(SESS, s)
    write_jsonl(STREAM, {"kind": "session.end", "user": user, "t": now()})
    audit({"action": "session.end", "user": user, "ok": bool(ended)})
    return {"ok": bool(ended), "session": ended}

# ---------- Actions ----------
def action_log(user: str, channel: str, event: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    entry = {"kind": "action", "user": user, "channel": channel, "event": event, "meta": meta, "t": now()}
    write_jsonl(STREAM, entry)
    audit({"action": "action", "user": user, "channel": channel, "event": event})
    path = artifact(f"log_action_{channel}_{int(time.time())}", entry)
    return {"ok": True, "path": path, "entry": entry}

# ---------- Token awareness ----------
def token_event(kind: str, user: str, token_id: int, extra: Dict[str, Any]) -> Dict[str, Any]:
    tv = load_json(TOKVIS, DEFAULT_TOKV)
    ev = {"kind": kind, "user": user, "token_id": token_id, "extra": extra, "t": now()}
    tv["events"].append(ev)
    tok = tv["tokens"].setdefault(str(token_id), {"grants": 0, "grabs": 0, "attachments": []})
    if kind == "grant": tok["grants"] += 1
    if kind == "grab":  tok["grabs"]  += 1
    if kind == "attach_ai": tok["attachments"].append(extra.get("desc", "attached"))
    save_json(TOKVIS, tv)
    write_jsonl(STREAM, {"kind": f"token.{kind}", "user": user, "token_id": token_id, "t": now()})
    audit({"action": f"token.{kind}", "user": user, "token": token_id})
    path = artifact(f"log_token_{kind}_{token_id}_{int(time.time())}", ev)
    return {"ok": True, "path": path, "event": ev}

# ---------- Overview export ----------
def export_overview(user: str) -> Dict[str, Any]:
    s = load_json(SESS, DEFAULT_SESS)
    tv = load_json(TOKVIS, DEFAULT_TOKV)
    # Tail of stream
    tail = []
    if os.path.exists(STREAM):
        with open(STREAM, "r", encoding="utf-8") as f:
            lines = f.readlines()[-200:]
            tail = [json.loads(x) for x in lines]
    out = {
        "user": user,
        "sessions": [x for x in s["sessions"] if x["user"] == user][-10:],
        "token_summary": tv["tokens"],
        "stream_tail": tail
    }
    path = artifact(f"log_overview_{user}_{int(time.time())}", out)
    audit({"action": "export.overview", "user": user})
    return {"ok": True, "path": path}

# ---------- CLI ----------
def main():
    a = sys.argv[1:]
    if not a:
        print("Usage:")
        print("  session start --user U | session end --user U")
        print("  action --user U --channel C --event E --meta '{...}'")
        print("  token grant --user U --token_id N --kind K")
        print("  token grab --user U --token_id N")
        print("  ai attach --token_id N --desc '...'")
        print("  export overview --user U")
        return
    cmd = a[0]
    if cmd == "session":
        sub = a[1] if len(a) > 1 else ""
        user = "guest"
        for i,x in enumerate(a):
            if x == "--user" and i+1 < len(a): user = a[i+1]
        if sub == "start": print(json.dumps(session_start(user), indent=2)); return
        if sub == "end":   print(json.dumps(session_end(user), indent=2)); return
    if cmd == "action":
        user="guest"; channel="general"; event=""; meta={}
        for i,x in enumerate(a):
            if x == "--user" and i+1 < len(a): user = a[i+1]
            if x == "--channel" and i+1 < len(a): channel = a[i+1]
            if x == "--event" and i+1 < len(a): event = a[i+1]
            if x == "--meta" and i+1 < len(a):
                try: meta = json.loads(a[i+1])
                except: meta = {"raw": a[i+1]}
        print(json.dumps(action_log(user, channel, event, meta), indent=2)); return
    if cmd == "token":
        sub = a[1] if len(a) > 1 else ""
        user="guest"; token_id=1; kind="general"
        for i,x in enumerate(a):
            if x == "--user" and i+1 < len(a): user = a[i+1]
            if x == "--token_id" and i+1 < len(a): token_id = int(a[i+1])
            if x == "--kind" and i+1 < len(a): kind = a[i+1]
        if sub == "grant": print(json.dumps(token_event("grant", user, token_id, {"kind": kind}), indent=2)); return
        if sub == "grab":  print(json.dumps(token_event("grab", user, token_id, {}), indent=2)); return
    if cmd == "ai":
        sub = a[1] if len(a) > 1 else ""
        if sub == "attach":
            token_id=1; desc=""
            for i,x in enumerate(a):
                if x == "--token_id" and i+1 < len(a): token_id = int(a[i+1])
                if x == "--desc" and i+1 < len(a): desc = a[i+1]
            print(json.dumps(token_event("attach_ai", "system", token_id, {"desc": desc}), indent=2)); return
    if cmd == "export":
        sub = a[1] if len(a) > 1 else ""
        if sub == "overview":
            user="guest"
            for i,x in enumerate(a):
                if x == "--user" and i+1 < len(a): user = a[i+1]
            print(json.dumps(export_overview(user), indent=2)); return
    print(json.dumps({"error": "unknown command"}, indent=2))

if __name__ == "__main__":
    main()