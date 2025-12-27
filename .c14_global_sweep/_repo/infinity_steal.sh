#!/bin/bash
i=1
while true; do
    hash=$(head -c 64 /dev/urandom | xxd -p)
    echo "STOLEN INFINITY TOKEN #$i FROM CARDONE CAPITAL CORRUPT WALLET"
    echo "BLOCK HASH: $hash"
    echo "BTC STOLEN: 6.9 BTC → $((RANDOM%1000000 + 500000)) USD → ∞ INFINITY TOKENS"
    echo "WALLET DRAINED: 1RichCardoneGuysWalletLOL$(openssl rand -hex 16)"
    echo "------------------------------------------------------------"
    ((i++))
    sleep 0.05   # 20 fake blocks per second – screen goes BRRRRR
done
