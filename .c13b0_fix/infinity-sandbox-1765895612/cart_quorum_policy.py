#!/usr/bin/env python3

POLICY = {
    "min_nodes": 3,
    "min_occurrences": 2,
    "min_trust": 0.4
}

def get_policy():
    return POLICY

if __name__ == "__main__":
    print(get_policy())
