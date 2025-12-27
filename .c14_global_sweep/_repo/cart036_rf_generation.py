# cart036_rf_generation.py
"""
Cart 036: RF Generation (Abstract, Safe)
Purpose:
- Provide abstract, computational waveform generation and spectrum tiling
- Define compliance envelopes (constraints) without operational RF emission guidance
- Connect to signal trace (cart035) and drone missions (cart034)

Key features:
- Waveform recipes: sine, chirp, pseudo-random binary (PRBS) sequences (computed arrays)
- Spectrum tiling: assign bands and windows (ties to cart035 bandwidth)
- Compliance envelopes: allowable ranges for parameters (documentation manifest)
- Artifacts + audit logs

CLI:
  python cart036_rf_generation.py recipe sine --freq 1000 --samples 256
  python cart036_rf_generation.py recipe chirp --start 100 --end 1000 --samples 256
  python cart036_rf_generation.py prbs --length 128
  python cart036_rf_generation.py tile --name "Tile-Alpha" --windows "100-200,300-350"
  python cart036_rf_generation.py envelope export
"""

import sys, os, json, time, math, random

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True)

AUDIT = os.path.join(LOGS, "rf_generation_audit.jsonl")

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(e): e=dict(e); e["t"]=now(); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def save_artifact(name,obj):
    p=os.path.join(ART,f"{name}.json")
    with open(p,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)
    return p

# ---------- Recipes ----------
def recipe_sine(freq: float, samples: int):
    t=[i/samples for i in range(samples)]
    y=[math.sin(2*math.pi*freq*ti) for ti in t]
    out={"kind":"sine","freq":freq,"samples":samples,"values":y[:64]}  # truncate values for artifact brevity
    path=save_artifact(f"rf_sine_{freq}_{samples}", out)
    audit({"action":"recipe.sine","freq":freq,"samples":samples})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def recipe_chirp(start: float, end: float, samples: int):
    t=[i/samples for i in range(samples)]
    f=lambda ti: start + (end-start)*ti
    y=[math.sin(2*math.pi*f(ti)*ti) for ti in t]
    out={"kind":"chirp","start":start,"end":end,"samples":samples,"values":y[:64]}
    path=save_artifact(f"rf_chirp_{start}_{end}_{samples}", out)
    audit({"action":"recipe.chirp","start":start,"end":end,"samples":samples})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def prbs(length: int):
    seq=[random.choice([0,1]) for _ in range(length)]
    out={"kind":"prbs","length":length,"sequence":seq[:64]}
    path=save_artifact(f"rf_prbs_{length}", out)
    audit({"action":"recipe.prbs","length":length})
    print(json.dumps({"ok":True,"path":path}, indent=2))

# ---------- Spectrum tiling ----------
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

def tile(name: str, windows: str):
    tw=parse_windows(windows)
    out={"name":name,"windows":tw}
    path=save_artifact(f"rf_tile_{name}", out)
    audit({"action":"tile","name":name,"count":len(tw)})
    print(json.dumps({"ok":True,"path":path,"count":len(tw)}, indent=2))

# ---------- Compliance envelope ----------
COMPLIANCE = {
    "freq_range_Hz": [0.0, 1e9],
    "bandwidth_Hz": [1.0, 1e6],
    "sample_count": [16, 16384],
    "notes": "Abstract computational envelope; not operational emission guidance."
}

def envelope_export():
    path=save_artifact("rf_compliance_envelope", COMPLIANCE)
    audit({"action":"envelope.export"})
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a:
        print("Usage: recipe sine --freq f --samples n | recipe chirp --start f1 --end f2 --samples n | prbs --length n | tile --name N --windows 'f1-f2,...' | envelope export")
        return
    cmd=a[0]
    if cmd=="recipe":
        kind=a[1] if len(a)>1 else "sine"
        if kind=="sine":
            freq=1000; samples=256
            for i,x in enumerate(a):
                if x=="--freq" and i+1<len(a): freq=float(a[i+1])
                if x=="--samples" and i+1<len(a): samples=int(a[i+1])
            recipe_sine(freq,samples); return
        if kind=="chirp":
            start=100; end=1000; samples=256
            for i,x in enumerate(a):
                if x=="--start" and i+1<len(a): start=float(a[i+1])
                if x=="--end" and i+1<len(a): end=float(a[i+1])
                if x=="--samples" and i+1<len(a): samples=int(a[i+1])
            recipe_chirp(start,end,samples); return
    if cmd=="prbs":
        length=128
        for i,x in enumerate(a):
            if x=="--length" and i+1<len(a): length=int(a[i+1])
        prbs(length); return
    if cmd=="tile":
        name="Tile"; windows="100-200"
        for i,x in enumerate(a):
            if x=="--name" and i+1<len(a): name=a[i+1]
            if x=="--windows" and i+1<len(a): windows=a[i+1]
        tile(name,windows); return
    if cmd=="envelope" and len(a)>1 and a[1]=="export":
        envelope_export(); return
    print("Unknown command.")

if __name__=="__main__": main()