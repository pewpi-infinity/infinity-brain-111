#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "[∞] Cart Doctor online"
echo "[∞] PWD: $(pwd)"
echo

echo "[∞] Repo check:"
if [ -d .git ]; then
  echo "  ✓ Git repo detected"
else
  echo "  ✗ Not a git repo"
fi
echo

echo "[∞] Shell carts:"
ls -lh *.sh 2>/dev/null || echo "  (none found)"
echo

echo "[∞] Python carts:"
ls -lh *.py 2>/dev/null || echo "  (none found)"
echo

echo "[∞] Normalizing permissions (*.sh)"
chmod +x *.sh 2>/dev/null || true
echo "  ✓ done"
echo

echo "[∞] Checking for CRLF line endings"
for f in *.sh; do
  if file "$f" | grep -q CRLF; then
    echo "  ⚠ fixing CRLF in $f"
    sed -i 's/\r$//' "$f"
  fi
done

echo
echo "[∞] Cart Doctor complete."
