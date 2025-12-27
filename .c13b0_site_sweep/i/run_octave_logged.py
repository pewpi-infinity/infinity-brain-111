#!/usr/bin/env python3
"""
Run Octave OS but log every incoming and outgoing message to logs/txt.log using logger.append_log.
This is a wrapper so we don't need to modify octave_os.py directly.

Usage:
  python3 run_octave_logged.py

It reuses OShell, kernel, and module functions from octave_os.py and adds logging + optional auto-commit.
"""
import os
import sys
from time import sleep

# Import OShell and helpers from the existing octave_os.py
try:
    from octave_os import OShell, write_memory
except Exception as e:
    print("Failed to import octave_os.OShell:", e)
    sys.exit(1)

# Import the logger helper we pushed earlier
try:
    from logger import append_log, commit_log
except Exception:
    def append_log(text, kind="INFO"):
        try:
            os.makedirs("logs", exist_ok=True)
            with open(os.path.join("logs", "txt.log"), "a", encoding="utf-8") as f:
                from datetime import datetime
                ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC"
                f.write(f"[{ts}] [{kind}] {text}\n")
            return os.path.join("logs", "txt.log")
        except Exception:
            return ""
    def commit_log(commit_message=None, push=False):
        return False, "logger missing"


def main():
    shell = OShell()
    kernel = shell.kernel
    modules = shell.modules

    # Environment-controlled auto-commit behavior (disabled by default)
    auto_commit = os.environ.get("OCTAVE_AUTO_COMMIT", "0") in ("1", "true", "True")
    auto_push = os.environ.get("OCTAVE_AUTO_PUSH", "0") in ("1", "true", "True")
    commit_every_n = int(os.environ.get("OCTAVE_COMMIT_EVERY_N", "10"))
    action_counter = 0

    print("Octave OS (logged) — starting. Type Ctrl-C to exit.")

    try:
        while True:
            user = input("∞ > ")
            if user is None:
                continue

            # Log incoming user message (IN)
            try:
                append_log(user, kind="IN")
            except Exception:
                pass

            # Module routing
            module_key = user.split()[0].lower() if user.strip() else ""
            if module_key in modules:
                out = modules[module_key](user)
                print(out)
                try:
                    write_memory(f"MODULE({module_key}): {user}")
                except Exception:
                    pass
                # Log module result as OUT
                try:
                    append_log(out, kind="OUT")
                except Exception:
                    pass
                action_counter += 1
            else:
                pkt = kernel.encode(user)
                response = kernel.dispatch(pkt, user)
                print(response)
                try:
                    write_memory(f"USER: {user}")
                    write_memory(f"PACKET: {pkt}")
                except Exception:
                    pass
                # Log the packet and response
                try:
                    append_log(f"PACKET: {pkt}", kind="INFO")
                    append_log(response, kind="OUT")
                except Exception:
                    pass
                action_counter += 1

            # Optionally commit logs (batched)
            if auto_commit and action_counter >= commit_every_n:
                try:
                    ok, out = commit_log(commit_message=f"Auto log update: {user[:120]}", push=auto_push)
                    if not ok:
                        print(f"Auto-commit failed: {out}")
                    else:
                        print(f"Logs committed ({'and pushed' if auto_push else 'committed'})")
                except Exception as e:
                    print(f"Auto-commit exception: {e}")
                action_counter = 0

    except KeyboardInterrupt:
        print("\nExiting. Goodbye.")

if __name__ == "__main__":
    main()