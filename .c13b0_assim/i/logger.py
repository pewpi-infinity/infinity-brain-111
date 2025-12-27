#!/usr/bin/env python3
"""
logger.py — safe, minimal logging helper for Octave OS.

Usage:
  from logger import append_log, commit_log

Design:
- Appends timestamped entries to logs/txt.log
- Use append_log(text, kind="IN"|"OUT"|"INFO") to record messages.
- Optional auto-commit: set environment variable OCTAVE_AUTO_COMMIT="1"
  and (optionally) OCTAVE_AUTO_PUSH="1" to push after commit.
  The process that runs commits must have git credentials configured (SSH key
  or credential helper). Do NOT put tokens into files.

Security note:
- Never store secrets (tokens) inside repository files. Use environment variables,
  CI secrets, or an already-configured git credential helper/SSH key for commits.
"""
import os
from datetime import datetime
import subprocess
from typing import Tuple

ROOT = os.path.abspath(os.path.dirname(__file__))
LOG_DIR = os.path.join(ROOT, "logs")
LOG_FILE = os.path.join(LOG_DIR, "txt.log")

os.makedirs(LOG_DIR, exist_ok=True)

def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC"

def append_log(text: str, kind: str = "INFO") -> str:
    """
    Append a timestamped log entry to logs/txt.log.
    kind: "IN" (user), "OUT" (bot), "INFO" (misc).
    Returns the path of the log file written.
    """
    if text is None:
        text = ""
    # Normalize kind
    kind = (kind or "INFO").upper()
    entry = f"[{_timestamp()}] [{kind}] {text}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(entry)
    return LOG_FILE

def commit_log(commit_message: str = None, push: bool = False) -> Tuple[bool, str]:
    """
    Optional: git add/commit (and optionally push) the logs file.
    Controlled by calling process and environment. Use with caution.
    Returns tuple (ok, output).
    Preconditions:
      - This script runs from the repository root (or git operations will fail).
      - Git must be available and credentials configured in the environment.
    """
    commit_message = commit_message or f"Auto log update: {_timestamp()}"
    try:
        # Add the log file
        subprocess.check_output(["git", "add", LOG_FILE], stderr=subprocess.STDOUT)
        subprocess.check_output(["git", "commit", "-m", commit_message], stderr=subprocess.STDOUT)
        out = "committed"
        if push:
            subprocess.check_output(["git", "push"], stderr=subprocess.STDOUT)
            out += " and pushed"
        return True, out
    except subprocess.CalledProcessError as e:
        return False, e.output.decode(errors="replace")
    except FileNotFoundError:
        return False, "git not found in PATH"