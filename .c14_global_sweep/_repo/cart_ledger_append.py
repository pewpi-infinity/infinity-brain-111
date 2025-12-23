#!/usr/bin/env python3

import json
from datetime import datetime
import sys

LEDGER = "residual_ledger.jsonl"

def append(record):
    record["time"] = datetime.utcnow().isoformat()
    with open(LEDGER, "a") as f:
        f.write(json.dumps(record) + "\n")
    return record

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./cart_ledger_append.py '<json>'")
        sys.exit(1)
    data = json.loads(sys.argv[1])
    print(append(data))
