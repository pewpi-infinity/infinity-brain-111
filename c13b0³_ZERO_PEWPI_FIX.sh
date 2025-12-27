#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱👰🧱 C13B0³ ZERO — Pewpi Fix (inline, no folders)"

# backup
TS=$(date +%Y%m%d_%H%M%S)
cp index.html "index_backup_pewpi_zero_${TS}.html"

# remove any prior pewpi blocks
sed -i '/PEWPI_LOGIN_START/,/PEWPI_LOGIN_END/d' index.html

# inject FINAL pewpi logic
sed -i '/<\/body>/i \
<!-- PEWPI_LOGIN_START -->\
<section class="card" id="pewpi-login-card">\
  <strong>🔐 Pewpi Login</strong>\
  <p style="opacity:.7">Admin access</p>\
  <button onclick="pewpiLogin()" style="padding:10px 14px;border-radius:12px;">Login</button>\
</section>\
<script>\
function pewpiLogin(){\
  localStorage.setItem("pewpi_return_expected","1");\
  window.location.href="https://pewpi-infinity.github.io/pewpi-emoji-login/?redirect="+encodeURIComponent(location.origin+location.pathname);\
}\
(function(){\
  const cameBack = localStorage.getItem("pewpi_return_expected")==="1";\
  if(cameBack){\
    localStorage.removeItem("pewpi_return_expected");\
    localStorage.setItem("pewpi_admin_logged","true");\
    document.documentElement.classList.add("pewpi-admin");\
    console.log("🧱👰🧱 Pewpi return detected — admin unlocked");\
  }\
  if(localStorage.getItem("pewpi_admin_logged")==="true"){\
    document.documentElement.classList.add("pewpi-admin");\
  }\
})();\
</script>\
<!-- PEWPI_LOGIN_END -->\
' index.html

git add index.html index_backup_pewpi_zero_*.html
git commit -m "🧱👰🧱 C13B0³ ZERO Pewpi fix — no folders, inline, force admin"
git push origin main || git push --force-with-lease origin main

echo "🧱👰🧱 DONE — open with cache buster:"
echo "https://pewpi-infinity.github.io/infinity-brain-111/?pewpi_zero=$TS"
