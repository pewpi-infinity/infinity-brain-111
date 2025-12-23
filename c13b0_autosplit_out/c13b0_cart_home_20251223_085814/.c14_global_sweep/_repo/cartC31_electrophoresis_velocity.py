#!/usr/bin/env python3
"""
CART 31: Electrophoresis Velocity (Simplified)
v = epsilon * zeta * E / eta
"""
import sys
import math

def calculate_electrophoresis_velocity():
    print("--- Cartridge 31: Electrophoresis Velocity ---")
    try:
        E_v_m = float(input("Enter Electric Field E (in V/m): "))
        zeta_v = float(input("Enter Zeta Potential zeta (in Volts): "))
        eta_pa_s = float(input("Enter Fluid Viscosity eta (in Pa*s): "))
        epsilon_r = float(input("Enter Relative Permittivity epsilon_r (unitless): "))
        
        EPSILON_0 = 8.854187817e-12
        epsilon = epsilon_r * EPSILON_0
        
        if eta_pa_s <= 0 or epsilon_r < 1:
            print("Error: Viscosity must be positive; epsilon_r must be >= 1.")
            sys.exit(1)
            
        v = (epsilon * zeta_v * E_v_m) / eta_pa_s
        
        print(f"\n[OUTPUT]")
        print(f"Electric Field (E): {E_v_m:.4e} V/m")
        print(f"Zeta Potential (zeta): {zeta_v:.4e} V")
        print(f"---")
        print(f"Terminal Velocity (v): {v:.4e} m/s")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_electrophoresis_velocity()
