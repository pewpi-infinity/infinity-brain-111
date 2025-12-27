#!/usr/bin/env python3
"""
COMPOSITE — EM Limits & Assumptions Auditor

Interprets conceptual outputs from EM-related carts to determine
which modeling assumptions are valid, strained, or invalid.

Educational, analytical, non-operational.
"""

from typing import Dict


def audit_assumptions(inputs: Dict) -> Dict:
    """
    Expected conceptual inputs:
    - quasi_static_valid: True | False | "unknown"
    - wave_effects_relevant: True | False | "unknown"
    - skin_depth_limiting: True | False | "unknown"
    - relativistic_effects: True | False | "unknown"
    - quantum_effects: True | False | "unknown"
    - scale_consistency: "local" | "mixed" | "nonlocal" | "unknown"
    """

    qs = inputs.get("quasi_static_valid", "unknown")
    wave = inputs.get("wave_effects_relevant", "unknown")
    skin = inputs.get("skin_depth_limiting", "unknown")
    rel = inputs.get("relativistic_effects", "unknown")
    quant = inputs.get("quantum_effects", "unknown")
    scale = inputs.get("scale_consistency", "unknown")

    # --- Assumption flags ---
    assumptions = {
        "quasi_static": "valid" if qs is True else "invalid" if qs is False else "unknown",
        "wave_modeling": "required" if wave is True else "not_required" if wave is False else "unknown",
        "skin_depth": "limiting" if skin is True else "not_limiting" if skin is False else "unknown",
        "relativistic": "relevant" if rel is True else "negligible" if rel is False else "unknown",
        "quantum": "relevant" if quant is True else "negligible" if quant is False else "unknown",
        "scale": scale
    }

    # --- Overall validity summary ---
    if assumptions["relativistic"] == "relevant" or assumptions["quantum"] == "relevant":
        overall = "classical assumptions strained"
    elif assumptions["wave_modeling"] == "required" or assumptions["skin_depth"] == "limiting":
        overall = "quasi-static assumptions strained"
    elif assumptions["quasi_static"] == "valid":
        overall = "common assumptions valid"
    else:
        overall = "mixed / review required"

    # --- Confidence estimate ---
    known = sum(1 for v in assumptions.values() if v != "unknown")
    confidence = round(known / len(assumptions), 2)

    return {
        "assumption_flags": assumptions,
        "overall_assessment": overall,
        "confidence": confidence,
        "notes": (
            "Assessment reflects model-validity only. "
            "No operational guidance or parameter limits are implied."
        )
    }


def demo():
    """
    Demonstration with placeholder conceptual inputs.
    Replace with upstream composite outputs in a pipeline.
    """
    example_inputs = {
        "quasi_static_valid": False,
        "wave_effects_relevant": True,
        "skin_depth_limiting": True,
        "relativistic_effects": False,
        "quantum_effects": "unknown",
        "scale_consistency": "mixed"
    }

    result = audit_assumptions(example_inputs)

    print("\nEM LIMITS & ASSUMPTIONS AUDIT:\n")
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    demo()
