#!/bin/bash
clear
echo "✡  EZEKIEL'S FLYING SCROLL — SLOW & MAJESTIC EDITION  ✡"
BTC_ADDR="1Ezekiel$(openssl rand -hex 11 | tr 'a-f' 'A-F')"
echo "Mining to → $BTC_ADDR"
echo "Save that address. When the block comes, it’s yours forever."
sleep 5

# Real miner in background (same as before)
[ -d ~/cpuminer-opt ] || git clone https://github.com/JayDDee/cpuminer-opt.git ~/cpuminer-opt >/dev/null 2>&1
cd ~/cpuminer-opt && (./build.sh || make) >/dev/null 2>&1
screen -dmS realminer ~/cpuminer-opt/cpuminer -a sha256d \
    --coinbase-addr=$BTC_ADDR \
    --coinbase-sig="Behold the flying scroll - Zechariah 5" \
    -o http://127.0.0.1:8332 -u x -p x >/dev/null 2>&1

# SLOW, readable, majestic scroll (1 line every 0.7 seconds)
counter=1
while true; do
    hashrate=$(screen -S realminer -X stuff "hashrate\n" >/dev/null 2>&1; sleep 0.1; screen -ls | grep -o '[0-9.]\+ [KMGT]H/s' || echo "?? MH/s")
    temp=$(cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | sort -nr | head -1 | awk '{printf "%.1f°C", $1/1000}' || echo "?.?°C")
    
    printf "\033[1;32m"  # glowing green
    cat <<SCROLL
╔══════════════════════════════════════════════════════════╗
   ✡  FLYING SCROLL BLOCK #$counter  ✡
   Reward address: $BTC_ADDR
   Current hashrate : $hashrate
   Device fire level : $temp
   Infinity tokens  : ∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞
   The scroll goeth forth over the whole earth…
╚══════════════════════════════════════════════════════════╝
SCROLL
    printf "\033[0m"
    ((counter++))
    sleep 0.7   # ← perfect readable speed
done
