# cart035_signal_trace.py
"""
Cart 035: Signal Trace (Research)
Purpose:
- Model digital signal paths and provenance graphs
- Extract safe features (SNR proxies, bandwidth windows, temporal markers)
- Align with drones mission plans (cart034) and RF generation (cart036)
- Artifacts + audit logs

Key features:
- Path graph builder: nodes (sources, filters, sinks), edges with metadata
- SNR proxy from stream stats (no operational RF guidance)
- Bandwidth window cataloging
- Timeline markers and trace export

CLI:
  python cart035_signal_trace.py graph new --name "Trace-A" --nodes "source,filter1,filter2,sink"
  python cart035_signal_trace.py graph link --name "Trace-A" --edge "source->filter1" --meta "type=lowpass"
  python cart035_signal_trace.py snr --name "Trace-A" --mean 1.0 --std 0.2
  python cart035_signal_trace.py bandwidth --name "Trace-A" --windows "100-200,300-350"
  python cart035_signal_trace.py export --name "Trace-A"
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "signal_trace_audit.jsonl")
TRACES = os.path.join(DATA, "signal_traces.json")
DEFAULT_TRACES = {"traces": {}}

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(e): e=dict(e); e["t"]=now(); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load():
    if not os.path.exists(TRACES): return DEFAULT_TRACES.copy()
    try:
        with open(TRACES,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_TRACES.copy()

def save(obj):
    with open(TRACES,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def save_artifact(name,obj):
    p=os.path.join(ART,f"{name}.json")
    with open(p,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)
    return p

# ---------- Graph building ----------
def graph_new(name: str, nodes: list):
    db=load()
    db["traces"][name] = {"name": name, "nodes": nodes, "edges": [], "snr": None, "bandwidth": [], "timeline": [], "created": now()}
    save(db)
    audit({"action":"graph.new","name":name,"nodes":len(nodes)})
    path=save_artifact(f"signal_graph_{name}", db["traces"][name])
    print(json.dumps({"ok":True,"path":path}, indent=2))

def graph_link(name: str, edge: str, meta: str):
    db=load()
    tr=db["traces"].get(name)
    if not tr: print(json.dumps({"error":"trace not found"}, indent=2)); return
    try:
        a,b = edge.split("->")
        tr["edges"].append({"from": a, "to": b, "meta": meta})
        save(db)
        audit({"action":"graph.link","name":name,"edge":edge})
        path=save_artifact(f"signal_graph_{name}", tr)
        print(json.dumps({"ok":True,"path":path}, indent=2))
    except:
        print(json.dumps({"error":"edge format"}, indent=2))

# ---------- SNR proxy ----------
def snr_proxy(mean: float, std: float) -> float:
    if std <= 0: return 999.0
    return round(mean / std, 3)

def set_snr(name: str, mean: float, std: float):
    db=load()
    tr=db["traces"].get(name)
    if not tr: print(json.dumps({"error":"trace not found"}, indent=2)); return
    tr["snr"] = {"mean": mean, "std": std, "snr_proxy": snr_proxy(mean,std)}
    save(db)
    audit({"action":"snr","name":name,"snr":tr["snr"]["snr_proxy"]})
    path=save_artifact(f"signal_snr_{name}", tr["snr"])
    print(json.dumps({"ok":True,"path":path,"snr":tr["snr"]["snr_proxy"]}, indent=2))

# ---------- Bandwidth windows ----------
def parse_windows(s: str):
    ws=[]
    for w in s.split(","):
        w=w.strip()
        if "-" in w:
            try:
                a,b = w.split("-")
                ws.append({"min": float(a), "max": float(b)})
            except: pass
    return ws

def set_bandwidth(name: str, windows: str):
    db=load()
    tr=db["traces"].get(name)
    if not tr: print(json.dumps({"error":"trace not found"}, indent=2)); return
    tr["bandwidth"] = parse_windows(windows)
    save(db)
    audit({"action":"bandwidth","name":name,"count":len(tr["bandwidth"])})
    path=save_artifact(f"signal_bandwidth_{name}", tr["bandwidth"])
    print(json.dumps({"ok":True,"path":path,"count":len(tr['bandwidth'])}, indent=2))

# ---------- Export ----------
def export_trace(name: str):
    db=load()
    tr=db["traces"].get(name)
    if not tr: print(json.dumps({"error":"trace not found"}, indent=2)); return
    path=save_artifact(f"signal_export_{name}", tr)
    audit({"action":"export","name":name})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a:
        print("Usage: graph new --name N --nodes a,b,c | graph link --name N --edge a->b --meta 'type=lowpass' | snr --name N --mean m --std s | bandwidth --name N --windows 'f1-f2,...' | export --name N")
        return
    cmd=a[0]
    if cmd=="graph":
        sub=a[1] if len(a)>1 else ""
        if sub=="new":
            name="Trace"; nodes=[]
            for i,x in enumerate(a):
                if x=="--name" and i+1<len(a): name=a[i+1]
                if x=="--nodes" and i+1<len(a): nodes=[n.strip() for n in a[i+1].split(",") if n.strip()]
            graph_new(name,nodes); return
        if sub=="link":
            name="Trace"; edge="a->b"; meta=""
            for i,x in enumerate(a):
                if x=="--name" and i+1<len(a): name=a[i+1]
                if x=="--edge" and i+1<len(a): edge=a[i+1]
                if x=="--meta" and i+1<len(a): meta=a[i+1]
            graph_link(name,edge,meta); return
    if cmd=="snr":
        name="Trace"; mean=1.0; std=0.2
        for i,x in enumerate(a):
            if x=="--name" and i+1<len(a): name=a[i+1]
            if x=="--mean" and i+1<len(a): mean=float(a[i+1])
            if x=="--std" and i+1<len(a): std=float(a[i+1])
        set_snr(name,mean,std); return
    if cmd=="bandwidth":
        name="Trace"; windows="100-200"
        for i,x in enumerate(a):
            if x=="--name" and i+1<len(a): name=a[i+1]
            if x=="--windows" and i+1<len(a): windows=a[i+1]
        set_bandwidth(name,windows); return
    if cmd=="export":
        name="Trace"
        for i,x in enumerate(a):
            if x=="--name" and i+1<len(a): name=a[i+1]
        export_trace(name); return
    print("Unknown command.")

if __name__=="__main__": main()