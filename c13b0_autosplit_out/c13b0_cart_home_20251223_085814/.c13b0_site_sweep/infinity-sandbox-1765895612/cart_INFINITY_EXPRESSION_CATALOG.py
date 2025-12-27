#!/usr/bin/env python3
import json
import hashlib
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
INDEX = BASE / "index"
INDEX.mkdir(parents=True, exist_ok=True)

CATALOG_FILE = INDEX / "expression_catalog.json"
INDEX_FILE = INDEX / "expression_index.json"

NOW = datetime.datetime.utcnow().isoformat()

# -------------------------------------------------
# EXPRESSION DEFINITIONS (EXTEND THIS OVER TIME)
# -------------------------------------------------
EXPRESSIONS = [
    {
        "name": "military_stern",
        "purpose": "Convey seriousness, discipline, and clarity under pressure",
        "tone": "controlled, concise, directive",
        "reasoning_pattern": [
            "state objective",
            "establish constraints",
            "enumerate steps",
            "confirm readiness"
        ],
        "language_markers": [
            "clear headings",
            "short sentences",
            "no adjectives",
            "no speculation"
        ],
        "source_domain": "military doctrine (non-combat, organizational)",
        "safety_notes": "No threats, no coercion, no dehumanizing language"
    },
    {
        "name": "excited_discovery",
        "purpose": "Communicate novelty, insight, and momentum",
        "tone": "energetic, forward-moving, curious",
        "reasoning_pattern": [
            "highlight anomaly",
            "connect ideas",
            "speculate carefully",
            "invite exploration"
        ],
        "language_markers": [
            "exclamation points (limited)",
            "future-oriented verbs",
            "metaphor allowed"
        ],
        "source_domain": "scientific discovery narratives",
        "safety_notes": "Speculation must be labeled"
    },
    {
        "name": "neutral_analyst",
        "purpose": "Provide unbiased assessment and clarity",
        "tone": "measured, factual, calm",
        "reasoning_pattern": [
            "define terms",
            "present evidence",
            "compare alternatives",
            "state limits"
        ],
        "language_markers": [
            "citations",
            "balanced phrasing",
            "explicit uncertainty"
        ],
        "source_domain": "academic & policy analysis",
        "safety_notes": "No persuasion intent"
    }
]

# -------------------------------------------------
# BUILD HASHED CATALOG
# -------------------------------------------------
catalog = {}
index = {
    "generated": NOW,
    "count": 0,
    "expressions": {}
}

for expr in EXPRESSIONS:
    raw = json.dumps(expr, sort_keys=True).encode()
    h = hashlib.sha256(raw).hexdigest()

    expr_entry = {
        "hash": h,
        "created": NOW,
        "definition": expr
    }

    catalog[h] = expr_entry
    index["expressions"][expr["name"]] = h
    index["count"] += 1

# -------------------------------------------------
# WRITE FILES
# -------------------------------------------------
with open(CATALOG_FILE, "w") as f:
    json.dump(catalog, f, indent=2)

with open(INDEX_FILE, "w") as f:
    json.dump(index, f, indent=2)

print("\n[∞] Expression & Reasoning Catalog built")
print(f"[∞] Expressions stored: {index['count']}")
print(f"[∞] Catalog: {CATALOG_FILE}")
print(f"[∞] Index: {INDEX_FILE}\n")
