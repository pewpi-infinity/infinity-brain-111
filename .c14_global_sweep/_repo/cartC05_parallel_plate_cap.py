#!/usr/bin/env python3
"""
CART 5: Parallel Plate Capacitor Calculator
C = epsilon_r * epsilon_0 * A / d
"""
import sys
import math

def calculate_capacitance():
    EPSILON_0 = 8.854187817e-12 # Permittivity of free space
    print("--- Cartridge 5: Parallel Plate Capacitance ---")
    try:
        A_m2 = float(input("Enter Plate Area A (square meters): "))
        d_m = float(input("Enter separation distance d (meters): "))
        epsilon_r = float(input("Enter Relative Permittivity (Dielectric Constant epsilon_r): "))
        
        if A_m2 <= 0 or d_m <= 0 or epsilon_r < 1:
            print("Error: Area A and distance d must be positive. epsilon_r must be >= 1.")
            sys.exit(1)
            
        C = epsilon_r * EPSILON_0 * (A_m2 / d_m)
        
        print(f"\n[OUTPUT]")
        print(f"Capacitance (C): {C:.4e} Farads (F)")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_capacitance()
