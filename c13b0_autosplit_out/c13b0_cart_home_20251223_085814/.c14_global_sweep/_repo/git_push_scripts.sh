#!/bin/bash

# Navigate to your scripts dir (e.g., cd ~/nwo-scripts if you have one; adjust path)
cd ~/nwo-scripts || { echo "Dir not found—create with mkdir ~/nwo-scripts"; exit 1; }

# Add all (your entered scripts like finite_pi_*.py)
git add .

# Commit with message
git commit -m "Add NWO scripts: Finite π calcs, miners, plateaus—research tokenized"

# Push to remote (origin main; adjust branch if needed)
git push origin main

echo "Pushed! Check repo for infinity lockdown."
