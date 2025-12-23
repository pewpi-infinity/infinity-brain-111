#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 2 Network Builder & Pusher
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🧩] Starting Phase-2 network setup …"

# 1️⃣ Create /network folder with core files
mkdir -p network

# Each office from Phase 1 becomes a node
cat > network/nodes.json <<'EOF'
[
  {"id":"vice_president","name":"Vice President – Rogers AI","type":"executive"},
  {"id":"energy","name":"Energy & Infrastructure","type":"department"},
  {"id":"food","name":"Food & Agriculture","type":"department"},
  {"id":"housing","name":"Housing & Urban Development","type":"department"},
  {"id":"health","name":"Health & Human Services","type":"department"},
  {"id":"education","name":"Education & Research","type":"department"}
]
EOF

# Simple link map (showing connections between nodes)
cat > network/links.json <<'EOF'
[
  {"a":"vice_president","b":"energy","strength":1.0},
  {"a":"vice_president","b":"food","strength":1.0},
  {"a":"vice_president","b":"housing","strength":1.0},
  {"a":"vice_president","b":"health","strength":1.0},
  {"a":"vice_president","b":"education","strength":1.0},
  {"a":"energy","b":"housing","strength":0.8},
  {"a":"food","b":"health","strength":0.7},
  {"a":"education","b":"health","strength":0.9}
]
EOF

# A short JS stub for later visualization
mkdir -p osprey_ui/modules
cat > osprey_ui/modules/network_engine.js <<'EOF'
// ─────────────────────────────────────────────
// 🧩 OSPREY 4.0 – Network Engine (Phase 2 Stub)
// Loads nodes and links and makes them available to the vector UI
// ─────────────────────────────────────────────

async function loadNetwork() {
  const [nodesRes, linksRes] = await Promise.all([
    fetch('network/nodes.json'),
    fetch('network/links.json')
  ]);
  const nodes = await nodesRes.json();
  const links = await linksRes.json();
  console.log("[🌐] Network loaded:", nodes.length, "nodes,", links.length, "links");
  window.ospreyNetwork = { nodes, links };
}
loadNetwork();
EOF

echo "[📡] Network data and module created."

# 2️⃣ Add summary to README
echo -e "\n## Phase-2 Network Links $(date)\n- Added /network nodes and links for visual mapping." >> README.md

# 3️⃣ Commit and push
git add .
git commit -m "Phase-2: add network nodes, links, and loader module"
git push origin main

echo "[✅] Phase-2 pushed to GitHub successfully!"
echo "Check → https://github.com/pewpi-infinity/osprey-4.0/tree/main/network"

