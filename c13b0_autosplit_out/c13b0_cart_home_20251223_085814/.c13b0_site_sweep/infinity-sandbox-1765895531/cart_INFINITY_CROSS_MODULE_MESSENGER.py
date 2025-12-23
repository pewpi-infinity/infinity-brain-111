#!/usr/bin/env python3
import json
from pathlib import Path
import datetime

BASE = Path("infinity_storage")
INDEX = BASE / "index"
LOGS = BASE / "logs"

STATE_FILE = INDEX / "system_state.json"

now = datetime.datetime.utcnow().isoformat()

state = {
    "generated": now,
    "modules": {},
    "health": "OK"
}

def load_json(path):
    if path.exists():
        try:
            with open(path) as f:
                return json.load(f)
        except:
            return None
    return None

# --- Token Index ---
token_index = load_json(INDEX / "token_index.json")
if token_index:
    state["modules"]["token_index"] = {
        "token_count": token_index.get("count"),
        "generated": token_index.get("generated")
    }
else:
    state["modules"]["token_index"] = "MISSING"
    state["health"] = "DEGRADED"

# --- Link Index ---
link_index = load_json(INDEX / "link_index.json")
if link_index:
    state["modules"]["link_index"] = {
        "token_count": link_index.get("token_count"),
        "generated": link_index.get("generated")
    }
else:
    state["modules"]["link_index"] = "MISSING"
    state["health"] = "DEGRADED"

# --- Value Index ---
value_index = load_json(INDEX / "value_index.json")
if value_index:
    state["modules"]["value_index"] = {
        "token_count": value_index.get("token_count"),
        "generated": value_index.get("generated")
    }
else:
    state["modules"]["value_index"] = "MISSING"
    state["health"] = "DEGRADED"

# --- Pipeline Log ---
log_file = LOGS / "pipeline.log"
if log_file.exists():
    with open(log_file) as f:
        lines = f.readlines()
        state["modules"]["pipeline"] = {
            "last_event": lines[-1].strip() if lines else "EMPTY",
            "entries": len(lines)
        }
else:
    state["modules"]["pipeline"] = "MISSING"
    state["health"] = "DEGRADED"

# --- Write State ---
with open(STATE_FILE, "w") as f:
    json.dump(state, f, indent=2)

print("\n[∞] Cross-Module State Messenger complete")
print(f"[∞] Health: {state['health']}")
print(f"[∞] Output: {STATE_FILE}\n")
