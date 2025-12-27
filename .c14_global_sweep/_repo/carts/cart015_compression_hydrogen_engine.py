# cart015_compression_hydrogen_engine.py
"""
Cart 015: Compression Hydrogen Engine Module (SAFE RESEARCH)
Non-stop research on hydrogen: plan queries, compute properties, and export artifacts.

Purpose in Infinity:
- Build research queues for hydrogen topics
- Provide safe calculators (ideal gas, energy content, density approximations)
- Aggregate results with provenance

Capabilities:
- Query expansion: from simple terms to research facets
- Calculators: ideal gas (PV=nRT), energy per kg (HHV), density approximation (simple model)
- Queue manager: append tasks and export to JSON
- Audit logs

CLI:
  python cart015_compression_hydrogen_engine.py plan "hydrogen storage"
  python cart015_compression_hydrogen_engine.py calc pv --P 2e6 --V 0.1 --n 5 --R 8.314
  python cart015_compression_hydrogen_engine.py energy 1.0
  python cart015_compression_hydrogen_engine.py density --P 2e6 --T 300
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "hydrogen_engine_audit.jsonl")
QUEUE = os.path.join(DATA, "hydrogen_queue.json")

DEFAULT_QUEUE = {"tasks": []}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_queue() -> dict:
    if not os.path.exists(QUEUE): return DEFAULT_QUEUE.copy()
    try:
        with open(QUEUE, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_QUEUE.copy()

def save_queue(q: dict):
    with open(QUEUE, "w", encoding="utf-8") as f: json.dump(q, f, indent=2)

def expand_query(q: str) -> dict:
    base = q.strip().lower()
    facets = [base, base + " safety", base + " materials", base + " storage methods", base + " compression limits"]
    return {"query": q, "facets": facets, "estimate": len(facets)}

def plan(q: str):
    p = expand_query(q)
    queue = load_queue()
    for f in p["facets"]:
        queue["tasks"].append({"term": f, "created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())})
    save_queue(queue)
    audit({"action": "plan", "query": q, "count": len(p["facets"])})
    path = os.path.join(ART, f"hydrogen_plan_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump({"plan": p, "queue_added": p["facets"]}, f, indent=2)
    print(json.dumps({"ok": True, "path": path, "count": len(p["facets"])}, indent=2))

# Calculators (safe, high-level)
def pv_nrt(P: float = None, V: float = None, n: float = None, R: float = 8.314, T: float = None) -> dict:
    """
    Ideal gas law: PV = nRT
    Provide any three of (P,V,n,T) to compute the fourth (units must be consistent).
    """
    out = {"P": P, "V": V, "n": n, "R": R, "T": T}
    # Solve for missing
    known = {k:v for k,v in out.items() if v is not None}
    if len(known) < 4:
        # Try to compute missing variable
        if P is None and V is not None and n is not None and T is not None:
            out["P"] = n * R * T / V
        elif V is None and P is not None and n is not None and T is not None:
            out["V"] = n * R * T / P
        elif n is None and P is not None and V is not None and T is not None:
            out["n"] = P * V / (R * T)
        elif T is None and P is not None and V is not None and n is not None:
            out["T"] = P * V / (n * R)
    return out

def energy_per_kg(mass_kg: float) -> dict:
    HHV_MJ_PER_KG = 142.0
    mj = mass_kg * HHV_MJ_PER_KG
    kwh = mj / 3.6
    return {"mass_kg": mass_kg, "HHV_MJ": mj, "HHV_kWh": kwh}

def density_approx(P: float, T: float) -> dict:
    """
    Very rough density approximation for hydrogen under pressure and temperature using ideal gas assumptions.
    rho = (P * M) / (R * T), M ~ 0.002 kg/mol
    """
    M = 0.002
    R = 8.314
    rho = (P * M) / (R * T)
    return {"P": P, "T": T, "rho_kg_per_m3": rho}

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: plan <query> | calc pv [--P --V --n --R --T] | energy <mass_kg> | density --P --T"); return
    cmd = args[0]
    audit({"action": "cli", "cmd": cmd})
    if cmd == "plan":
        plan(" ".join(args[1:])); return
    if cmd == "calc":
        if args[1] != "pv":
            print(json.dumps({"error": "Only pv supported"}, indent=2)); return
        kv = {"P": None, "V": None, "n": None, "R": 8.314, "T": None}
        for i,a in enumerate(args):
            if a.startswith("--"):
                k = a[2:]
                if i+1 < len(args):
                    try: kv[k] = float(args[i+1])
                    except: kv[k] = kv[k]
        res = pv_nrt(**kv)
        path = os.path.join(ART, f"hydrogen_pv_{int(time.time())}.json")
        with open(path, "w", encoding="utf-8") as f: json.dump(res, f, indent=2)
        print(json.dumps(res, indent=2)); print(f"Saved: {path}"); return
    if cmd == "energy":
        m = float(args[1]) if len(args) > 1 else 1.0
        res = energy_per_kg(m)
        path = os.path.join(ART, f"hydrogen_energy_{int(time.time())}.json")
        with open(path, "w", encoding="utf-8") as f: json.dump(res, f, indent=2)
        print(json.dumps(res, indent=2)); print(f"Saved: {path}"); return
    if cmd == "density":
        kv = {"P": None, "T": None}
        for i,a in enumerate(args):
            if a == "--P" and i+1 < len(args): kv["P"] = float(args[i+1])
            if a == "--T" and i+1 < len(args): kv["T"] = float(args[i+1])
        res = density_approx(**kv)
        path = os.path.join(ART, f"hydrogen_density_{int(time.time())}.json")
        with open(path, "w", encoding="utf-8") as f: json.dump(res, f, indent=2)
        print(json.dumps(res, indent=2)); print(f"Saved: {path}"); return
    print("Unknown command.")

if __name__ == "__main__":
    main()