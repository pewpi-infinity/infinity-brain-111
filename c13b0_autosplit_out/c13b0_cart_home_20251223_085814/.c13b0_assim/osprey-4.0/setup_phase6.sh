#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 6 Portal / App-Builder Interface
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🚀] Starting Phase-6 Portal Interface setup…"

mkdir -p portal

# Main Portal HTML
cat > portal/index.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Osprey Portal – App Builder</title>
  <style>
    body{margin:0;padding:0;background:#030712;color:#e2e8f0;font-family:system-ui;}
    header{padding:1rem 2rem;background:#111827;color:#38bdf8;font-size:1.5rem;font-weight:600;}
    main{padding:2rem;}
    .card{background:rgba(15,23,42,.8);border:1px solid #38bdf8;
      border-radius:16px;padding:1rem;margin:1rem 0;box-shadow:0 0 10px #0ff;}
    button{background:#38bdf8;border:none;border-radius:12px;
      padding:0.5rem 1rem;color:#000;font-weight:600;margin-top:0.5rem;}
    #ideas button{margin:0.3rem;}
  </style>
</head>
<body>
  <header>🪶 Osprey Portal / App Builder</header>
  <main>
    <div class="card">
      <h2>Create Your Own App Page</h2>
      <p>Type an idea or select a suggestion to start building a unique application.</p>
      <input id="ideaInput" placeholder="Describe your idea…" style="width:70%;padding:0.5rem;border-radius:8px;border:1px solid #38bdf8;background:#0f172a;color:#e2e8f0;">
      <button onclick="createApp()">Build</button>
    </div>

    <div id="ideas" class="card">
      <h3>Need inspiration?</h3>
      <div id="ideaButtons"></div>
    </div>

    <div id="output" class="card" style="display:none;">
      <h3>New App Created 🎉</h3>
      <pre id="appCode"></pre>
    </div>
  </main>
  <script src="builder.js"></script>
</body>
</html>
EOF

# Builder Logic
cat > portal/builder.js <<'EOF'
// 🚀 Osprey Portal App-Builder Logic
const suggestions = [
 "Signal Generator",
 "Quantum Visualizer",
 "Voice Recorder",
 "Music Synth",
 "Coin Catalog",
 "Marketplace Listing",
 "Story Writer",
 "Gemstone Designer",
 "AI Chat Bot",
 "Weather Monitor"
];

const buttons = document.getElementById("ideaButtons");
suggestions.forEach(s =>{
  const b=document.createElement("button");
  b.textContent=s;
  b.onclick=()=>buildTemplate(s);
  buttons.appendChild(b);
});

function buildTemplate(name){
  const template = `// 🪶 ${name} App Template
function start${name.replace(/\s/g,'')}(){
  console.log("Starting ${name} App...");
}`;
  showOutput(template);
}

function createApp(){
  const idea = document.getElementById("ideaInput").value || "Untitled App";
  buildTemplate(idea);
}

function showOutput(code){
  document.getElementById("output").style.display='block';
  document.getElementById("appCode").textContent = code;
}
EOF

# Link from main UI (if desired later)
grep -q "portal/index.html" README.md || echo "\nPortal available at /portal/index.html" >> README.md

# Commit and push
git add .
git commit -m "Phase-6: add Portal / App-Builder Interface"
git push origin main

echo "[✅] Phase-6 Portal Interface pushed successfully!"
echo "Check → https://github.com/pewpi-infinity/osprey-4.0/tree/main/portal"

