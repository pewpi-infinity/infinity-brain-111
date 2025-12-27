#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 3 Bot & Rogers Framework
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🤖] Starting Phase-3 Bot framework setup…"

mkdir -p bots logic

# ---- Bots manifest ----
cat > bots/manifest.json <<'EOF'
[
  {"name":"Rogers","role":"Vice President","skills":["analysis","coordination","dialogue"]},
  {"name":"Helios","role":"Energy Bot","skills":["energy","infrastructure","statistics"]},
  {"name":"Gaia","role":"Food Bot","skills":["agriculture","logistics","sustainability"]},
  {"name":"Aegis","role":"Health Bot","skills":["public health","data","protection"]},
  {"name":"Athena","role":"Education Bot","skills":["learning","research","innovation"]}
]
EOF

# ---- Simple logic kernel ----
cat > logic/engine.js <<'EOF'
// 🧠 Osprey Logic Engine (Phase 3)
// Loads bots + provides basic rule processing hooks.

async function loadBots() {
  const res = await fetch('bots/manifest.json');
  const bots = await res.json();
  window.ospreyBots = bots;
  console.log("[🤖] Bots loaded:", bots.map(b=>b.name).join(', '));
  return bots;
}

function reason(context) {
  const msg = `[💬] Rogers reviewing context: ${context}`;
  console.log(msg);
  return msg;
}

window.OspreyLogic = { loadBots, reason };
EOF

# ---- Connect to UI automatically ----
echo -e "\n<script src=\"logic/engine.js\"></script>" >> osprey_ui/index.html

# ---- Update README ----
echo -e "\n## Phase-3 Bots and Logic Engine $(date)\n- Added /bots and /logic modules for AI reasoning." >> README.md

git add .
git commit -m "Phase-3: add bot manifest and logic engine"
git push origin main

echo "[✅] Phase-3 pushed successfully!"
echo "Check → https://github.com/pewpi-infinity/osprey-4.0/tree/main/bots"

