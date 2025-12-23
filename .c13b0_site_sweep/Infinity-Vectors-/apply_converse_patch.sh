#!/usr/bin/env bash
# apply_converse_patch.sh - safe in-place patch to rogers_logic.py
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
ROGERS="$PROJECT_DIR/rogers_logic.py"

if [ ! -f "$ROGERS" ]; then
  echo "ERROR: $ROGERS not found. cd to your project directory first."
  exit 1
fi

bak="${ROGERS}.bak.$(date +%s)"
cp -v "$ROGERS" "$bak"

python3 - <<'PY'
import sys, io
p = "rogers_logic.py"
s = open(p, "r", encoding="utf-8").read()
if "def simple_converse" in s:
    print("Already patched (simple_converse found). Exiting.")
    sys.exit(0)
insert_after = "from typing import Optional, Tuple\n"
if insert_after not in s:
    print("Insert point not found. Aborting patch.")
    sys.exit(2)
func = '''
def simple_converse(q: str) -> str:
    """
    Small rule-based fallback: greetings, status, time, question hint,
    otherwise returns sanitized user text (no (Echo) prefix).
    """
    import html, time
    low = (q or "").strip().lower()
    if any(g in low for g in ("hello","hi","hey")):
        return "Hello — Rogers logic is active. Ask me anything."
    if "how are you" in low:
        return "I'm a local Rogers bot — I don't have feelings, but I'm here to help."
    if "time" in low or "what time" in low:
        return time.strftime("UTC %Y-%m-%d %H:%M:%S", time.gmtime())
    if q.strip().endswith("?"):
        # polite note when a full LLM isn't connected
        return f"I don't have a general LLM connected. I can search or fetch. You asked: {html.escape(q)}"
    # default: return the user's text sanitized (no leading "(Echo)")
    return html.escape(q)
'''
s = s.replace(insert_after, insert_after + func)
# Replace the default "(Echo) ..." return with fallback call
s = s.replace('return f"(Echo) {html.escape(q)}"', 'return simple_converse(q)')
s = s.replace('return f"(Echo) {html.escape(q)}"', 'return simple_converse(q)')
open(p, "w", encoding="utf-8").write(s)
print("Patch applied to", p)
PY

echo "Backup saved to: $bak"
echo "Running quick import/self-test..."
python3 - <<'PY'
import importlib, traceback, sys
try:
    import rogers_logic
    print("Imported rogers_logic from:", getattr(rogers_logic, "__file__", "<unknown>"))
    print("has handle_query:", hasattr(rogers_logic, "handle_query"))
    try:
        r = rogers_logic.handle_query("hello")
        print("handle_query('hello') ->", repr(r)[:300])
    except Exception:
        print("Exception calling handle_query():")
        traceback.print_exc()
except Exception:
    print("Import failed; printing traceback:")
    traceback.print_exc()
    sys.exit(1)
PY

echo "Patch script finished."