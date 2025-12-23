#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 9 Gateway / World Selector + 404 Fix Stubs
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0
echo "[🌐] Building Gateway and placeholder pages …"

mkdir -p gateway offices

#  Gateway HTML
cat > gateway/index.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Osprey Gateway</title>
<style>
body{margin:0;background:#030712;color:#e2e8f0;font-family:system-ui;text-align:center;}
h1{color:#38bdf8;margin-top:2rem;}
button{background:#38bdf8;color:#000;border:none;border-radius:12px;
  padding:1rem 2rem;margin:1rem;font-weight:600;font-size:1.1rem;}
section{margin-top:3rem;}
</style>
</head>
<body>
<h1>🪶 Osprey Gateway</h1>
<p>Select a world to enter below :</p>
<section>
  <button onclick="go('portal/index.html')">App Builder Portal</button>
  <button onclick="go('graveyard/index.html')">Bot Graveyard Game</button>
  <button onclick="go('offices/index.html')">Government Hub</button>
</section>
<script>
function go(path){location.href='../'+path;}
</script>
</body>
</html>
EOF

#  Government Hub stub (fixes 404s)
cat > offices/index.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Osprey Government Hub</title>
<style>
body{margin:0;padding:2rem;background:#030712;color:#e2e8f0;font-family:system-ui;}
a{display:block;margin:.5rem 0;color:#38bdf8;}
</style>
</head>
<body>
<h1>🏛 Osprey Government Hub (placeholder)</h1>
<p>These links replace the 404 pages until their real modules exist.</p>
<a href="../portal/index.html">Back to Portal</a>
<a href="../gateway/index.html">Return to Gateway</a>
</body>
</html>
EOF

#  Update README and push
echo -e "\n## Phase-9 Gateway $(date)\n- Added /gateway world selector and stubbed /offices to stop 404s." >> README.md
git add .
git commit -m "Phase-9: add Gateway selector and 404 fix stubs"
git push origin main
echo "[✅] Phase-9 Gateway pushed successfully!"
echo "Open → https://github.com/pewpi-infinity/osprey-4.0/tree/main/gateway"
EOF

