#!/usr/bin/env python3
import json
import datetime
from pathlib import Path
import sys

BASE = Path("infinity_storage")
INDEX = BASE / "index"
INDEX.mkdir(parents=True, exist_ok=True)

EXPR_SELECTION = INDEX / "expression_selection.json"
GOV_FILE = INDEX / "governance_state.json"

OUT_FILE = INDEX / "reasoning_thread.json"

NOW = datetime.datetime.utcnow().isoformat()

def load(p):
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return None

expression = load(EXPR_SELECTION) or {}
governance = load(GOV_FILE) or {}

# -----------------------------
# Input objective
# -----------------------------
# Usage:
# ./cart_INFINITY_REASONING_THREAD_ENGINE.py "<objective>"
#
objective = sys.argv[1] if len(sys.argv) > 1 else "analyze hydrogen research trends"

# -----------------------------
# Governance constraints
# -----------------------------
rules = governance.get("rules", {})
non_neg = rules.get("non_negotiable", {})

# -----------------------------
# Build reasoning thread
# -----------------------------
thread = {
    "generated": NOW,
    "objective": objective,
    "expression_context": {
        "name": expression.get("expression_name"),
        "hash": expression.get("expression_hash")
    },
    "premises": [
        "Only verified sources may be used",
        "Speculation must be labeled",
        "No absolute claims permitted"
    ],
    "constraints": [
        k for k, v in non_neg.items() if v is True
    ],
    "logic_steps": [
        {
            "step": 1,
            "type": "definition",
            "description": "Define key terms and scope of the objective"
        },
        {
            "step": 2,
            "type": "evidence_scan",
            "description": "Identify available evidence relevant to the objective"
        },
        {
            "step": 3,
            "type": "relationship_mapping",
            "description": "Connect evidence through causal or correlational links"
        },
        {
            "step": 4,
            "type": "constraint_check",
            "description": "Verify reasoning does not violate governance constraints"
        },
        {
            "step": 5,
            "type": "provisional_inference",
            "description": "Draw tentative conclusions with uncertainty noted"
        }
    ],
    "provisional_conclusion": {
        "statement": "Pending execution of logic steps",
        "status": "incomplete"
    },
    "confidence": {
        "level": "unknown",
        "notes": "Confidence assigned only after evidence integration"
    }
}

# -----------------------------
# Write reasoning thread
# -----------------------------
with open(OUT_FILE, "w") as f:
    json.dump(thread, f, indent=2)

print("\n[∞] Reasoning Thread Engine initialized")
print(f"[∞] Objective: {objective}")
print(f"[∞] Expression context: {expression.get('expression_name')}")
print(f"[∞] Output: {OUT_FILE}\n")
