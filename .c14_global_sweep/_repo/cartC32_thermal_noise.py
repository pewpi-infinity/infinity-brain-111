#!/usr/bin/env python3
"""
CART 32: Thermal Noise Voltage (Johnson-Nyquist)
V_n = sqrt(4 * k_B * T * R * Delta_f)
"""
import sys
import math

def calculate_thermal_noise():
    # Fundamental constant
    K_B = 1.380649e-23 # Boltzmann constant (J/K)
    
    print("--- Cartridge 32: Thermal Noise Voltage (RMS) ---")
    
    try:
        R_ohm = float(input("Enter Resistance R (in Ohms): "))
        T_k = float(input("Enter Absolute Temperature T (in Kelvin): "))
        delta_f_hz = float(input("Enter Bandwidth Delta_f (in Hz): "))
        
        if R_ohm < 0 or T_k <= 0 or delta_f_hz <= 0:
            print("Error: R, T, and Delta_f must be positive.")
            sys.exit(1)
            
        # Calculate RMS noise voltage
        V_n_sq = 4 * K_B * T_k * R_ohm * delta_f_hz
        V_n = math.sqrt(V_n_sq)
        
        print(f"\n[OUTPUT]")
        print(f"Resistance (R): {R_ohm:.4e} Ohms")
        print(f"Temperature (T): {T_k:.2f} K")
        print(f"---")
        print(f"RMS Noise Voltage (V_n): {V_n:.4e} Volts")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_thermal_noise()
