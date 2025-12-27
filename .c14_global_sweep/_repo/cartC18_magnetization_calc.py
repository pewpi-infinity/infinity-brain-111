#!/usr/bin/env python3
"""
CART 18: Magnetization (M) Calculator

Calculates Magnetization M based on applied field H and susceptibility Chi_m.
"""

import sys

def calculate_magnetization():
    """Calculates M = Chi_m * H."""
    
    print("--- Cartridge 18: Magnetization Calculator ---")
    
    try:
        chi_m = float(input("Enter Magnetic Susceptibility (Chi_m, unitless): "))
        H_a_m = float(input("Enter Magnetic Field Strength H (in Amperes/meter): "))
        
        # Calculate Magnetization
        M = chi_m * H_a_m
        
        print(f"\n[OUTPUT]")
        print(f"Chi_m: {chi_m:.4e}")
        print(f"Field Strength (H): {H_a_m:.4e} A/m")
        print(f"---")
        print(f"Magnetization (M): {M:.4e} Amperes/meter")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_magnetization()
