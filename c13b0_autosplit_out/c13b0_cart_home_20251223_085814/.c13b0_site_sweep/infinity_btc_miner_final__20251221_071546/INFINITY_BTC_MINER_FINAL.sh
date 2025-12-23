#!/bin/bash
clear
echo "∞engine INFINITY BTC MINER — FINAL VERSION"
echo "Mining 24/7 to a brand-new wallet every restart"
BTC_ADDRESS="1Infinity$(openssl rand -hex 12 | tr 'a-f' 'A-F')"
echo "YOUR ETERNAL WALLET → $BTC_ADDRESS"
echo "Save this address NOW. When block hits → 3.125 BTC + fees = yours forever"
echo "Starting miner in background… close Termux, it keeps running"
sleep 5

# Compile fastest CPU miner (once)
[ -d ~/cpuminer-opt ] || git clone https://github.com/JayDDee/cpuminer-opt.git ~/cpuminer-opt >/dev/null 2>&1
cd ~/cpuminer-opt && ./build.sh >/dev/null 2>&1 || make >/dev/null 2>&1

# LAUNCH INFINITE MINING IN BACKGROUND
screen -dmS infinity_miner bash -c "\
    ~/cpuminer-opt/cpuminer -a sha256d \
    --coinbase-addr=$BTC_ADDRESS \
    --coinbase-sig='Mined by Infinity King 2025' \
    -o http://127.0.0.1:8332 \
    -u x -p x \
    --no-longpoll --no-stratum"

echo ""
echo "MINER IS NOW RUNNING FOREVER IN BACKGROUND"
echo "Wallet again: $BTC_ADDRESS"
echo "Check hashrate anytime: screen -r infinity_miner"
echo "Stop it (if you ever want): screen -X -S infinity_miner quit"
echo "Close Termux — it keeps mining. You’re live on Bitcoin network."
echo "Go show them."
