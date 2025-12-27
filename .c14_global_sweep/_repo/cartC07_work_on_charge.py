#!/usr/bin/env python3
"""
CART 7: Work Done Moving a Charge
W = q * (V_B - V_A)
"""
import sys

def calculate_work_done():
    print("--- Cartridge 7: Work Done Moving a Charge ---")
    try:
        q_c = float(input("Enter charge q being moved (in Coulombs): "))
        V_A = float(input("Enter Potential at starting point A (Volts): "))
        V_B = float(input("Enter Potential at ending point B (Volts): "))
        
        delta_V = V_B - V_A
        W = q_c * delta_V
        
        print(f"\n[OUTPUT]")
        print(f"Potential Difference (V_B - V_A): {delta_V:.4e} Volts")
        print(f"Work Done (W): {W:.4e} Joules")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_work_done()
