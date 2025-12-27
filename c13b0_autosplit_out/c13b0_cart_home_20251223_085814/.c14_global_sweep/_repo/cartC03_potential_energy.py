#!/usr/bin/env python3
"""
CART 3: Electric Potential Energy
U = k_e * (q1 * q2) / r
"""
import sys

def calculate_potential_energy():
    K_E = 8.987551787e9 # Electrostatic constant
    print("--- Cartridge 3: Electric Potential Energy ---")
    try:
        q1_c = float(input("Enter charge q1 (in Coulombs): "))
        q2_c = float(input("Enter charge q2 (in Coulombs): "))
        r_m = float(input("Enter separation distance r (in meters): "))
        
        if r_m <= 0:
            print("Error: Distance r must be greater than zero.")
            sys.exit(1)
            
        U = K_E * ((q1_c * q2_c) / r_m)
        interaction_type = "Potential Energy (Repulsion)" if U >= 0 else "Potential Energy (Attraction)"
        
        print(f"\n[OUTPUT]")
        print(f"{interaction_type}: {U:.4e} Joules")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_potential_energy()
