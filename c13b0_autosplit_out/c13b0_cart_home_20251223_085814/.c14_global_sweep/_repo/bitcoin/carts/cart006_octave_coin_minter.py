#!/usr/bin/env python3
import json, time, math, uuid, os

LEDGER = "bitcoin/ledger/OCTAVE_COINS.json"
os.makedirs("bitcoin/ledger", exist_ok=True)

try:
    coins = json.load(open(LEDGER))
except:
    coins = []

hash_work = 12000 * 3600
octave = int(math.log10(hash_work)) % 12

coin = {
    "id": f"∞OCT-{uuid.uuid4().hex[:8]}",
    "octave": octave,
    "value_basis": hash_work,
    "timestamp": int(time.time())
}

coins.append(coin)
json.dump(coins, open(LEDGER, "w"), indent=2)

print("[∞OCT] Octave coin minted:", coin["id"])
