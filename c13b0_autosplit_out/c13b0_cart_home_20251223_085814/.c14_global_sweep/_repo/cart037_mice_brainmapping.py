# cart037_mice_brainmapping.py
"""
Cart 037: Mice Brain Mapping (Neuromorphic Research, Safe)
Purpose:
- Build neuromorphic vector representations (abstract features) for research
- Feature banks: sensory vectors, temporal dynamics, connectivity proxies
- Ethical boundaries: no invasive or mind-reading capabilities; research-only modeling
- Connect outputs to drones missions (cart034 overlays) and genetics substrate (cart038 metadata)

Key features:
- Sensory feature vectors: sight, sound, tactile (normalized arrays)
- Temporal dynamics simulation: sequence of states with decay
- Connectivity proxies: graph metrics (degree, clustering proxy)
- Artifact exports + audit logs

CLI:
  python cart037_mice_brainmapping.py features --kind sight --size 32
  python cart037_mice_brainmapping.py temporal --length 50 --decay 0.9
  python cart037_mice_brainmapping.py connectivity --nodes 10 --p 0.2
  python cart037_mice_brainmapping.py export bank
"""

import sys, os, json, time, random

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "mice_brainmapping_audit.jsonl")
BANK  = os.path.join(DATA, "neuromorphic_bank.json")
DEFAULT_BANK = {"features": [], "temporal": [], "graphs": []}

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(e): e=dict(e); e["t"]=now(); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load_bank():
    if not os.path.exists(BANK): return DEFAULT_BANK.copy()
    try:
        with open(BANK,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_BANK.copy()

def save_bank(b):
    with open(BANK,"w",encoding="utf-8") as f: json.dump(b,f,indent=2)

def save_artifact(name,obj):
    p=os.path.join(ART,f"{name}.json")
    with open(p,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)
    return p

# ---------- Features ----------
def features(kind: str, size: int):
    random.seed(42 + hash(kind)%1000)
    vec=[round(random.random(), 5) for _ in range(size)]
    out={"kind":kind,"size":size,"vector":vec[:64]}
    b=load_bank(); b["features"].append(out); save_bank(b)
    path=save_artifact(f"neuro_features_{kind}_{size}", out)
    audit({"action":"features","kind":kind,"size":size})
    print(json.dumps({"ok":True,"path":path}, indent=2))

# ---------- Temporal dynamics ----------
def temporal(length: int, decay: float):
    seq=[]; v=1.0
    for i in range(length):
        v *= decay
        seq.append(round(v,6))
    out={"length":length,"decay":decay,"sequence":seq[:64]}
    b=load_bank(); b["temporal"].append(out); save_bank(b)
    path=save_artifact(f"neuro_temporal_{length}_{decay}", out)
    audit({"action":"temporal","length":length,"decay":decay})
    print(json.dumps({"ok":True,"path":path}, indent=2))

# ---------- Connectivity proxies ----------
def connectivity(nodes: int, p: float):
    edges=[]
    for i in range(nodes):
        for j in range(i+1,nodes):
            if random.random() < p:
                edges.append([i,j])
    deg=[0]*nodes
    for i,j in edges:
        deg[i]+=1; deg[j]+=1
    clustering_proxy = round(sum(deg)/max(1,nodes)/max(1,len(edges)), 4)
    out={"nodes":nodes,"p":p,"edges_count":len(edges),"deg":deg[:64],"clustering_proxy":clustering_proxy}
    b=load_bank(); b["graphs"].append(out); save_bank(b)
    path=save_artifact(f"neuro_connect_{nodes}_{p}", out)
    audit({"action":"connectivity","nodes":nodes,"edges":len(edges)})
    print(json.dumps({"ok":True,"path":path}, indent=2))

# ---------- Export bank ----------
def export_bank():
    b=load_bank()
    path=save_artifact("neuromorphic_bank_export", b)
    audit({"action":"export.bank","counts":{"features":len(b['features']),"temporal":len(b['temporal']),"graphs":len(b['graphs'])}})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a:
        print("Usage: features --kind sight|sound|tactile --size n | temporal --length n --decay d | connectivity --nodes n --p p | export bank")
        return
    cmd=a[0]
    if cmd=="features":
        kind="sight"; size=32
        for i,x in enumerate(a):
            if x=="--kind" and i+1<len(a): kind=a[i+1]
            if x=="--size" and i+1<len(a): size=int(a[i+1])
        features(kind,size); return
    if cmd=="temporal":
        length=50; decay=0.9
        for i,x in enumerate(a):
            if x=="--length" and i+1<len(a): length=int(a[i+1])
            if x=="--decay" and i+1<len(a): decay=float(a[i+1])
        temporal(length,decay); return
    if cmd=="connectivity":
        nodes=10; p=0.2
        for i,x in enumerate(a):
            if x=="--nodes" and i+1<len(a): nodes=int(a[i+1])
            if x=="--p" and i+1<len(a): p=float(a[i+1])
        connectivity(nodes,p); return
    if cmd=="export" and len(a)>1 and a[1]=="bank":
        export_bank(); return
    print("Unknown command.")

if __name__=="__main__": main()