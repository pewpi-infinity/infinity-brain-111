#!/usr/bin/env python3

import json
from cart_fork_policy import get_policy

def detect(residual, reports):
    policy = get_policy()
    trusts = [r.get("trust", 0) for r in reports]

    if not trusts:
        return None

    max_t = max(trusts)
    min_t = min(trusts)
    divergence = abs(max_t - min_t)

    dissent_nodes = [
        r["node"] for r in reports
        if abs(r.get("trust", 0) - max_t) > policy["max_trust_divergence"]
    ]

    fork = (
        policy["allow_parallel"]
        and len(set(dissent_nodes)) >= policy["min_dissent_nodes"]
    )

    return {
        "residual": residual,
        "divergence": round(divergence, 6),
        "dissent_nodes": list(set(dissent_nodes)),
        "fork_required": fork
    }

if __name__ == "__main__":
    import sys
    residual = sys.argv[1]
    reports = json.loads(sys.stdin.read())
    print(detect(residual, reports))
