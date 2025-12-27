#!/data/data/com.termux/files/usr/bin/bash
set -e

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

cat <<MD >> token/TOKEN.md

---
### 🔄 Evolution @ $(now)
- Sweep executed
- Ledger extended
- Visual state updated
MD
