#!/usr/bin/env python3
"""
CART 10: Magnetic Flux through a Loop
Phi_B = B * A * cos(theta)
"""
import sys
import math

def calculate_magnetic_flux():
    print("--- Cartridge 10: Magnetic Flux ---")
    try:
        B_t = float(input("Enter Magnetic Field B (in Tesla): "))
        A_m2 = float(input("Enter Loop Area A (in square meters): "))
        theta_deg = float(input("Enter angle theta (Field to Area vector, in degrees): "))
        
        theta_rad = math.radians(theta_deg)
        Phi_B = B_t * A_m2 * math.cos(theta_rad)
        
        print(f"\n[OUTPUT]")
        print(f"Magnetic Flux (Phi_B): {Phi_B:.4e} Webers (Wb)")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_magnetic_flux()
