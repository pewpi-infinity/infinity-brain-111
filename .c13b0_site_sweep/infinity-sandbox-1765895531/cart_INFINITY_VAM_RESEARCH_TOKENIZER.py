#!/usr/bin/env python3
import json
import hashlib
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
TOKENS = BASE / "tokens"
RESEARCH = BASE / "research"
INDEX = BASE / "index"

TOKENS.mkdir(parents=True, exist_ok=True)
RESEARCH.mkdir(parents=True, exist_ok=True)
INDEX.mkdir(parents=True, exist_ok=True)

NOW = datetime.datetime.utcnow().isoformat()

# -----------------------------
# VAM INPUT (structured, not copied)
# -----------------------------
VAM = {
    "vam_id": "1878-P/VAM-5",
    "name": "1878 VAM-5 Doubled Motto",
    "discovery": {
        "discoverer": "Leroy Van Allen",
        "date": "December 1965"
    },
    "top_100": True,
    "diagnostics": {
        "obverse": [
            "Doubled motto, strongest on R-I-B in PLURIBUS",
            "All left stars slightly doubled",
            "78 in date slightly doubled on right outside"
        ],
        "reverse": [
            "UNITED doubled top and bottom",
            "STATES OF AMERICA doubled at bottom",
            "ONE DOLLAR doubled at top",
            "Strongly doubled left wreath",
            "Extra tailfeathers (8TF)",
            "Blob of metal at bottom of F (key identifier)"
        ]
    },
    "die_pairing": {
        "obverse": "I2-4",
        "reverse": "A1c",
        "shared_with": [
            "VAM-3", "VAM-4", "VAM-14-6", "VAM-14-7",
            "VAM-14-11", "VAM-14-12", "VAM-14-14",
            "VAM-14-17", "VAM-14-18"
        ]
    },
    "scarcity": "Scarce in all grades",
    "market": {
        "estimated_value_usd": "1000+ circulated",
        "pcgs_population": "link_required",
        "ngc_population": "link_required",
        "past_sales": []
    },
    "references": [
        {
            "name": "VAMWorld",
            "url": "https://vamworld.com/wiki/Top_100_Morgan_VAMs",
            "type": "diagnostic_reference"
        }
    ],
    "image_policy": {
        "copied_images": False,
        "allowed_sources": [
            "user_upload",
            "licensed_sources",
            "public_domain"
        ]
    }
}

# -----------------------------
# Build research article
# -----------------------------
research = {
    "generated": NOW,
    "type": "Infinity VAM Research Article",
    "vam": VAM,
    "simplified_explanation": (
        "A VAM identifies coins struck from specific dies. "
        "The VAM-5 can be recognized by a distinct doubled motto "
        "and a small blob of metal at the base of the letter F, "
        "acting like a fingerprint across all coins struck from "
        "that die pairing."
    ),
    "infinity_view": {
        "why_it_matters": (
            "VAM-5 coins are valuable because the diagnostic markers "
            "prove a shared origin from a specific die pairing. "
            "As market data and verified examples increase, the "
            "token gains informational and commercial value."
        ),
        "growth_model": (
            "Value increases by adding verified sightings, "
            "population data, auction records, and diagnostic imagery — "
            "not by minting more coins."
        )
    }
}

# -----------------------------
# Token metadata
# -----------------------------
token_meta = {
    "token_id": "VAM-1878-5",
    "token_type": "Commerce",
    "token_value_logic": "Market + diagnostics + availability",
    "colors": {
        "blue": 3,
        "green": 1,
        "orange": 2,
        "pink": 1,
        "purple": 5,
        "red": 4,
        "yellow": 3
    },
    "timestamp": "2025-12-12T05:33:00Z"
}

# -----------------------------
# Hash token
# -----------------------------
raw = json.dumps({"research": research, "token": token_meta}, sort_keys=True).encode()
token_hash = hashlib.sha256(raw).hexdigest()

token = {
    "hash": token_hash,
    "metadata": token_meta,
    "research_ref": f"research_{token_hash}.json"
}

# -----------------------------
# Write files
# -----------------------------
with open(RESEARCH / f"research_{token_hash}.json", "w") as f:
    json.dump(research, f, indent=2)

with open(TOKENS / f"token_{token_hash}.json", "w") as f:
    json.dump(token, f, indent=2)

print("\n[∞] VAM Infinity Research Token created")
print(f"[∞] VAM: {VAM['vam_id']}")
print(f"[∞] Token Hash: {token_hash}")
print(f"[∞] Research stored, image evidence attachable later\n")
