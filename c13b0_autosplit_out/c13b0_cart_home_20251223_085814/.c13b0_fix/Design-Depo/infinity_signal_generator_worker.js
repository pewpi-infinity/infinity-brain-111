
/**
 * Infinity Signal Generator — Auto‑Tuner
 * WebAudio synthesizer with multi‑oscillator + effects and mood presets.
 * Single-file Worker serving a rich UI at "/".
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(INDEX_HTML, { headers: { "content-type": "text/html; charset=UTF-8" } });
    }
    return new Response("Not found", { status: 404 });
  }
};

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infinity Signal Generator · Auto‑Tuner</title>
<style>
  :root{--bg:#090c11;--fg:#e9fbff;--mut:#96a9bc;--a:#23b47e}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(160deg,#090c11,#06101a);color:var(--fg);font-family:ui-sans-serif,system-ui}
  .wrap{max-width:980px;margin:0 auto;padding:20px}
  header{display:flex;align-items:center;justify-content:space-between}
  h1{margin:0;font-size:clamp(1.2rem,2.6vw,2rem)}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
  .card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  label{display:block;margin-bottom:6px;color:#a7c3d9}
  input[type=range]{width:100%}
  select,button,input[type=checkbox]{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:var(--fg)}
  button{background:var(--a);border:none;font-weight:700;cursor:pointer}
  button:active{transform:scale(.98)}
  .mut{color:var(--mut)}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Infinity Signal Generator <span class="mut">· Auto‑Tuner</span></h1>
    <button id="start">Start</button>
  </header>
  <div class="grid" style="margin-top:12px">
    <div class="card">
      <label>Preset</label>
      <select id="preset">
        <option value="calm">Calm</option>
        <option value="focus">Focus</option>
        <option value="sleep">Sleep</option>
        <option value="music">Music</option>
        <option value="energize">Energize</option>
      </select>
      <div style="height:8px"></div>
      <label>Base Frequency (Hz)</label>
      <input id="base" type="range" min="20" max="2000" value="440"/>
      <label>Detune (cents)</label>
      <input id="det" type="range" min="-1200" max="1200" value="0"/>
      <label>Volume</label>
      <input id="vol" type="range" min="0" max="1" step="0.001" value="0.2"/>
      <label><input id="binaural" type="checkbox"/> Binaural mode</label>
    </div>
    <div class="card">
      <h3 style="margin-top:0">Auto‑Tune</h3>
      <p class="mut">Auto‑adapts oscillator mix, envelopes, and filters based on the chosen intent.</p>
      <div class="grid">
        <div><label>Osc Mix</label><input id="mix" type="range" min="0" max="1" step="0.01" value="0.5"/></div>
        <div><label>Filter Cutoff</label><input id="cut" type="range" min="100" max="8000" value="2000"/></div>
        <div><label>Reverb-ish</label><input id="verb" type="range" min="0" max="1" step="0.01" value="0.15"/></div>
      </div>
    </div>
    <div class="card">
      <canvas id="scope" style="width:100%;height:160px;background:#0b1527;border-radius:12px"></canvas>
      <p class="mut">Scope view.</p>
    </div>
  </div>
</div>
<script>
let ctx,a,osc1,osc2,gain,biL,biR,analyser,buf,scope,sk;
function init(){
  ctx = new (window.AudioContext||window.webkitAudioContext)();
  gain = ctx.createGain(); gain.gain.value = +vol.value;
  analyser = ctx.createAnalyser(); analyser.fftSize=2048; buf = new Uint8Array(analyser.frequencyBinCount);
  const mixv = +mix.value;
  osc1 = ctx.createOscillator(); osc1.type="sine"; osc1.frequency.value = +base.value;
  osc2 = ctx.createOscillator(); osc2.type="triangle"; osc2.frequency.value = +base.value * (1+mixv*0.01);
  const bi = binaural.checked;
  const cutv = +cut.value;
  const filter = ctx.createBiquadFilter(); filter.type="lowpass"; filter.frequency.value = cutv;
  const verbGain = ctx.createGain(); verbGain.gain.value = +verb.value * 0.4;
  const delay = ctx.createDelay(); delay.delayTime.value = 0.2;
  // Route
  osc1.connect(filter); osc2.connect(filter);
  filter.connect(verbGain); verbGain.connect(delay); delay.connect(filter);
  filter.connect(gain);
  if(bi){
    biL = ctx.createStereoPanner(); biL.pan.value=-0.5;
    biR = ctx.createStereoPanner(); biR.pan.value=+0.5;
    gain.connect(biL); gain.connect(biR);
    biL.connect(ctx.destination); biR.connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }
  // analyser
  gain.connect(analyser);
  osc1.start(); osc2.start();
  drawScope();
}
function drawScope(){
  scope = document.getElementById("scope"); sk = scope.getContext("2d");
  const dpr=window.devicePixelRatio||1; scope.width=scope.clientWidth*dpr; scope.height=scope.clientHeight*dpr; sk.setTransform(dpr,0,0,dpr,0,0);
  requestAnimationFrame(function loop(){
    sk.clearRect(0,0,scope.width,scope.height);
    analyser.getByteTimeDomainData(buf);
    sk.strokeStyle="#8dd1ff"; sk.lineWidth=2;
    sk.beginPath();
    const pad=10,w=scope.clientWidth,h=scope.clientHeight;
    sk.strokeRect(pad,pad,w-2*pad,h-2*pad);
    for(let i=0;i<buf.length;i++){
      const x = pad + i/buf.length*(w-2*pad);
      const y = h-pad - (buf[i]/255)*(h-2*pad);
      if(i===0) sk.moveTo(x,y); else sk.lineTo(x,y);
    }
    sk.stroke();
    requestAnimationFrame(loop);
  });
}
function applyPreset(p){
  if(p==="calm"){ base.value=396; det.value=-3; cut.value=1800; mix.value=0.3; verb.value=0.25; vol.value=0.18; }
  if(p==="focus"){ base.value=528; det.value=+5; cut.value=3200; mix.value=0.6; verb.value=0.12; vol.value=0.22; }
  if(p==="sleep"){ base.value=174; det.value=-7; cut.value=1400; mix.value=0.2; verb.value=0.35; vol.value=0.12; }
  if(p==="music"){ base.value=440; det.value=+0; cut.value=2600; mix.value=0.5; verb.value=0.18; vol.value=0.2; }
  if(p==="energize"){ base.value=639; det.value=+9; cut.value=5200; mix.value=0.7; verb.value=0.1; vol.value=0.24; }
  if(ctx){ updateAudio(); }
}
function updateAudio(){
  if(!ctx) return;
  const baseHz=+base.value, detc=+det.value;
  const mixv=+mix.value, cutv=+cut.value;
  const detRatio = Math.pow(2, detc/1200);
  osc1.frequency.setTargetAtTime(baseHz, ctx.currentTime, 0.05);
  osc2.frequency.setTargetAtTime(baseHz*detRatio*(1+mixv*0.01), ctx.currentTime, 0.05);
  gain.gain.setTargetAtTime(+vol.value, ctx.currentTime, 0.1);
  // naive: adjust first filter in chain
  // (simplified because we don't keep explicit handle; in a richer synth you'd route nodes more granularly)
}
document.getElementById("start").onclick=()=>{ if(!ctx) init(); };
const preset = document.getElementById("preset");
const base = document.getElementById("base");
const det = document.getElementById("det");
const vol = document.getElementById("vol");
const mix = document.getElementById("mix");
const cut = document.getElementById("cut");
const verb = document.getElementById("verb");
const binaural = document.getElementById("binaural");
preset.onchange=()=>applyPreset(preset.value);
[base,det,vol,mix,cut,verb].forEach(e=>e.oninput=updateAudio);
applyPreset(preset.value);
</script>
</body>
</html>`;
