# cart027_robotics_factory.py
"""
Cart 027: Robotics Factory Orchestrator
Digital-to-hardware planner and controller that:
- Manages robot build orders, factory lines, and status
- Integrates components (cart010) and computers (cart003) conceptually
- Implements emoji research modes ⭐⚙️🎨🔭⚡ (star, gear/tools, painting/art, telescope/explore, power)
- Implements color fuel mechanics 🟥🟧🟨🟩🟦 with purple regen
- Outputs JSON artifacts with provenance for SPA rendering

CLI:
  python cart027_robotics_factory.py components
  python cart027_robotics_factory.py new --name "StarPainter-01" --profile painting --fuel "red,orange,yellow,green,blue"
  python cart027_robotics_factory.py assign --name "StarPainter-01" --emoji "⭐"
  python cart027_robotics_factory.py run --name "StarPainter-01" --steps 5
  python cart027_robotics_factory.py status --name "StarPainter-01"
  python cart027_robotics_factory.py line add "Line-A"
  python cart027_robotics_factory.py line route --name "StarPainter-01" --line "Line-A"
  python cart027_robotics_factory.py fuel --name "StarPainter-01" --add "purple" --amount 3
  python cart027_robotics_factory.py export --name "StarPainter-01"
"""

import sys, os, json, time, random

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART  = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True)

AUDIT      = os.path.join(LOGS, "robotics_factory_audit.jsonl")
FACTORY_DB = os.path.join(DATA, "robotics_factory.json")

DEFAULT_DB = {
    "lines": [],           # Factory lines
    "robots": {},          # name -> robot_state
    "components_ref": [],  # quick ref snapshot of component keys
}

# ---------- Utilities ----------
def now_iso(): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

