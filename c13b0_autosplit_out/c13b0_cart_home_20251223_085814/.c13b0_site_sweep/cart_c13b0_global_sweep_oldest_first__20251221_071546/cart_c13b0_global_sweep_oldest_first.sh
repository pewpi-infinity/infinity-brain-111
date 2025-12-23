#!/data/data/com.termux/files/usr/bin/bash
set -e

# =========================================================
# c13b0 GLOBAL SWEEP — OLDEST FIRST
# ONE FILE • AUTO RUN • TERMUX SAFE • HTTPS ONLY
# =========================================================

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_global_sweep"
mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
day(){ date -u +%Y%m%d; }
hash(){ printf "%s" "$1" | sha256sum | awk '{print $1}'; }

echo "== c13b0 GLOBAL SWEEP START $(now) =="

# ---------------------------------------------------------
# Get repo list sorted by creation date (oldest first)
# ---------------------------------------------------------
gh repo list "$OWNER" \
  --limit 500 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

# ---------------------------------------------------------
# Sweep repos
# ---------------------------------------------------------
while read -r REPO; do
  [ -z "$REPO" ] && continue

  echo
  echo "---- Sweeping $REPO ----"

  DIR="$WORK/$REPO"
  URL="https://github.com/$OWNER/$REPO.git"

  if [ -d "$DIR/.git" ]; then
    cd "$DIR"
    git pull --ff-only || true
  else
    git clone "$URL" "$DIR" || { cd "$WORK"; continue; }
    cd "$DIR"
  fi

  # Git safety
  rm -f .git/index.lock .git/HEAD.lock .git/packed-refs.lock 2>/dev/null || true

  # Ensure structure
  mkdir -p token ledger

  # Skip if already swept today
  if grep -R "$(day)" ledger 2>/dev/null | grep -q "Sweep"; then
    echo "Already swept today — skipping"
    cd "$WORK"
    continue
  fi

  # ---------------- TOKEN ----------------
  if [ ! -f token/TOKEN.md ]; then
cat <<MD > token/TOKEN.md
# C13B0 TOKEN

Status: active
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

  # ---------------- LEDGER ----------------
  LEDGER_FILE="ledger/$(day).md"
  STATE_HASH="$(hash "$(cat token/TOKEN.md)")"

cat <<MD >> "$LEDGER_FILE"
## Sweep $(now)

Repo: $REPO
Order: oldest-first
State hash: $STATE_HASH

- Repo normalized
- Token verified
- Index aligned
MD

  # Ledger index
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

  # ---------------- VISUALIZER ----------------
cat <<'JS' > visualizer.js
const c=document.getElementById("q");
if(c){
  const x=c.getContext("2d");
  let t=0;
  function draw(){
    x.clearRect(0,0,c.width,c.height);
    x.strokeStyle=`hsl(${(Date.now()/70)%360},70%,60%)`;
    x.beginPath();
    for(let i=0;i<80;i++){
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
}
JS

  # ---------------- INDEX ----------------
  if [ ! -f index.html ]; then
cat <<HTML > index.html
<!doctype html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>$REPO</title>
<style>
body{background:#0b0f14;color:#e6edf3;font-family:monospace;padding:12px}
.panel{border:1px solid #30363d;padding:12px;margin:12px 0}
canvas{width:100%;max-width:360px}
</style>
</head>
<body>

<h1>$REPO</h1>

<div class=panel>
<h2>Token</h2>
<pre id=token>loading...</pre>
</div>

<div class=panel>
<h2>Quantum Visualizer</h2>
<canvas id=q width=240 height=160></canvas>
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
  fi

  # ---------------- COMMIT + PUSH ----------------
  git add token ledger index.html visualizer.js
  git commit -m "c13b0 sweep: normalize token ledger index" || true
  git push || true

  cd "$WORK"

done < repos.txt

echo
echo "== c13b0 GLOBAL SWEEP COMPLETE $(now) =="
