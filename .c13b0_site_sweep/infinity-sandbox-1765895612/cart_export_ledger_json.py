#!/usr/bin/env python3

import json

LEDGER = "residual_ledger.jsonl"
OUT = "export_ledger.json"

def export():
    records = []
    try:
        with open(LEDGER, "r") as f:
            for line in f:
                records.append(json.loads(line))
    except FileNotFoundError:
        pass

    with open(OUT, "w") as f:
        json.dump(records, f, indent=2)

    return {"exported": len(records), "file": OUT}

if __name__ == "__main__":
    print(export())
