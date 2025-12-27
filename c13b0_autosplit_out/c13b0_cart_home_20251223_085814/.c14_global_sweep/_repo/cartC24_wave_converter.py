#!/usr/bin/env python3
"""
CART 24: Wavelength/Frequency Converter
lambda = c / f
"""
import sys

def convert_wave_properties():
    C = 2.99792458e8 # Speed of light in m/s
    
    print("--- Cartridge 24: Wavelength/Frequency Converter ---")
    
    mode = input("Convert (F)requency to Wavelength or (W)avelength to Frequency? (F/W): ").upper()
    
    try:
        if mode == 'F':
            f_hz = float(input("Enter Frequency f (in Hz): "))
            if f_hz <= 0:
                print("Error: Frequency must be positive.")
                sys.exit(1)
            
            lambda_m = C / f_hz
            print(f"\n[OUTPUT]")
            print(f"Frequency (f): {f_hz:.4e} Hz")
            print(f"Wavelength (lambda): {lambda_m:.4e} meters")
            
        elif mode == 'W':
            lambda_m = float(input("Enter Wavelength lambda (in meters): "))
            if lambda_m <= 0:
                print("Error: Wavelength must be positive.")
                sys.exit(1)
                
            f_hz = C / lambda_m
            print(f"\n[OUTPUT]")
            print(f"Wavelength (lambda): {lambda_m:.4e} meters")
            print(f"Frequency (f): {f_hz:.4e} Hz")
            
        else:
            print("Invalid mode selected. Please enter 'F' or 'W'.")
            
    except ValueError:
        print("\nError: Invalid input. Please enter numeric values.")

if __name__ == "__main__":
    convert_wave_properties()
