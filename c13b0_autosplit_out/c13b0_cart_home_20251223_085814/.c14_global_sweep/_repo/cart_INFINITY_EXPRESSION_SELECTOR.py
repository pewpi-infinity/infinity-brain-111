#!/usr/bin/env python3
import json
import datetime
from pathlib import Path
import sys

BASE = Path("infinity_storage")
INDEX = BASE / "index"

EXPR_INDEX = INDEX / "expression_index.json"
EXPR_CATALOG = INDEX / "expression_catalog.json"
GOV_FILE = INDEX / "governance_state.json"

OUT_FILE = INDEX / "expression_selection.json"

NOW = datetime.datetime.utcnow().isoformat()

def load(p):
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return None

expr_index = load(EXPR_INDEX) or {}
expr_catalog = load(EXPR_CATALOG) or {}
gov = load(GOV_FILE) or {}

# -----------------------------
# Context input (simple & explicit)
# -----------------------------
# Usage:
# ./cart_INFINITY_EXPRESSION_SELECTOR.py <context>
#
# Context examples:
#   analysis
#   discovery
#   briefing
#   audit
#
context = sys.argv[1] if len(sys.argv) > 1 else "analysis"

# -----------------------------
# Governance constraints
# -----------------------------
rules = gov.get("rules", {})
language_rules = rules.get("language_constraints", {})
allowed_languages = language_rules.get("allowed_languages", ["English"])

# -----------------------------
# Selection logic (deterministic)
# -----------------------------
# Map context → expression name
CONTEXT_MAP = {
    "analysis": "neutral_analyst",
    "audit": "neutral_analyst",
    "briefing": "military_stern",
    "discovery": "excited_discovery"
}

expr_name = CONTEXT_MAP.get(context, "neutral_analyst")
expr_hash = expr_index.get("expressions", {}).get(expr_name)

if not expr_hash or expr_hash not in expr_catalog:
    expr_name = "neutral_analyst"
    expr_hash = expr_index.get("expressions", {}).get(expr_name)

selection = {
    "generated": NOW,
    "context": context,
    "expression_name": expr_name,
    "expression_hash": expr_hash,
    "language": allowed_languages[0],
    "governance": {
        "enforced": True,
        "notes": "Expression selected within governance constraints"
    }
}

with open(OUT_FILE, "w") as f:
    json.dump(selection, f, indent=2)

print("\n[∞] Expression selected")
print(f"[∞] Context: {context}")
print(f"[∞] Expression: {expr_name}")
print(f"[∞] Hash: {expr_hash}")
print(f"[∞] Output: {OUT_FILE}\n")
