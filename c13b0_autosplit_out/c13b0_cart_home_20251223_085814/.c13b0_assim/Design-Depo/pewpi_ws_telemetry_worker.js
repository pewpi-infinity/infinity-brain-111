
/**
 * PewPi WS Telemetry — Signal Control Hub (Single‑File Worker)
 * - "/"  : HTML client to send/receive control messages
 * - "/ws": WebSocket; accepts {type:"control", param:"base", value:440} and broadcasts state.
 */
export default {
  async fetch(request){
    const url = new URL(request.url);
    if (url.pathname==="/") return new Response(HTML,{headers:{"content-type":"text/html; charset=UTF-8"}});
    if (url.pathname==="/ws"){
      const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
      server.accept();
      clients.add(server);
      server.addEventListener("message", evt=>{
        try{
          const m = JSON.parse(evt.data);
          if(m.type==="control" && m.param){ state[m.param]=m.value; broadcast({type:"state", state}); }
        }catch(e){}
      });
      server.addEventListener("close", ()=>clients.delete(server));
      server.send(JSON.stringify({type:"state", state}));
      return new Response(null,{status:101, webSocket:client});
    }
    return new Response("Not found",{status:404});
  }
}
const clients = new Set();
const state = { base:440, bpm:110, wave:"sine", lfoRate:0.5, lfoDepth:0.3 };
function broadcast(obj){ const s=JSON.stringify(obj); for(const c of clients){ try{ c.send(s); }catch(e){} } }

const HTML = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PewPi WS Telemetry</title>
<style>body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}.wrap{max-width:760px;margin:0 auto;padding:18px}.card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.35)}input,button,select{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:#e9fbff}button{background:#23b47e;border:none;font-weight:700;cursor:pointer}</style>
</head><body><div class="wrap">
<h1>PewPi WS Telemetry</h1>
<div class="card">
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <label>Base <input id="base" type="range" min="50" max="1200" value="440"/></label>
    <label>BPM <input id="bpm" type="range" min="40" max="220" value="110"/></label>
    <label>Wave <select id="wave"><option>sine</option><option>triangle</option><option>square</option><option>sawtooth</option></select></label>
    <label>LFO Rate <input id="lfoRate" type="range" min="0" max="20" step="0.01" value="0.5"/></label>
    <label>LFO Depth <input id="lfoDepth" type="range" min="0" max="1" step="0.01" value="0.3"/></label>
  </div>
  <pre id="out"></pre>
</div>
<script>
const ws = new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws");
const out = document.getElementById("out");
function send(p,v){ ws.send(JSON.stringify({type:"control", param:p, value:v})); }
["base","bpm","wave","lfoRate","lfoDepth"].forEach(id=>{
  const el=document.getElementById(id);
  el.oninput=()=>send(id, el.type==="range"?+el.value:el.value);
});
ws.onmessage=(e)=>{ out.textContent=e.data; };
</script>
</div></body></html>`;
