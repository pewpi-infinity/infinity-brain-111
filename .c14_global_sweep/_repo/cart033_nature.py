# cart033_nature_study.py
"""
Cart 033: Nature Study
Models natural areas and produces maturity/enhancement plans.
Purpose:
- Area registry (name, type: forest, river, mountain, urban green)
- Maturity index (biodiversity, resilience, human access proxies)
- Enhancement planner (micro: trails, sensors; macro: restoration)
- Artifacts + audit logs

CLI:
  python cart033_nature_study.py add "River-Bend" --type river --biodiversity 0.7 --resilience 0.6 --access 0.5
  python cart033_nature_study.py index
  python cart033_nature_study.py plan "River-Bend"
"""

import sys, os, json, time

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)
DATA=os.path.join(ROOT,"data"); os.makedirs(DATA,exist_ok=True)

AUDIT=os.path.join(LOGS,"nature_study_audit.jsonl")
REG=os.path.join(DATA,"nature_registry.json")
DEFAULT={"areas":[]}

def audit(e): e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime()); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load():
    if not os.path.exists(REG): return DEFAULT.copy()
    try:
        with open(REG,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT.copy()

def save(obj):
    with open(REG,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def add(name, typ, bio, res, acc):
    r=load()
    area={"name":name,"type":typ,"biodiversity":bio,"resilience":res,"access":acc,"created":time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime())}
    r["areas"].append(area); save(r)
    audit({"action":"add","name":name,"type":typ})
    path=os.path.join(ART,f"nature_{name.replace(' ','_')}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(area,f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def index():
    r=load()
    path=os.path.join(ART,"nature_index.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"areas":r["areas"]},f,indent=2)
    audit({"action":"index","count":len(r['areas'])})
    print(json.dumps({"ok":True,"path":path,"count":len(r['areas'])}, indent=2))

def plan(name):
    r=load()
    a=next((x for x in r["areas"] if x["name"]==name),None)
    if not a: print(json.dumps({"error":"area not found"}, indent=2)); return
    # Maturity index
    maturity=round((a["biodiversity"]+a["resilience"]+a["access"])/3.0,2)
    recs=[]
    if maturity<0.5:
        recs.append({"type":"macro","action":"habitat restoration"})
    else:
        recs.append({"type":"micro","action":"add trail markers and environmental sensors"})
    out={"name":name,"maturity":maturity,"recommendations":recs}
    path=os.path.join(ART,f"nature_plan_{name.replace(' ','_')}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(out,f,indent=2)
    audit({"action":"plan","name":name,"maturity":maturity})
    print(json.dumps({"ok":True,"path":path,"maturity":maturity}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: print("Usage: add <name> --type T --biodiversity x --resilience y --access z | index | plan <name>"); return
    cmd=a[0]
    if cmd=="add":
        name=a[1]; typ="forest"; bio=0.5; res=0.5; acc=0.5
        for i,x in enumerate(a):
            if x=="--type" and i+1<len(a): typ=a[i+1]
            if x=="--biodiversity" and i+1<len(a): bio=float(a[i+1])
            if x=="--resilience" and i+1<len(a): res=float(a[i+1])
            if x=="--access" and i+1<len(a): acc=float(a[i+1])
        add(name,typ,bio,res,acc); return
    if cmd=="index": index(); return
    if cmd=="plan": 
        name=" ".join(a[1:]); plan(name); return
    print("Unknown command.")

if __name__=="__main__": main()