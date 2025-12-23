
/**
 * PewPi Broadcast Hub — Infinity Powered
 * Single-file pub/sub Worker with WebSocket.
 * - "/"  : HTML client
 * - "/ws": WebSocket for broadcast; first message from a client is their nickname.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(INDEX_HTML, { headers: { "content-type": "text/html; charset=UTF-8" } });
    }
    if (url.pathname === "/ws") {
      const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
      server.accept();
      let name = "guest-"+Math.floor(Math.random()*9999);
      server.addEventListener("message", evt => {
        try{
          const data = JSON.parse(evt.data);
          if(data.type==="hello" && data.name) { name = String(data.name).slice(0,24); server.send(JSON.stringify({type:"ack",name})); return; }
          if(data.type==="say" && data.text){
            broadcast({ type:"msg", at: Date.now(), from:name, text:String(data.text).slice(0,500) }, server);
          }
        }catch(e){}
      });
      sockets.add(server);
      server.addEventListener("close", ()=> sockets.delete(server));
      return new Response(null, { status:101, webSocket: client });
    }
    return new Response("Not found", { status:404 });
  }
}

const sockets = new Set();
function broadcast(obj, from){
  const s = JSON.stringify(obj);
  for(const ws of sockets){
    try{ if(ws!==from) ws.send(s); }catch(e){ /* ignore */ }
  }
}

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PewPi Broadcast Hub · Infinity</title>
<style>
  body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}
  .wrap{max-width:860px;margin:0 auto;padding:20px}
  .card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 28px rgba(0,0,0,.35)}
  input,button{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:#e9fbff}
  button{background:#23b47e;border:none;font-weight:700;cursor:pointer}
  ul{list-style:none;padding:0;margin:0} li{padding:8px 0;border-bottom:1px dashed #17324a}
</style>
</head>
<body>
<div class="wrap">
  <h1>PewPi Broadcast Hub <span style="color:#8dd1ff">· Infinity</span></h1>
  <div class="card">
    <p>Join the broadcast and speak. First set your nickname, then send messages. Open in multiple tabs to see broadcast behavior.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <input id="name" placeholder="nickname" style="flex:1"/>
      <button id="join">Join</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <input id="text" placeholder="your message…" style="flex:1"/>
      <button id="send">Send</button>
    </div>
    <ul id="log"></ul>
  </div>
</div>
<script>
const ws = new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws");
const log = document.getElementById("log");
function push(msg){ const li=document.createElement("li"); li.textContent=msg; log.prepend(li); }
document.getElementById("join").onclick=()=>{
  const name = document.getElementById("name").value.trim() || "guest";
  ws.send(JSON.stringify({type:"hello", name}));
};
document.getElementById("send").onclick=()=>{
  const text = document.getElementById("text").value.trim();
  if(text) ws.send(JSON.stringify({type:"say", text}));
  document.getElementById("text").value="";
};
ws.onmessage=(e)=>{
  const m = JSON.parse(e.data);
  if(m.type==="ack"){ push("joined as "+m.name); }
  if(m.type==="msg"){ push(new Date(m.at).toLocaleTimeString()+" · "+m.from+": "+m.text); }
};
</script>
</body>
</html>`;
