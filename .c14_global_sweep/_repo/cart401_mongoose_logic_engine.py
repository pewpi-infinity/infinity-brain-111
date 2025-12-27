#!/usr/bin/env python3
"""
[∞] Cart 4.1 — Mongoose OS
Logical Governance, Aid, and Compliance Engine
Non-violent | Auditable | Human-in-the-loop
"""

import os, json, datetime

BASE_DIR = "cart401_logs"
os.makedirs(BASE_DIR, exist_ok=True)

NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

# --- CODE MAP 1–111 ---
CODE_MAP = {i: f"STATE_{i}" for i in range(1, 112)}

DESCRIPTIONS = {
    1: "System boot verified",
    4: "Degraded but stable",
    12: "Supply contamination suspected",
    22: "Public health risk flagged",
    31: "Meals-on-wheels requested",
    41: "Regulatory inconsistency detected",
    52: "Financial irregularity detected",
    61: "Construction task queued",
    72: "Audit checksum mismatch",
    84: "Emergency aid reroute",
    96: "Normalization complete",
    111: "Human oversight required"
}

def log_event(code, details):
    entry = {
        "timestamp": NOW,
        "code": code,
        "state": CODE_MAP.get(code, "UNKNOWN"),
        "description": DESCRIPTIONS.get(code, "Generic state"),
        "details": details
    }
    with open(os.path.join(BASE_DIR, "events.jsonl"), "a") as f:
        f.write(json.dumps(entry) + "\n")
    print(f"[∞] Logged code {code}: {DESCRIPTIONS.get(code, 'Generic state')}")

# --- LOGIC MODULES ---

def check_seed(seed_name):
    banned = ["opium", "coca", "fentanyl", "meth", "heroin"]
    if any(b in seed_name.lower() for b in banned):
        log_event(22, f"Prohibited biological material flagged: {seed_name}")
        return False
    log_event(12, f"Seed verified: {seed_name}")
    return True

def request_meal(name, address):
    log_event(31, f"Meal requested for {name} at {address}")

def detect_financial_anomaly(entity):
    log_event(52, f"Anomaly detected in records for {entity}")

def queue_construction(site):
    log_event(61, f"Infrastructure task queued at {site}")

def system_review():
    log_event(111, "Manual review requested")

# --- MAIN ---
def main():
    print("[∞] Cart 4.1 Logic Engine Online")

    check_seed("Infinity OG")
    check_seed("Coca bush")

    request_meal("Jane Doe", "Infinity City")
    detect_financial_anomaly("Example Corp")
    queue_construction("Zone A-17")

    system_review()
    log_event(96, "Cycle completed")

if __name__ == "__main__":
    main()
