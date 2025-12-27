# cart032_ecosystems_system.py
"""
Cart 032: Ecosystems System
System check across communities, governance, computing; recommends micro vs macro adjustments.
Purpose:
- Ingest module artifacts and summarize health/impact
- Scoring heuristics: activity, provenance, diversity, performance proxy
- Recommendations: micro (tune params) vs macro (refactor workflows)
- Artifacts + audit logs

CLI:
  python cart032_ecosystems_system.py scan
  python cart032_ecosystems_system.py assess
  python cart032_ecosystems_system.py recommend
"""

import sys, os, json, time, random

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)
DATA=os.path.join(ROOT,"data"); os.makedirs(DATA,exist_ok=True)

AUDIT=os.path.join(LOGS,"ecosystems_audit.jsonl")

def audit(e): e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime()); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def scan():
    idx={"artifacts":[]}
    for fn in os.listdir(ART):
        if fn.endswith(".json"):
            idx["artifacts"].append(fn)
    path=os.path.join(ART,"ecosystems_scan.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(idx,f,indent=2)
    audit({"action":"scan","count":len(idx['artifacts'])})
    print(json.dumps({"ok":True,"path":path,"count":len(idx["artifacts"])}, indent=2))

def assess():
    # Heuristic scores from artifact presence
    scan_path=os.path.join(ART,"ecosystems_scan.json")
    try:
        with open(scan_path,"r",encoding="utf-8") as f: idx=json.load(f)
    except:
        idx={"artifacts":[]}
    modules=set(x.split("_")[0] for x in idx["artifacts"])
    diversity=len(modules)
    activity=len(idx["artifacts"])
    provenance=sum(1 for x in idx["artifacts"] if "audit" not in x)
    perf=random.uniform(0.4,0.9)
    out={"diversity":diversity,"activity":activity,"provenance_hint":provenance,"perf_proxy":round(perf,2)}
    path=os.path.join(ART,"ecosystems_assess.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(out,f,indent=2)
    audit({"action":"assess","diversity":diversity,"activity":activity})
    print(json.dumps({"ok":True,"path":path,"assess":out}, indent=2))

def recommend():
    # Use assess to choose micro vs macro
    try:
        with open(os.path.join(ART,"ecosystems_assess.json"),"r",encoding="utf-8") as f: a=json.load(f)
    except:
        a={"diversity":0,"activity":0,"perf_proxy":0.5}
    recs=[]
    if a["activity"]>50 and a["perf_proxy"]<0.6:
        recs.append({"type":"micro","module":"cart027_robotics_factory","action":"tune fuel sequencing, increase purple regen"})
    if a["diversity"]<10:
        recs.append({"type":"macro","module":"cart010_components","action":"expand component library and link to new devices"})
    recs.append({"type":"micro","module":"cart032_ecosystems_system","action":"increase scan frequency"})
    path=os.path.join(ART,"ecosystems_recommend.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"recs":recs,"assess":a},f,indent=2)
    audit({"action":"recommend","count":len(recs)})
    print(json.dumps({"ok":True,"path":path,"count":len(recs)}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: print("Usage: scan | assess | recommend"); return
    cmd=a[0]
    if cmd=="scan": scan(); return
    if cmd=="assess": assess(); return
    if cmd=="recommend": recommend(); return
    print("Unknown command.")

if __name__=="__main__": main()