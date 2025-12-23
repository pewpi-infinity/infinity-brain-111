#!/data/data/com.termux/files/usr/bin/bash
set -e

# ==========================================
# c13b0 GENESIS BOOTSTRAP
# NEW REPO • HTTPS ONLY • TERMUX SAFE
# ==========================================

REPO_NAME="c13b0-genesis"
OWNER="pewpi-infinity"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
day(){ date -u +%Y%m%d; }
hash(){ printf "%s" "$1" | sha256sum | awk '{print $1}'; }

echo "== c13b0 GENESIS START =="

# ------------------------------------------
# Create repo on GitHub (ASCII, HTTPS)
# ------------------------------------------
gh repo create "$OWNER/$REPO_NAME" \
  --public \
  --confirm \
  --clone=false

# ------------------------------------------
# Local repo setup
# ------------------------------------------
mkdir -p "$REPO_NAME"
cd "$REPO_NAME"
git init
git branch -M main
git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"

# ------------------------------------------
# Structure
# ------------------------------------------
mkdir -p token ledger

# ------------------------------------------
# TOKEN (CANONICAL)
# ------------------------------------------
cat <<MD > token/TOKEN.md
# C13B0 TOKEN

Status: genesis
Issued: $(now)

This token is the canonical anchor of the repository.
MD

echo "TOKEN.md" > token/latest.txt

cat <<JSON > token/state.json
{
  "anchor": "token/TOKEN.md",
  "ledger": "ledger/index.json",
  "created": "$(now)"
}
JSON

# ------------------------------------------
# LEDGER (FIRST ENTRY)
# ------------------------------------------
LEDGER_FILE="ledger/$(day).md"
STATE_HASH="$(hash "$(cat token/TOKEN.md)")"

cat <<MD > "$LEDGER_FILE"
## Genesis Sweep $(now)

State hash: $STATE_HASH

- Repository created
- Token initialized
- Ledger activated
- Index and visual systems online
MD

# ------------------------------------------
# LEDGER INDEX
# ------------------------------------------
cat <<JSON > ledger/index.json
[
  { "date": "$(day)", "file": "$LEDGER_FILE" }
]
JSON

# ------------------------------------------
# VISUALIZER + SLOT MACHINE
# ------------------------------------------
cat <<'JS' > visualizer.js
const c=document.getElementById("q");
const x=c.getContext("2d");
let t=0;
function draw(){
  x.clearRect(0,0,c.width,c.height);
  x.strokeStyle=`hsl(${(Date.now()/50)%360},70%,60%)`;
  x.beginPath();
  for(let i=0;i<90;i++){
    x.lineTo(
      120+Math.sin(i+t)*60,
      80+Math.cos(i+t)*40
    );
  }
  x.stroke();
  t+=0.02;
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

# ------------------------------------------
# INDEX (TOKEN = SOURCE OF TRUTH)
# ------------------------------------------
cat <<HTML > index.html
<!doctype html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>$REPO_NAME</title>
<style>
body{background:#0b0f14;color:#e6edf3;font-family:monospace;padding:12px}
.panel{border:1px solid #30363d;padding:12px;margin:12px 0}
button{padding:8px 12px;font-family:monospace}
canvas{width:100%;max-width:360px}
</style>
</head>
<body>

<h1>$REPO_NAME</h1>

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
   list.forEach(e=>{
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

# ------------------------------------------
# COMMIT + PUSH
# ------------------------------------------
git add .
git commit -m "c13b0 genesis: token ledger index visualizer"
git push -u origin main

# ------------------------------------------
# ENABLE GITHUB PAGES
# ------------------------------------------
gh api -X POST "repos/$OWNER/$REPO_NAME/pages" \
  -f source.branch=main \
  -f source.path=/ >/dev/null 2>&1 || true

echo "== c13b0 GENESIS COMPLETE =="
echo "Repo: https://github.com/$OWNER/$REPO_NAME"
echo "Pages: https://$OWNER.github.io/$REPO_NAME/"
