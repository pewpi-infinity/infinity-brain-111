#!/usr/bin/env python3

import json
from cart_quorum_policy import get_policy

def check(residual, reports):
    policy = get_policy()

    nodes = set(r["node"] for r in reports)
    trusted = [
        r for r in reports
        if r.get("trust", 0) >= policy["min_trust"]
    ]

    return {
        "residual": residual,
        "nodes_reporting": len(nodes),
        "trusted_reports": len(trusted),
        "quorum_passed": (
            len(nodes) >= policy["min_nodes"]
            and len(trusted) >= policy["min_occurrences"]
        )
    }

if __name__ == "__main__":
    import sys
    residual = sys.argv[1]
    reports = json.loads(sys.stdin.read())
    print(check(residual, reports))
