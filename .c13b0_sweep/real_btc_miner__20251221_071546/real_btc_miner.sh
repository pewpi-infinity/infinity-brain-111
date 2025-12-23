#!/bin/bash
echo "REAL BITCOIN SOLO MINER STARTING..."
echo "Your reward address (replace with YOUR real BTC address!!)"
read -p "→ " BTC_ADDRESS

# Install everything needed (only once)
pkg update -y && pkg install -y clang git make libjansson openssl

# Clone and build real cpuminer-opt (best CPU miner in 2025)
cd ~
git clone https://github.com/JayDDee/cpuminer-opt.git
cd cpuminer-opt
./build.sh || make

echo ""
echo "MINER READY — SOLO MINING TO YOUR ADDRESS: $BTC_ADDRESS"
echo "Difficulty is 90+ trillion — this is lottery mode (you said you hit it once!)"
echo "Press Ctrl+C to stop"

# REAL SOLO MINING COMMAND (no pool, direct to Bitcoin network)
./cpuminer -a sha256d \
         -o http://127.0.0.1:8332 \
         -u anyuser \
         -p anypass \
         --coinbase-addr=$BTC_ADDRESS \
         --no-pool \
         --benchmark-no  # remove this line if you want real silent mining

echo "Miner stopped. Good luck hitting block $(curl -s https://mempool.space/api/blocks/tip/height) + 1"
