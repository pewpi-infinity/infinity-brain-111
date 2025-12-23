# cart013_mercury_aluminum_growth.py
"""
Cart 013: Mercury–Aluminum Growth Module
“The robot brain” that constantly gathers what it needs to build better robots, parts, and software.

Purpose in Infinity:
- Maintain a safe, curated corpus of component and design knowledge
- Discover and normalize new entries from whitelisted sources (metadata only)
- Deduplicate, score relevance, and propose upgrade plans for Components/Engineering carts
- Never includes hazardous operational instructions

Capabilities:
- Whitelist URL metadata fetch (title/desc only; no scraping of risky content)
- Component schema normalization (sensors/actuators/compute/power)
- Relevance scoring by tags (“robotics”, “compute”, “sensor”, “power”)
- Plan export for cart010_components and cart002_engineering
- Audit logs

CLI:
  python cart013_mercury_aluminum_growth.py ingest "https://example.com/spec"
  python cart013_mercury_aluminum_growth.py list
  python cart013_mercury_aluminum_growth.py plan
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "mag_audit.jsonl")
CORPUS = os.path.join(DATA, "mag_corpus.json")

DEFAULT_CORPUS = {"items": []}
WHITELIST = [
    # Populate with safe vendor/spec/reference pages you trust
    "example.com", "docs.python.org", "developer.mozilla.org"
]

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_corpus() -> dict:
    if not os.path.exists(CORPUS): return DEFAULT_CORPUS.copy()
    try:
        with open(CORPUS, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_CORPUS.copy()

def save_corpus(c: dict):
    with open(CORPUS, "w", encoding="utf-8") as f: json.dump(c, f, indent=2)

def domain_of(url: str) -> str:
    try:
        return url.split("//",1)[1].split("/",1)[0]
    except:
        return ""

def allowed(url: str) -> bool:
    dom = domain_of(url).lower()
    return any(dom.endswith(w) or dom == w for w in WHITELIST)

def fetch_metadata(url: str) -> dict:
    """
    Safe metadata fetch: only records the URL and a placeholder title.
    (In production, add a safe HEAD or minimal GET with text/plain fallback.)
    """
    return {"url": url, "title": f"Spec: {domain_of(url)}", "desc": "Metadata only (safe corpus entry)"}

def normalize_to_component(meta: dict) -> dict:
    # Naive tag classifier from URL domain (extend with NLP later)
    tags = []
    dom = domain_of(meta["url"])
    if "dev" in dom or "docs" in dom: tags.extend(["compute", "software"])
    if "example" in dom: tags.append("sensor")
    return {
        "key": f"comp_{int(time.time())}",
        "source": meta["url"],
        "title": meta["title"],
        "desc": meta["desc"],
        "tags": sorted(set(tags))
    }

def relevance_score(comp: dict) -> float:
    base = 0.0
    for t in comp.get("tags", []):
        if t in ("sensor","actuator"): base += 1.0
        if t == "compute": base += 0.8
        if t == "power": base += 0.6
        if t == "software": base += 0.5
    return round(base, 2)

def ingest(url: str):
    if not allowed(url):
        print(json.dumps({"error": "domain not whitelisted"}, indent=2)); return
    meta = fetch_metadata(url)
    comp = normalize_to_component(meta)
    comp["score"] = relevance_score(comp)
    c = load_corpus()
    c["items"].append(comp)
    save_corpus(c)
    audit({"action": "ingest", "url": url, "score": comp["score"]})
    path = os.path.join(ART, f"mag_ingest_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(comp, f, indent=2)
    print(json.dumps({"ok": True, "path": path, "comp": comp}, indent=2))

def list_items():
    c = load_corpus()
    print(json.dumps({"count": len(c["items"]), "items": c["items"][-10:]}, indent=2))

def plan_upgrades():
    c = load_corpus()
    top = sorted(c["items"], key=lambda x: x.get("score",0), reverse=True)[:10]
    plan = {"targets": [{"cart": "cart010_components", "item": i} for i in top]}
    path = os.path.join(ART, "mag_plan.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(plan, f, indent=2)
    audit({"action": "plan", "count": len(top)})
    print(json.dumps({"ok": True, "path": path, "count": len(top)}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: ingest <url> | list | plan"); return
    cmd = args[0]
    if cmd == "list": list_items(); return
    if cmd == "plan": plan_upgrades(); return
    if cmd == "ingest": ingest(args[1]); return
    print("Unknown command.")

if __name__ == "__main__":
    main()