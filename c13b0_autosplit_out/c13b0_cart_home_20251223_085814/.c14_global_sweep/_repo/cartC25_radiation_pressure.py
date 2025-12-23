#!/usr/bin/env python3
"""
CART 25: Radiation Pressure
P = I / c (for perfect absorber)
"""
import sys

def calculate_radiation_pressure():
    C = 2.99792458e8 # Speed of light in m/s
    
    print("--- Cartridge 25: Radiation Pressure ---")
    
    try:
        I_w_m2 = float(input("Enter EM Wave Intensity I (in W/m^2): "))
        
        if I_w_m2 < 0:
            print("Error: Intensity must be non-negative.")
            sys.exit(1)
            
        P = I_w_m2 / C
        
        print(f"\n[OUTPUT]")
        print(f"Intensity (I): {I_w_m2:.4e} W/m^2")
        print(f"Speed of Light (c): {C:.4e} m/s")
        print(f"---")
        print(f"Radiation Pressure (P): {P:.4e} Pascals (Pa)")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_radiation_pressure()
