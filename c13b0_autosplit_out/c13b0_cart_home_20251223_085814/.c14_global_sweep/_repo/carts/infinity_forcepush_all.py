#!/usr/bin/env python3
import subprocess, time, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# All directories that generate real work
OUTPUT_DIRS = [
    "infinity_research_output",
    "infinity_tokens",
    "artifacts",
]

def run(cmd):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def main():
    print("∞ INFINITY FORCE PUSH EVERYTHING")
    print("--------------------------------------------")
    print("Started:", time.strftime("%Y-%m-%d %H:%M:%S"))
    print()

    # Stage everything in all output dirs
    for d in OUTPUT_DIRS:
        path = os.path.join(ROOT, d)
        if os.path.isdir(path):
            print(f"∞ Staging: {d}/")
            run(f"git add {d}/")

    # Commit
    msg = f'"∞ FULL AUTO-PUSH {time.strftime("%Y-%m-%d %H:%M:%S")}"'
    print("\n∞ Committing…")
    run(f"git commit -m {msg} || true")

    # Push
    print("\n∞ Pushing to GitHub…")
    run("git push origin main || true")

    print("\n∞ Done – All directories force-pushed.")
    print("Finished:", time.strftime("%Y-%m-%d %H:%M:%S"))

if __name__ == "__main__":
    main()
