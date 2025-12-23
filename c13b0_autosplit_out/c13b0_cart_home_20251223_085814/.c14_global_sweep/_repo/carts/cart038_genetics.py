# cart038_genetics_substrate_v2.py
"""
Cart 038 v2: Genetics Substrate (Robust, Interoperable, Provenance-first)
Safe, computational modeling of DNA-as-data substrates and metadata routing.

Core improvements:
- Encode/decode blocks with chunking, hashing, and optional compression tags (abstract).
- Substrate scoring and selection suited to mission constraints (stability, flexibility, compute-adjacency).
- Routing that validates references, repairs orphaned links, and emits manifests.
- Crosslinks to carts 034 (drones), 035 (signal trace), 036 (RF generation), 037 (neuromorphic), 039 (crosslinker).
- Dream journal planner mapped to tokens with safe, creative narratives.
- Index and search across blocks, routes, tags, and manifests.
- Health checks and export pack for SPA consumption.

CLI:
  python cart038_genetics_substrate_v2.py encode --text "hello world" --chunk 8 --tag research
  python cart038_genetics_substrate_v2.py decode --block_ids 1,2,3
  python cart038_genetics_substrate_v2.py substrate list
  python cart038_genetics_substrate_v2.py substrate select --need stability --weight 0.7
  python cart038_genetics_substrate_v2.py route add --tag research --block_id 1
  python cart038_genetics_substrate_v2.py route validate
  python cart038_genetics_substrate_v2.py dream plan --user Kris --tokens 7 --link_token 101
  python cart038_genetics_substrate_v2.py index build
  python cart038_genetics_substrate_v2.py search --q research
  python cart038_genetics_substrate_v2.py manifest make --name "Bundle-Alpha" --mission "Survey-Alpha" --trace "Trace-A" --tile "Tile-Alpha" --bank "neuromorphic_bank_export"
  python cart038_genetics_substrate_v2.py health
  python cart038_genetics_substrate_v2.py export
"""

import sys, os, json, time, hashlib, random

# Paths
ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

# Files
AUDIT      = os.path.join(LOGS, "genetics_substrate_v2_audit.jsonl")
STORE      = os.path.join(DATA, "substrate_store_v2.json")
INDEX      = os.path.join(DATA, "substrate_index_v2.json")
MANIFESTS  = os.path.join(DATA, "substrate_manifests_v2.json")

# Defaults
DEFAULT_STORE = {
    "blocks": [],         # list of {id, bases[4], char, tag, chunk_id, hash}
    "chunks": [],         # group of block ids for logical chunking
    "routes": [],         # list of {tag, block_id, created}
    "substrates": [       # catalog
        {"key":"glass","desc":"Stable optical-grade storage metaphor","scores":{"stability":0.9,"flexibility":0.3,"compute":0.4}},
        {"key":"polymer","desc":"Flexible write/read metaphor","scores":{"stability":0.6,"flexibility":0.8,"compute":0.5}},
        {"key":"silicon","desc":"Compute-adjacent storage metaphor","scores":{"stability":0.7,"flexibility":0.5,"compute":0.9}}
    ],
    "next_block_id": 1,
    "next_chunk_id": 1
}

DEFAULT_INDEX = {
    "blocks_by_tag": {},  # tag -> [block_id]
    "tags": [],           # all tags
    "search_cache": {}    # q -> results
}

DEFAULT_MANIFESTS = {
    "bundles": []         # bundle manifests linked to other carts
}

BASES = ["A","C","G","T"]

# Utilities
def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

def audit(entry: dict):
    entry = dict(entry); entry["t"] = now()
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load(path: str, default: dict) -> dict:
    if not os.path.exists(path): return default.copy()
    try:
        with open(path, "r", encoding="utf-8") as f: return json.load(f)
    except:
        return default.copy()

def save(path: str, obj: dict):
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)

def save_artifact(name: str, obj: dict) -> str:
    p = os.path.join(ART, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

def sha256_obj(obj: dict) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode("utf-8")).hexdigest()

