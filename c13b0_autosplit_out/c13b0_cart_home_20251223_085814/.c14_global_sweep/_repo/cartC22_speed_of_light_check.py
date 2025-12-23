#!/usr/bin/env python3
"""
CART 22: Speed of Light (c) Checker
c = 1 / sqrt(mu_0 * epsilon_0)
"""
import sys
import math

def calculate_speed_of_light():
    # Fundamental constants
    MU_0 = 4 * math.pi * 1e-7          # Permeability of free space (H/m)
    EPSILON_0 = 8.854187817e-12        # Permittivity of free space (F/m)
    
    print("--- Cartridge 22: Speed of Light Checker ---")
    
    try:
        # Calculate c
        c = 1.0 / math.sqrt(MU_0 * EPSILON_0)
        
        print(f"\n[OUTPUT]")
        print(f"Permeability (mu_0): {MU_0:.4e} H/m")
        print(f"Permittivity (epsilon_0): {EPSILON_0:.4e} F/m")
        print(f"---")
        print(f"Calculated Speed (c): {c:.4e} m/s")
        print(f"Reference Value: 2.9979e8 m/s")
        
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_speed_of_light()
