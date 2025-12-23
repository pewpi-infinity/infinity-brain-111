#!/usr/bin/env bash
# apply_rogers_fix.sh - safe small patch to rogers_logic.py
# Usage:
# 1) cd ~/infinity-portal/InfinityOS
# 2) paste & run: bash apply_rogers_fix.sh
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
ROGERS="$PROJECT_DIR/rogers_logic.py"

if [ ! -f "$ROGERS" ]; then
  echo "ERROR: $ROGERS not found. cd to your project directory first."
  exit 1
fi

ts() { date +%s; }

# Backup current file
cp -v "$ROGERS" "${ROGERS}.bak.$(ts)"

# 1) Replace the examples list so it doesn't include the telephone sample.
#    This matches the typical single-line examples definition and replaces it.
#    If examples span lines in your copy this still tries a safe fallback.
perl -0777 -pe 's/examples\s*=\s*\[.*?\]/examples = ["hello","what is the time","search python programming"]/s' -i "$ROGERS" || true

# 2) Replace the default echo so it returns a plain, normal reply instead of "(Echo) ..."
#    We replace the exact f-string return pattern with a plain html.escape(q) return.
perl -0777 -pe 's/return f\(\"\\(Echo\\) \\{html\.escape\(q\)\}\"|return f\\(\"\\(Echo\\) \\{html\.escape\(q\)\\}\"\\)/return html.escape(q)/s' -i "$ROGERS" || true

# 3) Ensure the file still imports; run quick tests (test_import.py and rogers_logic.py __main__)
echo "Running quick import/self-tests..."
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

echo
echo "Patch complete. Backup saved as ${ROGERS}.bak.*"
echo "If tests above looked OK, restart your portal so it re-imports the module."
echo "Common restart commands you can run (pick the one you normally use):"
echo "  pkill -f rogers.bot.py || true ; nohup python3 rogers.bot.py >> start_and_deploy.log 2>&1 &"
echo "  OR ./infinity_start.sh >> start_and_deploy.log 2>&1 &"
echo "After restart, test by running: python3 run_query.py \"How are you?\""
exit 0