# Encoding / Decoding
def encode_text(text: str, chunk_size: int, tag: str) -> dict:
    """
    Encode text into blocks with chunking:
    - Each char -> base quad derived from ord%4 rotated.
    - Blocks grouped into chunks to ease retrieval.
    """
    store = load(STORE, DEFAULT_STORE)
    blocks = []; chunks = []
    chunk_id = store["next_chunk_id"]
    current_chunk = {"chunk_id": chunk_id, "block_ids": [], "tag": tag, "created": now()}
    for ch in text:
        v = (ord(ch) % 4)
        bases = [BASES[(v+j)%4] for j in range(4)]
        blk = {"id": store["next_block_id"], "char": ch, "bases": bases, "tag": tag, "chunk_id": chunk_id}
        blk["hash"] = sha256_obj({"char": ch, "bases": bases, "tag": tag, "chunk": chunk_id})
        blocks.append(blk)
        current_chunk["block_ids"].append(blk["id"])
        store["next_block_id"] += 1
        # move to next chunk when size reached
        if len(current_chunk["block_ids"]) >= chunk_size:
            chunks.append(current_chunk)
            chunk_id = chunk_id + 1
            current_chunk = {"chunk_id": chunk_id, "block_ids": [], "tag": tag, "created": now()}
    if current_chunk["block_ids"]:
        chunks.append(current_chunk)
    store["blocks"].extend(blocks)
    store["chunks"].extend(chunks)
    store["next_chunk_id"] = chunk_id + 1
    save(STORE, store)
    artifact = {"encoded_count": len(blocks), "chunks_made": [c["chunk_id"] for c in chunks], "tag": tag}
    path = save_artifact(f"dna_encode_{int(time.time())}", artifact)
    audit({"action":"encode","chars":len(text),"blocks":len(blocks),"chunks":len(chunks),"tag":tag})
    return {"ok": True, "path": path, "summary": artifact}

def decode_blocks(block_ids: list) -> dict:
    store = load(STORE, DEFAULT_STORE)
    idset = set(block_ids)
    out_chars = []
    for b in store["blocks"]:
        if b["id"] in idset:
            out_chars.append(b["char"])
    recovered = "".join(out_chars)
    artifact = {"requested": block_ids, "recovered_text": recovered}
    path = save_artifact(f"dna_decode_{int(time.time())}", artifact)
    audit({"action":"decode","count":len(block_ids)})
    return {"ok": True, "path": path, "text": recovered}

# Substrate selection
def substrate_list() -> dict:
    store = load(STORE, DEFAULT_STORE)
    path = save_artifact("substrates_catalog_v2", {"substrates": store["substrates"]})
    audit({"action":"substrate.list","count":len(store["substrates"])})
    return {"ok": True, "path": path, "count": len(store["substrates"])}

def substrate_select(need: str, weight: float = 0.7) -> dict:
    """
    Weighted score selection:
    - need: one of stability, flexibility, compute
    - weight applies to that need; others average in.
    """
    store = load(STORE, DEFAULT_STORE)
    picks = []
    for s in store["substrates"]:
        sc = s["scores"]
        need_val = sc.get(need, 0.5)
        others = [v for k,v in sc.items() if k != need]
        base = sum(others)/max(1,len(others))
        final = round(weight*need_val + (1.0-weight)*base, 3)
        picks.append({"key": s["key"], "score": final, "desc": s["desc"]})
    picks.sort(key=lambda x: x["score"], reverse=True)
    path = save_artifact(f"substrate_select_{need}_{int(time.time())}", {"need": need, "picks": picks})
    audit({"action":"substrate.select","need":need,"top":picks[0]["key"] if picks else None})
    return {"ok": True, "path": path, "top": picks[0] if picks else None}

# Routing with validation/repair
def route_add(tag: str, block_id: int) -> dict:
    store = load(STORE, DEFAULT_STORE)
    exists = any(b["id"] == block_id for b in store["blocks"])
    if not exists:
        audit({"action":"route.add","error":"block_missing","block_id":block_id})
        return {"ok": False, "error": "block not found"}
    store["routes"].append({"tag": tag, "block_id": block_id, "created": now()})
    save(STORE, store)
    path = save_artifact(f"substrate_route_v2_{tag}_{block_id}", {"tag": tag, "block_id": block_id})
    audit({"action":"route.add","tag":tag,"block_id":block_id})
    return {"ok": True, "path": path}

