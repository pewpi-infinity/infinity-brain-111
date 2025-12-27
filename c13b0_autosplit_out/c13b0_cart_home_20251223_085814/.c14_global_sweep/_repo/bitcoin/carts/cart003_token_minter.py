#!/usr/bin/env python3
import json, time, uuid, os, math

TOKEN_FILE = "bitcoin/ledger/TOKEN_LEDGER.json"
os.makedirs("bitcoin/ledger", exist_ok=True)

try:
    ledger = json.load(open(TOKEN_FILE))
except:
    ledger = []

hashrate = 12000
seconds = 3600
work = hashrate * seconds

token = {
    "id": f"∞BTC-{uuid.uuid4().hex[:10]}",
    "hashrate_Hs": hashrate,
    "seconds": seconds,
    "hash_work": work,
    "octave": int(math.log10(work)) % 12,
    "timestamp": int(time.time())
}

ledger.append(token)
json.dump(ledger, open(TOKEN_FILE, "w"), indent=2)

print("[∞] Token minted:", token["id"])
