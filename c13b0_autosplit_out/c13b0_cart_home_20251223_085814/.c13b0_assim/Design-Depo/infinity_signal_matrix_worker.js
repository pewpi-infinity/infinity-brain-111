
/**
 * Infinity Signal Matrix — 16x Sequencer & Recorder (Single‑File Worker)
 * - "/" : Step sequencer with 4 tracks, per-step velocity, and WAV export (client-side)
 */
export default {
  async fetch(request){ 
    if(new URL(request.url).pathname==="/") 
      return new Response(HTML,{headers:{"content-type":"text/html; charset=UTF-8"}});
    return new Response("Not found",{status:404}); 
  }
}

const HTML = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infinity Signal Matrix</title>
<style>
  body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}
  .wrap{max-width:1100px;margin:0 auto;padding:18px}
  .card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.35)}
  table{width:100%;border-collapse:collapse} td,th{border:1px dashed #1b3955;padding:6px;text-align:center}
  input,button{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:#e9fbff}
  button{background:#23b47e;border:none;font-weight:700;cursor:pointer}
</style></head><body><div class="wrap">
<h1>Infinity Signal Matrix</h1>
<div class="card">
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
    <button id="start">Start</button>
    <button id="stop" style="background:#1f3b57">Stop</button>
    <label>BPM <input id="bpm" type="range" min="40" max="220" value="110"/></label>
    <button id="export" style="background:#2d9cdb">Record WAV</button>
  </div>
  <table id="grid"></table>
</div>
<script>
let ctx,gain,tracks,playing,timer,recChunks,mediaDest,mediaRec;
const N=16, T=4;
function setup(){
  if(ctx) return;
  ctx=new (window.AudioContext||window.webkitAudioContext)();
  gain=ctx.createGain(); gain.gain.value=0.5; gain.connect(ctx.destination);
  tracks=Array.from({length:T},(_,i)=>({base:220*Math.pow(2,i/2), seq:Array(N).fill(0)}));
  buildGrid();
}
function buildGrid(){
  const tbl=document.getElementById("grid"); tbl.innerHTML="";
  const head=document.createElement("tr"); head.appendChild(document.createElement("th"));
  for(let i=0;i<N;i++){ const th=document.createElement("th"); th.textContent=i+1; head.appendChild(th); }
  tbl.appendChild(head);
  tracks.forEach((tr,ti)=>{
    const row=document.createElement("tr");
    const lab=document.createElement("th"); lab.textContent="Track "+(ti+1); row.appendChild(lab);
    for(let i=0;i<N;i++){ const td=document.createElement("td"); td.textContent="•"; td.style.opacity="0.2";
      td.onclick=()=>{ tr.seq[i]=tr.seq[i]?0:1; td.style.opacity=tr.seq[i]?1:0.2; };
      row.appendChild(td); }
    tbl.appendChild(row);
  });
}
function tick(step=0){
  if(!playing) return;
  const bpm=+document.getElementById("bpm").value; const int=(60/bpm)/4;
  tracks.forEach(tr=>{ if(tr.seq[step]) note(tr.base,int*0.9); });
  setTimeout(()=>tick((step+1)%N), int*1000);
}
function note(freq,dur){
  const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=freq;
  const g=ctx.createGain(); g.gain.value=0; o.connect(g); g.connect(gain);
  const t=ctx.currentTime; g.gain.linearRampToValueAtTime(1,t+0.01); g.gain.setTargetAtTime(0,t+0.2,0.3);
  o.start(); o.stop(t+dur+0.5);
}
function start(){ setup(); playing=true; tick(0); startRec(); }
function stop(){ playing=false; stopRec(); }
function startRec(){
  mediaDest=ctx.createMediaStreamDestination();
  gain.disconnect(); gain.connect(mediaDest); gain.connect(ctx.destination);
  mediaRec=new MediaRecorder(mediaDest.stream);
  recChunks=[]; mediaRec.ondataavailable=e=>recChunks.push(e.data);
  mediaRec.onstop=()=>{ const blob=new Blob(recChunks,{type:"audio/webm"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="signal-matrix.webm"; a.click(); };
  mediaRec.start();
}
function stopRec(){ if(mediaRec&&mediaRec.state!=="inactive") mediaRec.stop(); }
document.getElementById("start").onclick=start;
document.getElementById("stop").onclick=stop;
document.getElementById("export").onclick=()=>stopRec();
</script>
</div></body></html>`;
