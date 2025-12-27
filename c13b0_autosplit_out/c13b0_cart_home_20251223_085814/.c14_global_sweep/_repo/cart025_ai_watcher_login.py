# cart025_ai_watcher_login.py
"""
Cart 025: Ai_watcher_login — Pewpi Security Terminal
Keeps Infinity safe and transparent. Shows users their clicks, where tokens are stored,
and the history generated across the system. Purely informational—no personal data beyond
a username field is handled here.

Features:
- Session manager (start/end/list)
- Activity tracker (clicks with section/action/metadata)
- Token visibility (reads token files from data/artifacts and summarizes paths)
- User history export (JSON artifacts)
- JSONL audit logs for provenance

CLI:
  python cart025_ai_watcher_login.py session start --user Kris
  python cart025_ai_watcher_login.py session end --user Kris
  python cart025_ai_watcher_login.py click --user Kris --section tokens --action view --meta "id=101"
  python cart025_ai_watcher_login.py tokens --user Kris
  python cart025_ai_watcher_login.py history --user Kris
  python cart025_ai_watcher_login.py overview --user Kris
"""

import os, sys, json, time
from typing import Dict, Any, List

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")

os.makedirs(LOGS, exist_ok=True)
os.makedirs(ART, exist_ok=True)
os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "pewpi_security_audit.jsonl")
SESSIONS = os.path.join(DATA, "pewpi_sessions.json")
ACTIVITY = os.path.join(DATA, "pewpi_activity.json")
VISIBILITY = os.path.join(DATA, "pewpi_visibility.json")

DEFAULT_SESSIONS = {"sessions": []}
DEFAULT_ACTIVITY = {"events": []}
DEFAULT_VISIBILITY = {"paths": {"artifacts": ART, "data": DATA, "logs": LOGS}, "last_scan": None}

def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

