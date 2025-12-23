# cart006_python.py
"""
Cart 006: Python Module
An “everything Python” toolbox for Infinity. Provides:
- Environment introspection (versions, packages)
- Code runner (safe subset, no shell)
- Package manifest reader (requirements.txt)
- Snippet library (logging, CLI, web server, data model)
- Simple test runner (doctest-like)
- Artifact export and audit logs
- CLI:
    python cart006_python.py info
    python cart006_python.py run "print(2+2)"
    python cart006_python.py reqs ./requirements.txt
    python cart006_python.py snippet logging
    python cart006_python.py test "2+2==4"
"""

import sys, os, json, platform, re, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
os.makedirs(LOGS, exist_ok=True)
os.makedirs(ART, exist_ok=True)
AUDIT = os.path.join(LOGS, "python_audit.jsonl")

SNIPPETS = {
    "logging": "import logging\nlogging.basicConfig(level=logging.INFO)\nlog=logging.getLogger('app')\nlog.info('ready')\n",
    "cli": "import argparse\np=argparse.ArgumentParser('tool')\np.add_argument('--flag', action='store_true')\na=p.parse_args()\nprint('flag', a.flag)\n",
    "web_server": "from http.server import BaseHTTPRequestHandler, HTTPServer\nclass H(BaseHTTPRequestHandler):\n    def do_GET(self):\n        self.send_response(200); self.end_headers(); self.wfile.write(b'Hello')\nHTTPServer(('0.0.0.0',8080), H).serve_forever()\n",
    "data_model": "class Item:\n    def __init__(self,id,name): self.id=id; self.name=name\n    def to_dict(self): return {'id':self.id,'name':self.name}\n"
}

def audit(entry: dict):
    entry = dict(entry)
    entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def save_artifact(name: str, obj: dict) -> str:
    path = os.path.join(ART, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return path

def info():
    data = {
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "implementation": platform.python_implementation(),
        "executable": sys.executable,
        "argv": sys.argv
    }
    audit({"action": "info"})
    path = save_artifact("python_info", data)
    print(json.dumps(data, indent=2)); print(f"Saved: {path}")

SAFE_BUILTINS = {"print": print, "len": len, "range": range, "sum": sum, "min": min, "max": max}

def run(code: str):
    # Safe runner: no __import__, no open, no os
    audit({"action": "run"})
    env = {"__builtins__": SAFE_BUILTINS}
    out = {"stdout": [], "result": None, "error": None}
    def safe_print(*args, **kwargs):
        s = " ".join(str(a) for a in args)
        out["stdout"].append(s)
    env["print"] = safe_print
    try:
        result = eval(code, env) if re.match(r"^[^;\n]+$", code) else None
        if result is not None: out["result"] = result
        else: exec(code, env)
    except Exception as e:
        out["error"] = str(e)
    path = save_artifact("python_run", out)
    print(json.dumps(out, indent=2)); print(f"Saved: {path}")

def reqs(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f: lines = [l.strip() for l in f if l.strip()]
        data = {"requirements": lines}
        audit({"action": "reqs", "path": path})
        p = save_artifact("python_requirements", data)
        print(json.dumps(data, indent=2)); print(f"Saved: {p}")
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))

def snippet(kind: str):
    s = SNIPPETS.get(kind)
    if not s:
        print("Available:", ", ".join(SNIPPETS.keys())); return
    data = {"kind": kind, "snippet": s}
    audit({"action": "snippet", "kind": kind})
    p = save_artifact(f"python_snippet_{kind}", data)
    print(json.dumps({"ok": True, "path": p}, indent=2))

def test(expr: str):
    ok = False
    try: ok = bool(eval(expr, {"__builtins__": SAFE_BUILTINS}))
    except Exception as e: return print(json.dumps({"ok": False, "error": str(e)}, indent=2))
    audit({"action": "test", "expr": expr, "ok": ok})
    print(json.dumps({"ok": ok}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: info | run <code> | reqs <path> | snippet <kind> | test <expr>"); return
    cmd = args[0]
    if cmd == "info": info()
    elif cmd == "run": run(args[1] if len(args) > 1 else "print('hello')")
    elif cmd == "reqs": reqs(args[1] if len(args) > 1 else "./requirements.txt")
    elif cmd == "snippet": snippet(args[1] if len(args) > 1 else "logging")
    elif cmd == "test": test(args[1] if len(args) > 1 else "1==1")
    else: print("Unknown command.")

if __name__ == "__main__":
    main()