#!/usr/bin/env python3

import json
import os
from datetime import datetime

LEDGER_FILE = "quant_ledger.jsonl"

def write_entry(entry):
    record = {
        "time": datetime.utcnow().isoformat(),
        "entry": entry
    }
    with open(LEDGER_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")
    return record

def read_ledger(limit=10):
    if not os.path.exists(LEDGER_FILE):
        return []
    with open(LEDGER_FILE, "r") as f:
        lines = f.readlines()[-limit:]
    return [json.loads(l) for l in lines]

def run(payload):
    return write_entry(payload)

if __name__ == "__main__":
    sample = {
        "state": "/÷",
        "node": "NODE-EXAMPLE",
        "hash": "example_hash",
        "agreement": "agreement_hash"
    }

    print(run(sample))
    print(read_ledger())
