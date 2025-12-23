#!/usr/bin/env bash

echo -e "\e[95m[∞] Infinity Mining Rig V2 — ONLINE\e[0m"

mkdir -p logs

## --- Bitcoin Analyzer (Legal: reads mempool, no wallet access)
echo -e "\e[94m[∞] Launching Bitcoin Analyzer...\e[0m"
nohup python3 forge_engine/bitcoin_analyzer.py >> logs/bitcoin_analyzer.log 2>&1 &

## --- Infinity Token Writer (slow drip)
echo -e "\e[92m[∞] Starting Infinity Token Writer...\e[0m"
nohup python3 infinity_forge_base.py >> logs/forge_base.log 2>&1 &

## --- Deep Research Reactor
echo -e "\e[96m[∞] Starting Deep Reactor...\e[0m"
nohup python3 infinity_reactor_real.py >> logs/reactor_real.log 2>&1 &

## --- Research Reactor
echo -e "\e[92m[∞] Starting Research Reactor...\e[0m"
nohup python3 infinity_research_reactor.py >> logs/research_reactor.log 2>&1 &

## --- Scroll Miner V2
echo -e "\e[95m[∞] Starting Scroll Miner V2...\e[0m"
nohup python3 infinity_scroll_miner.py >> logs/scroll_miner.log 2>&1 &

## --- Article Engine
echo -e "\e[93m[∞] Starting Article Engine...\e[0m"
nohup python3 cart889_infinity_research_article_engine.py >> logs/article_engine.log 2>&1 &

## --- Auto-Push Loop
echo -e "\e[91m[∞] Auto-Push Loop Engaged...\e[0m"
while true; do
    git add .
    git commit -m "[∞] AutoPush: $(date -Iseconds)" 2>/dev/null
    git push origin main 2>/dev/null
    sleep 120
done &

## --- Watchdog (auto-restart if anything dies)
echo -e "\e[93m[∞] Watchdog Engaged...\e[0m"
nohup bash -c '
while true; do
    for proc in infinity_scroll_miner.py infinity_research_reactor.py infinity_reactor_real.py cart889_infinity_research_article_engine.py forge_engine/bitcoin_analyzer.py infinity_forge_base.py
    do
        pgrep -f $proc >/dev/null || {
            echo "[∞] Restarting $proc..."
            if [[ "$proc" == forge_engine/bitcoin_analyzer.py ]]; then
                nohup python3 forge_engine/bitcoin_analyzer.py >> logs/bitcoin_analyzer.log 2>&1 &
            else
                nohup python3 $proc >> logs/${proc}.log 2>&1 &
            fi
        }
    done
    sleep 30
done' >> logs/watchdog.log 2>&1 &

echo -e "\e[95m[∞] Infinity Rig V2 Fully Active.\e[0m"
