#!/usr/bin/env python3
"""
CART 4: Capacitor Charge/Discharge Simulator (Simple)
V(t) = V0 * exp(-t / (R*C)) (Discharge only)
"""
import sys
import math

def calculate_rc_discharge():
    print("--- Cartridge 4: RC Discharge Voltage ---")
    try:
        V0_v = float(input("Enter Initial Voltage V0 (Volts): "))
        R_ohm = float(input("Enter Resistance R (Ohms): "))
        C_f = float(input("Enter Capacitance C (Farads): "))
        t_s = float(input("Enter Time t (seconds): "))
        
        if R_ohm <= 0 or C_f <= 0:
            print("Error: R and C must be positive.")
            sys.exit(1)
            
        tau = R_ohm * C_f
        V_t = V0_v * math.exp(-t_s / tau)
        
        print(f"\n[OUTPUT]")
        print(f"Time Constant (Tau): {tau:.4e} seconds")
        print(f"Voltage V(t) after {t_s}s: {V_t:.4e} Volts")
        
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    calculate_rc_discharge()
