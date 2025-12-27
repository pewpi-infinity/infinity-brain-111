# cart031_exoskeleton_crew.py
"""
Cart 031: Exoskeleton Crew
Builds the exoskeleton mind: redundancy for programs/modules, backup links in a hydrogen “cloud” pointer model.
Purpose:
- Redundancy maps: which module backups which, with priorities
- Backup pointers: artifact paths + remote-safe pointers (abstract)
- Health checks: simple availability flags
- Artifacts + audit logs

CLI:
  python cart031_exoskeleton_crew.py map
  python cart031_exoskeleton_crew.py add --module cart027_robotics_factory --backs cart010_components,cart003_computers
  python cart031_exoskeleton_crew.py health
  python cart031_exoskeleton_crew.py export
"""

import sys, os, json, time

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)
DATA=os.path.join(ROOT,"data"); os.makedirs(DATA,exist_ok=True)

AUDIT=os.path.join(LOGS,"exoskeleton_audit.jsonl")
MAP=os.path.join(DATA,"exoskeleton_map.json")
DEFAULT={"links":[]}

def audit(e): e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime()); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load(): 
    if not os.path.exists(MAP): return DEFAULT.copy()
    try: 
        with open(MAP,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT.copy()

def save(obj): 
    with open(MAP,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def base_map():
    r=load()
    if not r["links"]:
        r["links"]=[
            {"module":"cart010_components","backs":["cart029_crystal_truths","cart030_superchemistry_fireproof"],"priority":1},
            {"module":"cart027_robotics_factory","backs":["cart010_components","cart003_computers"],"priority":1},
            {"module":"cart019_token_generation","backs":["cart007_tokens","cart021_token_tiers"],"priority":1}
        ]
        save(r)
    audit({"action":"map","count":len(r["links"])})
    path=os.path.join(ART,"exoskeleton_map.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(r,f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def add(module, backs):
    r=load()
    r["links"].append({"module":module,"backs":backs,"priority":1})
    save(r); audit({"action":"add","module":module,"count":len(backs)})
    print(json.dumps({"ok":True,"module":module}, indent=2))

def health():
    r=load()
    checks=[]
    for link in r["links"]:
        # Heuristic: check if ART has any files referencing module key
        present = any(link["module"].split("_")[0] in fn for fn in os.listdir(ART) if fn.endswith(".json"))
        checks.append({"module":link["module"],"available_hint":present})
    path=os.path.join(ART,"exoskeleton_health.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"checks":checks},f,indent=2)
    audit({"action":"health","count":len(checks)})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def export():
    r=load()
    path=os.path.join(ART,"exoskeleton_export.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(r,f,indent=2)
    audit({"action":"export"})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: print("Usage: map | add --module M --backs m1,m2 | health | export"); return
    cmd=a[0]
    if cmd=="map": base_map(); return
    if cmd=="add":
        module="cartXXX"; backs=[]
        for i,x in enumerate(a):
            if x=="--module" and i+1<len(a): module=a[i+1]
            if x=="--backs" and i+1<len(a): backs=[b.strip() for b in a[i+1].split(",")]
        add(module,backs); return
    if cmd=="health": health(); return
    if cmd=="export": export(); return
    print("Unknown command.")

if __name__=="__main__": main()