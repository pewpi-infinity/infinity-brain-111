
/**
 * PewPi Chat Bridge — OpenAI Proxy + Console (Single‑File Worker)
 * - "/"     : simple console to send chat messages
 * - "/chat" : POST { key, model, messages } -> forwards to OpenAI
 * Adds CORS headers for cross‑origin use by other Workers/apps.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/") return new Response(HTML,{headers:{"content-type":"text/html; charset=UTF-8"}});
    if (url.pathname === "/chat" && request.method==="POST"){
      const { key, model, messages } = await request.json().catch(()=>({}));
      if(!key) return J({ok:false,error:"missing key"},400);
      const r = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{ "authorization":"Bearer "+key, "content-type":"application/json" },
        body: JSON.stringify({ model: model||"gpt-4o-mini", messages: messages||[{role:"user",content:"Hi"}] })
      });
      return J({ ok:true, data: await r.json() });
    }
    if (url.pathname === "/chat" && request.method==="OPTIONS"){
      return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-headers":"content-type"}});
    }
    return new Response("Not found",{status:404});
  }
}
function J(o,s=200){ return new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","access-control-allow-origin":"*"}}); }

const HTML = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PewPi Chat Bridge</title>
<style>body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}.wrap{max-width:760px;margin:0 auto;padding:18px}.card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.35)}input,textarea,button{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:#e9fbff}button{background:#23b47e;border:none;font-weight:700;cursor:pointer}</style>
</head><body><div class="wrap">
<h1>PewPi Chat Bridge</h1>
<div class="card">
  <input id="k" placeholder="sk-..." style="width:100%"/>
  <div style="height:8px"></div>
  <input id="m" value="gpt-4o-mini" style="width:100%"/>
  <div style="height:8px"></div>
  <textarea id="u" rows="6" style="width:100%" placeholder="Your message"></textarea>
  <div style="height:8px"></div>
  <button id="send">Send</button>
  <pre id="out" style="white-space:pre-wrap;max-height:320px;overflow:auto"></pre>
</div>
<script>
document.getElementById("send").onclick=async()=>{
  const key=document.getElementById("k").value.trim();const model=document.getElementById("m").value.trim();const msg=document.getElementById("u").value.trim();
  const r=await fetch("/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key,model,messages:[{role:"user",content:msg||"Hi"}]})});
  const j=await r.json(); document.getElementById("out").textContent=JSON.stringify(j,null,2);
};
</script>
</div></body></html>`;
