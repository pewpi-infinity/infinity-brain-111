#!/usr/bin/env python3
"""
CART 27: Plasma Frequency (Angular)
omega_p = sqrt(n_e * e^2 / (epsilon_0 * m_e))
"""
import sys
import math

def calculate_plasma_frequency():
    # Fundamental constants
    E = 1.602176634e-19        # Elementary charge (C)
    M_E = 9.1093837015e-31     # Electron mass (kg)
    EPSILON_0 = 8.854187817e-12# Permittivity of free space (F/m)
    
    print("--- Cartridge 27: Plasma Frequency (Angular) ---")
    
    try:
        n_e_m3 = float(input("Enter Electron Number Density n_e (electrons/m^3): "))
        
        if n_e_m3 <= 0:
            print("Error: Density must be positive.")
            sys.exit(1)
            
        # Calculate omega_p squared
        omega_p_sq = (n_e_m3 * E**2) / (EPSILON_0 * M_E)
        omega_p = math.sqrt(omega_p_sq)
        
        print(f"\n[OUTPUT]")
        print(f"Electron Density (n_e): {n_e_m3:.4e} m^-3")
        print(f"---")
        print(f"Plasma Frequency (omega_p): {omega_p:.4e} rad/s")
        
    except ValueError:
        print("\nError: Invalid input. Please enter a numeric value.")

if __name__ == "__main__":
    calculate_plasma_frequency()
