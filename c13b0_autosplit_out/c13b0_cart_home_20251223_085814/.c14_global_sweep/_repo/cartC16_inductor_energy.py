#!/usr/bin/env python3
"""
CART 16: Energy Stored in an Inductor
U = 1/2 * L * I^2
"""
import sys

def calculate_inductor_energy():
    print("--- Cartridge 16: Energy Stored in Inductor ---")
    try:
        L_h = float(input("Enter Inductance L (in Henries): "))
        I_a = float(input("Enter Current I (in Amperes): "))
        
        if L_h < 0:
            print("Error: Inductance L cannot be negative.")
            sys.exit(1)
            
        U = 0.5 * L_h * (I_a ** 2)
        
        print(f"\n[OUTPUT]")
        print(f"Stored Energy (U): {U:.4e} Joules")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_inductor_energy()
