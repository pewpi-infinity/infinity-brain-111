#!/usr/bin/env python3
"""
CART 23: Poynting Vector Magnitude (Energy Flux)
S = E * B / mu_0
"""
import sys
import math

def calculate_poynting_vector():
    MU_0 = 4 * math.pi * 1e-7 # Permeability of free space
    
    print("--- Cartridge 23: Poynting Vector Magnitude (S) ---")
    
    try:
        E_v_m = float(input("Enter Electric Field Magnitude E (in V/m): "))
        B_t = float(input("Enter Magnetic Field Magnitude B (in Tesla): "))
        
        if E_v_m < 0 or B_t < 0:
            print("Error: Field magnitudes must be non-negative.")
            sys.exit(1)
            
        S = (E_v_m * B_t) / MU_0
        
        print(f"\n[OUTPUT]")
        print(f"Electric Field (E): {E_v_m:.4e} V/m")
        print(f"Magnetic Field (B): {B_t:.4e} T")
        print(f"---")
        print(f"Poynting Vector Magnitude (S): {S:.4e} W/m^2")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_poynting_vector()