def route_validate() -> dict:
    store = load(STORE, DEFAULT_STORE)
    valid = []; broken = []
    block_ids = set(b["id"] for b in store["blocks"])
    for r in store["routes"]:
        if r["block_id"] in block_ids:
            valid.append(r)
        else:
            broken.append(r)
    # Attempt repair: drop broken
    if broken:
        store["routes"] = valid
        save(STORE, store)
    artifact = {"valid_count": len(valid), "broken_count": len(broken)}
    path = save_artifact("substrate_route_validation_v2", artifact)
    audit({"action":"route.validate","valid":len(valid),"broken":len(broken)})
    return {"ok": True, "path": path, "summary": artifact}

# Index and search
def index_build() -> dict:
    store = load(STORE, DEFAULT_STORE)
    idx = {"blocks_by_tag": {}, "tags": [], "search_cache": {}}
    for b in store["blocks"]:
        tag = b.get("tag", "untagged")
        idx["blocks_by_tag"].setdefault(tag, []).append(b["id"])
    idx["tags"] = sorted([t for t in idx["blocks_by_tag"].keys()])
    save(INDEX, idx)
    path = save_artifact("substrate_index_v2", idx)
    audit({"action":"index.build","tags":len(idx['tags'])})
    return {"ok": True, "path": path, "tags": idx["tags"]}

def search(q: str) -> dict:
    idx = load(INDEX, DEFAULT_INDEX)
    store = load(STORE, DEFAULT_STORE)
    # naive search across tags and chars
    hits = {"tags": [], "blocks": []}
    for tag in idx.get("tags", []):
        if q.lower() in tag.lower():
            hits["tags"].append(tag)
    for b in store["blocks"]:
        if q.lower() in (b["char"] or "").lower() or q.lower() in (b.get("tag","") or "").lower():
            hits["blocks"].append({"id": b["id"], "char": b["char"], "tag": b.get("tag","")})
    # cache
    idx.setdefault("search_cache", {})[q] = hits
    save(INDEX, idx)
    path = save_artifact(f"substrate_search_{int(time.time())}", {"q": q, "hits": hits})
    audit({"action":"search","q":q,"tags":len(hits['tags']),"blocks":len(hits['blocks'])})
    return {"ok": True, "path": path, "hits": hits}

# Dream journal and token ties
def dream_plan(user: str, tokens: int, link_token_id: int = None) -> dict:
    entries = []
    for i in range(tokens):
        entries.append({
            "user": user,
            "token_id": (link_token_id if link_token_id else i+1),
            "theme": random.choice(["research","creativity","growth","provenance","value"]),
            "created": now()
        })
    path = save_artifact(f"dream_journal_v2_{user}_{int(time.time())}", {"user": user, "entries": entries})
    audit({"action":"dream.plan","user":user,"count":tokens,"link_token":link_token_id})
    return {"ok": True, "path": path, "count": tokens}

# Cross-manifest builder (interoperability)
def manifest_make(name: str, mission: str, trace: str, tile: str, bank: str) -> dict:
    """
    Build a bundle manifest referencing artifacts from drones, signal traces, RF tiles, and neuromorphic bank.
    SPA can use this to present a single panel with linked views.
    """
    manifests = load(MANIFESTS, DEFAULT_MANIFESTS)
    bundle = {
        "name": name,
        "paths": {
            "mission": f"artifacts/drone_mission_{mission}.json",
            "trace":   f"artifacts/signal_export_{trace}.json",
            "tile":    f"artifacts/rf_tile_{tile}.json",
            "bank":    f"artifacts/{bank}.json"
        },
        "created": now()
    }
    bundle["hash"] = sha256_obj(bundle)
    manifests["bundles"].append(bundle)
    save(MANIFESTS, manifests)
    path = save_artifact(f"substrate_manifest_{name}", bundle)
    audit({"action":"manifest.make","name":name})
    return {"ok": True, "path": path, "manifest": bundle}

# Health and export
def health() -> dict:
    store = load(STORE, DEFAULT_STORE)
    idx   = load(INDEX, DEFAULT_INDEX)
    man   = load(MANIFESTS, DEFAULT_MANIFESTS)
    summary = {
        "blocks": len(store["blocks"]),
        "chunks": len(store["chunks"]),
        "routes": len(store["routes"]),
        "tags": len(idx.get("tags", [])),
        "bundles": len(man.get("bundles", []))
    }
    path = save_artifact("substrate_health_v2", summary)
    audit({"action":"health","summary":summary})
    return {"ok": True, "path": path, "summary": summary}

