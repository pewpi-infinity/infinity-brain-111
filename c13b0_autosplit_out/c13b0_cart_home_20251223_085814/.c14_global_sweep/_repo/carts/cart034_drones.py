# cart034_drones.py
"""
Cart 034: Drones (Research Planner)
Purpose:
- Plan drone missions in a safe, computational manner (no operational control)
- Integrate neuromorphic overlays (vector features from cart037)
- Hydrogen energy accounting (cart009/cart015 references)
- Reasoning hooks (IBM-style: rule-based scoring, explainability manifests)

Key features:
- Mission spec builder: waypoints, payload class, sensor roles
- Energy budget estimator: hydrogen HHV-based computational estimate (safe)
- Signal plan references: tie to cart035 signal trace & cart036 RF generation
- Neuromorphic overlay: import vector summaries from mice_brainmapping (cart037) to tag missions
- Explainability manifest: rules and scores per mission
- Artifacts + audit logs

CLI:
  python cart034_drones.py mission new --name "Survey-Alpha" --payload camera --sensors imu,lidar --waypoints "0,0;1,1;2,1"
  python cart034_drones.py mission energy --name "Survey-Alpha" --mass_kg 0.5
  python cart034_drones.py mission explain --name "Survey-Alpha"
  python cart034_drones.py mission link --name "Survey-Alpha" --signals cart035 --rf cart036 --neuro cart037
"""

import sys, os, json, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT = os.path.join(LOGS, "drones_audit.jsonl")
MISSIONS = os.path.join(DATA, "drones_missions.json")
DEFAULT_MISSIONS = {"missions": {}}

def now(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
def audit(entry: dict): 
    entry=dict(entry); entry["t"]=now()
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry)+"\n")

