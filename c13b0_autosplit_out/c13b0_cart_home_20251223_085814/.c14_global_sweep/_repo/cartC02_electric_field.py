#!/usr/bin/env python3
"""
CART 2: Electric Field (Point Charge)
E = k_e * |q| / r^2
"""
import sys

def calculate_electric_field():
    K_E = 8.987551787e9 # Electrostatic constant
    print("--- Cartridge 2: Electric Field Magnitude ---")
    try:
        q_c = float(input("Enter point charge q (in Coulombs): "))
        r_m = float(input("Enter distance r from the charge (in meters): "))
        
        if r_m <= 0:
            print("Error: Distance r must be greater than zero.")
            sys.exit(1)
            
        E = K_E * (abs(q_c) / (r_m ** 2))
        
        print(f"\n[OUTPUT]")
        print(f"Electric Field Magnitude (E): {E:.4e} N/C (or V/m)")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_electric_field()
