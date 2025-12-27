#!/usr/bin/env python3
import os, time, subprocess, shutil

REPO_DIR = "/data/data/com.termux/files/home/mongoose.os"
DEST_DIR = os.path.join(REPO_DIR, "infinity_tokens")
SOURCE_DIR = "/data/data/com.termux/files/home"
BRANCH = "main"
INTERVAL = 180

def run(cmd):
    p = subprocess.run(cmd, shell=True, text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.stdout.strip(): print(p.stdout.strip())
    if p.stderr.strip(): print(p.stderr.strip())
    return p.returncode

print("[∞] Zero-filter push engine online\n")

while True:
    txts = [f for f in os.listdir(SOURCE_DIR)
            if f.endswith(".txt") and f != "slow_push.py"]

    if not txts:
        print("[∞] No .txt files found in HOME.")
        break

    f = txts[0]
    src = os.path.join(SOURCE_DIR, f)
    dst = os.path.join(DEST_DIR, f)

    print(f"[∞] Moving {f}")
    shutil.move(src, dst)

    run(f"cd {REPO_DIR} && git add infinity_tokens/{f}")
    if run(f'cd {REPO_DIR} && git commit -m "Token push: {f}"') != 0:
        print("[!] Commit failed")
        continue

    if run(f"cd {REPO_DIR} && git push origin {BRANCH}") != 0:
        print("[X] Push failed — stopping.")
        break

    print(f"[✓] Pushed {f}. Sleeping {INTERVAL}s")
    time.sleep(INTERVAL)
