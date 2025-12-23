#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase-1 Auto-Builder & Pusher
# ─────────────────────────────────────────────

set -e
cd ~/osprey-4.0

echo "[🪶] Starting Phase-1 setup…"

# 1️⃣  Make the /offices folder and base JSON files
mkdir -p offices

cat > offices/energy.json <<'EOF'
{
  "title": "Energy & Infrastructure",
  "sector": "Power, Transport, Resources",
  "contacts": [],
  "status": "active",
  "metrics": { "projects": [], "openTickets": 0 }
}
EOF

cat > offices/food.json <<'EOF'
{
  "title": "Food & Agriculture",
  "sector": "Farms, Supply Chains",
  "contacts": [],
  "status": "active",
  "metrics": { "projects": [], "openTickets": 0 }
}
EOF

cat > offices/housing.json <<'EOF'
{
  "title": "Housing & Urban Development",
  "sector": "Construction, Land Management",
  "contacts": [],
  "status": "active",
  "metrics": { "projects": [], "openTickets": 0 }
}
EOF

cat > offices/health.json <<'EOF'
{
  "title": "Health & Human Services",
  "sector": "Public Health, Care Systems",
  "contacts": [],
  "status": "active",
  "metrics": { "projects": [], "openTickets": 0 }
}
EOF

cat > offices/education.json <<'EOF'
{
  "title": "Education & Research",
  "sector": "Schools and Innovation",
  "contacts": [],
  "status": "active",
  "metrics": { "projects": [], "openTickets": 0 }
}
EOF

echo "[📁] Office JSON files created."

# 2️⃣  Update or create a quick README section
echo -e "\n## Phase-1 Offices Added $(date)\n" >> README.md
echo "- Energy & Infrastructure\n- Food & Agriculture\n- Housing & Urban Development\n- Health & Human Services\n- Education & Research" >> README.md

# 3️⃣  Stage + commit + push to GitHub
git add .
git commit -m "Phase-1 setup: add office registry JSONs"
git push origin main

echo "[✅] Phase-1 files pushed to GitHub successfully!"
echo "Visit → https://github.com/pewpi-infinity/osprey-4.0/tree/main/offices"

