import json, pathlib, time

TRUST_FILE = pathlib.Path("ledger/trust.json")
TRUST_FILE.parent.mkdir(exist_ok=True)

def load_trust():
    if TRUST_FILE.exists():
        return json.loads(TRUST_FILE.read_text())
    return {}

def save_trust(data):
    TRUST_FILE.write_text(json.dumps(data, indent=2))

def update_trust(session_id):
    trust = load_trust()
    now = int(time.time())

    if session_id not in trust:
        trust[session_id] = {
            "first_seen": now,
            "events": 0,
            "weight": 0.1
        }

    trust[session_id]["events"] += 1

    # slow growth, no spikes
    trust[session_id]["weight"] = min(
        1.0,
        trust[session_id]["weight"] + 0.02
    )

    save_trust(trust)
    return trust[session_id]
