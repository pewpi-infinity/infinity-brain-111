#!/data/data/com.termux/files/usr/bin/bash
set -e

rm -f .git/index.lock .git/HEAD.lock .git/packed-refs.lock 2>/dev/null || true

./cart_c13b0_token_canonicalize.sh
./cart_c13b0_quantum_ledger.sh
./cart_c13b0_ledger_index.sh
./cart_c13b0_token_evolve.sh
./cart_c13b0_quantum_visualizer.sh
./cart_c13b0_index_synth.sh

git add token ledger index.html visualizer.js
git commit -m "🧱⚛ c13b0 sweep (token canonical)" || true
git push || true
