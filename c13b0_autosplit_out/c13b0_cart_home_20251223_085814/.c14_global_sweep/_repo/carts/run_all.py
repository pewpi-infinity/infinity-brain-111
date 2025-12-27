#!/usr/bin/env python3
import os, subprocess, time

CARTS = [
    f for f in os.listdir(".")
    if f.startswith("cart") and f.endswith(".py")
]

def run(cmd: str):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def main():
    print("\n∞ Infinity Full Run – Python Engine")
    print("------------------------------------")
    print("Started:", time.ctime(), "\n")

    for cart in CARTS:
        print(f"∞ Running {cart}")
        run(f"python3 {cart}")
        print("")

    print("∞ GitHub sync…")
    run("git add -A")
    run("git commit -m 'Infinity auto-run update' || true")
    run("git push origin main || true")

    print("\n∞ Complete")
    print("Finished:", time.ctime())

if __name__ == "__main__":
    main()
