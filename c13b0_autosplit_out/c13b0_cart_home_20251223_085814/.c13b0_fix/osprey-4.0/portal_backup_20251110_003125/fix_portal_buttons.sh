#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/osprey-4.0

echo "[🪶] Restoring portal buttons..."

cat > portal/builder.js <<'EOF'
// 🚀  Osprey Portal App-Builder Logic  (patched)
const ideas = [
 "Signal Generator","Quantum Visualizer","Voice Recorder","Music Synth",
 "Coin Catalog","Marketplace Listing","Story Writer","Gemstone Designer",
 "AI Chat Bot","Weather Monitor"
];

function renderIdeas(){
  const wrap=document.getElementById("ideaButtons");
  wrap.innerHTML="";
  ideas.forEach(i=>{
    const b=document.createElement("button");
    b.textContent=i;
    b.onclick=()=>buildTemplate(i);
    wrap.appendChild(b);
  });
}

function buildTemplate(name){
  const safe=name.replace(/\s/g,'');
  const code=`// 🪶 ${name} App Template
function start${safe}(){
  console.log("Launching ${name} app...");
}`;
  showOutput(code);
}

function createApp(){
  const idea=document.getElementById("ideaInput").value||"Untitled";
  buildTemplate(idea);
}

function showOutput(code){
  const o=document.getElementById("output");
  o.style.display="block";
  document.getElementById("appCode").textContent=code;
}

window.addEventListener("DOMContentLoaded",renderIdeas);
EOF

git add portal/builder.js
git commit -m "fix: restore working Portal buttons"
git push origin main
echo "[✅] Portal button patch pushed to GitHub."

