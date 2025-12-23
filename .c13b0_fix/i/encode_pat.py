#!/usr/bin/env python3
# Local helper: base64-encode your PAT and write server/.env (local only).
# Run this on your machine where you will run the commit server.
#
# Usage:
#   python encode_pat.py
#
# It will prompt for:
# - GitHub PAT (input is hidden)
# - COMMIT_SECRET (the short secret you will paste into the page session)
#
# The script writes server/.env with GITHUB_TOKEN_B64=... and COMMIT_SECRET=...
# DO NOT commit server/.env to git.

import os
import base64
import getpass
from pathlib import Path

def main():
    print("This creates server/.env locally. Do NOT commit server/.env to the repository.")
    pat = getpass.getpass("Enter your GitHub Personal Access Token (input hidden): ").strip()
    if not pat:
        print("No token provided, aborting.")
        return
    secret = getpass.getpass("Enter a short COMMIT_SECRET (you will paste into the page for this session): ").strip()
    if not secret:
        print("No secret provided, aborting.")
        return

    b64 = base64.b64encode(pat.encode('utf-8')).decode('ascii')
    env_lines = [
        f"GITHUB_TOKEN_B64={b64}",
        f"COMMIT_SECRET={secret}",
        "PORT=4000",
    ]
    server_dir = Path('server')
    server_dir.mkdir(exist_ok=True)
    env_path = server_dir / '.env'
    if env_path.exists():
        confirm = input(f"server/.env already exists. Overwrite? (y/N): ").strip().lower()
        if confirm != 'y':
            print("Aborted.")
            return

    env_path.write_text("\n".join(env_lines) + "\n", encoding='utf-8')
    print(f"Wrote {env_path.resolve()} (do NOT commit it).")
    print("Now start your server (see server/log_commit_server.py) — server will decode the token from GITHUB_TOKEN_B64 at runtime.")

if __name__ == '__main__':
    main()