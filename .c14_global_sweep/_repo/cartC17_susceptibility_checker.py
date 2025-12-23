#!/usr/bin/env python3
"""
CART 17: Magnetic Susceptibility (Chi_m) Checker

Classifies material based on magnetic susceptibility (unitless, SI system).
Ferromagnetism is assumed if Chi_m is very large and positive.
"""

import sys

def check_susceptibility():
    """Reads Chi_m and classifies the material type."""
    
    print("--- Cartridge 17: Magnetic Susceptibility Checker ---")
    
    try:
        chi_m = float(input("Enter Magnetic Susceptibility (Chi_m, unitless): "))
        
        # Thresholds for classification
        # Chi_m < 0 (e.g., -1e-5) is Diamagnetic
        # 0 < Chi_m < 1e-3 is Paramagnetic
        # Chi_m >> 1 (or often just > 1e-3) is Ferromagnetic
        
        if chi_m < -1e-8:
            classification = "DIAMAGNETIC (Weakly Repelled)"
            description = "Material generates an opposing field, found in most common materials (e.g., water, copper)."
        elif chi_m > 1e-3:
            classification = "FERROMAGNETIC (Strongly Attracted)"
            description = "Material retains magnetism (e.g., iron, nickel). Note: This is a simplified check."
        elif chi_m > 1e-8:
            classification = "PARAMAGNETIC (Weakly Attracted)"
            description = "Material aligns weakly with the field (e.g., aluminum, oxygen)."
        else:
            classification = "VACUUM-LIKE (or near-zero effect)"
            description = "Susceptibility is extremely close to zero."

        print(f"\n[OUTPUT]")
        print(f"Chi_m entered: {chi_m:.4e}")
        print(f"---")
        print(f"Classification: {classification}")
        print(f"Notes: {description}")
        
    except ValueError:
        print("\nError: Invalid input. Please enter a numeric value for Chi_m.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    check_susceptibility()
