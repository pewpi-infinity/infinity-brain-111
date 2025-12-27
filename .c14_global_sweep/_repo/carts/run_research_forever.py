#!/usr/bin/env python3
import time, subprocess

while True:
    print("[∞] Running the research writer…")
    subprocess.run(["python3", "cart_research_writer.py"])

    print("[∞] Adding all new research files to git…")
    subprocess.run(["git", "add", "-A"])

    print("[∞] Committing…")
    subprocess.run(["git", "commit", "-m", "auto update"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print("[∞] Pushing to main…")
    subprocess.run(["git", "push"])

    print("[∞] Cycle complete. Sleeping 10 seconds…")
    time.sleep(10)
