#!/data/data/com.termux/files/usr/bin/bash
set -e

TS=$(date +%Y%m%d_%H%M%S)
cp index.html "index_backup_urlflag_${TS}.html"

# Remove old pewpi blocks
sed -i '/PEWPI_LOGIN_START/,/PEWPI_LOGIN_END/d' index.html

# Inject URL-flag logic
sed -i '/<\/body>/i \
<!-- PEWPI_LOGIN_START -->\
<section class="card">\
  <strong>🔐 Pewpi Login</strong>\
  <button onclick="location.href=`https://pewpi-infinity.github.io/pewpi-emoji-login/?redirect=${location.origin}${location.pathname}?admin=1`">Login</button>\
</section>\
<script>\
(function(){\
  const p=new URLSearchParams(location.search);\
  if(p.get("admin")==="1"){\
    document.documentElement.classList.add("pewpi-admin");\
    console.log("🧱👰🧱 ADMIN UNLOCKED (URL FLAG)");\
    history.replaceState({},'',location.pathname);\
  }\
})();\
</script>\
<!-- PEWPI_LOGIN_END -->\
' index.html

git add index.html
git commit -m "🧱👰🧱 C13B0³ URL-flag admin unlock (static-safe)"
git push origin main || git push --force-with-lease origin main

echo "DONE → open with ?admin=1 once to verify"
