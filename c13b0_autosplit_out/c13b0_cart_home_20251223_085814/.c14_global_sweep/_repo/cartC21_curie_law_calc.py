#!/usr/bin/env python3
"""
CART 21: Curie's Law (Paramagnetism)

Calculates Paramagnetic susceptibility (Chi_m) based on Temperature (T).
"""

import sys

def calculate_curie_susceptibility():
    """Calculates Chi_m = C / T."""
    
    print("--- Cartridge 21: Curie's Law Calculator ---")
    
    try:
        C_unit = float(input("Enter Curie Constant C (in K): "))
        T_k = float(input("Enter Absolute Temperature T (in Kelvin): "))
        
        if T_k <= 0:
            print("Error: Absolute Temperature T must be greater than zero.")
            sys.exit(1)
            
        # Calculate Paramagnetic Susceptibility
        chi_m = C_unit / T_k
        
        print(f"\n[OUTPUT]")
        print(f"Curie Constant (C): {C_unit:.4e} K")
        print(f"Temperature (T): {T_k:.4e} K")
        print(f"---")
        print(f"Paramagnetic Susceptibility (Chi_m): {chi_m:.4e} (unitless)")
        
        if chi_m > 1:
            print("Note: If Chi_m is large, the material might be nearing its Curie temperature (Ferromagnetism).")
            
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    calculate_curie_susceptibility()
