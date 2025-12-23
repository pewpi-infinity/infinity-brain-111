#!/usr/bin/env python3
"""
CART 19: Relative Permeability (Mu_r) Calculator

Calculates Mu_r from Chi_m.
"""

import sys

def calculate_relative_permeability():
    """Calculates Mu_r = 1 + Chi_m."""
    
    print("--- Cartridge 19: Relative Permeability Calculator ---")
    
    try:
        chi_m = float(input("Enter Magnetic Susceptibility (Chi_m, unitless): "))
        
        # Calculate Relative Permeability
        mu_r = 1.0 + chi_m
        
        print(f"\n[OUTPUT]")
        print(f"Chi_m: {chi_m:.4e}")
        print(f"---")
        print(f"Relative Permeability (Mu_r): {mu_r:.4e} (unitless)")
        
        if mu_r < 1:
            print("Note: Mu_r < 1 indicates a Diamagnetic material (dilutes flux).")
        elif mu_r > 1.0001:
            print("Note: Mu_r > 1 indicates a Paramagnetic or Ferromagnetic material (concentrates flux).")
            
    except ValueError:
        print("\nError: Invalid input. Please enter a numeric value for Chi_m.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_relative_permeability()
