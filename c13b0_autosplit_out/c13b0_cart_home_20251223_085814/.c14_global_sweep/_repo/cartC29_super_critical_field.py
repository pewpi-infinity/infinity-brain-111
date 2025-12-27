#!/usr/bin/env python3
"""
CART 29: Superconductor Critical Field (Simplified)
H_c(T) = H_c(0) * [1 - (T/T_c)^2]
"""
import sys
import math

def calculate_critical_field():
    print("--- Cartridge 29: Superconductor Critical Field H_c(T) ---")
    try:
        Hc0_a_m = float(input("Enter Critical Field at T=0K, Hc(0) (in A/m): "))
        Tc_k = float(input("Enter Critical Temperature T_c (in Kelvin): "))
        T_k = float(input("Enter Operating Temperature T (in Kelvin): "))
        
        if Tc_k <= 0 or Hc0_a_m <= 0:
            print("Error: Tc and Hc(0) must be positive.")
            sys.exit(1)
            
        if T_k >= Tc_k:
            Hc_T = 0.0
            print("\nNOTE: Operating temperature T >= T_c. Superconductivity is lost.")
        else:
            ratio_sq = (T_k / Tc_k) ** 2
            Hc_T = Hc0_a_m * (1.0 - ratio_sq)
        
        print(f"\n[OUTPUT]")
        print(f"Hc(0): {Hc0_a_m:.4e} A/m")
        print(f"Tc: {Tc_k:.2f} K")
        print(f"T: {T_k:.2f} K")
        print(f"---")
        print(f"Critical Field Hc(T): {Hc_T:.4e} A/m")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_critical_field()
