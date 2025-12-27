#!/usr/bin/env python3
"""
CART 30: Magnetic Flux Quantum (Phi_0)
Phi_0 = h / 2e
"""
import sys
import math

def calculate_flux_quantum():
    # Fundamental constants
    H = 6.62607015e-34 # Planck's constant (J*s)
    E = 1.602176634e-19# Elementary charge (C)
    
    print("--- Cartridge 30: Magnetic Flux Quantum ---")
    
    try:
        # Calculation
        Phi_0 = H / (2 * E)
        
        print(f"\n[OUTPUT]")
        print(f"Planck's Constant (h): {H:.4e} J*s")
        print(f"Elementary Charge (e): {E:.4e} C")
        print(f"---")
        print(f"Magnetic Flux Quantum (Phi_0): {Phi_0:.4e} Wb")
        
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_flux_quantum()
