#!/data/data/com.termux/files/usr/bin/bash
set -e

SEED=$(date +%s)
COLOR=$((SEED % 360))

cat <<HTML > visualizer.js
const c=document.getElementById("q");
const x=c.getContext("2d");
let t=0;
function draw(){
  x.clearRect(0,0,c.width,c.height);
  x.strokeStyle="hsl($COLOR,80%,60%)";
  x.beginPath();
  for(let i=0;i<100;i++){
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
HTML
