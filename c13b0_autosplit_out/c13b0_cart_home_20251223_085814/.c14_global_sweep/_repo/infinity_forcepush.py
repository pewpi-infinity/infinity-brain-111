#!/usr/bin/env python3
import os, subprocess, time, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(ROOT, "infinity_research_output")

def run(cmd):
    print("→", cmd)
    subprocess.run(cmd, shell=True)

def main():
    print("\n∞ INFINITY FORCE PUSH ENGINE")
    print("--------------------------------------")
    print("Started:", time.ctime(), "\n")

    if not os.path.exists(TARGET):
        print("∞ No infinity_research_output/ folder found.")
        return

    print("∞ Staging research…")
    run("git add infinity_research_output/")

    print("∞ Committing…")
    commit_msg = f'"∞ Auto-force research push {time.strftime("%Y-%m-%d %H:%M:%S")}"'
    run(f"git commit -m {commit_msg} || true")

    print("∞ Pushing to GitHub…")
    run("git push origin main || true")

    print("\n∞ Done – Force push complete.")
    print("Finished:", time.ctime())

if __name__ == '__main__':
    main()
