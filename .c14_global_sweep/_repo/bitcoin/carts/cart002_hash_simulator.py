#!/usr/bin/env python3
import json

PROFILE = {
    "device": "Termux-CPU",
    "hashrate_Hs": 12000,
    "power_watts": 6
}

STATE = json.load(open("bitcoin/ledger/HASH_LEDGER.json"))

share = PROFILE["hashrate_Hs"] / (STATE["network_hashrate_THs"] * 1e12)
blocks_per_day = 86400 / STATE["block_time_sec"]
btc_day = share * blocks_per_day * STATE["block_reward_btc"]

print(f"[SIM] Expected BTC/day: {btc_day:.12f}")
