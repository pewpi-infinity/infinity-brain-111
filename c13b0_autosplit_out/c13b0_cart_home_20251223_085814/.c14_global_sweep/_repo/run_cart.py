#!/usr/bin/env python3
import os, subprocess, sys, time

ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "infinity_research_output")
LOG_DIR = os.path.join(ROOT, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def run_sh(cmd):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def auto_push():
    print("\n∞ AUTO-PUSH: Staging research…")
    run_sh("git add infinity_research_output/")

    msg = f'"∞ Auto-push from run_cart.py – {time.strftime("%Y-%m-%d %H:%M:%S")}"'
    print("∞ AUTO-PUSH: Committing…")
    run_sh(f"git commit -m {msg} || true")

    print("∞ AUTO-PUSH: Pushing to GitHub…")
    run_sh("git push origin main || true")

def run_cart(cart):
    print("\n∞ Run-Cart Engine (Python3 clean)")
    print(f"∞ Running cart: {cart}\n")

    try:
        subprocess.run(["python3", cart], check=False)
    except Exception as e:
        print(f"∞ ERROR running {cart}: {e}")

    # Check if new output exists
    produced = os.listdir(OUTPUT_DIR)
    if produced:
        print(f"\n∞ Cart produced {len(produced)} files. Auto-pushing…")
        auto_push()
    else:
        print("\n∞ Cart produced NO files — skipping push.")

    print("∞ Cart finished.\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_cart.py <cart.py>")
        return
    cart = sys.argv[1]
    run_cart(cart)

if __name__ == "__main__":
    main()
