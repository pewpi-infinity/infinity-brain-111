#!/usr/bin/env python3
import os
import json
import datetime
import hashlib
import requests
import sys
from pathlib import Path

# -----------------------------
# Infinity+ Storage Layout
# -----------------------------
BASE = Path("infinity_storage")
RESEARCH = BASE / "research"
TOKENS = BASE / "tokens"
INDEX = BASE / "index"

for p in [RESEARCH, TOKENS, INDEX]:
    p.mkdir(parents=True, exist_ok=True)

# -----------------------------
# Input
# -----------------------------
TERM = "quantum biology"
if len(sys.argv) > 1:
    TERM = " ".join(sys.argv[1:])

NOW = datetime.datetime.utcnow().isoformat()
YEAR = NOW[:4]
MONTH = NOW[5:7]

(RESEARCH / YEAR / MONTH).mkdir(parents=True, exist_ok=True)
(TOKENS / YEAR / MONTH).mkdir(parents=True, exist_ok=True)

print(f"\n[∞] Infinity+ Research Writer")
print(f"[∞] Term: {TERM}")
print(f"[∞] Time: {NOW}\n")

# -----------------------------
# Fetch arXiv
# -----------------------------
query_url = (
    "http://export.arxiv.org/api/query?"
    f"search_query=all:{TERM.replace(' ', '+')}"
    "&start=0&max_results=1"
)

print("[∞] Contacting arXiv...")
response = requests.get(query_url, timeout=30)
response.raise_for_status()

raw_data = response.text
hash_id = hashlib.sha256(raw_data.encode()).hexdigest()[:12]

# -----------------------------
# Write Research
# -----------------------------
research_file = RESEARCH / YEAR / MONTH / f"arxiv_{hash_id}.txt"

with open(research_file, "w") as f:
    f.write(raw_data)

print(f"[∞] Research stored:")
print(f"    {research_file}")

# -----------------------------
# Mint Token (Immutable)
# -----------------------------
token_number = f"INF-{hash_id.upper()}"
token = {
    "token_number": token_number,
    "token_value": 1,
    "token_color": "GREEN",
    "datetime": NOW,
    "research_ref": str(research_file),
    "source": "arXiv",
    "term": TERM
}

token_file = TOKENS / YEAR / MONTH / f"{token_number}.json"

with open(token_file, "w") as f:
    json.dump(token, f, indent=2)

print(f"\n[∞] Token minted:")
print(f"    {token_file}")
print("\n[∞] Infinity+ cycle complete\n")
