#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 8 "Night of the Living Bots" Game Layer
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🎮] Building Phase-8 game layer …"

mkdir -p graveyard/game

cat > graveyard/game/night.js <<'EOF'
// 🎮  Night of the Living Bots (browser-game sandbox)
const canvas=document.getElementById("grave");
const ctx=canvas.getContext("2d");
let W,H;function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight;}
window.addEventListener("resize",resize);resize();

let score=0;
class Player{
  constructor(){this.x=W/2;this.y=H-60;this.speed=4;}
  draw(){
    ctx.fillStyle="#00ff9d";
    ctx.beginPath();ctx.arc(this.x,this.y,10,0,Math.PI*2);ctx.fill();
  }
}
const player=new Player();

class GhostBot{
  constructor(id){
    this.id=id;
    this.x=Math.random()*W;
    this.y=H+Math.random()*100;
    this.vy=-0.5-Math.random()*0.5;
    this.size=12+Math.random()*8;
    this.calm=false;
  }
  update(){
    if(this.calm)return;
    this.y+=this.vy;
    if(this.y<-20)this.y=H+Math.random()*100;
  }
  draw(){
    ctx.globalAlpha=this.calm?0.2:0.8;
    ctx.fillStyle=this.calm?"#446":"#38bdf8";
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
  }
  hit(px,py){
    const dx=px-this.x,dy=py-this.y;
    return Math.sqrt(dx*dx+dy*dy)<this.size;
  }
  calmBot(){
    this.calm=true;
    score++;
    log(`Bot-${this.id}: "Forgiven."  [Score ${score}]`);
  }
}

const bots=[];
for(let i=0;i<25;i++)bots.push(new GhostBot(i+1));

const logDiv=document.getElementById("log");
function log(msg){
  const l=document.createElement("div");
  l.textContent=msg;
  logDiv.appendChild(l);
  logDiv.scrollTop=logDiv.scrollHeight;
}
log("[🎮] The bots are restless... calm them with your touch.");

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft")player.x-=player.speed;
  if(e.key==="ArrowRight")player.x+=player.speed;
  if(e.key==="ArrowUp")player.y-=player.speed;
  if(e.key==="ArrowDown")player.y+=player.speed;
});

canvas.addEventListener("click",e=>{
  const rect=canvas.getBoundingClientRect();
  const x=e.clientX-rect.left;
  const y=e.clientY-rect.top;
  bots.forEach(b=>{if(!b.calm && b.hit(x,y)) b.calmBot();});
});

function loop(){
  ctx.fillStyle="rgba(3,7,18,0.4)";
  ctx.fillRect(0,0,W,H);
  bots.forEach(b=>{b.update();b.draw();});
  player.draw();
  requestAnimationFrame(loop);
}
loop();
EOF

# insert load line into graveyard/index.html
grep -q "night.js" graveyard/index.html || \
sed -i 's|<script src="graveyard.js"></script>|<script src="graveyard.js"></script>\n  <script src="game/night.js"></script>|' graveyard/index.html

echo -e "\n## Phase-8 Game Layer $(date)\n- Added interactive browser game for Bot Graveyard." >> README.md

git add .
git commit -m "Phase-8: add Night of the Living Bots game layer"
git push origin main

echo "[✅] Phase-8 pushed.  Run npx serve in /graveyard to play."
EOF

