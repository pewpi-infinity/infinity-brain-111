#!/usr/bin/env python3
"""
CART 15: Self-Inductance of a Solenoid
L = mu_0 * n^2 * A * l
"""
import sys
import math

def calculate_solenoid_inductance():
    MU_0 = 4 * math.pi * 1e-7
    print("--- Cartridge 15: Solenoid Self-Inductance ---")
    try:
        n_inv_m = float(input("Enter turns per unit length n (N/L in turns/meter): "))
        A_m2 = float(input("Enter Cross-sectional Area A (in square meters): "))
        l_m = float(input("Enter Solenoid Length l (in meters): "))
        
        if n_inv_m <= 0 or A_m2 <= 0 or l_m <= 0:
            print("Error: All geometric inputs must be positive.")
            sys.exit(1)
            
        L = MU_0 * (n_inv_m ** 2) * A_m2 * l_m
        
        print(f"\n[OUTPUT]")
        print(f"Self-Inductance (L): {L:.4e} Henries (H)")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_solenoid_inductance()
