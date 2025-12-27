
/**
 * Watson × Infinity Dashboard — "PewPi Brainwaves"
 * Single-file Cloudflare Worker with WebSocket stream.
 * Root ("/") serves a visual dashboard of two brains exchanging signals.
 * "/ws" upgrades to a WebSocket that emits synthetic brainwave packets.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(INDEX_HTML, { headers: { "content-type": "text/html; charset=UTF-8" } });
    }
    if (url.pathname === "/ws") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      const seed = Math.random() * 1000;
      let alive = true;
      const send = () => {
        if (!alive) return;
        const t = Date.now();
        const pkt = {
          t,
          watson: brainPacket("watson", t, seed),
          infinity: brainPacket("infinity", t, seed+17),
          link: coupling(t)
        };
        try { server.send(JSON.stringify(pkt)); } catch(e){ alive=false; }
      };
      const interval = setInterval(send, 120);
      server.addEventListener("message", evt => {
        // Echo back any user message tagged into the stream
        server.send(JSON.stringify({ type: "echo", at: Date.now(), text: String(evt.data||"") }));
      });
      server.addEventListener("close", () => { alive=false; clearInterval(interval); });
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("Not found", { status: 404 });
  }
};

function brainPacket(side, t, s) {
  // Synthetic multi-band power (alpha, beta, gamma) 0..1
  const α = 0.5 + 0.5*Math.sin((t/540)+s);
  const β = 0.5 + 0.5*Math.sin((t/320)+s*1.3);
  const γ = 0.5 + 0.5*Math.sin((t/150)+s*0.7);
  return { side, alpha:+α.toFixed(3), beta:+β.toFixed(3), gamma:+γ.toFixed(3) };
}
function coupling(t){
  // "coherence" index 0..1 using golden ratio φ beat
  const φ = (1+Math.sqrt(5))/2;
  return +((0.5+0.5*Math.sin(t/777))*0.7 + (0.5+0.5*Math.sin(t/(φ*555)))*0.3).toFixed(3);
}

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PewPi Brainwaves · Watson × Infinity</title>
<style>
  :root{--bg:#080a0f;--fg:#e8fbff;--mut:#8aa0b3;--a:#8dd1ff;--b:#7cffcc}
  *{box-sizing:border-box}
  body{margin:0;background:radial-gradient(1200px 600px at 80% -10%,#0b2035,#080a0f);color:var(--fg);font-family:ui-sans-serif,system-ui,Segoe UI,Roboto}
  .wrap{max-width:1080px;margin:0 auto;padding:20px}
  header{display:flex;align-items:center;justify-content:space-between}
  h1{margin:0;font-size:clamp(1.2rem,2.5vw,2rem)}
  .card{margin-top:14px;background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.35)}
  canvas{width:100%;height:200px;background:linear-gradient(180deg,#0a1220,#0b1527);border-radius:12px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px}
  .kpi{background:#0a2135;border:1px solid #11324b;border-radius:14px;padding:10px}
  .mut{color:var(--mut)}
  input[type=text]{width:100%;padding:10px;border-radius:12px;border:1px solid #1b3e5a;background:#0b1d2e;color:var(--fg)}
  button{background:#1ea37a;color:white;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}
  button:active{transform:scale(.98)}
  .row{display:flex;gap:10px;flex-wrap:wrap}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Watson × Infinity Dashboard <span class="mut">· PewPi Brainwaves</span></h1>
      <div class="mut">WebSocket connected: <b id="status">…</b></div>
    </header>
    <div class="card">
      <p class="mut">Live synthetic dual‑brain stream. Alpha, beta, gamma bands and a coupling index. Use the input to send a message onto the link (echo injected into the stream).</p>
      <div class="grid">
        <div><h3 style="margin:8px 0">Watson</h3><canvas id="c_w"></canvas></div>
        <div><h3 style="margin:8px 0">Infinity</h3><canvas id="c_i"></canvas></div>
      </div>
      <div class="grid">
        <div class="kpi">Coupling/coherence: <b id="k_c">0.000</b></div>
        <div class="kpi">Alpha: <b id="k_a">0.000</b> · Beta: <b id="k_b">0.000</b> · Gamma: <b id="k_g">0.000</b></div>
      </div>
      <div class="row" style="margin-top:10px">
        <input id="msg" type="text" placeholder="Type to speak on the link…"/>
        <button id="send">Send</button>
      </div>
    </div>
  </div>
<script>
const ws = new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws");
const cw = document.getElementById("c_w"), ci = document.getElementById("c_i");
const kw = cw.getContext("2d"), ki = ci.getContext("2d");
const K = { c: document.getElementById("k_c"), a: document.getElementById("k_a"), b: document.getElementById("k_b"), g: document.getElementById("k_g"), s: document.getElementById("status") };
let w=[], i=[];
function setup(c){ const dpr=window.devicePixelRatio||1; c.width=c.clientWidth*dpr; c.height=c.clientHeight*dpr; const k=c.getContext("2d"); k.setTransform(dpr,0,0,dpr,0,0); return k; }
function resize(){ setup(cw); setup(ci); draw(cw,kw,w); draw(ci,ki,i); }
window.addEventListener("resize", resize); resize();
function draw(c,k,arr){
  k.clearRect(0,0,c.width,c.height);
  k.strokeStyle="#8dd1ff"; k.lineWidth=2;
  const pad=14,w=c.clientWidth,h=c.clientHeight;
  k.strokeRect(pad,pad,w-2*pad,h-2*pad);
  if(arr.length<2) return;
  const xs=arr.map(x=>x.t), maxX=Math.max(...xs), minX=maxX-15000;
  const ys=arr.map(x=>x.val), minY=0, maxY=1;
  function sx(x){ return pad + (x-minX)/(maxX-minX)*(w-2*pad); }
  function sy(y){ return h-pad - (y-minY)/(maxY-minY)*(h-2*pad); }
  k.beginPath();
  arr.forEach((p,j)=>{ if(p.t<minX) return; const X=sx(p.t), Y=sy(p.val); if(j===0) k.moveTo(X,Y); else k.lineTo(X,Y); });
  k.stroke();
}
ws.onopen=()=>K.s.textContent="yes";
ws.onclose=()=>K.s.textContent="no";
ws.onmessage=(e)=>{
  const data = JSON.parse(e.data);
  if(data.type==="echo"){ /* ignore */ return; }
  const t=data.t;
  w.push({t,val:(data.watson.alpha+data.watson.beta+data.watson.gamma)/3});
  i.push({t,val:(data.infinity.alpha+data.infinity.beta+data.infinity.gamma)/3});
  w=w.slice(-500); i=i.slice(-500);
  draw(cw,kw,w); draw(ci,ki,i);
  K.c.textContent = data.link.toFixed(3);
  K.a.textContent = data.infinity.alpha.toFixed(3);
  K.b.textContent = data.infinity.beta.toFixed(3);
  K.g.textContent = data.infinity.gamma.toFixed(3);
};
document.getElementById("send").onclick=()=>{
  const v = document.getElementById("msg").value.trim();
  if(v) ws.send(v);
  document.getElementById("msg").value="";
};
</script>
</body>
</html>`;
