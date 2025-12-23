#!/usr/bin/env python3
"""
CART 12: Solenoid Magnetic Field
B = mu_0 * n * I
"""
import sys
import math

def calculate_solenoid_field():
    MU_0 = 4 * math.pi * 1e-7 # Permeability of free space
    print("--- Cartridge 12: Solenoid Magnetic Field ---")
    try:
        I_a = float(input("Enter current I (in Amperes): "))
        n_inv_m = float(input("Enter turns per unit length n (N/L in turns/meter): "))
        
        if n_inv_m < 0:
            print("Error: Turns per unit length cannot be negative.")
            sys.exit(1)
            
        B = MU_0 * n_inv_m * I_a
        
        print(f"\n[OUTPUT]")
        print(f"Magnetic Field (B): {B:.4e} Tesla")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_solenoid_field()
