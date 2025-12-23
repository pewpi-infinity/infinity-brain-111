#!/data/data/com.termux/files/usr/bin/bash
#
# c13b0 — PayPal Buy + Login + Token Lineage
#

set -e

OWNER="pewpi-infinity"
BASE="$HOME/.c13b0_matrix"
PAYPAL_EMAIL="watsonkris611@gmail.com"

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }

hash() {
  printf "%s" "$1" | sha256sum | awk '{print $1}'
}

for DIR in "$BASE"/*; do
  [ -d "$DIR" ] || continue
  cd "$DIR"

  REPO="$(basename "$DIR")"
  TOKEN_HASH="$(sha256sum README.md | awk '{print $1}')"

  # ownership ledger
  [ -f OWNERS.json ] || echo "[]" > OWNERS.json

cat <<HTML > index.html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>$REPO — Token Purchase</title>
<style>
body { font-family: sans-serif; background:#111; color:#eee; max-width:900px; margin:auto; }
input, button { padding:10px; margin:6px 0; width:100%; }
.box { border:1px solid #444; padding:16px; margin-top:20px; }
</style>
</head>
<body>

<h1>🧱 Token Access — $REPO</h1>

<div class="box">
<h2>Login</h2>
<input id="email" placeholder="Email">
<input id="alias" placeholder="Alias / Handle">
<button onclick="login()">Login</button>
</div>

<div class="box">
<h2>Buy Token</h2>
<p>Token Hash: <code>$TOKEN_HASH</code></p>

<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
<input type="hidden" name="cmd" value="_xclick">
<input type="hidden" name="business" value="$PAYPAL_EMAIL">
<input type="hidden" name="item_name" value="c13b0 Token — $REPO">
<input type="hidden" name="currency_code" value="USD">
<input type="hidden" name="amount" value="0.00">
<input type="hidden" name="custom" value="$REPO|$TOKEN_HASH">
<button type="submit">Buy via PayPal</button>
</form>

<button onclick="record()">Record Ownership</button>
</div>

<script>
function login() {
  localStorage.setItem("c13b0_email", document.getElementById("email").value);
  localStorage.setItem("c13b0_alias", document.getElementById("alias").value);
  alert("Logged in");
}

function record() {
  const e = localStorage.getItem("c13b0_email");
  const a = localStorage.getItem("c13b0_alias");
  if (!e || !a) { alert("Login first"); return; }

  const rec = {
    email_hash: "$TOKEN_HASH".slice(0,8) + ":" + e,
    alias: a,
    repo: "$REPO",
    token: "$TOKEN_HASH",
    time: new Date().toISOString()
  };

  fetch("OWNERS.json")
    .then(r => r.json())
    .then(j => {
      j.push(rec);
      const blob = new Blob([JSON.stringify(j,null,2)],{type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "OWNERS.json";
      a.click();
    });
}
</script>

</body>
</html>
HTML

  git add index.html OWNERS.json
  git commit -m "add PayPal buy button + login + token lineage" >/dev/null 2>&1 || true
  git push origin main --force >/dev/null 2>&1

  echo "🧱 PAYPAL + LOGIN ADDED → $REPO"
done
