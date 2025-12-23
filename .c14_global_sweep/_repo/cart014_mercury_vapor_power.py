# cart014_mercury_vapor_power.py
"""
Cart 014: Mercury Vapor Power Module (SAFE, COMPUTATIONAL ONLY)
Purpose in Infinity:
- Provide computational models for abstract power scenarios
- Avoid any operational guidance involving hazardous materials
- Offer scenario comparisons in purely mathematical terms

Capabilities:
- Scenario builder: compares abstract cycle efficiencies
- Energy accounting: converts between MJ/kWh for hypothetical cycles
- Sensitivity: vary parameters and chart outputs (JSON)

CLI:
  python cart014_mercury_vapor_power.py scenario baseline
  python cart014_mercury_vapor_power.py sweep efficiency 0.2 0.6 5
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True)

AUDIT = os.path.join(LOGS, "mvp_audit.jsonl")

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def mj_to_kwh(mj: float) -> float:
    return mj / 3.6

def scenario(name: str) -> dict:
    """
    Abstract scenario:
    - energy_input_MJ: arbitrary input
    - efficiency: 0–1 abstract conversion
    """
    base_input = 1000.0
    efficiency_map = {"baseline": 0.35, "optimistic": 0.5, "conservative": 0.2}
    eff = efficiency_map.get(name, 0.35)
    output_mj = base_input * eff
    return {
        "name": name,
        "input_MJ": base_input,
        "efficiency": eff,
        "output_MJ": output_mj,
        "output_kWh": mj_to_kwh(output_mj)
    }

def sweep(param: str, start: float, end: float, steps: int) -> dict:
    vals = []
    if steps <= 1: steps = 2
    step = (end - start) / (steps - 1)
    for i in range(steps):
        v = start + i * step
        out = scenario("baseline")
        if param == "efficiency":
            out["efficiency"] = v
            out["output_MJ"] = out["input_MJ"] * v
            out["output_kWh"] = mj_to_kwh(out["output_MJ"])
        vals.append({"param": param, "value": round(v,3), "out": out})
    return {"param": param, "rows": vals}

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: scenario <name> | sweep efficiency <start> <end> <steps>"); return
    cmd = args[0]
    audit({"action": "cli", "cmd": cmd})
    if cmd == "scenario":
        name = args[1] if len(args) > 1 else "baseline"
        res = scenario(name)
        path = os.path.join(ART, f"mvp_{name}.json")
        with open(path, "w", encoding="utf-8") as f: json.dump(res, f, indent=2)
        print(json.dumps(res, indent=2)); print(f"Saved: {path}"); return
    if cmd == "sweep":
        param = args[1]; start = float(args[2]); end = float(args[3]); steps = int(args[4])
        res = sweep(param, start, end, steps)
        path = os.path.join(ART, f"mvp_sweep_{param}.json")
        with open(path, "w", encoding="utf-8") as f: json.dump(res, f, indent=2)
        print(json.dumps(res, indent=2)); print(f"Saved: {path}"); return
    print("Unknown command.")

if __name__ == "__main__":
    main()