# cart029_crystal_truths.py
"""
Cart 029: Crystal Truths
Knowledge cart for crystals (structure, properties) with safe computational estimators.
Purpose:
- Lattice catalog (FCC/BCC/HCP, ruby, diamond, sapphire proxies)
- Property heuristics: hardness, band gap proxy, refractive index proxy
- Signal modeling: simple scattering/attenuation estimates
- Artifacts + audit logs

CLI:
  python cart029_crystal_truths.py catalog
  python cart029_crystal_truths.py estimate diamond --props hardness,bandgap,refractive
  python cart029_crystal_truths.py signal diamond --freq 2.4e9 --thickness 0.001
"""

import sys, os, json, time, math

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)

AUDIT=os.path.join(LOGS,"crystal_truths_audit.jsonl")

def audit(e): e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime()); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

CATALOG=[
    {"key":"diamond","lattice":"FCC","notes":"sp3; very high hardness; wide band gap (proxy only)"},
    {"key":"ruby","lattice":"trigonal","notes":"Al2O3 with Cr; optical activity; proxy only"},
    {"key":"sapphire","lattice":"trigonal","notes":"Al2O3; hard; optical window (proxy)"},
    {"key":"silicon","lattice":"diamond","notes":"semiconductor baseline"}
]

def hardness_proxy(key): 
    return {"diamond":10,"ruby":9,"sapphire":9,"silicon":7}.get(key,5)

def bandgap_proxy(key):
    return {"diamond":5.5,"ruby":3.0,"sapphire":8.8,"silicon":1.12}.get(key,2.0)  # eV (proxy)

def refractive_proxy(key):
    return {"diamond":2.4,"ruby":1.77,"sapphire":1.76,"silicon":3.5}.get(key,1.5)  # index (proxy)

def catalog():
    audit({"action":"catalog","count":len(CATALOG)})
    path=os.path.join(ART,"crystals_catalog.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"catalog":CATALOG},f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def estimate(key, props):
    out={"key":key}
    if "hardness" in props: out["hardness"]=hardness_proxy(key)
    if "bandgap" in props: out["bandgap_eV"]=bandgap_proxy(key)
    if "refractive" in props: out["refractive_index"]=refractive_proxy(key)
    audit({"action":"estimate","key":key,"props":props})
    path=os.path.join(ART,f"crystal_estimate_{key}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(out,f,indent=2)
    print(json.dumps({"ok":True,"path":path,"estimate":out}, indent=2))

def signal(key, freq, thickness):
    """
    Very simple attenuation proxy: alpha ~ freq * (1/refractive)
    loss ~ exp(-alpha * thickness). Purely computational.
    """
    n=refractive_proxy(key)
    alpha=freq*(1.0/max(n,0.1))*1e-12  # arbitrary scaling
    loss=math.exp(-alpha*thickness)
    out={"key":key,"freq_Hz":freq,"thickness_m":thickness,"attenuation":round(1.0-loss,6)}
    audit({"action":"signal","key":key})
    path=os.path.join(ART,f"crystal_signal_{key}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(out,f,indent=2)
    print(json.dumps({"ok":True,"path":path,"signal":out}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: print("Usage: catalog | estimate <key> --props hardness,bandgap,refractive | signal <key> --freq Hz --thickness m"); return
    cmd=a[0]
    if cmd=="catalog": catalog(); return
    if cmd=="estimate":
        key=a[1]; props=[]
        for i,x in enumerate(a):
            if x=="--props" and i+1<len(a): props=[p.strip() for p in a[i+1].split(",")]
        estimate(key,props); return
    if cmd=="signal":
        key=a[1]; freq=2.4e9; thick=0.001
        for i,x in enumerate(a):
            if x=="--freq" and i+1<len(a): freq=float(a[i+1])
            if x=="--thickness" and i+1<len(a): thick=float(a[i+1])
        signal(key,freq,thick); return
    print("Unknown command.")

if __name__=="__main__": main()