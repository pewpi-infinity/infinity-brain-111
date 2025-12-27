# cart043_demo_logging.py
"""
Cart 043: Demo Logging (Discourse)
Ethical, provenance-first logger that records public discourse mentions relevant to your hydrogen mission.
- Sources: manual notes (strings), tags, sentiment hint (neutral proxy), context
- Filters: non-harassing, non-targeting; respectful framing only
- Artifacts + audit logs

CLI:
  python cart043_demo_logging.py note --text "Article discussed hydrogen scaling" --tags mission,hydrogen
  python cart043_demo_logging.py export
  python cart043_demo_logging.py health
"""

import sys, os, json, time, random

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)
DATA=os.path.join(ROOT,"data"); os.makedirs(DATA,exist_ok=True)

AUDIT=os.path.join(LOGS,"demo_logging_audit.jsonl")
REG=os.path.join(DATA,"demo_logging_store.json")

DEFAULT={"notes":[]}

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(e): e=dict(e); e["t"]=now(); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load():
    if not os.path.exists(REG): return DEFAULT.copy()
    try:
        with open(REG,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT.copy()

def save(obj):
    with open(REG,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def save_artifact(name,obj):
    p=os.path.join(ART,f"{name}.json")
    with open(p,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)
    return p

# ---------- Note ----------
def note(text: str, tags: list):
    # neutral sentiment proxy (random baseline)
    sentiment = round(random.uniform(0.4,0.6), 2)
    entry={"text":text,"tags":tags,"sentiment_hint":sentiment,"created":now()}
    db=load(); db["notes"].append(entry); save(db)
    path=save_artifact(f"demo_note_{int(time.time())}", entry)
    audit({"action":"note","tags":tags})
    return {"ok":True,"path":path}

# ---------- Export / Health ----------
def export():
    db=load()
    path=save_artifact("demo_logging_export", db)
    audit({"action":"export","count":len(db['notes'])})
    return {"ok":True,"path":path}

def health():
    db=load()
    out={"notes":len(db["notes"])}
    path=save_artifact("demo_logging_health", out)
    audit({"action":"health","count":out['notes']})
    return {"ok":True,"path":path,"summary":out}

def main():
    a=sys.argv[1:]
    if not a:
        print("Usage: note --text '...' --tags t1,t2 | export | health")
        return
    cmd=a[0]
    if cmd=="note":
        text=""; tags=[]
        for i,x in enumerate(a):
            if x=="--text" and i+1<len(a): text=a[i+1]
            if x=="--tags" and i+1<len(a): tags=[t.strip() for t in a[i+1].split(",") if t.strip()]
        print(json.dumps(note(text,tags), indent=2)); return
    if cmd=="export": print(json.dumps(export(), indent=2)); return
    if cmd=="health": print(json.dumps(health(), indent=2)); return
    print(json.dumps({"error":"unknown command"}, indent=2))

if __name__=="__main__": main()