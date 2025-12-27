#!/usr/bin/env python3
"""
CART 1: Coulomb's Law (Electrostatic Force)
F = k_e * |q1 * q2| / r^2
"""
import sys

def calculate_coulomb_force():
    K_E = 8.987551787e9 # Electrostatic constant
    print("--- Cartridge 1: Coulomb's Force ---")
    try:
        q1_c = float(input("Enter charge q1 (in Coulombs): "))
        q2_c = float(input("Enter charge q2 (in Coulombs): "))
        r_m = float(input("Enter separation distance r (in meters): "))
        
        if r_m <= 0:
            print("Error: Distance r must be greater than zero.")
            sys.exit(1)
            
        F = K_E * (abs(q1_c * q2_c) / (r_m ** 2))
        interaction = "Attraction" if (q1_c * q2_c < 0) else "Repulsion"
        
        print(f"\n[OUTPUT]")
        print(f"Force Magnitude (F): {F:.4e} Newtons")
        print(f"Interaction Type: {interaction}")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_coulomb_force()
