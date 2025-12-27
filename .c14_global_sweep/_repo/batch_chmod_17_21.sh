#!/bin/bash
# Batch script to set execute permissions for Carts 17 through 21.

echo "Setting execute permissions for carts C17 through C21..."

chmod +x cartC17_susceptibility_checker.py
chmod +x cartC18_magnetization_calc.py
chmod +x cartC19_relative_permeability.py
chmod +x cartC20_landau_diamagnetism_model.py
chmod +x cartC21_curie_law_calc.py

echo "Done."
