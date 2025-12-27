#!/usr/bin/env python3
"""
CART 8: Charge Density on a Sphere
Sigma = Q / (4 * pi * R^2)
"""
import sys
import math

def calculate_charge_density():
    print("--- Cartridge 8: Surface Charge Density (Sphere) ---")
    try:
        Q_c = float(input("Enter Total Charge Q (in Coulombs): "))
        R_m = float(input("Enter Sphere Radius R (in meters): "))
        
        if R_m <= 0:
            print("Error: Radius R must be greater than zero.")
            sys.exit(1)
            
        Area = 4 * math.pi * (R_m ** 2)
        Sigma = Q_c / Area
        
        print(f"\n[OUTPUT]")
        print(f"Surface Area: {Area:.4e} m^2")
        print(f"Surface Charge Density (Sigma): {Sigma:.4e} C/m^2")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_charge_density()
