#!/usr/bin/env python3
import subprocess

def cmd(c):
    return subprocess.check_output(c, stderr=subprocess.DEVNULL).decode().strip()

try:
    repo = cmd(["git","rev-parse","--show-toplevel"])
    branch = cmd(["git","branch","--show-current"])
    commit = cmd(["git","rev-parse","--short","HEAD"])
    dirty = cmd(["git","status","--porcelain"])

    print(f"[REPO] Root: {repo}")
    print(f"[REPO] Branch: {branch}")
    print(f"[REPO] Commit: {commit}")
    print(f"[REPO] Dirty files: {len(dirty.splitlines()) if dirty else 0}")
except:
    print("[REPO] NOT INSIDE A GIT REPO — ABORT")
    exit(1)