def audit(entry: dict):
    entry = dict(entry); entry["t"] = now_iso()
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_db() -> dict:
    if not os.path.exists(FACTORY_DB): return DEFAULT_DB.copy()
    try:
        with open(FACTORY_DB, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_DB.copy()

def save_db(db: dict):
    with open(FACTORY_DB, "w", encoding="utf-8") as f: json.dump(db, f, indent=2)

def save_artifact(name: str, obj: dict) -> str:
    path = os.path.join(ART, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2)
    return path

# ---------- Emoji research modes ----------
EMOJI_MODES = {
    "⭐": {"key": "star", "desc": "Star power: boosts speed, discovery, and composite value."},
    "⚙️": {"key": "gear", "desc": "Toolchain expansion: adds build tools and diagnostics."},
    "🎨": {"key": "painting", "desc": "Art pipeline: visual generation, color logic alignment."},
    "🔭": {"key": "telescope", "desc": "Exploration: scanning and mapping new idea space."},
    "⚡": {"key": "power", "desc": "Power model: computational energy budgeting and routing."}
}

# ---------- Color fuel mechanics ----------
COLOR_FUEL_ORDER = ["red","orange","yellow","green","blue"]  # sequential consumption
REGEN_COLOR = "purple"  # regenerates lower bands, boosts star mode

def init_fuel_sequence(seq_str: str):
    seq = [s.strip().lower() for s in seq_str.split(",") if s.strip()]
    if not seq: seq = COLOR_FUEL_ORDER[:]
    # add counters
    return {c: 3 for c in seq}  # default 3 units per color

def consume_fuel(fuel: dict, amount: int = 1) -> str:
    """
    Consume in order: red → orange → yellow → green → blue.
    Returns the color consumed, or "" if empty.
    """
    for c in COLOR_FUEL_ORDER:
        if fuel.get(c, 0) > 0:
            fuel[c] -= amount
            return c
    return ""

def regen_purple(fuel: dict, amount: int = 1):
    """
    Purple adds 1 unit to each depleted early color up to a soft cap.
    """
    for c in COLOR_FUEL_ORDER[:-1]:  # except blue
        if fuel.get(c, 0) < 2:
            fuel[c] = fuel.get(c, 0) + amount

# ---------- Components integration (conceptual) ----------
def components_snapshot() -> list:
    """
    Snapshot of components keys from cart010 (conceptual reference).
    If cart010 artifacts exist, we read them; else we provide defaults.
    """
    # Try to read components_library artifact
    lib_path = os.path.join(ART, "components_library.json")
    comps = []
    try:
        with open(lib_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for group in data.values():
                if isinstance(group, list):
                    for c in group:
                        key = c.get("key")
                        if key: comps.append(key)
    except:
        comps = [
            "cam_hd","mic_array","imu_9dof","tof_lidar",
            "servo_micro","dc_motor","stepper_small",
            "soc_arm","fpga_mid","ai_accel",
            "battery_liion","regulator_5v","regulator_3v3"
        ]
    return sorted(set(comps))

# ---------- Computer integration (conceptual) ----------
def computer_profile() -> dict:
    """
    Conceptual spec and a small throughput estimate; ties to cart003_computers.
    """
    cores = 8; ghz = 3.2; ipc = 1.8
    throughput_bops = cores * ghz * ipc
    return {"cores": cores, "ghz": ghz, "ipc": ipc, "throughput_bops": throughput_bops}

# ---------- Robot state ----------
def new_robot(name: str, profile: str, fuel_seq: str) -> dict:
    db = load_db()
    comps = components_snapshot()
    comp_profile = random.sample(comps, k=min(6, len(comps)))
    robot = {
        "name": name,
        "profile": profile,  # painting, telescope, gear, star, power, custom
        "emoji_modes": [],
        "fuel": init_fuel_sequence(fuel_seq),
        "status": {"state": "idle", "line": None, "steps_done": 0},
        "components": comp_profile,
        "computer": computer_profile(),
        "history": [{"t": now_iso(), "event": "created"}]
    }
    db["robots"][name] = robot
    save_db(db)
    audit({"action":"robot.new","name":name,"profile":profile})
    path = save_artifact(f"robot_{name}_state", robot)
    return {"ok": True, "path": path, "robot": robot}

def assign_emoji(name: str, emoji: str) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    if emoji not in EMOJI_MODES: return {"ok": False, "error": "unknown emoji"}
    if emoji not in r["emoji_modes"]: r["emoji_modes"].append(emoji)
    r["history"].append({"t": now_iso(), "event": "emoji", "emoji": emoji})
    save_db(db)
    audit({"action":"robot.emoji","name":name,"emoji":emoji})
    path = save_artifact(f"robot_{name}_emoji_modes", {"name": name, "emoji_modes": r["emoji_modes"]})
    return {"ok": True, "path": path, "emoji_modes": r["emoji_modes"]}

# ---------- Factory lines ----------
def line_add(line: str) -> dict:
    db = load_db()
    if line not in db["lines"]:
        db["lines"].append(line)
        save_db(db)
    audit({"action":"line.add","line":line})
    return {"ok": True, "lines": db["lines"]}

def line_route(name: str, line: str) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    if line not in db["lines"]: return {"ok": False, "error": "line not found"}
    r["status"]["line"] = line
    r["history"].append({"t": now_iso(), "event": "route", "line": line})
    save_db(db)
    audit({"action":"line.route","name":name,"line":line})
    return {"ok": True, "status": r["status"]}

# ---------- Run cycle ----------
def apply_mode_effects(r: dict, emoji: str) -> dict:
    """
    Mode effects (computational):
    - ⭐: speed boost (+2 steps), discovery flag
    - ⚙️: add tools (servo, fpga_mid) if missing
    - 🎨: add 'painting' tag to profile; color alignment hint
    - 🔭: exploration flag; add sensor if missing
    - ⚡: power budgeting artifact for current step
    """
    effects = {"notes": []}
    if emoji == "⭐":
        r["status"]["steps_done"] += 2
        effects["notes"].append("star-boost")
    elif emoji == "⚙️":
        for k in ("servo_micro","fpga_mid"):
            if k not in r["components"]: r["components"].append(k)
        effects["notes"].append("tools-expanded")
    elif emoji == "🎨":
        r["profile"] = "painting"
        effects["notes"].append("profile-painting")
    elif emoji == "🔭":
        for k in ("tof_lidar","imu_9dof"):
            if k not in r["components"]: r["components"].append(k)
        effects["notes"].append("explore-sensors")
    elif emoji == "⚡":
        # simple power budget record
        pb = {"step": r["status"]["steps_done"], "kWh_est": round(r["computer"]["throughput_bops"]*1e-12, 6)}
        effects["power_budget"] = pb
        effects["notes"].append("power-budget")
    return effects

def run_steps(name: str, steps: int) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    r["status"]["state"] = "running"
    events = []
    for s in range(steps):
        # consume fuel
        consumed = consume_fuel(r["fuel"], amount=1)
        if not consumed:
            # try purple regen automatically if emoji includes star or painting
            if "⭐" in r["emoji_modes"] or "🎨" in r["emoji_modes"]:
                regen_purple(r["fuel"], amount=1)
                consumed = consume_fuel(r["fuel"], amount=1)
        r["status"]["steps_done"] += 1
        step_event = {"t": now_iso(), "step": r["status"]["steps_done"], "fuel_color": consumed or "none"}
        # apply mode effects
        for em in r["emoji_modes"]:
            eff = apply_mode_effects(r, em)
            if eff.get("power_budget"):
                step_event["power_budget"] = eff["power_budget"]
            if eff.get("notes"):
                step_event.setdefault("notes", []).extend(eff["notes"])
        r["history"].append(step_event)
        events.append(step_event)
        # stop if all fuel exhausted even after regen attempt
        if consumed == "" and s >= 1:
            break
    r["status"]["state"] = "idle" if events else "fuel-empty"
    save_db(db)
    audit({"action":"robot.run","name":name,"steps":len(events)})
    path = save_artifact(f"robot_{name}_run_{int(time.time())}", {"name": name, "events": events, "status": r["status"]})
    return {"ok": True, "path": path, "events": events, "status": r["status"]}

# ---------- Fuel management ----------
def fuel_add(name: str, color: str, amount: int) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    color = color.lower()
    r["fuel"][color] = r["fuel"].get(color, 0) + amount
    r["history"].append({"t": now_iso(), "event": "fuel.add", "color": color, "amount": amount})
    save_db(db)
    audit({"action":"fuel.add","name":name,"color":color,"amount":amount})
    return {"ok": True, "fuel": r["fuel"]}

# ---------- Status / Export ----------
def status(name: str) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    return {"ok": True, "status": r["status"], "fuel": r["fuel"], "emoji_modes": r["emoji_modes"], "components": r["components"]}

def export(name: str) -> dict:
    db = load_db()
    r = db["robots"].get(name)
    if not r: return {"ok": False, "error": "robot not found"}
    art = {
        "name": name,
        "profile": r["profile"],
        "components": r["components"],
        "computer": r["computer"],
        "line": r["status"]["line"],
        "fuel": r["fuel"],
        "emoji_modes": r["emoji_modes"],
        "history_tail": r["history"][-25:]
    }
    path = save_artifact(f"robot_{name}_export", art)
    audit({"action":"robot.export","name":name})
    return {"ok": True, "path": path, "export": art}

# ---------- Components reference caching ----------
def refresh_components_ref() -> dict:
    db = load_db()
    db["components_ref"] = components_snapshot()
    save_db(db)
    audit({"action":"components.refresh","count":len(db['components_ref'])})
    return {"ok": True, "count": len(db["components_ref"])}

# ---------- CLI ----------
def main():
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print("  components | new --name N --profile painting --fuel \"red,orange,yellow,green,blue\"")
        print("  assign --name N --emoji ⭐ | run --name N --steps k | status --name N")
        print("  line add L | line route --name N --line L")
        print("  fuel --name N --add purple --amount 3 | export --name N")
        return
    cmd = args[0]
    if cmd == "components":
        res = refresh_components_ref(); print(json.dumps(res, indent=2)); return
    if cmd == "new":
        name="Robot-01"; profile="painting"; fuel="red,orange,yellow,green,blue"
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
            if a == "--profile" and i+1 < len(args): profile = args[i+1]
            if a == "--fuel" and i+1 < len(args): fuel = args[i+1]
        print(json.dumps(new_robot(name, profile, fuel), indent=2)); return
    if cmd == "assign":
        name="Robot-01"; emoji="⭐"
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
            if a == "--emoji" and i+1 < len(args): emoji = args[i+1]
        print(json.dumps(assign_emoji(name, emoji), indent=2)); return
    if cmd == "run":
        name="Robot-01"; steps=5
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
            if a == "--steps" and i+1 < len(args): steps = int(args[i+1])
        print(json.dumps(run_steps(name, steps), indent=2)); return
    if cmd == "status":
        name="Robot-01"
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
        print(json.dumps(status(name), indent=2)); return
    if cmd == "line":
        sub = args[1] if len(args) > 1 else ""
        if sub == "add":
            line = args[2] if len(args) > 2 else "Line-A"
            print(json.dumps(line_add(line), indent=2)); return
        if sub == "route":
            name="Robot-01"; line="Line-A"
            for i,a in enumerate(args):
                if a == "--name" and i+1 < len(args): name = args[i+1]
                if a == "--line" and i+1 < len(args): line = args[i+1]
            print(json.dumps(line_route(name, line), indent=2)); return
        print(json.dumps({"error":"unknown line subcommand"}, indent=2)); return
    if cmd == "fuel":
        name="Robot-01"; add="purple"; amount=1
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
            if a == "--add" and i+1 < len(args): add = args[i+1]
            if a == "--amount" and i+1 < len(args): amount = int(args[i+1])
        print(json.dumps(fuel_add(name, add, amount), indent=2)); return
    if cmd == "export":
        name="Robot-01"
        for i,a in enumerate(args):
            if a == "--name" and i+1 < len(args): name = args[i+1]
        print(json.dumps(export(name), indent=2)); return
    print(json.dumps({"error":"unknown command"}, indent=2))

if __name__ == "__main__":
    main()