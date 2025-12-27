#!/usr/bin/env python3
# ∞ cart001A – Infinity AutoPush Controller (10MB Threshold)

import os
import subprocess
import datetime

OUTPUT_DIR = "infinity_research_output"
LOG = "research_cache/cart001A_autopush.log"
THRESHOLD_MB = 10

os.makedirs("research_cache", exist_ok=True)

def log(msg):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[∞ cart001A] {ts} – {msg}"
    print(line)
    with open(LOG, "a") as f:
        f.write(line + "\n")

def folder_size_megabytes(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except:
                pass
    return total / (1024 * 1024)

def git(command_list):
    """Run git commands safely."""
    result = subprocess.run(command_list, text=True,
                            capture_output=True)
    if result.stdout:
        log(result.stdout.strip())
    if result.stderr:
        log(result.stderr.strip())

log("Starting 10MB autopush check.")

size_mb = folder_size_megabytes(OUTPUT_DIR)
log(f"Current research output size: {size_mb:.2f} MB")

if size_mb >= THRESHOLD_MB:
    log(f"Threshold reached ({THRESHOLD_MB}MB). Committing new research…")

    git(["git", "add", "-A"])
    git(["git", "status"])

    commit_message = f"∞ AutoPush – {datetime.datetime.now().isoformat()} – {size_mb:.2f}MB research"
    git(["git", "commit", "-m", commit_message])

    git(["git", "push", "origin", "main"])

    log("AutoPush complete.")
else:
    log("Threshold not reached. No push performed.")

log("cart001A complete.")
