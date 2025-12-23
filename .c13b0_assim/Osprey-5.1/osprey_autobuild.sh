#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "[🦅] Starting Osprey 5.1 full rebuild..."

# make sure you're in the repo
cd ~/osprey-5.1

# rebuild key scripts
cat > osprey_system.js <<'JS'
// 🦅 Osprey 5.1 unified system
window.Osprey={version:"5.1",modules:{},register(n,d){this.modules[n]=d;console.log("[🪶] Module registered:",n)},list(){return Object.keys(this.modules)}};
Osprey.register("bots",[{name:"Rogers",role:"Vice President",skills:["analysis","coordination","dialogue"]},{name:"Helios",role:"Energy Bot",skills:["energy","infrastructure","statistics"]},{name:"Gaia",role:"Food Bot",skills:["agriculture","logistics","sustainability"]},{name:"Aegis",role:"Health Bot",skills:["public health","data","protection"]},{name:"Athena",role:"Education Bot",skills:["learning","research","innovation"]}]);
Osprey.register("network",{nodes:[{id:"vice_president",name:"Vice President – Rogers AI",type:"executive"},{id:"energy",name:"Energy & Infrastructure",type:"department"},{id:"food",name:"Food & Agriculture",type:"department"},{id:"housing",name:"Housing & Urban Development",type:"department"},{id:"health",name:"Health & Human Services",type:"department"},{id:"education",name:"Education & Research",type:"department"}],links:[{a:"vice_president",b:"energy",strength:1.0},{a:"vice_president",b:"food",strength:1.0},{a:"vice_president",b:"housing",strength:1.0},{a:"vice_president",b:"health",strength:1.0},{a:"vice_president",b:"education",strength:1.0},{a:"energy",b:"housing",strength:0.8},{a:"food",b:"health",strength:0.7},{a:"education",b:"health",strength:0.9}]});
Osprey.register("routes",{portal:"portal/index.html",builder:"portal/builder.js",signal:"signal_generator.html",quantum:"quantum_visualizer.html",graveyard:"graveyard/game/night_extended.html"});
document.addEventListener("DOMContentLoaded",()=>{const o=document.createElement("div");o.id="osprey-status";o.style.cssText="position:fixed;bottom:10px;right:10px;background:rgba(15,23,42,.9);color:#0ff;padding:10px 16px;border-radius:8px;font-family:monospace;font-size:13px;border:1px solid #0ff;z-index:9999";o.innerHTML="🦅 Osprey "+Osprey.version+"<br/>Modules: "+Osprey.list().join(", ");document.body.appendChild(o)});
console.log("[🧠] Osprey Unified System Online");
JS

# stage & push all updates
git add .
git commit -m "🚀 Osprey 5.1 full rebuild (system+portal+game+quantum)"
git push origin main

echo "[✅] All pages and scripts deployed to GitHub successfully."
