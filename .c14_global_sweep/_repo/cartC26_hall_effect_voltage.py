#!/usr/bin/env python3
"""
CART 26: Hall Effect Voltage
V_H = R_H * I * B / t
"""
import sys

def calculate_hall_voltage():
    print("--- Cartridge 26: Hall Effect Voltage ---")
    try:
        I_a = float(input("Enter Current I (in Amperes): "))
        B_t = float(input("Enter Magnetic Field B (in Tesla): "))
        t_m = float(input("Enter Conductor Thickness t (in meters): "))
        R_H = float(input("Enter Hall Coefficient R_H (in m^3/C): "))
        
        if t_m <= 0:
            print("Error: Thickness t must be positive.")
            sys.exit(1)
            
        V_H = R_H * I_a * B_t / t_m
        
        carrier_type = "Holes (Positive)" if R_H > 0 else "Electrons (Negative)"
        
        print(f"\n[OUTPUT]")
        print(f"Hall Coefficient (R_H): {R_H:.4e} m^3/C")
        print(f"---")
        print(f"Hall Voltage (V_H): {V_H:.4e} Volts")
        print(f"Inferred Carrier Type: {carrier_type}")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_hall_voltage()
