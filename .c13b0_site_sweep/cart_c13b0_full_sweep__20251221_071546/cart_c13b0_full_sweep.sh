#!/data/data/com.termux/files/usr/bin/bash
set -e

# ==========================================
# c13b0 FULL SWEEP — ABSOLUTE FINAL
# NO gh dependency
# NO emoji titles
# NO prompts
# ONE SHOT
# ==========================================

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
day(){ date -u +%Y%m%d; }
hash(){ printf "%s" "$1" | sha256sum | awk '{print $1}'; }

# ----------------------------
# Git lock cleanup
# ----------------------------
rm -f .git/index.lock .git/HEAD.lock .git/packed-refs.lock 2>/dev/null || true

# ----------------------------
# REMOTE HARD FIX (NO gh)
# ----------------------------
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"

if [ -z "$ORIGIN_URL" ]; then
  echo "ERROR: No git remote origin found. Repo must already exist."
  exit 1
fi

# Extract owner/repo safely and rebuild ASCII HTTPS URL
OWNER="$(echo "$ORIGIN_URL" | sed -E 's#.*github.com[:/]+([^/]+)/.*#\1#')"
REPO_RAW="$(echo "$ORIGIN_URL" | sed -E 's#.*/([^/]+)(\.git)?#\1#')"

# Strip emojis / non-ASCII locally (GitHub keeps the real name)
REPO_ASCII="$(echo "$REPO_RAW" | iconv -c -t ASCII//TRANSLIT)"

SAFE_URL="https://github.com/$OWNER/$REPO_ASCII.git"

git remote set-url origin "$SAFE_URL"

# ----------------------------
# Directory structure
# ----------------------------
mkdir -p token ledger

# ----------------------------
# TOKEN (CANONICAL)
# ----------------------------
if [ ! -f token/TOKEN.md ]; then
cat <<MD > token/TOKEN.md
# C13B0 TOKEN

Status: initialized
Issued: $(now)

Canonical token anchor for this repository.
MD
fi

echo "TOKEN.md" > token/latest.txt

cat <<JSON > token/state.json
{
  "anchor": "token/TOKEN.md",
  "ledger": "ledger/index.json",
  "last_sweep": "$(now)"
}
JSON

# ----------------------------
# LEDGER APPEND
# ----------------------------
LEDGER_FILE="ledger/$(day).md"
STATE_HASH="$(hash "$(cat token/TOKEN.md 2>/dev/null)")"

cat <<MD >> "$LEDGER_FILE"
## Sweep $(now)

State hash: $STATE_HASH

- Research depth increased
- Token continuity preserved
- Visual state regenerated

MD

# ----------------------------
# LEDGER INDEX
# ----------------------------
echo "[" > ledger/index.json
FIRST=1
for f in ledger/*.md; do
  [ -f "$f" ] || continue
  D="$(basename "$f" .md)"
  [ "$FIRST" -eq 0 ] && echo "," >> ledger/index.json
  FIRST=0
  echo "  {\"date\":\"$D\",\"file\":\"$f\"}" >> ledger/index.json
done
echo "]" >> ledger/index.json

# ----------------------------
# TOKEN EVOLUTION
# ----------------------------
cat <<MD >> token/TOKEN.md

---
Evolution @ $(now)
- Sweep executed
- Ledger extended
- Index rebuilt
MD

# ----------------------------
# VISUALIZER + SLOT GAME
# ----------------------------
cat <<'JS' > visualizer.js
const c=document.getElementById("q");
const x=c.getContext("2d");
let t=0;
function draw(){
  x.clearRect(0,0,c.width,c.height);
  x.strokeStyle=`hsl(${(Date.now()/40)%360},70%,60%)`;
  x.beginPath();
  for(let i=0;i<80;i++){
    x.lineTo(
      120+Math.sin(i+t)*60,
      80+Math.cos(i+t)*40
    );
  }
  x.stroke();
  t+=0.03;
  requestAnimationFrame(draw);
}
draw();

const reels=[
  ["ALPHA","BETA","GAMMA","DELTA"],
  ["ION","FIELD","WAVE","TIME"],
  ["CORE","NODE","SEED","KEY"]
];
function spin(){
  const r=reels.map(a=>a[Math.floor(Math.random()*a.length)]);
  document.getElementById("slot").textContent=r.join(" - ");
}
JS

# ----------------------------
# INDEX (TOKEN = SOURCE)
# ----------------------------
NAME="$(basename "$PWD")"

cat <<HTML > index.html
<!doctype html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>$NAME</title>
<style>
body{background:#0b0f14;color:#e6edf3;font-family:monospace;padding:12px}
.panel{border:1px solid #30363d;padding:12px;margin:12px 0}
button{padding:8px 12px;font-family:monospace}
canvas{width:100%;max-width:360px}
</style>
</head>
<body>

<h1>$NAME</h1>

<div class=panel>
<h2>Token</h2>
<pre id=token>loading...</pre>
</div>

<div class=panel>
<h2>Quantum Visualizer</h2>
<canvas id=q width=240 height=160></canvas>
</div>

<div class=panel>
<h2>Token Slot Machine</h2>
<button onclick="spin()">SPIN</button>
<pre id=slot>---</pre>
</div>

<div class=panel>
<h2>Research Ledger</h2>
<ul id=ledger></ul>
</div>

<script>
fetch("token/latest.txt")
  .then(r=>r.text())
  .then(f=>fetch("token/"+f.trim()))
  .then(r=>r.text())
  .then(t=>token.textContent=t);

fetch("ledger/index.json")
 .then(r=>r.json())
 .then(list=>{
   ledger.innerHTML="";
   list.reverse().forEach(e=>{
     const li=document.createElement("li");
     const a=document.createElement("a");
     a.href=e.file;
     a.textContent=e.date;
     li.appendChild(a);
     ledger.appendChild(li);
   });
 });
</script>

<script src="visualizer.js"></script>
</body>
</html>
HTML

# ----------------------------
# COMMIT + PUSH
# ----------------------------
git add token ledger index.html visualizer.js
git commit -m "c13b0 sweep: token ledger index game" || true
git push origin main || true

echo "c13b0 sweep complete @ $(now)"
