#!/usr/bin/env python3
import subprocess, time

def run(cmd):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def get_unpushed_file():
    cmd = "git ls-files --others --exclude-standard infinity_tokens/"
    out = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    files = [f.strip() for f in out.stdout.split("\n") if f.strip()]
    return files[0] if files else None

def push_one():
    f = get_unpushed_file()
    if not f:
        print("∞ No new tokens found.")
        return False

    print(f"\n∞ Pushing token: {f}")
    run(f"git add {f}")
    run(f'git commit -m "∞ Loop push {f}" || true')
    run("git push origin main || true")
    print("∞ Pushed.\n")
    return True

def main():
    print("∞ TOKEN LOOP PUSH ENGINE\nCTRL+C to stop.\n")
    while True:
        push_one()
        time.sleep(5)

if __name__ == "__main__":
    main()
