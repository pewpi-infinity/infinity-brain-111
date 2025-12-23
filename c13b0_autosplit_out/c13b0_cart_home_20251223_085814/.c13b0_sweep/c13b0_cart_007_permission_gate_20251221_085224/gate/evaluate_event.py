import json, time, hashlib, pathlib
from trust_state import update_trust

EVENTS = pathlib.Path("ledger/events.json")
EVENTS.parent.mkdir(exist_ok=True)

session = hashlib.sha256(str(time.time()).encode()).hexdigest()[:10]
trust = update_trust(session)

event = {
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "session": session,
    "accepted": True,
    "weight": trust["weight"]
}

data = []
if EVENTS.exists():
    data = json.loads(EVENTS.read_text())

data.append(event)
EVENTS.write_text(json.dumps(data, indent=2))

print("🧱 Event accepted with weight:", trust["weight"])
