#!/usr/bin/env python3
import datetime

stamp = datetime.datetime.now().isoformat()

with open(f"test_output_{stamp.replace(':', '-')}.txt", "w") as f:
    f.write(f"[∞] Test file created at {stamp}\n")

print("[∞] Test file created.")
