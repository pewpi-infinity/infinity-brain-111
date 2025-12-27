#!/usr/bin/env bash
echo "[∞] Restarting Infinity Engines…"

# Start the scroll miner
nohup python3 infinity_scroll_miner.py >> logs/scroll_miner.log 2>&1 &

# Start the research reactor
nohup python3 infinity_research_reactor.py >> logs/research_reactor.log 2>&1 &

# Start the deep reactor
nohup python3 infinity_reactor_real.py >> logs/reactor_real.log 2>&1 &

# Start the token writer
nohup python3 cart889_infinity_research_article_engine.py >> logs/article_engine.log 2>&1 &

echo "[∞] All engines online."
