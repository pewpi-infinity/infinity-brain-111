#!/usr/bin/env python3

power_watts = 6
hours = 24
kwh_price = 0.15

kwh = (power_watts / 1000) * hours
cost = kwh * kwh_price

print(f"[ENERGY] Daily power use: {kwh:.4f} kWh")
print(f"[ENERGY] Daily cost: ${cost:.4f}")
