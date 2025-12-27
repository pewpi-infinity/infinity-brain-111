#!/usr/bin/env python3

import json
from collections import defaultdict
from cart_quorum_check import check

def audit(records):
    grouped = defaultdict(list)
    for r in records:
        grouped[r["residual"]].append(r)

    report = []
    for res, group in grouped.items():
        report.append(check(res, group))

    return report

if __name__ == "__main__":
    import sys
    records = json.loads(sys.stdin.read())
    print(audit(records))
