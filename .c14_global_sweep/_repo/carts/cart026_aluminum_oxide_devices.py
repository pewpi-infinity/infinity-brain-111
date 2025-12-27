# cart026_aluminum_oxide_devices.py
"""
Cart 026: Aluminum Oxide Devices
Infinity’s hardware brain (research-to-hardware planner). It:
- Organizes aluminum-oxide-centric device concepts (memory, sensors, coatings)
- Generates device manifests (specs, materials, power hints, interfaces)
- Builds robot-ready material lists (high-level BOM) tied to Components cart
- Integrates safe hydrogen-powered planning (computational energy accounting only)
- Produces 2026 forecast tracks: candidate devices, milestones, and readiness scores
- Artifacts + JSONL audit logs for provenance

CLI:
  python cart026_aluminum_oxide_devices.py concepts
  python cart026_aluminum_oxide_devices.py spec "AOX-Memory-Cell"
  python cart026_aluminum_oxide_devices.py bom "AOX-Memory-Cell"
  python cart026_aluminum_oxide_devices.py forecast 2026
  python cart026_aluminum_oxide_devices.py plan "AOX-Optical-Sensor"
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "aox_devices_audit.jsonl")

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def save_artifact(name: str, obj: dict) -> str:
    p = os.path.join(ART, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

# ---------- Concept library ----------
CONCEPTS = [
    {"key": "AOX-Memory-Cell", "domain": "compute", "desc": "Aluminum-oxide based memristive cell concept for NVM."},
    {"key": "AOX-Optical-Sensor", "domain": "sensor", "desc": "Thin-film AOX optical sensor/coating for environmental monitoring."},
    {"key": "AOX-Coating-Barrier", "domain": "materials", "desc": "Protective AOX barrier coating for components longevity."},
    {"key": "AOX-Dielectric-Layer", "domain": "compute", "desc": "High-k dielectric AOX layer for transistor gate stacks (conceptual)."}
]

# ---------- Device spec builder ----------
def device_spec(name: str) -> dict:
    # Map concept to a structured spec
    base = next((c for c in CONCEPTS if c["key"] == name), {"key": name, "domain": "general", "desc": "Custom AOX concept"})
    spec = {
        "name": base["key"],
        "domain": base["domain"],
        "description": base["desc"],
        "materials": [
            {"key": "aluminum_oxide", "role": "active/dielectric", "notes": "Thin film or layer (computational planning only)"},
            {"key": "substrate_glass_or_si", "role": "substrate", "notes": "Conceptual substrate map"},
            {"key": "conductive_trace", "role": "interconnect", "notes": "Neutral interconnect placeholder"}
        ],
        "interfaces": ["I2C", "SPI", "Analog", "Digital"],
        "power_hint": {"type": "low_power", "estimation_only": True},
        "routes": ["engineering", "components", "nuances"],
        "color": "blue",
        "provenance": {"created": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()), "author": "Infinity"},
        "readiness": {"design": 0.6, "materials": 0.5, "integration": 0.4}
    }
    audit({"action":"spec","name":name})
    path = save_artifact(f"aox_spec_{name.replace(' ','_')}", spec)
    return {"ok": True, "path": path, "spec": spec}

# ---------- Robot-ready BOM (high-level, conceptual) ----------
COMPONENT_MAP = {
    "compute": ["soc_arm", "ai_accel", "fpga_mid"],
    "sensor": ["cam_hd", "imu_9dof", "tof_lidar"],
    "materials": ["regulator_5v", "regulator_3v3"],
    "general": ["soc_arm", "battery_liion", "regulator_5v"]
}

def bom(name: str) -> dict:
    spec = device_spec(name)["spec"]
    domain = spec["domain"]
    comps = COMPONENT_MAP.get(domain, COMPONENT_MAP["general"])
    bom_items = [{"component_key": k, "qty": 1} for k in comps] + [{"material": m["key"], "role": m["role"]} for m in spec["materials"]]
    out = {"device": name, "bom": bom_items, "notes": "Conceptual BOM; link to cart010_components for details."}
    audit({"action":"bom","name":name,"count":len(bom_items)})
    path = save_artifact(f"aox_bom_{name.replace(' ','_')}", out)
    return {"ok": True, "path": path, "bom": out}

# ---------- Hydrogen-enabled planning (safe computational accounting) ----------
def energy_budget_kwh(estimated_ops: float, per_op_kwh: float = 1e-12) -> float:
    """
    Computational energy budget estimate for device operation (no operational guidance).
    """
    return estimated_ops * per_op_kwh

def hydrogen_offset_kwh(kwh: float, offset_ratio: float = 0.5) -> float:
    """
    Abstract offset model: portion of energy assumed offset by hydrogen systems (computational only).
    """
    return max(0.0, kwh * offset_ratio)

def plan(name: str) -> dict:
    spec = device_spec(name)["spec"]
    ops = 1e9 if spec["domain"] == "compute" else 1e7
    kwh = energy_budget_kwh(ops)
    offset = hydrogen_offset_kwh(kwh, 0.5)
    out = {
        "device": name, "spec": spec, 
        "energy_budget_kWh": kwh, "hydrogen_offset_kWh": offset,
        "robot_materials": [m["key"] for m in spec["materials"]],
        "next_steps": ["components-link", "engineering-sim", "nuances-scan", "solutes-score"]
    }
    audit({"action":"plan","name":name})
    path = save_artifact(f"aox_plan_{name.replace(' ','_')}", out)
    return {"ok": True, "path": path, "plan": out}

# ---------- 2026 Forecast ----------
def forecast(year: int) -> dict:
    """
    Produces a readiness forecast for candidate AOX devices.
    """
    tracks = []
    for c in CONCEPTS:
        spec = device_spec(c["key"])["spec"]
        score = round((spec["readiness"]["design"] + spec["readiness"]["materials"] + spec["readiness"]["integration"]) / 3.0, 2)
        tracks.append({"name": c["key"], "domain": c["domain"], "readiness_score": score, "target_year": year})
    out = {"year": year, "tracks": tracks}
    audit({"action":"forecast","year":year,"count":len(tracks)})
    path = save_artifact(f"aox_forecast_{year}", out)
    return {"ok": True, "path": path, "forecast": out}

# ---------- Concepts list ----------
def concepts() -> dict:
    audit({"action":"concepts","count":len(CONCEPTS)})
    path = save_artifact("aox_concepts", {"concepts": CONCEPTS})
    return {"ok": True, "path": path, "concepts": CONCEPTS}

# ---------- CLI ----------
def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: concepts | spec <name> | bom <name> | forecast <year> | plan <name>")
        return
    cmd = args[0]
    if cmd == "concepts":
        print(json.dumps(concepts(), indent=2)); return
    if cmd == "spec":
        name = " ".join(args[1:])
        print(json.dumps(device_spec(name), indent=2)); return
    if cmd == "bom":
        name = " ".join(args[1:])
        print(json.dumps(bom(name), indent=2)); return
    if cmd == "forecast":
        year = int(args[1]) if len(args) > 1 else 2026
        print(json.dumps(forecast(year), indent=2)); return
    if cmd == "plan":
        name = " ".join(args[1:])
        print(json.dumps(plan(name), indent=2)); return
    print("Unknown command.")

if __name__ == "__main__":
    main()