def load_missions():
    if not os.path.exists(MISSIONS): return DEFAULT_MISSIONS.copy()
    try:
        with open(MISSIONS, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_MISSIONS.copy()

def save_missions(m):
    with open(MISSIONS, "w", encoding="utf-8") as f: json.dump(m, f, indent=2)

def save_artifact(name: str, obj: dict) -> str:
    path = os.path.join(ART, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return path

# ---------- Mission builder ----------
def parse_waypoints(s: str):
    pts=[]
    for p in s.split(";"):
        p=p.strip()
        if not p: continue
        try:
            x,y = [float(v) for v in p.split(",")]
            pts.append({"x":x,"y":y})
        except:
            pass
    return pts

def mission_new(name: str, payload: str, sensors: list, waypoints: str):
    ms = load_missions()
    spec = {
        "name": name,
        "payload": payload,
        "sensors": sensors,
        "waypoints": parse_waypoints(waypoints),
        "links": {},
        "created": now()
    }
    ms["missions"][name] = spec
    save_missions(ms)
    audit({"action":"mission.new","name":name,"payload":payload,"sensors":len(sensors)})
    path = save_artifact(f"drone_mission_{name}", spec)
    print(json.dumps({"ok": True, "path": path}, indent=2))

# ---------- Energy budget using hydrogen HHV (safe, computational) ----------
def hydrogen_energy_kwh(mass_kg: float) -> float:
    HHV_MJ_PER_KG = 142.0
    return (mass_kg * HHV_MJ_PER_KG) / 3.6

def mission_energy(name: str, mass_kg: float):
    ms = load_missions()
    spec = ms["missions"].get(name)
    if not spec: print(json.dumps({"error":"mission not found"}, indent=2)); return
    kwh = hydrogen_energy_kwh(mass_kg)
    out = {"name": name, "mass_kg": mass_kg, "hydrogen_energy_kWh": kwh}
    path = save_artifact(f"drone_energy_{name}", out)
    audit({"action":"mission.energy","name":name,"kWh":kwh})
    print(json.dumps({"ok": True, "path": path, "kWh": kwh}, indent=2))

# ---------- Explainability: rule scoring ----------
RULES = [
    {"id": "short_path_bonus", "desc": "Short total distance => higher efficiency"},
    {"id": "sensor_diversity", "desc": "More sensors => better coverage"},
    {"id": "payload_weight_penalty", "desc": "Heavier payload class => lower score"}
]

def total_distance(pts: list) -> float:
    d=0.0
    for i in range(1,len(pts)):
        dx = pts[i]["x"] - pts[i-1]["x"]
        dy = pts[i]["y"] - pts[i-1]["y"]
        d += (dx*dx + dy*dy) ** 0.5
    return d

def payload_weight_class(p: str) -> int:
    # proxy classes
    return {"camera":1, "lidar":2, "multisensor":3, "unknown":2}.get(p, 2)

def mission_explain(name: str):
    ms = load_missions()
    spec = ms["missions"].get(name)
    if not spec: print(json.dumps({"error":"mission not found"}, indent=2)); return
    dist = total_distance(spec["waypoints"])
    sensors = len(spec["sensors"])
    pclass = payload_weight_class(spec["payload"])
    score = 100.0
    score += max(0, 20 - dist*5)  # short path bonus
    score += sensors * 3          # sensor diversity
    score -= pclass * 5           # payload penalty
    explanation = {
        "name": name,
        "rules": RULES,
        "measures": {"distance": dist, "sensors": sensors, "payload_class": pclass},
        "score": round(score, 2)
    }
    path = save_artifact(f"drone_explain_{name}", explanation)
    audit({"action":"mission.explain","name":name,"score":score})
    print(json.dumps({"ok": True, "path": path, "score": round(score,2)}, indent=2))

# ---------- Links to other carts ----------
def mission_link(name: str, signals: str, rf: str, neuro: str):
    ms = load_missions()
    spec = ms["missions"].get(name)
    if not spec: print(json.dumps({"error":"mission not found"}, indent=2)); return
    spec["links"] = {"signals": signals, "rf": rf, "neuromorphic": neuro}
    save_missions(ms)
    path = save_artifact(f"drone_links_{name}", spec["links"])
    audit({"action":"mission.link","name":name,"links":spec["links"]})
    print(json.dumps({"ok": True, "path": path, "links": spec["links"]}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: mission new --name N --payload camera --sensors a,b --waypoints 'x,y;...' | mission energy --name N --mass_kg m | mission explain --name N | mission link --name N --signals cart035 --rf cart036 --neuro cart037")
        return
    cmd = args[0]
    if cmd == "mission":
        sub = args[1] if len(args) > 1 else ""
        if sub == "new":
            name="Mission"; payload="camera"; sensors=[]; wps="0,0;1,0"
            for i,a in enumerate(args):
                if a == "--name" and i+1 < len(args): name=args[i+1]
                if a == "--payload" and i+1 < len(args): payload=args[i+1]
                if a == "--sensors" and i+1 < len(args): sensors=[x.strip() for x in args[i+1].split(",") if x.strip()]
                if a == "--waypoints" and i+1 < len(args): wps=args[i+1]
            mission_new(name, payload, sensors, wps); return
        if sub == "energy":
            name="Mission"; mass=0.5
            for i,a in enumerate(args):
                if a == "--name" and i+1 < len(args): name=args[i+1]
                if a == "--mass_kg" and i+1 < len(args): mass=float(args[i+1])
            mission_energy(name, mass); return
        if sub == "explain":
            name="Mission"
            for i,a in enumerate(args):
                if a == "--name" and i+1 < len(args): name=args[i+1]
            mission_explain(name); return
        if sub == "link":
            name="Mission"; signals="cart035"; rf="cart036"; neuro="cart037"
            for i,a in enumerate(args):
                if a == "--name" and i+1 < len(args): name=args[i+1]
                if a == "--signals" and i+1 < len(args): signals=args[i+1]
                if a == "--rf" and i+1 < len(args): rf=args[i+1]
                if a == "--neuro" and i+1 < len(args): neuro=args[i+1]
            mission_link(name, signals, rf, neuro); return
    print("Unknown command.")

if __name__ == "__main__":
    main()