#!/usr/bin/env python3
"""
CART 20: Simple Landau Diamagnetism Model

Conceptual script to show dependence of Diamagnetic susceptibility (Chi_dia) on 
number density and orbital radius (simplified to 'mean radius').
Chi_dia is proportional to (n * r^2).
"""

import sys

def calculate_diamagnetic_factor():
    """Calculates a conceptual factor proportional to Landau Diamagnetic susceptibility."""
    
    print("--- Cartridge 20: Landau Diamagnetism Factor ---")
    print("NOTE: This calculates a proportional factor, not the absolute Chi_m.")
    
    try:
        n_inv_m3 = float(input("Enter Electron Number Density n (electrons/m^3): "))
        r_m = float(input("Enter Mean Orbital Radius r (in meters): "))
        
        if n_inv_m3 < 0 or r_m < 0:
            print("Error: Density and Radius must be non-negative.")
            sys.exit(1)
            
        # Chi_dia is proportional to - (n * e^2 * mu_0 * <r^2>) / (6 * m_e)
        # We calculate the core dependence: n * r^2
        diamagnetic_factor = n_inv_m3 * (r_m ** 2)
        
        print(f"\n[OUTPUT]")
        print(f"Electron Density (n): {n_inv_m3:.4e} m^-3")
        print(f"Mean Radius (r): {r_m:.4e} m")
        print(f"---")
        print(f"Diamagnetic Factor (n * r^2): {diamagnetic_factor:.4e}")
        print("Increasing this factor increases the Diamagnetic susceptibility (more negative Chi_m).")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_diamagnetic_factor()
