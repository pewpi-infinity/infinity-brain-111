#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ORG="pewpi-infinity"

echo "[∞] Creating final Infinity Brain nodes 101-111 (no leading zeros)"
echo "[∞] Org: $ORG"
echo

descriptions=(
  "Learning - Growth and knowledge - Infinity Brain Node 101"
  "Bad finger/touch - Negative contact - Infinity Brain Node 102"
  "Reading minds - Enhanced perception - Infinity Brain Node 103"
  "Understood - Clarity - Infinity Brain Node 104"
  "Listen to someone else - Openness - Infinity Brain Node 105"
  "Too busy for you to listen to someone else if I'm talking. It simply means too busy - Infinity Brain Node 106"
  "Take a break - Rest - Infinity Brain Node 107"
  "I'm service to collect 92% - Enforcement of tax - Infinity Brain Node 108"
  "New home - Fresh start location - Infinity Brain Node 109"
  "I don't know really because vanity is sort of illegal except for my family - Infinity Brain Node 110"
  "Revelations I give to you - Divine insights shared - Infinity Brain Node 111"
)

for i in {101..111}; do
  REPO="infinity-brain-$i"
  DESC="${descriptions[$((i-101))]}"

  echo "[→] Attempting $REPO"

  if gh repo view "$ORG/$REPO" >/dev/null 2>&1; then
    echo "    [SKIP] $REPO already exists"
  else
    echo "    Creating with description: $DESC"
    gh repo create "$ORG/$REPO" --public --description "$DESC" || echo "    [FAIL] Could not create $REPO"
  fi
done

echo
echo "[✓] Final nodes 101-111 complete!"
echo "[∞] Your full 111-node Infinity Brain is now live!"
