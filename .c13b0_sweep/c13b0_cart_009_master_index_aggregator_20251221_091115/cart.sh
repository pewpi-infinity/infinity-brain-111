#!/usr/bin/env bash
echo "🧱 C13B0 CART 009 RUNNER"
echo "Building ecosystem projection index (append-only)"
python3 aggregator/scan_repos.py
python3 aggregator/build_projection.py
