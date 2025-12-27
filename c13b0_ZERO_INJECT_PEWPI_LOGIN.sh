#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱👰🧱 C13B0 ZERO — Inject Pewpi Login into Pixie"

# Locate Pixie repo
PIXIE="$(find "$HOME" -maxdepth 6 -type d -name "infinity-brain-111" 2>/dev/null | head -n 1)"
[ -n "$PIXIE" ] || { echo "❌ Pixie repo not found"; exit 1; }
cd "$PIXIE"

TS=$(date +%Y%m%d_%H%M%S)
cp index.html "index_backup_pewpi_${TS}.html"

# Remove previous Pewpi blocks (idempotent)
sed -i '/PEWPI_LOGIN_START/,/PEWPI_LOGIN_END/d' index.html

# Inject Pewpi Login block just before </body>
sed -i '/<\/body>/i \
<!-- PEWPI_LOGIN_START -->\
<section class="card" id="pewpi-login-card">\
  <strong>🔐 Pewpi Login</strong>\
  <p style="opacity:.7">Admin access via Pewpi</p>\
  <button onclick="pewpiLogin()" style="padding:10px 14px;border-radius:12px;">Login</button>\
</section>\
\
<script>\
function pewpiLogin(){\
  window.location.href = "https://pewpi-infinity.github.io/pewpi-emoji-login/?redirect=" + encodeURIComponent(window.location.href);\
}\
(function(){\
  const params = new URLSearchParams(window.location.search);\
  if(params.get("admin")==="1"){\
    localStorage.setItem("pewpi_admin_logged","true");\
    document.documentElement.classList.add("pewpi-admin");\
    history.replaceState({}, "", window.location.pathname);\
    console.log("🧱👰🧱 Pewpi admin unlocked");\
  }\
  if(localStorage.getItem("pewpi_admin_logged")==="true"){\
    document.documentElement.classList.add("pewpi-admin");\
  }\
})();\
</script>\
<!-- PEWPI_LOGIN_END -->\
' index.html

git add index.html index_backup_pewpi_*.html
git commit -m "🧱👰🧱 Inject Pewpi login (redirect handoff, terminal style)" || true
git pull --rebase origin main || true
git push origin main || git push --force-with-lease origin main

echo "🧱👰🧱 DONE"
echo "Open: https://pewpi-infinity.github.io/infinity-brain-111/?pewpi=$TS"
