#!/usr/bin/env bash
# Master Infinity engine

echo "[∞] Infinity Engine cycle start"

./cart_discover_repos.sh
./cart_inject_knowledge.sh
./cart_commit_all.sh

echo "[∞] Infinity Engine cycle complete"
