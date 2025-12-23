# cart030_superchemistry_fireproof.py
"""
Cart 030: Superchemistry Fireproof
Periodic table knowledge and utility equations (safe, computational).
Purpose:
- Element registry (subset with properties)
- Equation utilities: basic thermochemistry proxies, electronegativity differences, bond estimates
- “Fireproof” lens: materials with high melting points and stability (proxy filtering)
- Artifacts + audit logs

CLI:
  python cart030_superchemistry_fireproof.py elements
  python cart030_superchemistry_fireproof.py fireproof
  python cart030_superchemistry_fireproof.py bond C O
  python cart030_superchemistry_fireproof.py mix Al O --ratio 2:3
"""

import sys, os, json, time

ROOT=os.path.dirname(os.path.abspath(__file__))
LOGS=os.path.join(ROOT,"logs"); os.makedirs(LOGS,exist_ok=True)
ART=os.path.join(ROOT,"artifacts"); os.makedirs(ART,exist_ok=True)

AUDIT=os.path.join(LOGS,"superchem_fireproof_audit.jsonl")

def audit(e): e=dict(e); e["t"]=time.strftime("%Y-%m-%dT%H:%M:%S",time.gmtime()); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

ELEMENTS=[
    {"symbol":"C","name":"Carbon","EN":2.55,"MP_C":3823,"notes":"versatile"},
    {"symbol":"O","name":"Oxygen","EN":3.44,"MP_C":54,"notes":"oxidizer"},
    {"symbol":"Al","name":"Aluminum","EN":1.61,"MP_C":933,"notes":"light metal"},
    {"symbol":"Si","name":"Silicon","EN":1.90,"MP_C":1687,"notes":"semiconductor"},
    {"symbol":"Cr","name":"Chromium","EN":1.66,"MP_C":2180,"notes":"hard coatings"},
    {"symbol":"W","name":"Tungsten","EN":2.36,"MP_C":3695,"notes":"very high MP"}
]

def elements():
    audit({"action":"elements","count":len(ELEMENTS)})
    path=os.path.join(ART,"elements.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"elements":ELEMENTS},f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def fireproof():
    rows=[e for e in ELEMENTS if e["MP_C"]>=2000]
    audit({"action":"fireproof","count":len(rows)})
    path=os.path.join(ART,"fireproof_candidates.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"candidates":rows},f,indent=2)
    print(json.dumps({"ok":True,"path":path,"count":len(rows)}, indent=2))

def bond(a,b):
    ea=next((x for x in ELEMENTS if x["symbol"]==a),None)
    eb=next((x for x in ELEMENTS if x["symbol"]==b),None)
    if not ea or not eb: print(json.dumps({"error":"element not found"}, indent=2)); return
    delta=abs(ea["EN"]-eb["EN"])
    type_hint="ionic" if delta>1.7 else "polar" if delta>0.4 else "covalent"
    audit({"action":"bond","a":a,"b":b,"delta":delta})
    path=os.path.join(ART,f"bond_{a}_{b}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump({"a":a,"b":b,"deltaEN":delta,"type_hint":type_hint},f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def mix(a,b,ratio):
    ra, rb = [int(x) for x in ratio.split(":")]
    out={"mix":f"{a}{ra}-{b}{rb}","notes":"proxy mixture model"}
    audit({"action":"mix","a":a,"b":b,"ratio":ratio})
    path=os.path.join(ART,f"mix_{a}_{b}_{ratio}.json")
    with open(path,"w",encoding="utf-8") as f: json.dump(out,f,indent=2)
    print(json.dumps({"ok":True,"path":path}, indent=2))

def main():
    a=sys.argv[1:]
    if not a: print("Usage: elements | fireproof | bond <A> <B> | mix <A> <B> --ratio x:y"); return
    cmd=a[0]
    if cmd=="elements": elements(); return
    if cmd=="fireproof": fireproof(); return
    if cmd=="bond":
        if len(a)<3: print("bond A B"); return
        bond(a[1],a[2]); return
    if cmd=="mix":
        if len(a)<3: print("mix A B --ratio x:y"); return
        ratio="1:1"
        for i,x in enumerate(a):
            if x=="--ratio" and i+1<len(a): ratio=a[i+1]
        mix(a[1],a[2],ratio); return
    print("Unknown command.")

if __name__=="__main__": main()