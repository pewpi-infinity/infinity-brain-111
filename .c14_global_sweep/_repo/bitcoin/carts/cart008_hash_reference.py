#!/usr/bin/env python3

profiles = {
    "CPU_Termux": "10–50 kH/s",
    "GPU_RTX_4090": "~120 TH/s",
    "ASIC_S19": "~95 TH/s",
}

print("[HASH] Reference profiles:")
for k,v in profiles.items():
    print(f" - {k}: {v}")
