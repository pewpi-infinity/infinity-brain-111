# cart016_hot_cold_TEG.py
"""
Cart 016: Hot/Cold TEG Module
Research and expansion package for thermoelectric generators (TEG):
- Adaptive sensing model: temperature samples (hot/cold) → ΔT
- Adaptive tuning: adjusts load to maximize estimated power (computational model)
- Data capture: session logs, JSON artifacts for provenance
- Expansion hooks: attach sensors, add materials, export plans

CLI:
  python cart016_hot_cold_TEG.py sample --hot 360 --cold 300
  python cart016_hot_cold_TEG.py sweep --hot 360 --cold 300 --loads 1,2,4,8
  python cart016_hot_cold_TEG.py tune --hot 360 --cold 300 --rint 2.0 --seebeck 0.0002
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "teg_audit.jsonl")

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def save_artifact(name: str, obj: dict) -> str:
    p = os.path.join(ART, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

def delta_t(hot: float, cold: float) -> float:
    return hot - cold

def teg_power(dT: float, seebeck: float, rint: float, rload: float) -> float:
    """
    Simplified TEG model:
    V = S * dT; I = V / (Rint + Rload); P = I^2 * Rload
    """
    V = seebeck * dT
    I = V / (rint + rload) if (rint + rload) > 0 else 0
    return (I**2) * rload

def sample(hot: float, cold: float):
    dT = delta_t(hot, cold)
    out = {"hot_K": hot, "cold_K": cold, "deltaT_K": round(dT, 3)}
    audit({"action": "sample", "hot": hot, "cold": cold})
    p = save_artifact(f"teg_sample_{int(time.time())}", out)
    print(json.dumps(out, indent=2)); print(f"Saved: {p}")

def sweep(hot: float, cold: float, loads: list, seebeck: float = 0.0002, rint: float = 2.0):
    dT = delta_t(hot, cold)
    rows = []
    for rload in loads:
        P = teg_power(dT, seebeck, rint, rload)
        rows.append({"rload_ohm": rload, "power_W": round(P, 6)})
    out = {"hot_K": hot, "cold_K": cold, "deltaT_K": dT, "seebeck_VperK": seebeck, "rint_ohm": rint, "rows": rows}
    audit({"action": "sweep", "loads": loads})
    p = save_artifact(f"teg_sweep_{int(time.time())}", out)
    print(json.dumps(out, indent=2)); print(f"Saved: {p}")

def tune(hot: float, cold: float, rint: float, seebeck: float):
    """
    Adaptive tuning: search rload to maximize P
    Strategy: coarse sweep then local refine.
    """
    dT = delta_t(hot, cold)
    coarse = [x/2 for x in range(1, 41)]  # 0.5..20.0
    best = {"rload": None, "P": -1}
    for rl in coarse:
        P = teg_power(dT, seebeck, rint, rl)
        if P > best["P"]:
            best = {"rload": rl, "P": P}
    # Local refine around best rload ±1.0 in 0.1 steps
    center = best["rload"]
    for i in range(-10, 11):
        rl = max(0.05, center + i*0.1)
        P = teg_power(dT, seebeck, rint, rl)
        if P > best["P"]:
            best = {"rload": rl, "P": P}
    out = {
        "hot_K": hot, "cold_K": cold, "deltaT_K": dT,
        "rint_ohm": rint, "seebeck_VperK": seebeck,
        "best_rload_ohm": round(best["rload"], 3),
        "power_W": round(best["P"], 6)
    }
    audit({"action": "tune", "best_rload": best["rload"], "power": best["P"]})
    p = save_artifact(f"teg_tune_{int(time.time())}", out)
    print(json.dumps(out, indent=2)); print(f"Saved: {p}")

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: sample --hot K --cold K | sweep --hot K --cold K --loads 1,2,4,8 | tune --hot K --cold K --rint 2.0 --seebeck 0.0002")
        return
    cmd = args[0]
    kv = {}
    for i,a in enumerate(args):
        if a == "--hot" and i+1 < len(args): kv["hot"] = float(args[i+1])
        if a == "--cold" and i+1 < len(args): kv["cold"] = float(args[i+1])
        if a == "--loads" and i+1 < len(args): kv["loads"] = [float(x) for x in args[i+1].split(",")]
        if a == "--rint" and i+1 < len(args): kv["rint"] = float(args[i+1])
        if a == "--seebeck" and i+1 < len(args): kv["seebeck"] = float(args[i+1])
    if cmd == "sample": sample(kv.get("hot", 350), kv.get("cold", 300)); return
    if cmd == "sweep": sweep(kv.get("hot", 350), kv.get("cold", 300), kv.get("loads", [1,2,4,8])); return
    if cmd == "tune": tune(kv.get("hot", 350), kv.get("cold", 300), kv.get("rint", 2.0), kv.get("seebeck", 0.0002)); return
    print("Unknown command.")

if __name__ == "__main__":
    main()