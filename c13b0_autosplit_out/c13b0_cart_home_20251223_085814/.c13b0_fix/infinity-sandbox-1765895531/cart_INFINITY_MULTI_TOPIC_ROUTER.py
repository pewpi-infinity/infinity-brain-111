#!/usr/bin/env python3
import json
import subprocess
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
INDEX = BASE / "index"
QUEUE_FILE = INDEX / "topic_queue.json"

NOW = datetime.datetime.utcnow().isoformat()

# -----------------------------
# Default topics (edit freely)
# -----------------------------
DEFAULT_TOPICS = [
    "hydrogen",
    "quantum biology",
    "energy storage",
    "materials science",
    "electron transport"
]

# -----------------------------
# Load or init queue
# -----------------------------
if QUEUE_FILE.exists():
    with open(QUEUE_FILE) as f:
        queue = json.load(f)
else:
    queue = {
        "generated": NOW,
        "pointer": 0,
        "topics": DEFAULT_TOPICS
    }

topics = queue["topics"]
pointer = queue.get("pointer", 0)

if not topics:
    print("[!] No topics configured")
    exit(1)

# -----------------------------
# Select next topic (round-robin)
# -----------------------------
topic = topics[pointer % len(topics)]
queue["pointer"] = (pointer + 1) % len(topics)
queue["last_run"] = NOW
queue["last_topic"] = topic

# -----------------------------
# Save updated queue
# -----------------------------
with open(QUEUE_FILE, "w") as f:
    json.dump(queue, f, indent=2)

print(f"\n[∞] Multi-Topic Router")
print(f"[∞] Selected topic: {topic}")
print(f"[∞] Pointer now at: {queue['pointer']}")

# -----------------------------
# Run pipeline with topic
# -----------------------------
cmd = ["./cart_INFINITY_PIPELINE_ORCHESTRATOR.py", topic]

try:
    subprocess.run(cmd, check=True)
    print(f"[∞] Pipeline completed for topic: {topic}")
except subprocess.CalledProcessError:
    print(f"[!] Pipeline failed for topic: {topic}")
    exit(1)
