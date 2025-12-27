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
