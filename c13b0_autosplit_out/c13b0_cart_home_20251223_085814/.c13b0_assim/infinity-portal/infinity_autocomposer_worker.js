
/**
 * Infinity AutoComposer — Chat‑Generated Patterns (Single‑File Worker)
 * - "/"     : UI to prompt ChatGPT for JSON note patterns; plays with WebAudio
 * - "/chat" : Proxy to OpenAI (user pastes API key)
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/") return new Response(HTML, { headers: { "content-type":"text/html; charset=UTF-8" } });
    if (url.pathname === "/chat" && request.method==="POST"){
      const { key, model, messages } = await request.json().catch(()=>({}));
      if(!key) return J({ok:false,error:"missing key"},400);
      const r = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{ "authorization":"Bearer "+key, "content-type":"application/json" },
        body: JSON.stringify({ model: model||"gpt-4o-mini", messages })
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
<title>Infinity AutoComposer</title>
<style>
  body{margin:0;background:#0a0f14;color:#e9fbff;font-family:ui-sans-serif,system-ui}
  .wrap{max-width:980px;margin:0 auto;padding:18px}
  .card{background:#0c1623;border:1px solid #12304a;border-radius:16px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.35)}
  input,textarea,button{padding:10px;border-radius:12px;border:1px solid #244b6b;background:#0b1d2e;color:#e9fbff}
  button{background:#23b47e;border:none;font-weight:700;cursor:pointer}
  table{width:100%;border-collapse:collapse} td,th{border:1px dashed #1b3955;padding:6px;text-align:center}
</style></head>
<body><div class="wrap">
<h1>Infinity AutoComposer</h1>
<div class="card">
  <p>Describe a pattern or style. The model returns JSON { "bpm": 100, "notes": [ { "t":0,"dur":0.5,"midi":60 }, ... ] } (seconds, MIDI). Paste your API key.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <input id="k" placeholder="sk-..." style="flex:2"/>
    <input id="m" value="gpt-4o-mini" style="flex:1"/>
  </div>
  <textarea id="p" rows="5" style="width:100%;margin-top:8px" placeholder="Make a chill lo-fi arpeggio in A minor, 8 bars, sparse."></textarea>
  <div style="margin-top:8px">
    <button id="go">Generate</button>
    <button id="play" style="background:#1f3b57">Play</button>
  </div>
  <pre id="out" style="white-space:pre-wrap;max-height:220px;overflow:auto"></pre>
</div>
<script>
let ctx, out=document.getElementById("out"), last={ bpm:100, notes:[] };
function midiToHz(m){return 440*Math.pow(2,(m-69)/12);}
function env(t,g){ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.9,t+0.01); g.gain.setTargetAtTime(0.0,t+0.2,0.25); }
async function gen(){
  const key=document.getElementById("k").value.trim(); if(!key){ out.textContent="missing key"; return; }
  const model=document.getElementById("m").value.trim();
  const prompt=document.getElementById("p").value.trim();
  const sys={role:"system",content:"Return ONLY JSON with fields { bpm:number, notes:Array<{t:number,dur:number,midi:number}> }. No prose."};
  const user={role:"user",content:prompt||"Make a slow ambient pad with sparse notes"};
  const r=await fetch("/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:model?key:key,model, messages:[sys,user]})});
  const j=await r.json(); const text=j?.data?.choices?.[0]?.message?.content||"{}";
  out.textContent=text;
  try{ last = JSON.parse(text); } catch(e){}
}
function play(){
  if(!last.notes?.length) return;
  if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
  const gain=ctx.createGain(); gain.gain.value=0.2; gain.connect(ctx.destination);
  const start=ctx.currentTime;
  last.notes.forEach(n=>{
    const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=midiToHz(n.midi);
    const g=ctx.createGain(); o.connect(g); g.connect(gain);
    o.start(start+n.t);
    env(start+n.t,g);
    o.stop(start+n.t+n.dur+1);
  });
}
document.getElementById("go").onclick=gen;
document.getElementById("play").onclick=play;
</script>
</div></body></html>`;
