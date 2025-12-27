#!/usr/bin/env python3
import os, subprocess, time

ROOT = os.path.dirname(os.path.abspath(__file__))
TOKENS = os.path.join(ROOT, "infinity_tokens")

def run(cmd):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def get_unpushed_file():
    # git ls-files --others --exclude-standard infinity_tokens/
    result = subprocess.run(
        "git ls-files --others --exclude-standard infinity_tokens/",
        shell=True, capture_output=True, text=True
    )
    files = [f.strip() for f in result.stdout.split("\n") if f.strip()]
    return files[0] if files else None

def main():
    print("∞ SINGLE-TOKEN PUSH ENGINE")
    print("------------------------------")

    file = get_unpushed_file()
    if not file:
        print("∞ No untracked token found. Nothing to push.")
        return

    print(f"∞ Found token to push: {file}\n")

    # Stage ONLY this file
    run(f"git add {file}")

    # Commit ONLY this file
    msg = f'"∞ Single token push {file} @ {time.strftime("%Y-%m-%d %H:%M:%S")}"'
    run(f"git commit -m {msg} || true")

    # Push to GitHub
    run("git push origin main || true")

    print("\n∞ DONE – Single token pushed successfully.")

if __name__ == "__main__":
    main()
