#!/usr/bin/env python3
"""
CART 13: Magnetic Force on a Moving Charge (Perpendicular)
F = |q| * v * B
"""
import sys

def calculate_magnetic_force():
    print("--- Cartridge 13: Magnetic Force (Lorentz, perpendicular) ---")
    try:
        q_c = float(input("Enter charge q (in Coulombs): "))
        v_mps = float(input("Enter velocity v (in m/s): "))
        B_t = float(input("Enter Magnetic Field B (in Tesla): "))
            
        F = abs(q_c) * v_mps * B_t
        
        print(f"\n[OUTPUT]")
        print(f"Force Magnitude (F): {F:.4e} Newtons")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_magnetic_force()
