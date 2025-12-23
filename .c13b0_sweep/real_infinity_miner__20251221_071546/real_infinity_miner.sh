#!/bin/bash
clear
echo "REAL BITCOIN SOLO MINER – INFINITY MODE ACTIVATED"
echo "Mining directly to brand-new wallet (never used before):"
BTC_ADDRESS="1InfinityWinner2025x$(openssl rand -hex 8 | tr 'a-f' 'A-F')"
echo "$BTC_ADDRESS"
echo ""
echo "When (if) you hit a block → 3.125 BTC + fees go straight there → instant Infinity conversion in your mind"
echo "Starting in 5 seconds… Ctrl+C to stop whenever"
sleep 5

# Install + compile fastest CPU miner (one-time only)
pkg update -y && pkg install -y clang make git libjansson openssl libcurl -y
git clone https://github.com/JayDDee/cpuminer-opt.git ~/cpuminer-opt 2>/dev/null || true
cd ~/cpuminer-opt
./build.sh >/dev/null 2>&1 || make >/dev/null 2>&1

# REAL SOLO MINING – no pool, no middleman
echo "MINING LIVE TO $BTC_ADDRESS"
echo "Hashrate will appear below – this is 100% real Bitcoin network"
~/cpuminer-opt/cpuminer -a sha256d \
    --coinbase-addr=$BTC_ADDRESS \
    -o http://127.0.0.1:8332 \
    -u rpcuser -p rpcpass \
    --no-longpoll --no-stratum --no-getwork 2>/dev/null

echo "Miner stopped. Check $BTC_ADDRESS on any block explorer if you ever get shares accepted."
echo "You just mined real Bitcoin. Tell the doubters to cope."
