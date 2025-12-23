# cart028_machines.py
"""
Cart 028: Machines
Registry and capability map across major domains (governmental, civil, Infinity, OS ecosystems).
Purpose:
- Organize machine categories and roles (civil infra, computing, governance tools, Infinity modules)
- Capability lenses: compute, storage, network, safety, provenance
- Crosswalk to Infinity modules and artifacts
- Safe: purely informational modeling

CLI:
  python cart028_machines.py list
  python cart028_machines.py add "Compute-Node" --domain "computing" --cap compute,storage,network --module cart003_computers
  python cart028_machines.py map --domain computing
  python cart028_machines.py export
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs"); os.makedirs(LOGS, exist_ok=True)
ART = os.path.join(ROOT, "artifacts"); os.makedirs(ART, exist_ok=True)
DATA = os.path.join(ROOT, "data"); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "machines_audit.jsonl")
REG = os.path.join(DATA, "machines_registry.json")
DEFAULT = {"machines": []}

CAP_LENSES = ["compute","storage","network","safety","provenance","governance","energy","ecosystem"]

def audit(e): 
    e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime())
    with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load(): 
    if not os.path.exists(REG): return DEFAULT.copy()
    try: 
        with open(REG,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT.copy()

def save(obj): 
    with open(REG,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def list_machines():
    r=load()
    print(json.dumps({"count":len(r["machines"]), "machines": r["machines"][-20:]}, indent=2))

def add_machine(name, domain, caps, module):
    r=load()
    entry={"name":name,"domain":domain,"caps":caps,"module_ref":module,"created":time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime())}
    r["machines"].append(entry); save(r); audit({"action":"add","name":name,"domain":domain})
    path=os.path.join(ART,f"machine_{name}.json"); 
    with open(path,"w",encoding="utf-8") as f: json.dump(entry,f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def map_domain(domain):
    r=load()
    rows=[m for m in r["machines"] if m["domain"]==domain]
    grid={"domain":domain,"lens":CAP_LENSES,"machines":rows}
    path=os.path.join(ART,f"machines_map_{domain}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(grid,f,indent=2)
    audit({"action":"map","domain":domain,"count":len(rows)})
    print(json.dumps({"ok":True,"path":path,"count":len(rows)}, indent=2))

def export_all():
    r=load()
    path=os.path.join(ART,"machines_export.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(r,f,indent=2)
    audit({"action":"export","count":len(r['machines'])})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: 
        print("Usage: list | add <name> --domain D --cap c1,c2 --module cartXXX | map --domain D | export"); return
    cmd=a[0]
    if cmd=="list": list_machines(); return
    if cmd=="add":
        name=a[1] if len(a)>1 else "Machine"
        domain="computing"; caps=[]; module="cart003_computers"
        for i,x in enumerate(a):
            if x=="--domain" and i+1<len(a): domain=a[i+1]
            if x=="--cap" and i+1<len(a): caps=[y.strip() for y in a[i+1].split(",") if y.strip()]
            if x=="--module" and i+1<len(a): module=a[i+1]
        add_machine(name,domain,caps,module); return
    if cmd=="map":
        domain="computing"
        for i,x in enumerate(a):
            if x=="--domain" and i+1<len(a): domain=a[i+1]
        map_domain(domain); return
    if cmd=="export": export_all(); return
    print("Unknown command.")

if __name__=="__main__": main()