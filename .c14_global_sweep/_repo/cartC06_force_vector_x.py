#!/usr/bin/env python3
"""
CART 6: Electrostatic Force Vector (X-Component Simplification)
Calculates F_x between q1 at (0,0) and q2 at (x2, 0).
F_x = k_e * q1 * q2 / x2^2
"""
import sys

def calculate_force_x_component():
    K_E = 8.987551787e9
    print("--- Cartridge 6: Electrostatic Force X-Component ---")
    try:
        q1_c = float(input("Enter charge q1 (in Coulombs): "))
        q2_c = float(input("Enter charge q2 (in Coulombs): "))
        x2_m = float(input("Enter X-distance separation x2 (in meters, must be > 0): "))
        
        if x2_m <= 0:
            print("Error: Distance x2 must be greater than zero.")
            sys.exit(1)
            
        F_x = K_E * (q1_c * q2_c) / (x2_m ** 2)
        
        print(f"\n[OUTPUT]")
        print(f"Force X-Component (F_x): {F_x:.4e} Newtons")
        print("Positive F_x = Repulsion; Negative F_x = Attraction.")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_force_x_component()
