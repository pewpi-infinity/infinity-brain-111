
/**
 * Infinity Energy Taps — "Hydrogen Cloud"
 * Single-file Cloudflare Worker (modules syntax)
 * Drag & drop into Cloudflare Workers. Serves an HTML app at "/".
 * Persists per-user tap data via Cache API keyed by a clientId.
 * No external bindings required.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(INDEX_HTML, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }
    if (url.pathname === "/tap" && request.method === "POST") {
      const body = await request.json().catch(()=>({}));
      const clientId = body.clientId || "anon";
      const taps = (await readState(clientId)) || { count: 0, joules: 0, history: [] };
      const now = Date.now();
      // Model: each tap = ~0.3J * efficiency; we use phi-scaling for "potential"
      const phi = (1 + Math.sqrt(5)) / 2;
      const tapEnergy = 0.3 * 0.1; // 10% capture demo
      taps.count += 1;
      taps.joules += tapEnergy;
      taps.history.push({ t: now, e: tapEnergy, potential: taps.count ** (1/phi) });
      await writeState(clientId, taps);
      return jsonResp({ ok: true, taps });
    }
    if (url.pathname === "/state" && request.method === "POST") {
      const body = await request.json().catch(()=>({}));
      const clientId = body.clientId || "anon";
      const taps = (await readState(clientId)) || { count: 0, joules: 0, history: [] };
      return jsonResp({ ok: true, taps });
    }
    if (url.pathname === "/reset" && request.method === "POST") {
      const body = await request.json().catch(()=>({}));
      const clientId = body.clientId || "anon";
      await writeState(clientId, { count: 0, joules: 0, history: [] });
      return jsonResp({ ok: true });
    }
    return new Response("Not found", { status: 404 });
  }
};

async function readState(clientId) {
  const key = "hydrogen-cloud:" + clientId;
  const cache = caches.default;
  const res = await cache.match(key);
  if (!res) return null;
  return await res.json();
}

async function writeState(clientId, obj) {
  const key = "hydrogen-cloud:" + clientId;
  const cache = caches.default;
  await cache.put(key, new Response(JSON.stringify(obj), { headers: { "content-type": "application/json" } }));
}

function jsonResp(obj) {
  return new Response(JSON.stringify(obj), { headers: { "content-type": "application/json" } });
}

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infinity Energy Taps · Hydrogen Cloud</title>
<style>
  :root{--bg:#0b0f14;--fg:#d9f1ff;--mut:#93a4b4;--acc:#24b47e}
  *{box-sizing:border-box}
  body{margin:0;background:linear-gradient(160deg,#0b0f14,#051019);color:var(--fg);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto}
  .wrap{max-width:980px;margin:0 auto;padding:22px}
  header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  h1{font-size:clamp(1.2rem,2.6vw,2rem);margin:0;letter-spacing:.5px}
  .card{background:#0e1a24cc;border:1px solid #0e2a45;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .row{display:flex;gap:16px;flex-wrap:wrap}
  .col{flex:1 1 300px}
  button{background:var(--acc);color:white;border:none;border-radius:12px;padding:12px 16px;font-weight:700;cursor:pointer}
  button:active{transform:scale(.98)}
  .mut{color:var(--mut)}
  canvas{width:100%;height:160px;background:rgba(255,255,255,.04);border-radius:12px}
  .pill{display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;background:#0d2236;border:1px solid #0e2a45;color:#aee6ff}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
  .kpi{background:#061526;border:1px solid #0b2d4a;border-radius:14px;padding:12px}
  .kpi b{font-size:1.2rem}
  a{color:#8dd1ff}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>∞ Infinity Energy Taps <span class="mut">· Hydrogen Cloud</span></h1>
    <span class="pill">Client <code id="cid"></code></span>
  </header>

  <div class="row">
    <div class="col card">
      <h3>Tap your phone — harvest micro‑energy</h3>
      <p class="mut">Each tap simulates captured micro‑joules stored in the “Hydrogen Cloud”. Powered by φ (golden ratio) scaling and a finite‑π stabilization curve.</p>
      <div class="grid" style="margin:10px 0 14px">
        <div class="kpi"><div class="mut">Total taps</div><b id="k_taps">0</b></div>
        <div class="kpi"><div class="mut">Stored energy (J)</div><b id="k_j">0.000</b></div>
        <div class="kpi"><div class="mut">Potential index</div><b id="k_pot">0.000</b></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button id="btnTap">Tap</button>
        <button id="btnReset" style="background:#1f3b57">Reset</button>
        <a id="btnExport" class="pill" href="#" download="hydrogen-cloud.json">Export Log</a>
      </div>
      <canvas id="chart"></canvas>
      <p class="mut">Tip: Increase potential by steady rhythm; φ‑paced tapping (approx 0.618s spacing) yields smoother growth.</p>
    </div>
    <div class="col card">
      <h3>How it works (demo)</h3>
      <ol class="mut">
        <li>Your browser gets a unique <em>clientId</em>.</li>
        <li>Each tap sends <code>/tap</code> to this Worker.</li>
        <li>The Worker stores your tally in the Cache API under your clientId.</li>
        <li>Potential uses φ and a finite‑π curve to model compounding.</li>
      </ol>
      <p class="mut">This is a proof‑of‑concept. For production persistence, bind KV/Durable Objects.</p>
    </div>
  </div>
</div>
<script>
const clientId = localStorage.getItem("hydrogenClientId") || crypto.randomUUID();
localStorage.setItem("hydrogenClientId", clientId);
document.getElementById("cid").textContent = clientId.slice(0,8);

const tapBtn = document.getElementById("btnTap");
const resetBtn = document.getElementById("btnReset");
const exportA = document.getElementById("btnExport");
const kT = document.getElementById("k_taps");
const kJ = document.getElementById("k_j");
const kP = document.getElementById("k_pot");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

function resize(){ const dpr=window.devicePixelRatio||1; canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw([]); }
window.addEventListener("resize", resize);
resize();

async function post(path, payload){
  const res = await fetch(path, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
  return res.json();
}

async function refresh(){
  const { taps } = await post("/state", { clientId });
  updateUI(taps);
}

function updateUI(taps){
  kT.textContent = taps.count;
  kJ.textContent = taps.joules.toFixed(3);
  const latest = taps.history[taps.history.length-1];
  kP.textContent = latest ? Number(latest.potential).toFixed(3) : "0.000";
  draw(taps.history || []);
  exportA.href = "data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(taps,null,2));
}

function draw(hist){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const w=canvas.clientWidth, h=canvas.clientHeight, pad=16;
  ctx.strokeStyle="#8dd1ff"; ctx.lineWidth=2;
  if(hist.length<2){ 
    ctx.strokeRect(pad,pad,w-2*pad,h-2*pad); 
    ctx.fillStyle="#93a4b4"; ctx.fillText("Tap to begin →", pad+8, h/2); 
    return;
  }
  const xs = hist.map(x=>x.t), ys = hist.map(x=>x.potential);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = 0, maxY = Math.max(...ys)*1.1;
  function sx(x){ return pad + (x-minX)/(maxX-minX) * (w-2*pad); }
  function sy(y){ return h-pad - (y-minY)/(maxY-minY) * (h-2*pad); }
  ctx.strokeRect(pad,pad,w-2*pad,h-2*pad);
  ctx.beginPath();
  hist.forEach((p,i)=>{ const X=sx(p.t), Y=sy(p.potential); if(i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y); });
  ctx.stroke();
}

tapBtn.onclick = async ()=>{
  const { taps } = await post("/tap", { clientId });
  updateUI(taps);
};
resetBtn.onclick = async ()=>{
  await post("/reset",{ clientId });
  refresh();
};

refresh();
</script>
</body>
</html>`;
