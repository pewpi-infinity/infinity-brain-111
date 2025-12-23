#!/usr/bin/env python3

import json
from datetime import datetime

def fork(residual, group_a, group_b):
    stamp = datetime.utcnow().isoformat()
    return {
        "residual": residual,
        "forked_at": stamp,
        "branches": {
            "A": {
                "nodes": list({r["node"] for r in group_a}),
                "records": group_a
            },
            "B": {
                "nodes": list({r["node"] for r in group_b}),
                "records": group_b
            }
        }
    }

if __name__ == "__main__":
    import sys
    data = json.loads(sys.stdin.read())
    print(fork(
        data["residual"],
        data["branch_A"],
        data["branch_B"]
    ))
