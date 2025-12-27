#!/usr/bin/env python3
import time

# 41 carts as you defined them
CARTS = {
    1:  "cart001A_infinity_runcommands.py",
    2:  "cart002_engineering.py",
    3:  "cart003_computers.py",
    4:  "cart004_nuances.py",
    5:  "cart005_code.py",
    6:  "cart006_python.py",
    7:  "cart007_tokens.py",
    8:  "cart008_government.py",
    9:  "cart009_power.py",
    10: "cart010_components.py",
    11: "cart011_speakeasy.py",
    12: "cart012_solutes.py",
    13: "cart013_mercury_aluminum_growth.py",
    14: "cart014_mercury_vapor_power.py",
    15: "cart015_compression_hydrogen_engine.py",
    16: "cart016_hot_cold_TEG.py",
    17: "cart017_spiderweb_engine.py",
    18: "cart018_zip_hashing.py",
    19: "cart019_token_generation.py",
    20: "cart020_unzip_install_strategy.py",
    21: "cart021_token_tiers.py",
    22: "cart022_bank_grade_tokens.py",
    23: "cart023_idea_merger.py",
    24: "cart024_quantum_transport.py",
    25: "cart025_ai_watcher_login.py",
    26: "cart026_aluminum_oxide_devices.py",
    27: "cart027_robotics.py",
    28: "cart028_machines.py",
    29: "cart029_crystal_truths.py",
    30: "cart030_superchemistry_fireproof.py",
    31: "cart031_exoskeleton.py",
    32: "cart032_ecosystem.py",
    33: "cart033_nature.py",
    34: "cart034_drones.py",
    35: "cart035_signal_trace.py",
    36: "cart036_rf_generation.py",
    37: "cart037_mice_brainmapping.py",
    38: "cart038_genetics.py",
    39: "cart039_dna_engine.py",
    40: "cart040_gas_shell_code.py",
    41: "cart041_hydrogen_expansion.py"
}

def main():
    print("∞ INFINITY RUN COMMANDS (41 CARTS) ∞\n")
    for n, file in CARTS.items():
        print(f"{n:02d}.  python {file}")
        time.sleep(0.05)

    print("\nCopy any line above and run it in Termux when carts are installed.")

if __name__ == "__main__":
    main()
# ∞ cart001A – Infinity AutoPush Controller (10MB Threshold)

import os
import subprocess
import datetime

OUTPUT_DIR = "infinity_research_output"
LOG = "research_cache/cart001A_autopush.log"
THRESHOLD_MB = 10

os.makedirs("research_cache", exist_ok=True)

def log(msg):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[∞ cart001A] {ts} – {msg}"
    print(line)
    with open(LOG, "a") as f:
        f.write(line + "\n")

def folder_size_megabytes(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except:
                pass
    return total / (1024 * 1024)

def git(command_list):
    """Run git commands safely."""
    result = subprocess.run(command_list, text=True,
                            capture_output=True)
    if result.stdout:
        log(result.stdout.strip())
    if result.stderr:
        log(result.stderr.strip())

log("Starting 10MB autopush check.")

size_mb = folder_size_megabytes(OUTPUT_DIR)
log(f"Current research output size: {size_mb:.2f} MB")

if size_mb >= THRESHOLD_MB:
    log(f"Threshold reached ({THRESHOLD_MB}MB). Committing new research…")

    git(["git", "add", "-A"])
    git(["git", "status"])

    commit_message = f"∞ AutoPush – {datetime.datetime.now().isoformat()} – {size_mb:.2f}MB research"
    git(["git", "commit", "-m", commit_message])

    git(["git", "push", "origin", "main"])

    log("AutoPush complete.")
else:
    log("Threshold not reached. No push performed.")

log("cart001A complete.")
