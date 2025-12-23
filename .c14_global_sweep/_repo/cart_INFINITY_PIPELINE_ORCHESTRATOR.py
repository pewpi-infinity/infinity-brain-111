#!/usr/bin/env python3
import subprocess
import datetime
from pathlib import Path
import sys

LOG_DIR = Path("infinity_storage/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "pipeline.log"

PIPELINE = [
    {
        "name": "Research Writer",
        "cmd": ["./cart_INFINITY_PLUS_RESEARCH.py", "hydrogen"],
        "requires": []
    },
    {
        "name": "Token Index Builder",
        "cmd": ["./cart_INFINITY_PLUS_INDEX_BUILDER.py"],
        "requires": ["infinity_storage/index/token_index.json"]
    },
    {
        "name": "Link Tree Builder",
        "cmd": ["./cart_INFINITY_PLUS_LINK_TREE.py"],
        "requires": ["infinity_storage/index/link_index.json"]
    },
    {
        "name": "Value Accumulator",
        "cmd": ["./cart_INFINITY_PLUS_VALUE_ACCUMULATOR.py"],
        "requires": ["infinity_storage/index/value_index.json"]
    }
]

def log(msg):
    timestamp = datetime.datetime.utcnow().isoformat()
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

log("Infinity Pipeline Orchestrator started")

for step in PIPELINE:
    log(f"Running: {step['name']}")

    try:
        subprocess.run(step["cmd"], check=True)
    except Exception as e:
        log(f"ERROR running {step['name']}: {e}")
        sys.exit(1)

    for req in step["requires"]:
        if not Path(req).exists():
            log(f"Missing required output: {req}")
            sys.exit(1)

    log(f"Completed: {step['name']}")

log("Infinity Pipeline Orchestrator complete")