def audit(entry: Dict[str, Any]) -> None:
    entry = dict(entry)
    entry["t"] = now_iso()
    with open(AUDIT, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def load(path: str, default: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(path): return default.copy()
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return default.copy()

def save(path: str, obj: Dict[str, Any]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)

# -------- Session manager --------
def session_start(user: str) -> Dict[str, Any]:
    s = load(SESSIONS, DEFAULT_SESSIONS)
    sess = {"user": user, "start": now_iso(), "end": None}
    s["sessions"].append(sess)
    save(SESSIONS, s)
    audit({"action": "session.start", "user": user})
    path = os.path.join(ART, f"session_start_{user}_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(sess, f, indent=2)
    return {"ok": True, "path": path, "session": sess}

def session_end(user: str) -> Dict[str, Any]:
    s = load(SESSIONS, DEFAULT_SESSIONS)
    ended = None
    for sess in reversed(s["sessions"]):
        if sess["user"] == user and sess["end"] is None:
            sess["end"] = now_iso()
            ended = sess
            break
    save(SESSIONS, s)
    audit({"action": "session.end", "user": user, "ok": bool(ended)})
    return {"ok": bool(ended), "session": ended}

def session_list(user: str) -> Dict[str, Any]:
    s = load(SESSIONS, DEFAULT_SESSIONS)
    rows = [sess for sess in s["sessions"] if sess["user"] == user]
    return {"user": user, "sessions": rows[-20:]}

# -------- Activity tracker --------
def track_click(user: str, section: str, action: str, meta: str = "") -> Dict[str, Any]:
    a = load(ACTIVITY, DEFAULT_ACTIVITY)
    event = {"user": user, "section": section, "action": action, "meta": meta, "t": now_iso()}
    a["events"].append(event)
    save(ACTIVITY, a)
    audit({"action": "click", "user": user, "section": section, "action": action})
    path = os.path.join(ART, f"click_{user}_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(event, f, indent=2)
    return {"ok": True, "path": path, "event": event}

def activity_history(user: str) -> Dict[str, Any]:
    a = load(ACTIVITY, DEFAULT_ACTIVITY)
    rows = [e for e in a["events"] if e["user"] == user]
    return {"user": user, "events": rows[-100:]}

# -------- Token visibility --------
def scan_tokens() -> Dict[str, Any]:
    """
    Scans known paths for token-like JSONs:
    - artifacts/: token_*, master_*, grand_*, ziphash_* files
    - data/: wallet, registry files
    Produces counts and index entries for visibility.
    """
    v = load(VISIBILITY, DEFAULT_VISIBILITY)
    index = {"artifacts": [], "data": []}
    # artifacts
    try:
        for fn in os.listdir(ART):
            if fn.endswith(".json"):
                if any(fn.startswith(p) for p in ("token_", "master_", "grand_", "ziphash_", "grant_", "hydrogen_", "qt_")):
                    index["artifacts"].append({"file": fn, "path": os.path.join(ART, fn)})
    except Exception as e:
        index["artifacts"].append({"error": f"scan_artifacts: {e}"})
    # data
    try:
        for fn in os.listdir(DATA):
            if fn.endswith(".json"):
                if any(x in fn for x in ("wallets", "registry", "index", "queue", "uploads", "vault")):
                    index["data"].append({"file": fn, "path": os.path.join(DATA, fn)})
    except Exception as e:
        index["data"].append({"error": f"scan_data: {e}"})
    v["last_scan"] = now_iso()
    save(VISIBILITY, {"paths": v.get("paths", {"artifacts": ART, "data": DATA, "logs": LOGS}), "last_scan": v["last_scan"], "index": index})
    audit({"action": "scan.tokens", "artifacts": len(index["artifacts"]), "data": len(index["data"])})
    path = os.path.join(ART, f"pewpi_visibility_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump({"visibility": index, "paths": v["paths"], "t": v["last_scan"]}, f, indent=2)
    return {"ok": True, "path": path, "counts": {"artifacts": len(index["artifacts"]), "data": len(index["data"])}}

def user_tokens_summary(user: str) -> Dict[str, Any]:
    """
    Summarize token-related artifacts created near this user's actions (heuristic: last scan only).
    """
    vis = load(VISIBILITY, DEFAULT_VISIBILITY)
    idx = vis.get("index", {"artifacts": [], "data": []})
    tokens = [x for x in idx.get("artifacts", []) if "token_" in x.get("file","") or "ziphash_" in x.get("file","")]
    masters = [x for x in idx.get("artifacts", []) if x.get("file","").startswith("master_")]
    grands = [x for x in idx.get("artifacts", []) if x.get("file","").startswith("grand_")]
    wallets = [x for x in idx.get("data", []) if "wallets" in x.get("file","")]
    summary = {
        "user": user,
        "counts": {"tokens": len(tokens), "masters": len(masters), "grands": len(grands), "wallets": len(wallets)},
        "paths_hint": vis.get("paths", {"artifacts": ART, "data": DATA, "logs": LOGS})
    }
    audit({"action": "summary.tokens", "user": user, "counts": summary["counts"]})
    path = os.path.join(ART, f"pewpi_tokens_summary_{user}_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(summary, f, indent=2)
    return {"ok": True, "path": path, "summary": summary}

# -------- Overview terminal --------
def overview(user: str) -> Dict[str, Any]:
    """
    Produces a single artifact with:
    - Latest session info
    - Last 25 activity events
    - Token visibility counts and paths
    This can power a Pewpi Security terminal in the SPA.
    """
    sess = session_list(user)["sessions"]
    acts = activity_history(user)["events"][-25:]
    vis = user_tokens_summary(user)["summary"]
    out = {"user": user, "session_tail": sess[-5:], "activity_tail": acts, "visibility": vis}
    audit({"action": "overview", "user": user})
    path = os.path.join(ART, f"pewpi_overview_{user}_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(out, f, indent=2)
    return {"ok": True, "path": path, "overview": out}

# -------- CLI Dispatcher --------
def main():
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print("  session start --user U | session end --user U | session list --user U")
        print("  click --user U --section S --action A [--meta 'k=v']")
        print("  tokens --user U | history --user U | overview --user U | scan")
        return
    cmd = args[0]
    if cmd == "session":
        sub = args[1] if len(args) > 1 else ""
        user = "guest"
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
        if sub == "start":
            res = session_start(user)
            print(json.dumps(res, indent=2)); return
        if sub == "end":
            res = session_end(user)
            print(json.dumps(res, indent=2)); return
        if sub == "list":
            res = session_list(user)
            print(json.dumps(res, indent=2)); return
        print("Unknown session subcommand."); return
    if cmd == "click":
        user="guest"; section="home"; action="view"; meta=""
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
            if a == "--section" and i+1 < len(args): section = args[i+1]
            if a == "--action" and i+1 < len(args): action = args[i+1]
            if a == "--meta" and i+1 < len(args): meta = args[i+1]
        res = track_click(user, section, action, meta)
        print(json.dumps(res, indent=2)); return
    if cmd == "tokens":
        user="guest"
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
        # force a fresh scan before summarizing
        scan_tokens()
        res = user_tokens_summary(user)
        print(json.dumps(res, indent=2)); return
    if cmd == "history":
        user="guest"
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
        res = activity_history(user)
        print(json.dumps(res, indent=2)); return
    if cmd == "overview":
        user="guest"
        for i,a in enumerate(args):
            if a == "--user" and i+1 < len(args): user = args[i+1]
        # fresh scan helps keep visibility current
        scan_tokens()
        res = overview(user)
        print(json.dumps(res, indent=2)); return
    if cmd == "scan":
        res = scan_tokens()
        print(json.dumps(res, indent=2)); return
    print("Unknown command.")

if __name__ == "__main__":
    main()