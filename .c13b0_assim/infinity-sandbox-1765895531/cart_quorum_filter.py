#!/usr/bin/env python3

import json
from collections import defaultdict
from cart_quorum_check import check

def filter_records(records):
    grouped = defaultdict(list)
    for r in records:
        if "residual" in r:
            grouped[r["residual"]].append(r)

    passed = []
    for res, group in grouped.items():
        result = check(res, group)
        if result["quorum_passed"]:
            passed.extend(group)

    return passed

if __name__ == "__main__":
    import sys
    records = json.loads(sys.stdin.read())
    print(filter_records(records))
