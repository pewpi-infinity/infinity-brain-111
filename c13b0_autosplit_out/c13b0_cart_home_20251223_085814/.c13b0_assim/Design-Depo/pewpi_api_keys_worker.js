
/**
 * PewPi Broadcasting — API Keys Service
 * Single-file Worker providing:
 *  - "/"  : HTML docs
 *  - "/register" (POST): issues an API key (HMAC) and returns JSON
 *  - "/verify" (POST): verifies a provided key
 *  - "/hello" (GET): sample protected endpoint (requires "x-api-key" header)
 * Keys are stateless: base64url(hmacSHA256(clientId|timestamp)|timestamp|clientId)
 * This is a demo; for production store real secrets in bindings.
 */
const PEPPER = "pewpi-infinity-demo-hmac-pepper"; // demo pepper

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(DOCS_HTML, { headers: { "content-type": "text/html; charset=UTF-8" } });
    }
    if (url.pathname === "/register" && request.method === "POST") {
      const { clientId } = await request.json().catch(()=>({}));
      const cid = clientId || crypto.randomUUID();
      const ts = Date.now().toString();
      const mac = await hmac(`${cid}|${ts}`);
      const token = b64url(mac)+"."+b64urlStr(ts)+"."+b64urlStr(cid);
      return j({ ok:true, clientId: cid, apiKey: token });
    }
    if (url.pathname === "/verify" && request.method === "POST") {
      const { apiKey } = await request.json().catch(()=>({}));
      const ok = await verify(apiKey||"");
      return j({ ok });
    }
    if (url.pathname === "/hello") {
      const key = request.headers.get("x-api-key") || "";
      const ok = await verify(key);
      if (!ok) return j({ ok:false, error:"invalid or missing x-api-key" }, 401);
      return j({ ok:true, message:"Hello from PewPi Broadcasting · Infinity" });
    }
    return new Response("Not found", { status:404 });
  }
}

async function verify(token){
  try{
    const [h, tsb64, cidb64] = token.split(".");
    if(!h||!tsb64||!cidb64) return false;
    const ts = atobUrl(tsb64);
    const cid = atobUrl(cidb64);
    const mac = await hmac(`${cid}|${ts}`);
    return b64url(mac) === h;
  }catch(e){ return false; }
}

async function hmac(msg){
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(PEPPER), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}
function b64url(bytes){ return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function b64urlStr(s){ return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function atobUrl(s){ return atob(s.replace(/-/g,"+").replace(/_/g,"/")); }
function j(obj, status=200){ return new Response(JSON.stringify(obj), { status, headers: { "content-type":"application/json" } }); }

const DOCS_HTML = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PewPi Broadcasting · API Keys</title>
<style>
  body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}
  .wrap{max-width:860px;margin:0 auto;padding:22px}
  code,pre{background:#0e1a24;border:1px solid #16324a;border-radius:8px;padding:2px 6px}
  .card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 6px 20px rgba(0,0,0,.35)}
  button{background:#1ea37a;color:white;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}
</style></head>
<body><div class="wrap">
<h1>PewPi Broadcasting · API Keys</h1>
<p>Issue and verify simple HMAC API keys. Demo only — single‑file Worker, no external bindings.</p>
<div class="card">
  <h3>Register</h3>
  <p><button id="reg">Get API key</button></p>
  <pre id="out"></pre>
</div>
<div class="card">
  <h3>Quick test</h3>
  <pre id="hello"></pre>
</div>
<script>
document.getElementById("reg").onclick = async ()=>{
  const r = await fetch("/register",{method:"POST",headers:{'content-type':'application/json'},body:JSON.stringify({})});
  const j = await r.json();
  out.textContent = JSON.stringify(j,null,2);
  const h = await fetch("/hello",{ headers: { "x-api-key": j.apiKey }});
  hello.textContent = await h.text();
};
</script>
</div></body></html>`;