def export_all() -> dict:
    store = load(STORE, DEFAULT_STORE)
    idx   = load(INDEX, DEFAULT_INDEX)
    man   = load(MANIFESTS, DEFAULT_MANIFESTS)
    pack = {"store": store, "index": idx, "manifests": man, "exported": now()}
    path = save_artifact("genetics_substrate_v2_export", pack)
    audit({"action":"export","blocks":len(store['blocks']),"routes":len(store['routes']),"bundles":len(man['bundles'])})
    return {"ok": True, "path": path}

# CLI
def main():
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print("  encode --text '...' --chunk n --tag T | decode --block_ids 1,2,3")
        print("  substrate list | substrate select --need stability|flexibility|compute --weight 0.7")
        print("  route add --tag T --block_id N | route validate")
        print("  dream plan --user U --tokens k [--link_token N]")
        print("  index build | search --q 'term'")
        print("  manifest make --name N --mission M --trace T --tile K --bank B")
        print("  health | export")
        return
    cmd = args[0]

    # Encode
    if cmd == "encode":
        text="hello"; chunk=8; tag="research"
        for i,a in enumerate(args):
            if a == "--text" and i+1 < len(args): text = args[i+1]
            if a == "--chunk" and i+1 < len(args): chunk = int(args[i+1])
            if a == "--tag" and i+1 < len(args): tag = args[i+1]
        res = encode_text(text, chunk, tag); print(json.dumps(res, indent=2)); return

    # Decode
    if cmd == "decode":
        ids=[]
        for i,a in enumerate(args):
            if a == "--block_ids" and i+1 < len(args): ids = [int(x) for x in args[i+1].split(",") if x.strip()]
        res = decode_blocks(ids); print(json.dumps(res, indent=2)); return

    # Substrate
    if cmd == "substrate":
        sub = args[1] if len(args) > 1 else ""
        if sub == "list":
            print(json.dumps(substrate_list(), indent=2)); return
        if sub == "select":
            need="stability"; weight=0.7
            for i,a in enumerate(args):
                if a == "--need" and i+1 < len(args): need = args[i+1]
                if a == "--weight" and i+1 < len(args): weight = float(args[i+1])
            print(json.dumps(substrate_select(need, weight), indent=2)); return

    # Route
    if cmd == "route":
        sub = args[1] if len(args) > 1 else ""
        if sub == "add":
            tag="research"; bid=1
            for i,a in enumerate(args):
                if a == "--tag" and i+1 < len(args): tag = args[i+1]
                if a == "--block_id" and i+1 < len(args): bid = int(args[i+1])
            print(json.dumps(route_add(tag, bid), indent=2)); return
        if sub == "validate":
            print(json.dumps(route_validate(), indent=2)); return

    # Dream
    if cmd == "dream":
        sub = args[1] if len(args) > 1 else ""
        if sub == "plan":
            user="guest"; tokens=5; link=None
            for i,a in enumerate(args):
                if a == "--user" and i+1 < len(args): user = args[i+1]
                if a == "--tokens" and i+1 < len(args): tokens = int(args[i+1])
                if a == "--link_token" and i+1 < len(args): link = int(args[i+1])
            print(json.dumps(dream_plan(user, tokens, link), indent=2)); return

    # Index/Search
    if cmd == "index" and len(args) > 1 and args[1] == "build":
        print(json.dumps(index_build(), indent=2)); return
    if cmd == "search":
        q="research"
        for i,a in enumerate(args):
            if a == "--q" and i+1 < len(args): q = args[i+1]
        print(json.dumps(search(q), indent=2)); return

    # Manifest
    if cmd == "manifest" and len(args) > 1 and args[1] == "make":
        name="Bundle"; mission="Survey-Alpha"; trace="Trace-A"; tile="Tile-Alpha"; bank="neuromorphic_bank_export"
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
            if a == "--mission" and i+1 < len(args): mission = args[i+1]
            if a == "--trace" and i+1 < len(args): trace = args[i+1]
            if a == "--tile" and i+1 < len(args): tile = args[i+1]
            if a == "--bank" and i+1 < len(args): bank = args[i+1]
        print(json.dumps(manifest_make(name, mission, trace, tile, bank), indent=2)); return

    # Health / Export
    if cmd == "health":
        print(json.dumps(health(), indent=2)); return
    if cmd == "export":
        print(json.dumps(export_all(), indent=2)); return

    print(json.dumps({"error":"unknown command"}, indent=2))

if __name__ == "__main__":
    main()