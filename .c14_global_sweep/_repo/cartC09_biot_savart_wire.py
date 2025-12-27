#!/usr/bin/env python3
"""
CART 9: Biot-Savart Law (Straight Wire Field)
B = mu_0 * I / (2 * pi * r)
"""
import sys
import math

def calculate_straight_wire_field():
    MU_0 = 4 * math.pi * 1e-7 # Permeability of free space
    print("--- Cartridge 9: Straight Wire Magnetic Field ---")
    try:
        I_a = float(input("Enter current I (in Amperes): "))
        r_m = float(input("Enter perpendicular distance r (in meters): "))
        
        if r_m <= 0:
            print("Error: Distance r must be greater than zero.")
            sys.exit(1)
            
        B = (MU_0 * I_a) / (2 * math.pi * r_m)
        
        print(f"\n[OUTPUT]")
        print(f"Magnetic Field (B): {B:.4e} Tesla")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_straight_wire_field()
