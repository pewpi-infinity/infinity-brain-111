
/**
 * Infinity Signal Studio — Chat‑Controlled Synth (Single‑File Worker)
 * - "/"      : Full WebAudio synth UI (multi-osc, ADSR, LFOs, FX, 16‑step sequencer)
 * - "/chat"  : Proxy to OpenAI Chat Completions (user supplies API key)
 *
 * SECURITY NOTE: This demo forwards your API key from the browser to this Worker,
 * then to OpenAI. Deploy only to your own account. For production, store keys in
 * encrypted storage and DO NOT ship keys from browsers.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(INDEX_HTML, { headers: { "content-type":"text/html; charset=UTF-8" } });
    }
    if (url.pathname === "/chat" && request.method === "POST") {
      const { key, model, messages } = await request.json().catch(()=>({}));
      if (!key) return json({ ok:false, error:"missing API key" }, 400);
      const m = messages && Array.isArray(messages) ? messages : [{role:"user", content:"Say hello"}];
      const mdl = model || "gpt-4o-mini";
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method:"POST",
        headers:{
          "authorization": "Bearer " + key,
          "content-type":"application/json"
        },
        body: JSON.stringify({ model: mdl, messages: m })
      });
      const data = await r.json();
      return json({ ok:true, data });
    }
    // CORS preflight for /chat
    if (url.pathname === "/chat" && request.method === "OPTIONS") {
      return new Response(null, { status:204, headers:{
        "access-control-allow-origin":"*",
        "access-control-allow-headers":"content-type",
        "access-control-allow-methods":"POST,OPTIONS"
      }});
    }
    return new Response("Not found", { status:404 });
  }
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type":"application/json", "access-control-allow-origin":"*" }
  });
}

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infinity Signal Studio · Chat‑Controlled Synth</title>
<style>
  :root{--bg:#090c11;--fg:#e9fbff;--mut:#9ab0c4;--a:#23b47e;--panel:#0c1623;--bd:#12304a}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(160deg,#090c11,#06101a);color:var(--fg);font-family:ui-sans-serif,system-ui}
  .wrap{max-width:1200px;margin:0 auto;padding:18px}
  header{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}
  h1{margin:0;font-size:clamp(1.2rem,2.6vw,2rem)}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .card{background:var(--panel);border:1px solid var(--bd);border-radius:16px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
  label{display:block;margin-bottom:6px;color:#a7c3d9}
  input[type=range], select{width:100%}
  input,select,button,textarea{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:var(--fg)}
  button{background:var(--a);border:none;font-weight:700;cursor:pointer}
  button:active{transform:scale(.98)}
  .mut{color:var(--mut)}
  canvas{width:100%;height:160px;background:#0b1527;border-radius:12px}
  .pill{display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;background:#0d2236;border:1px solid #0e2a45;color:#aee6ff}
  table{width:100%;border-collapse:collapse}
  td,th{border:1px dashed #1b3955;padding:6px;text-align:center}
  .kbd{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>∞ Infinity Signal Studio <span class="mut">· Chat‑Controlled</span></h1>
    <span class="pill">Status: <b id="status">idle</b></span>
  </header>

  <div class="grid">
    <div class="card">
      <h3 style="margin:0 0 8px">Master</h3>
      <div class="grid">
        <div><label>Volume</label><input id="vol" type="range" min="0" max="1" step="0.001" value="0.2"/></div>
        <div><label>Tempo (BPM)</label><input id="bpm" type="range" min="40" max="220" value="110"/></div>
        <div><label>Wave</label><select id="wave"><option>sine</option><option>triangle</option><option>square</option><option>sawtooth</option></select></div>
        <div><label>Binaural</label><select id="binaural"><option>off</option><option>on</option></select></div>
      </div>
      <div class="grid">
        <div><label>Base (Hz)</label><input id="base" type="range" min="20" max="2000" value="440"/></div>
        <div><label>Detune (cents)</label><input id="det" type="range" min="-2400" max="2400" value="0"/></div>
        <div><label>LFO Rate (Hz)</label><input id="lfoRate" type="range" min="0" max="20" step="0.01" value="0.5"/></div>
        <div><label>LFO Depth</label><input id="lfoDepth" type="range" min="0" max="1" step="0.001" value="0.25"/></div>
      </div>
      <div class="grid">
        <div><label>Filter Cutoff</label><input id="cut" type="range" min="100" max="10000" value="2400"/></div>
        <div><label>Filter Q</label><input id="q" type="range" min="0.1" max="20" step="0.1" value="1.2"/></div>
        <div><label>Delay (s)</label><input id="delay" type="range" min="0" max="1" step="0.01" value="0.18"/></div>
        <div><label>Feedback</label><input id="fb" type="range" min="0" max="0.95" step="0.01" value="0.35"/></div>
      </div>
      <div class="grid">
        <div><label>Attack</label><input id="a" type="range" min="0.001" max="2" step="0.001" value="0.01"/></div>
        <div><label>Sustain</label><input id="s" type="range" min="0" max="1" step="0.001" value="0.6"/></div>
        <div><label>Decay</label><input id="d" type="range" min="0.001" max="2" step="0.001" value="0.2"/></div>
        <div><label>Release</label><input id="r" type="range" min="0.001" max="3" step="0.001" value="0.4"/></div>
      </div>
      <div class="row" style="margin-top:8px">
        <button id="start">Start Audio</button>
        <button id="stop" style="background:#1f3b57">Stop</button>
        <button id="random" style="background:#9b59b6">Randomize</button>
        <button id="save" style="background:#2d9cdb">Export Preset</button>
      </div>
      <canvas id="scope"></canvas>
    </div>

    <div class="card">
      <h3 style="margin:0 0 8px">Sequencer (16‑step)</h3>
      <table id="seq"></table>
      <p class="mut">Click cells to toggle notes. Plays base frequency ± scale offsets.</p>
      <label>Scale</label>
      <select id="scale">
        <option value="minor">Minor</option>
        <option value="major">Major</option>
        <option value="pent">Pentatonic</option>
        <option value="phi">Golden (φ) steps</option>
      </select>
    </div>

    <div class="card">
      <h3 style="margin:0 8px 8px">Chat‑GPT Auto‑Control</h3>
      <p class="mut">Paste your API key, describe what you want (e.g., “calming pad at 432Hz with gentle LFO and soft attack”), then Apply.</p>
      <label>API Key</label>
      <input id="k" placeholder="sk‑..." />
      <label>Model</label>
      <input id="m" value="gpt-4o-mini"/>
      <label>Instruction</label>
      <textarea id="t" rows="6" placeholder="Describe the sound, sequencer pattern, or mood…"></textarea>
      <div class="row" style="margin-top:8px">
        <button id="ask">Ask & Apply</button>
        <button id="ex" style="background:#1f3b57">Show JSON Only</button>
      </div>
      <pre id="out" class="kbd" style="white-space:pre-wrap;max-height:220px;overflow:auto"></pre>
    </div>
  </div>
</div>
<script>
let ctx, master, pannerL, pannerR, filter, delay, fbGain, comp, analyser, buf, seqData, step=0, tickHandle, lfo, gainNode;
const S = {}; // UI refs

function $(id){ return document.getElementById(id); }
["vol","bpm","wave","binaural","base","det","lfoRate","lfoDepth","cut","q","delay","fb","a","s","d","r","scale"].forEach(id=>S[id]=$(id));
["status","scope","seq","start","stop","random","save","k","m","t","ask","ex","out"].forEach(id=>S[id]=$(id));

function initAudio(){
  if(ctx) return;
  ctx = new (window.AudioContext||window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = +S.vol.value;
  pannerL = ctx.createStereoPanner(); pannerR = ctx.createStereoPanner(); pannerL.pan.value=-0.4; pannerR.pan.value=0.4;
  filter = ctx.createBiquadFilter(); filter.type="lowpass"; filter.frequency.value=+S.cut.value; filter.Q.value=+S.q.value;
  delay = ctx.createDelay(1); delay.delayTime.value=+S.delay.value;
  fbGain = ctx.createGain(); fbGain.gain.value=+S.fb.value;
  comp = ctx.createDynamicsCompressor();
  analyser = ctx.createAnalyser(); analyser.fftSize=2048; buf=new Uint8Array(analyser.frequencyBinCount);
  // Route: synth -> filter -> master -> (panners?) -> compressor -> analyser -> destination
  filter.connect(master);
  master.connect(pannerL); master.connect(pannerR);
  pannerL.connect(comp); pannerR.connect(comp);
  comp.connect(analyser); comp.connect(ctx.destination);
  // Delay loop
  master.connect(delay); delay.connect(fbGain); fbGain.connect(delay); delay.connect(master);
  // LFO
  lfo = ctx.createOscillator(); lfo.type="sine"; lfo.frequency.value=+S.lfoRate.value;
  gainNode = ctx.createGain(); gainNode.gain.value=+S.lfoDepth.value*50; // mod amount (Hz)
  lfo.connect(gainNode);
  lfo.start();
  drawScope();
  S.status.textContent = "audio ready";
}

function osc(freq){
  const o = ctx.createOscillator(); o.type=S.wave.value; o.frequency.value = freq;
  // LFO to frequency
  gainNode.connect(o.frequency);
  const g = ctx.createGain(); g.gain.value=0.0;
  o.connect(g); g.connect(filter);
  o.start();
  return { o, g };
}

function noteOn(freq, dur=0.3){
  const envA=+S.a.value, envD=+S.d.value, envS=+S.s.value, envR=+S.r.value;
  const voice1 = osc(freq);
  const voice2 = osc(freq * Math.pow(2, +S.det.value/1200));
  const t = ctx.currentTime;
  // ADSR: attack-decay-sustain-release envelope on gain
  [voice1.g, voice2.g].forEach(g=>{
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t+envA);
    g.gain.linearRampToValueAtTime(envS, t+envA+envD);
    g.gain.setTargetAtTime(0.0, t+dur, envR);
  });
  setTimeout(()=>{ voice1.o.stop(); voice2.o.stop(); }, (dur+envR+0.5)*1000);
}

function drawScope(){
  const scope=S.scope, k=scope.getContext("2d");
  const dpr=window.devicePixelRatio||1; scope.width=scope.clientWidth*dpr; scope.height=scope.clientHeight*dpr; k.setTransform(dpr,0,0,dpr,0,0);
  requestAnimationFrame(function loop(){
    k.clearRect(0,0,scope.width,scope.height);
    analyser.getByteTimeDomainData(buf);
    k.strokeStyle="#8dd1ff"; k.lineWidth=2;
    k.beginPath();
    const pad=10,w=scope.clientWidth,h=scope.clientHeight;
    k.strokeRect(pad,pad,w-2*pad,h-2*pad);
    for(let i=0;i<buf.length;i++){
      const x = pad + i/buf.length*(w-2*pad);
      const y = h-pad - (buf[i]/255)*(h-2*pad);
      if(i===0) k.moveTo(x,y); else k.lineTo(x,y);
    }
    k.stroke();
    requestAnimationFrame(loop);
  });
}

function seqInit(){
  seqData = Array.from({length:16}, ()=>0);
  const tbl = S.seq; tbl.innerHTML="";
  const tr=document.createElement("tr");
  for(let i=0;i<16;i++){ const th=document.createElement("th"); th.textContent=(i+1); tr.appendChild(th); }
  tbl.appendChild(tr);
  const tr2=document.createElement("tr");
  for(let i=0;i<16;i++){
    const td=document.createElement("td"); td.textContent="•"; td.style.opacity="0.2";
    td.onclick=()=>{ seqData[i]=seqData[i]?0:1; td.style.opacity=seqData[i]?1:0.2; };
    tr2.appendChild(td);
  }
  tbl.appendChild(tr2);
}

function scaleOffsets(kind){
  if(kind==="major") return [0,2,4,5,7,9,11,12];
  if(kind==="pent") return [0,3,5,7,10,12];
  if(kind==="phi") return [0,1,2,3,5,8,13]; // Fibonacci-ish
  return [0,2,3,5,7,8,10,12]; // minor
}

function seqTick(){
  if(!ctx) return;
  const bpm = +S.bpm.value;
  const interval = (60/bpm)/4; // 16th notes
  const active = seqData[step];
  if(active){
    const offsets = scaleOffsets(S.scale.value);
    const offset = offsets[step % offsets.length];
    const freq = +S.base.value * Math.pow(2, offset/12);
    noteOn(freq, interval*0.9);
  }
  step=(step+1)%16;
  tickHandle = setTimeout(seqTick, interval*1000);
}

function start(){
  initAudio();
  if(tickHandle) clearTimeout(tickHandle);
  seqTick();
}

function stop(){
  if(tickHandle) clearTimeout(tickHandle); tickHandle=null;
  S.status.textContent = "stopped";
}

function randomize(){
  // Random seq & params
  for(let i=0;i<16;i++) seqData[i]=Math.random()<0.5?1:0;
  S.base.value = Math.floor(100+Math.random()*800);
  S.det.value = Math.floor(-100+Math.random()*200);
  S.lfoRate.value = (Math.random()*5).toFixed(2);
  S.lfoDepth.value = (Math.random()).toFixed(2);
  S.cut.value = Math.floor(500+Math.random()*6000);
  S.q.value = (0.5+Math.random()*8).toFixed(1);
  S.delay.value = (Math.random()*0.5).toFixed(2);
  S.fb.value = (Math.random()*0.7).toFixed(2);
  ["vol","bpm","wave","binaural","base","det","lfoRate","lfoDepth","cut","q","delay","fb"].forEach(id=>updateParam(id));
  // redraw seq
  seqInit(); for(let i=0;i<16;i++){ if(seqData[i]) S.seq.rows[1].cells[i].style.opacity=1; }
}

function exportPreset(){
  const preset = {
    params: Object.fromEntries(["vol","bpm","wave","binaural","base","det","lfoRate","lfoDepth","cut","q","delay","fb","a","s","d","r","scale"].map(id=>[id,S[id].value])),
    sequence: seqData
  };
  const a=document.createElement("a");
  a.download="infinity-signal-studio-preset.json";
  a.href="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(preset,null,2));
  a.click();
}

function updateParam(id){
  if(!ctx) return;
  if(id==="vol") master.gain.setTargetAtTime(+S.vol.value, ctx.currentTime, 0.1);
  if(id==="binaural"){
    const on = S.binaural.value==="on";
    pannerL.pan.value = on?-0.6:-0.1;
    pannerR.pan.value = on?+0.6:+0.1;
  }
  if(id==="cut") filter.frequency.setTargetAtTime(+S.cut.value, ctx.currentTime, 0.05);
  if(id==="q") filter.Q.setTargetAtTime(+S.q.value, ctx.currentTime, 0.05);
  if(id==="delay") delay.delayTime.setTargetAtTime(+S.delay.value, ctx.currentTime, 0.05);
  if(id==="fb") fbGain.gain.setTargetAtTime(+S.fb.value, ctx.currentTime, 0.05);
  if(id==="lfoRate") lfo.frequency.setTargetAtTime(+S.lfoRate.value, ctx.currentTime, 0.05);
  if(id==="lfoDepth") gainNode.gain.setTargetAtTime(+S.lfoDepth.value*50, ctx.currentTime, 0.05);
}

;["vol","bpm","wave","binaural","base","det","lfoRate","lfoDepth","cut","q","delay","fb","a","s","d","r","scale"].forEach(id=>{
  S[id].oninput = ()=>updateParam(id);
});

S.start.onclick = start;
S.stop.onclick = stop;
S.random.onclick = randomize;
S.save.onclick = exportPreset;
seqInit();

// Chat control
async function ask(apply){
  const key=S.k.value.trim(); if(!key){ S.out.textContent="Missing API key"; return; }
  const sys = { role:"system", content: "You are an audio design model that replies ONLY with a compact JSON object named 'preset' with fields: vol,bpm,wave,binaural,base,det,lfoRate,lfoDepth,cut,q,delay,fb,a,s,d,r,scale (strings/numbers), and 'sequence' as an array of 16 zeros/ones. No prose." };
  const user = { role:"user", content: S.t.value||"Create a calming pad at 432 Hz with gentle LFO and soft attack." };
  const r = await fetch("/chat",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ key, model:S.m.value, messages:[sys,user] }) });
  const j = await r.json();
  const text = j?.data?.choices?.[0]?.message?.content || "";
  S.out.textContent = text;
  try{
    const preset = JSON.parse(text).preset;
    if(apply && preset){
      Object.entries(preset.params||preset).forEach(([k,v])=>{ if(S[k]) S[k].value = v; updateParam(k); });
      if(preset.sequence){
        seqData = preset.sequence.slice(0,16).map(x=>x?1:0);
        seqInit(); for(let i=0;i<16;i++){ if(seqData[i]) S.seq.rows[1].cells[i].style.opacity=1; }
      }
    }
  }catch(e){ /* ignore parse errors */ }
}
S.ask.onclick = ()=>ask(true);
S.ex.onclick = ()=>ask(false);
</script>
</body>
</html>`;
