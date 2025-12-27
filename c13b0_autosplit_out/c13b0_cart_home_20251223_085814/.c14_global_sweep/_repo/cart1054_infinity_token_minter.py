#!/usr/bin/env python3
# cart1054_infinity_token_minter.py

import os
import json
import hashlib
from datetime import datetime
from collections import defaultdict, Counter

# ---------------- CONFIG ---------------- #

TOKEN_DIR = "infinity_tokens"
DICT_FILE = "infinity_dictionary.json"

BASE_TOKEN = {
    "number": 1054,
    "value": 2593,
    "color": "RED",
    "datetime": "2025-12-05 22:33:45"
}

os.makedirs(TOKEN_DIR, exist_ok=True)

# ---------------- DICTIONARY ---------------- #
# Traversal graph (can be expanded endlessly)

DEFAULT_DICTIONARY = {
    "bitcoin": ["blockchain", "hashrate", "proof of work", "ledger"],
    "blockchain": ["ledger", "immutability", "tokens"],
    "tokens": ["value", "exchange", "infinity"],
    "infinity": ["recursion", "networks", "research"],
    "research": ["citations", "papers", "links"],
    "links": ["jump", "connection", "graph"],
    "graph": ["nodes", "edges", "recursion"]
}

if not os.path.exists(DICT_FILE):
    with open(DICT_FILE, "w") as f:
        json.dump(DEFAULT_DICTIONARY, f, indent=2)

with open(DICT_FILE) as f:
    DICTIONARY = json.load(f)

# ---------------- FUNCTIONS ---------------- #

def expand_terms(seeds, depth=2):
    visited = set(seeds)
    jumps = []

    def dfs(term, d):
        if d == 0:
            return
        for nxt in DICTIONARY.get(term, []):
            jumps.append(nxt)
            if nxt not in visited:
                visited.add(nxt)
                dfs(nxt, d - 1)

    for s in seeds:
        dfs(s, depth)

    return jumps

def token_hash(data):
    h = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    return h

# ---------------- MAIN ---------------- #

print("\n[∞] Infinity Token Minter\n")

seed_input = input("Enter seed terms (comma separated): ").strip()
seed_terms = [s.strip().lower() for s in seed_input.split(",") if s.strip()]

if not seed_terms:
    print("[∞] No seeds provided. Exiting.")
    exit(1)

internal_jumps = expand_terms(seed_terms, depth=3)
jump_counts = Counter(internal_jumps)

external_links = [
    "https://bitcoin.org/bitcoin.pdf",
    "https://arxiv.org",
    "https://github.com",
    "https://en.wikipedia.org/wiki/Blockchain"
]

# ---------------- VALUE CALCULATION ---------------- #

value = BASE_TOKEN["value"]

# Internal jumps
unique_internal = len(jump_counts)
repeat_internal = sum(c - 1 for c in jump_counts.values() if c > 1)

value += unique_internal + repeat_internal

# External links count as virtual tokens
value += len(external_links)

# ---------------- TOKEN BUILD ---------------- #

token = {
    "token_number": BASE_TOKEN["number"],
    "token_color": BASE_TOKEN["color"],
    "created": BASE_TOKEN["datetime"],
    "seed_terms": seed_terms,
    "internal_jumps": dict(jump_counts),
    "external_links": external_links,
    "jump_value": {
        "unique_internal": unique_internal,
        "repeat_internal": repeat_internal,
        "external_virtual_tokens": len(external_links)
    },
    "final_value": value
}

token["hash"] = token_hash(token)

# ---------------- WRITE TOKEN ---------------- #

fname = f"INF-{token['token_number']}_{token['hash'][:8]}.json"
path = os.path.join(TOKEN_DIR, fname)

with open(path, "w") as f:
    json.dump(token, f, indent=2)

print(f"\n[∞] Token minted:")
print(f"    File: {path}")
print(f"    Final Value: {value}")
print(f"    Color: {token['token_color']}")
print(f"    Hash: {token['hash']}\n")
