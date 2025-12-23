import re, html, requests
from flask import Flask, request, Response
app = Flask(__name__)
PAGE = """<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<title>Rogers Chat</title>
<style>body{font-family:system-ui,Arial;background:#0b0f14;color:#e7f1ff;margin:0}
.wrap{max-width:860px;margin:24px auto;padding:12px}
.box{background:#101723;border:1px solid #1e2a3a;border-radius:18px;padding:12px;height:60vh;overflow:auto}
.msg{margin:10px 0;padding:10px 12px;border-radius:12px;max-width:88%}
.u{background:#17324d;margin-left:auto}.a{background:#162235;border:1px solid #223146}
.row{display:flex;gap:8px;margin-top:10px}
input{flex:1;padding:14px;border-radius:14px;border:1px solid #25354b;background:#0f1722;color:#e7f1ff}
button{padding:14px 16px;border-radius:14px;border:1px solid #2a3a50;background:#142033;color:#e7f1ff;font-weight:600}
.hint{opacity:.7;font-size:12px;margin-top:8px}</style>
<div class=wrap>
  <h1>Rogers (No-API)</h1>
  <div id=box class=box></div>
  <div class=row>
    <input id=q placeholder="Ask anything… (no keys, basic web lookup)">
    <button onclick="send()">Send</button>
  </div>
  <div class=hint>Uses DuckDuckGo HTML and a local summarizer. No API keys.</div>
</div>
<script>
const box=document.getElementById('box');const q=document.getElementById('q');
q.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
function add(role,text){const d=document.createElement('div');d.className='msg '+(role==='user'?'u':'a');d.innerText=text;box.appendChild(d);box.scrollTop=box.scrollHeight;}
async function send(){const msg=q.value.trim();if(!msg)return;add('user',msg);q.value='';try{const r=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({q:msg})});add('ai',await r.text());}catch(e){add('ai','Network error.');}}
</script>"""
def ddg(q):
    try:
        r=requests.get("https://duckduckgo.com/html/",params={"q":q},timeout=10,headers={"User-Agent":"Mozilla/5.0"})
        it=re.findall(r'result__a".*?>(.*?)</a>.*?result__snippet.*?>(.*?)<',r.text,re.S)
        out=[]
        for t,s in it[:5]:
            t=re.sub(r'<.*?>','',t); s=re.sub(r'<.*?>','',s)
            out.append((html.unescape(t).strip(),html.unescape(s).strip()))
        return out
    except Exception: return []
def reply(q):
    hits=ddg(q.strip()); 
    if not hits: return "I couldn't reach the web just now. Quick take: "+q
    lines=[f"Top takeaways for: {q}"]+[f"{i}. {t} — {s}" for i,(t,s) in enumerate(hits,1)]+["Source: DuckDuckGo HTML (no API)."]
    return "\n".join(lines)
@app.get("/") 
def home(): return Response(PAGE, mimetype="text/html")
@app.post("/chat")
def chat(): return reply(request.form.get("q",""))
if __name__ == "__main__": app.run(host="0.0.0.0", port=5050)
