#!/usr/bin/env bash
echo "[∞] Bringing Infinity Systems Online…"

mkdir -p logs

echo "[∞] Starting Scroll Miner…"
nohup python3 infinity_scroll_miner.py >> logs/scroll_miner.log 2>&1 &

echo "[∞] Starting Research Reactor…"
nohup python3 infinity_research_reactor.py >> logs/research_reactor.log 2>&1 &

echo "[∞] Starting Deep Reactor…"
nohup python3 infinity_reactor_real.py >> logs/reactor_real.log 2>&1 &

echo "[∞] Starting Article Engine…"
nohup python3 cart889_infinity_research_article_engine.py >> logs/article_engine.log 2>&1 &

echo "[∞] Infinity Engines Active."
