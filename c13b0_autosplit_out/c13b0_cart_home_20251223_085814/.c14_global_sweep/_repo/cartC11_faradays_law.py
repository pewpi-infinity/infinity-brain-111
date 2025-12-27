#!/usr/bin/env python3
"""
CART 11: Faraday's Law of Induction (EMF)
Epsilon = -N * d(Phi_B) / dt
"""
import sys

def calculate_induced_emf():
    print("--- Cartridge 11: Induced EMF (Faraday's Law) ---")
    try:
        N_turns = int(input("Enter Number of Turns N: "))
        delta_Phi_B = float(input("Enter Change in Magnetic Flux d(Phi_B) (in Webers): "))
        delta_t_s = float(input("Enter Change in Time d(t) (in seconds): "))
        
        if delta_t_s <= 0:
            print("Error: Time change must be positive and non-zero.")
            sys.exit(1)
            
        EMF_mag = abs(N_turns * (delta_Phi_B / delta_t_s))
        
        print(f"\n[OUTPUT]")
        print(f"Induced EMF Magnitude (Epsilon): {EMF_mag:.4e} Volts")
        
    except ValueError:
        print("\nError: Invalid input. Please enter appropriate numeric values.")

if __name__ == "__main__":
    calculate_induced_emf()
