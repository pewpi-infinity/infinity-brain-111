# cart010_components.py
"""
Cart 010: Components Module
Designs and documents components for Infinity OS hardware (conceptual specs):
- Component library schema (sensors, actuators, compute, power)
- Robot build spec generator (JSON)
- Phone/computer module spec builder (cutting-edge placeholders)
- BOM (bill of materials) formatter
- CLI:
    python cart010_components.py library
    python cart010_components.py robot "Explorer-01"
    python cart010_components.py device "Infinity-Phone"
    python cart010_components.py bom "Explorer-01"
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "components_audit.jsonl")

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

COMPONENTS = {
    "sensors": [
        {"key": "cam_hd", "desc": "HD camera", "voltage": 5, "iface": "CSI"},
        {"key": "mic_array", "desc": "Microphone array", "voltage": 5, "iface": "I2S"},
        {"key": "imu_9dof", "desc": "9-DOF IMU", "voltage": 3.3, "iface": "I2C"},
        {"key": "tof_lidar", "desc": "ToF LiDAR", "voltage": 5, "iface": "I2C"}
    ],
    "actuators": [
        {"key": "servo_micro", "desc": "Micro servo", "voltage": 5, "iface": "PWM"},
        {"key": "dc_motor", "desc": "DC motor", "voltage": 12, "iface": "PWM"},
        {"key": "stepper_small", "desc": "Small stepper", "voltage": 12, "iface": "STEP/DIR"}
    ],
    "compute": [
        {"key": "soc_arm", "desc": "ARM SoC, quad-core", "voltage": 5, "iface": "PCIe/USB"},
        {"key": "fpga_mid", "desc": "Mid FPGA", "voltage": 12, "iface": "PCIe"},
        {"key": "ai_accel", "desc": "AI accelerator", "voltage": 12, "iface": "PCIe"}
    ],
    "power": [
        {"key": "battery_liion", "desc": "Li-ion pack", "voltage": 11.1, "iface": "XT60"},
        {"key": "regulator_5v", "desc": "5V regulator", "voltage": 12, "iface": "DC"},
        {"key": "regulator_3v3", "desc": "3.3V regulator", "voltage": 12, "iface": "DC"}
    ]
}

def save_artifact(name: str, obj: dict) -> str:
    p = os.path.join(ART, f"{name}.json")
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return p

def library():
    audit({"action": "library"})
    path = save_artifact("components_library", COMPONENTS)
    print(json.dumps(COMPONENTS, indent=2)); print(f"Saved: {path}")

def robot(name: str):
    spec = {
        "name": name,
        "sensors": ["cam_hd", "imu_9dof", "tof_lidar", "mic_array"],
        "actuators": ["servo_micro", "dc_motor"],
        "compute": ["soc_arm", "ai_accel"],
        "power": ["battery_liion", "regulator_5v", "regulator_3v3"],
        "bus": ["I2C", "I2S", "PWM", "PCIe", "USB"],
        "notes": "Exploration robot; modular; audio-visual; IMU stabilization"
    }
    audit({"action": "robot", "name": name})
    path = save_artifact(f"robot_{name}", spec)
    print(json.dumps(spec, indent=2)); print(f"Saved: {path}")

def device(name: str):
    spec = {
        "name": name,
        "modules": {
            "camera": "cam_hd",
            "mic": "mic_array",
            "soc": "soc_arm",
            "ai": "ai_accel",
            "battery": "battery_liion",
            "reg_5v": "regulator_5v",
            "reg_3v3": "regulator_3v3"
        },
        "io": ["USB-C", "PCIe", "Audio jack"],
        "notes": "Infinity Phone concept; modular compute and sensor stack"
    }
    audit({"action": "device", "name": name})
    path = save_artifact(f"device_{name}", spec)
    print(json.dumps(spec, indent=2)); print(f"Saved: {path}")

def bom(name: str):
    # Produce a BOM by mapping keys to components
    try:
        with open(os.path.join(ART, f"robot_{name}.json"), "r", encoding="utf-8") as f:
            spec = json.load(f)
    except:
        print(json.dumps({"error": "Robot spec not found. Generate it first."}, indent=2)); return
    keys = spec["sensors"] + spec["actuators"] + spec["compute"] + spec["power"]
    idx = {c["key"]: c for group in COMPONENTS.values() for c in group}
    items = []
    for k in keys:
        c = idx.get(k)
        if c: items.append({"key": k, "desc": c["desc"], "voltage": c["voltage"], "iface": c["iface"]})
    out = {"name": name, "items": items}
    audit({"action": "bom", "name": name})
    path = save_artifact(f"bom_{name}", out)
    print(json.dumps(out, indent=2)); print(f"Saved: {path}")

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: library | robot <name> | device <name> | bom <name>"); return
    cmd = args[0]
    if cmd == "library": library(); return
    if cmd == "robot": robot(args[1] if len(args) > 1 else "Explorer-01"); return
    if cmd == "device": device(args[1] if len(args) > 1 else "Infinity-Phone"); return
    if cmd == "bom": bom(args[1] if len(args) > 1 else "Explorer-01"); return
    print("Unknown command.")

if __name__ == "__main__":
    main()