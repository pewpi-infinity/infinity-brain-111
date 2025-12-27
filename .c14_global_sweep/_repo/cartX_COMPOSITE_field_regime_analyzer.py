#!/usr/bin/env python3
"""
COMPOSITE — Field Regime Analyzer

This cart interprets results from multiple magnetics carts
to determine which physical regime applies.

Educational, analytical, non-operational.
"""

from typing import Dict

def analyze_regime(inputs: Dict) -> Dict:
    """
    Expected input keys (conceptual):
    - magnetic_flux_level
    - relative_permeability
    - critical_field_ratio
    """

    flux = inputs.get("magnetic_flux_level", "unknown")
    mu_r = inputs.get("relative_permeability", "unknown")
    crit = inputs.get("critical_field_ratio", 0)

    # --- Field strength regime ---
    if crit == "unknown":
        field_regime = "unknown"
    elif crit < 0.1:
        field_regime = "low"
    elif crit < 0.7:
        field_regime = "moderate"
    else:
        field_regime = "extreme"

    # --- Material response validity ---
    if mu_r == "unknown":
        material_regime = "unknown"
    elif mu_r < 5:
        material_regime = "weak-response"
    elif mu_r < 100:
        material_regime = "linear"
    else:
        material_regime = "nonlinear / saturation-likely"

    # --- Physics assumptions ---
    if field_regime in ("low", "moderate") and material_regime == "linear":
        assumption_status = "classical models valid"
    elif field_regime == "extreme":
        assumption_status = "classical breakdown likely"
    else:
        assumption_status = "mixed / review required"

    # --- Confidence estimate ---
    confidence = 0.0
    confidence += 0.4 if flux != "unknown" else 0.0
    confidence += 0.4 if mu_r != "unknown" else 0.0
    confidence += 0.2 if crit != "unknown" else 0.0

    return {
        "field_regime": field_regime,
        "material_regime": material_regime,
        "assumption_status": assumption_status,
        "confidence": round(confidence, 2),
        "notes": (
            "This output classifies physical regimes only. "
            "No operational or construction guidance is provided."
        )
    }


def demo():
    """
    Demonstration with placeholder inputs.
    Replace with outputs from upstream carts when wiring pipelines.
    """
    example_inputs = {
        "magnetic_flux_level": "measured",
        "relative_permeability": 50,
        "critical_field_ratio": 0.3
    }

    result = analyze_regime(example_inputs)

    print("\nFIELD REGIME ANALYSIS RESULT:\n")
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    demo()
