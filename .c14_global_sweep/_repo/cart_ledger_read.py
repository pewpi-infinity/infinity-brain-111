#!/usr/bin/env python3

import json
import sys

LEDGER = "residual_ledger.jsonl"

def read_last(n=20):
    try:
        with open(LEDGER, "r") as f:
            lines = f.readlines()[-n:]
        return [json.loads(l) for l in lines]
    except FileNotFoundError:
        return []

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    print(read_last(n))
