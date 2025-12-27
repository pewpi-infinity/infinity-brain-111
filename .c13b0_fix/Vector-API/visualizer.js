const c=document.getElementById("q");
if(c){
  const x=c.getContext("2d");
  let t=0;
  function draw(){
    x.clearRect(0,0,c.width,c.height);
    x.strokeStyle=`hsl(${(Date.now()/60)%360},70%,60%)`;
    x.beginPath();
    for(let i=0;i<80;i++){
      x.lineTo(
        120+Math.sin(i+t)*60,
        80+Math.cos(i+t)*40
      );
    }
    x.stroke();
    t+=0.025;
    requestAnimationFrame(draw);
  }
  draw();
}
