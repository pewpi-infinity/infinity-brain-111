#!/usr/bin/env python3

POLICY = {
    "min_dissent_nodes": 2,
    "max_trust_divergence": 0.35,
    "allow_parallel": True
}

def get_policy():
    return POLICY

if __name__ == "__main__":
    print(get_policy())
