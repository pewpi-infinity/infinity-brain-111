#!/usr/bin/env python3

import json

def audit(forks):
    report = []
    for res, data in forks.items():
        report.append({
            "residual": res,
            "forked_at": data["forked_at"],
            "branches": {
                k: len(v["nodes"])
                for k, v in data["branches"].items()
            }
        })
    return report

if __name__ == "__main__":
    import sys
    forks = json.loads(sys.stdin.read())
    print(audit(forks))
