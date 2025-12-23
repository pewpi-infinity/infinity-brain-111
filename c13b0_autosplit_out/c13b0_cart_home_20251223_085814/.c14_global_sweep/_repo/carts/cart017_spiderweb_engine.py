# cart017_spiderweb_engine.py
"""
Cart 017: Spiderweb Engine
Builds a vectorized "spiderweb" of 20 key words around a core topic, tying user memory (history, themes) into navigable paths.

Purpose in Infinity:
- Generate neural-like pathways across research, engineering, CEO themes, etc.
- Color-code nodes to match Infinity roles (value/knowledge/growth/creativity/provenance)
- Export readable webs and suggested next steps

Capabilities:
- Word expansion: seed → 20 related tokens (heuristic)
- Vectorization (simple embedding proxy): frequency/characteristics as vectors
- Pathfinding: recommend sequences across colors and roles
- Artifacts: JSON exports; audit logs

CLI:
  python cart017_spiderweb_engine.py web "hydrogen storage"
  python cart017_spiderweb_engine.py path "hydrogen storage"
"""

import sys, os, json, time, math, random

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True)

AUDIT = os.path.join(LOGS, "spiderweb_audit.jsonl")

COLORS = [
    {"key":"gold","role":"value"},
    {"key":"blue","role":"knowledge"},
    {"key":"green","role":"growth"},
    {"key":"purple","role":"creativity"},
    {"key":"gray","role":"provenance"}
]

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def expand(seed: str, n: int = 20) -> list:
    base = seed.lower().split()
    vocab = [
        "materials","storage","compression","safety","economy","design","sensor","actuator","compute","power",
        "color","logic","provenance","growth","value","creativity","datasets","models","planner","routes"
    ]
    picks = random.sample(vocab, k=min(n, len(vocab)))
    return [seed] + picks[:n]

def vectorize(word: str) -> list:
    """
    Simple proxy embedding: normalized ord sums and length.
    """
    s = sum(ord(c) for c in word) / (len(word) or 1)
    l = len(word)
    return [round(s/200.0, 3), round(l/10.0, 3)]

def assign_color(idx: int) -> str:
    return COLORS[idx % len(COLORS)]["key"]

def web(seed: str):
    nodes = []
    words = expand(seed, 20)
    for i,w in enumerate(words):
        nodes.append({"word": w, "vec": vectorize(w), "color": assign_color(i)})
    # edges: connect seed to all, and adjacent pairs
    edges = [{"from": words[0], "to": w} for w in words[1:]] + [{"from": words[i], "to": words[i+1]} for i in range(len(words)-1)]
    out = {"seed": seed, "nodes": nodes, "edges": edges}
    audit({"action": "web", "seed": seed, "nodes": len(nodes)})
    p = os.path.join(ART, f"spiderweb_{int(time.time())}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(out, f, indent=2)
    print(json.dumps(out, indent=2)); print(f"Saved: {p}")

def path(seed: str):
    words = expand(seed, 20)
    path = []
    for i,w in enumerate(words[:10]):
        path.append({"step": i+1, "word": w, "color": assign_color(i)})
    out = {"seed": seed, "path": path}
    audit({"action":"path","seed":seed,"len":len(path)})
    p = os.path.join(ART, f"spiderpath_{int(time.time())}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(out, f, indent=2)
    print(json.dumps(out, indent=2)); print(f"Saved: {p}")

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: web <seed> | path <seed>"); return
    cmd = args[0]
    if cmd == "web": web(" ".join(args[1:])); return
    if cmd == "path": path(" ".join(args[1:])); return
    print("Unknown command.")

if __name__ == "__main__":
    main()