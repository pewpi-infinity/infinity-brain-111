#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "[∞] CART INDEX"
echo "[∞] Repo: $(pwd)"
echo

CARTS_SH=$(ls cart_*.sh 2>/dev/null | grep -v cart_index.sh || true)
CARTS_PY=$(ls cart_*.py 2>/dev/null || true)

if [ -z "$CARTS_SH$CARTS_PY" ]; then
  echo "[!] No carts found"
  exit 0
fi

echo "[∞] Shell carts:"
for c in $CARTS_SH; do echo "  - $c"; done
echo

echo "[∞] Python carts:"
for c in $CARTS_PY; do echo "  - $c"; done
echo

read -p "[?] Run all carts? (y/N): " RUNALL

if [[ "$RUNALL" == "y" || "$RUNALL" == "Y" ]]; then
  for c in $CARTS_SH; do
    echo "[→] Running $c"
    bash "$c"
  done

  for c in $CARTS_PY; do
    echo "[→] Running $c"
    python3 "$c"
  done
fi

read -p "[?] Push all changes after run? (y/N): " PUSH

if [[ "$PUSH" == "y" || "$PUSH" == "Y" ]]; then
  ./cart_push_all.sh
fi


echo
echo "[✓] CART INDEX complete"
