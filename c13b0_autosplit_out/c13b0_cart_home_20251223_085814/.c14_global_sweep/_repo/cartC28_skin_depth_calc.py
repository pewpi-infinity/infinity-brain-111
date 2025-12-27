#!/usr/bin/env python3
"""
CART 28: Skin Depth
delta = sqrt(2 * rho / (omega * mu))
"""
import sys
import math

def calculate_skin_depth():
    print("--- Cartridge 28: EM Skin Depth ---")
    try:
        f_hz = float(input("Enter Frequency f (in Hz): "))
        rho_ohm_m = float(input("Enter Resistivity rho (in Ohm*meters): "))
        mu_r = float(input("Enter Relative Permeability mu_r (unitless, e.g., 1.0 for copper): "))
        
        MU_0 = 4 * math.pi * 1e-7
        mu = mu_r * MU_0
        omega = 2 * math.pi * f_hz
        
        if f_hz <= 0 or rho_ohm_m <= 0 or mu_r <= 0:
            print("Error: All inputs must be positive.")
            sys.exit(1)
            
        # Calculate skin depth
        delta = math.sqrt((2 * rho_ohm_m) / (omega * mu))
        
        print(f"\n[OUTPUT]")
        print(f"Frequency (f): {f_hz:.4e} Hz")
        print(f"Resistivity (rho): {rho_ohm_m:.4e} Ohm*m")
        print(f"---")
        print(f"Skin Depth (delta): {delta:.4e} meters")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_skin_depth()
