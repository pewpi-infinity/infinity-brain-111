#!/usr/bin/env python3
"""
CART 33: Dielectric Breakdown Voltage
V_max = E_max * d
"""
import sys

def calculate_breakdown_voltage():
    print("--- Cartridge 33: Dielectric Breakdown Voltage ---")
    
    try:
        E_max_v_m = float(input("Enter Dielectric Strength E_max (in V/m): "))
        d_m = float(input("Enter Plate Separation Distance d (in meters): "))
        
        if E_max_v_m <= 0 or d_m <= 0:
            print("Error: Strength E_max and distance d must be positive.")
            sys.exit(1)
            
        V_max = E_max_v_m * d_m
        
        print(f"\n[OUTPUT]")
        print(f"Dielectric Strength (E_max): {E_max_v_m:.4e} V/m")
        print(f"Separation Distance (d): {d_m:.4e} m")
        print(f"---")
        print(f"Maximum Voltage (V_max): {V_max:.4e} Volts")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_breakdown_voltage()
