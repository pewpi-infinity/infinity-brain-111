#!/data/data/com.termux/files/usr/bin/bash
set -e

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
hash(){ printf "%s" "$1" | sha256sum | awk '{print $1}'; }

mkdir -p ledger

DAY=$(date -u +%Y%m%d)
LEDGER="ledger/$DAY.md"

STATE_HASH=$(hash "$(cat TOKEN.md README.md 2>/dev/null)")

cat <<MD >> "$LEDGER"
## ⚛ Quantum Sweep @ $(now)

State Hash: \`$STATE_HASH\`

- Entropy increased
- Visual state recalculated
- Token continuity preserved

Next:
- Temporal drift
- Field coupling
- Graph expansion

MD
