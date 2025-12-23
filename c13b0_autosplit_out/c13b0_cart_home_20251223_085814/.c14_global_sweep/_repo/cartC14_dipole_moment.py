#!/usr/bin/env python3
"""
CART 14: Magnetic Dipole Moment
mu = N * I * A
"""
import sys

def calculate_magnetic_dipole_moment():
    print("--- Cartridge 14: Magnetic Dipole Moment ---")
    try:
        N_turns = int(input("Enter Number of Turns N: "))
        I_a = float(input("Enter current I (in Amperes): "))
        A_m2 = float(input("Enter Loop Area A (in square meters): "))
        
        if N_turns < 1 or A_m2 <= 0:
            print("Error: N must be >= 1 and Area must be positive.")
            sys.exit(1)
            
        mu = N_turns * I_a * A_m2
        
        print(f"\n[OUTPUT]")
        print(f"Dipole Moment (mu): {mu:.4e} A*m^2")
        
    except ValueError:
        print("\nError: Invalid input. Please enter appropriate numeric values.")

if __name__ == "__main__":
    calculate_magnetic_dipole_moment()
