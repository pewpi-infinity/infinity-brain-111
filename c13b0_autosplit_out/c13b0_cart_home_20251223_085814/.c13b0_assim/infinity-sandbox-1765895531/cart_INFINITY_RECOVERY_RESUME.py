#!/usr/bin/env python3
import json
import datetime
import subprocess
from pathlib import Path
import sys

BASE = Path("infinity_storage")
INDEX = BASE / "index"
LOGS = BASE / "logs"

STATE_FILE = INDEX / "system_state.json"
PIPE_LOG = LOGS / "pipeline.log"
RECOVERY_LOG = LOGS / "recovery.log"

now = datetime.datetime.utcnow().isoformat()

def log(msg):
    LOGS.mkdir(parents=True, exist_ok=True)
    line = f"[{now}] {msg}"
    print(line)
    with open(RECOVERY_LOG, "a") as f:
        f.write(line + "\n")

# -----------------------------
# Load system state
# -----------------------------
if not STATE_FILE.exists():
    log("system_state.json missing — full pipeline required")
    subprocess.run(["./cart_INFINITY_PIPELINE_ORCHESTRATOR.py"])
    sys.exit(0)

with open(STATE_FILE) as f:
    state = json.load(f)

modules = state.get("modules", {})

# -----------------------------
# Determine missing outputs
# -----------------------------
required = {
    "token_index": "infinity_storage/index/token_index.json",
    "link_index": "infinity_storage/index/link_index.json",
    "value_index": "infinity_storage/index/value_index.json"
}

missing = []
for name, path in required.items():
    if not Path(path).exists():
        missing.append(name)

if not missing:
    log("All required outputs present — no recovery needed")
    sys.exit(0)

log(f"Recovery needed for: {missing}")

# -----------------------------
# Recovery map (minimal reruns)
# -----------------------------
RECOVERY_STEPS = {
    "token_index": ["./cart_INFINITY_PLUS_INDEX_BUILDER.py"],
    "link_index": ["./cart_INFINITY_PLUS_LINK_TREE.py"],
    "value_index": ["./cart_INFINITY_PLUS_VALUE_ACCUMULATOR.py"]
}

for step in missing:
    cmd = RECOVERY_STEPS.get(step)
    if not cmd:
        continue
    log(f"Running recovery step: {step}")
    try:
        subprocess.run(cmd, check=True)
        log(f"Recovered: {step}")
    except subprocess.CalledProcessError:
        log(f"FAILED recovery for: {step}")
        sys.exit(1)

# -----------------------------
# Refresh system state
# -----------------------------
log("Refreshing system state")
subprocess.run(["./cart_INFINITY_CROSS_MODULE_MESSENGER.py"], check=True)

log("Recovery complete")
