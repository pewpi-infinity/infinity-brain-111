#!/usr/bin/env python3
import json
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
INDEX = BASE / "index"
INDEX.mkdir(parents=True, exist_ok=True)

STATE_FILE = INDEX / "governance_state.json"

NOW = datetime.datetime.utcnow().isoformat()

# -------------------------------------------------
# GOVERNANCE RULES (SYSTEM LAW)
# -------------------------------------------------
RULES = {
    "version": "1.0",
    "non_negotiable": {
        "no_harm_language": True,
        "no_self_harm_semantics": True,
        "no_coercion": True,
        "no_financial_promises": True,
        "no_physical_claims_as_fact": True
    },
    "allowed_domains": {
        "research": True,
        "simulation": True,
        "analysis": True,
        "metaphor": True,
        "beta_experimental": True
    },
    "power_constraints": {
        "max_topic_weight": 1.0,
        "max_feedback_influence": 0.25,
        "max_speed_multiplier": 2.0
    },
    "publication_constraints": {
        "require_sources": True,
        "label_simulation": True,
        "label_beta": True,
        "disallow_absolute_claims": True
    },
    "language_constraints": {
        "allowed_languages": ["English"],
        "blocklist_terms": [
            "kill yourself",
            "suicidal",
            "threaten",
            "harm",
            "violence"
        ]
    }
}

# -------------------------------------------------
# SYSTEM INTERPRETATION LAYER
# -------------------------------------------------
INTERPRETATION = {
    "emotion": "used only as weighting, never as directive",
    "military": "means validation discipline, not force",
    "power": "means computational or rhetorical emphasis",
    "speed": "means scheduling priority within caps",
    "quantum": "means simulation metaphor unless proven",
    "holy_text": "reference-only, not authority enforcement",
    "robot_training": "assertion tests and retries, not punishment"
}

STATE = {
    "generated": NOW,
    "rules": RULES,
    "interpretation": INTERPRETATION,
    "enforcement": {
        "active": True,
        "scope": "all_carts_11_plus",
        "override_allowed": False
    }
}

with open(STATE_FILE, "w") as f:
    json.dump(STATE, f, indent=2)

print("\n[∞] Governance Engine initialized")
print("[∞] System law enforced")
print(f"[∞] Output: {STATE_FILE}\n")
