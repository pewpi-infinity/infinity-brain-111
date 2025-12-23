# cart040_dna_engine.py
"""
Cart 040: DNA Engine
Safe, computational engine for encoding/decoding "binary bricks" and word packets:
- Binary bricks: strings of 0s (and 1s when needed) as containers
- Packetization: break text into letters and words; scramble safely
- Shell routing: produce manifests linking to hydrogen shell (cart041)
- Artifacts + JSONL audit logs
"""

import sys, os, json, time, hashlib, random
from typing import List, Dict

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "dna_engine_audit.jsonl")
STORE = os.path.join(DATA, "dna_engine_store.json")

DEFAULT = {
    "bricks": [],    # {id, zeros, meta}
    "packets": [],   # {id, word, letters, scrambled, brick_id, hash}
    "routes": []     # {packet_id, shell_hint, created}
}

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(e: Dict): e=dict(e); e["t"]=now(); 
with open(AUDIT,"a",encoding="utf-8") as f: f.write(json.dumps(e)+"\n")

def load() -> Dict:
    if not os.path.exists(STORE): return DEFAULT.copy()
    try:
        with open(STORE,"r",encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT.copy()

def save(obj: Dict):
    with open(STORE,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)

def save_artifact(name: str, obj: Dict) -> str:
    p=os.path.join(ART,f"{name}.json")
    with open(p,"w",encoding="utf-8") as f: json.dump(obj,f,indent=2)
    return p

# ---------- Binary brick ----------
def make_brick(zeros_len: int, meta: Dict = None) -> Dict:
    zeros = "0" * max(1, zeros_len)
    brick = {"id": hashlib.sha1(f"{zeros_len}-{now()}".encode()).hexdigest()[:12], "zeros": zeros, "meta": meta or {}}
    db=load(); db["bricks"].append(brick); save(db)
    path=save_artifact(f"dna_brick_{brick['id']}", brick)
    audit({"action":"brick.make","id":brick["id"],"zeros_len":zeros_len})
    return {"ok":True,"path":path,"brick":brick}

# ---------- Packetization ----------
def scramble_letters(letters: List[str]) -> List[str]:
    ls=letters[:]; random.shuffle(ls); return ls

def packetize(text: str, brick_id: str) -> Dict:
    words = [w for w in text.split() if w]
    packets=[]
    for w in words:
        letters=list(w)
        scrambled=scramble_letters(letters)
        packet={"id": hashlib.sha1(f"{w}-{brick_id}".encode()).hexdigest()[:12],
                "word": w, "letters": letters, "scrambled": scrambled, "brick_id": brick_id}
        packet["hash"] = hashlib.sha256(json.dumps(packet, sort_keys=True).encode()).hexdigest()
        packets.append(packet)
    db=load(); db["packets"].extend(packets); save(db)
    path=save_artifact(f"dna_packets_{brick_id}_{int(time.time())}", {"brick_id":brick_id,"packets":packets})
    audit({"action":"packetize","brick":brick_id,"count":len(packets)})
    return {"ok":True,"path":path,"count":len(packets),"packets":packets[:3]}

# ---------- Routing to hydrogen shell ----------
def route_to_shell(packet_id: str, shell_hint: str = "hydrogen_shell"):
    db=load()
    exists=any(p["id"]==packet_id for p in db["packets"])
    if not exists:
        audit({"action":"route.shell","error":"packet_missing","packet_id":packet_id})
        return {"ok":False,"error":"packet not found"}
    r={"packet_id":packet_id,"shell_hint":shell_hint,"created":now()}
    db["routes"].append(r); save(db)
    path=save_artifact(f"dna_route_shell_{packet_id}", r)
    audit({"action":"route.shell","packet_id":packet_id})
    return {"ok":True,"path":path,"route":r}

# ---------- CLI ----------
def main():
    a=sys.argv[1:]
    if not a:
        print("Usage:")
        print("  brick --zeros 16 [--meta '{\"topic\":\"research\"}']")
        print("  packetize --text \"...\" --brick_id BID")
        print("  route --packet_id PID [--shell hydrogen_shell]")
        return
    cmd=a[0]
    if cmd=="brick":
        zeros=16; meta=None
        for i,x in enumerate(a):
            if x=="--zeros" and i+1<len(a): zeros=int(a[i+1])
            if x=="--meta" and i+1<len(a): 
                try: meta=json.loads(a[i+1])
                except: meta={"raw":a[i+1]}
        print(json.dumps(make_brick(zeros, meta), indent=2)); return
    if cmd=="packetize":
        text="hello world"; bid=""
        for i,x in enumerate(a):
            if x=="--text" and i+1<len(a): text=a[i+1]
            if x=="--brick_id" and i+1<len(a): bid=a[i+1]
        if not bid: print(json.dumps({"error":"brick_id required"}, indent=2)); return
        print(json.dumps(packetize(text, bid), indent=2)); return
    if cmd=="route":
        pid=""; shell="hydrogen_shell"
        for i,x in enumerate(a):
            if x=="--packet_id" and i+1<len(a): pid=a[i+1]
            if x=="--shell" and i+1<len(a): shell=a[i+1]
        print(json.dumps(route_to_shell(pid, shell), indent=2)); return
    print(json.dumps({"error":"unknown command"}, indent=2))

if __name__=="__main__": main()