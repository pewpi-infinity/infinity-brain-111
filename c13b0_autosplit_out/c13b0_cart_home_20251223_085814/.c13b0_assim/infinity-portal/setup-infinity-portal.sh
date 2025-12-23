#!/data/data/com.termux/files/usr/bin/bash
set -e
export PATH="$HOME/bin:$PATH"

echo "[∞] Preparing folders..."
mkdir -p "$HOME/bin" "$HOME/InfinityPortal"/{site,deploy,project,static,data} "$HOME/InfinityOS/Logs"

echo "[∞] Minimal packages..."
pkg update -y >/dev/null 2>&1 || true
pkg install -y python python-pip rsync >/dev/null 2>&1 || true
python3 -m pip install --upgrade pip >/dev/null 2>&1 || true
python3 -m pip install flask requests >/dev/null 2>&1 || true

# ---------- run/kill ----------
printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'LOGDIR="$HOME/InfinityOS/Logs"; mkdir -p "$LOGDIR"' \
'nohup python3 "$HOME/InfinityPortal/portal.py" >/dev/null 2>>"$LOGDIR/portal.err" &' \
'echo "[∞] Portal on :8080"' > "$HOME/bin/pee-run" && chmod +x "$HOME/bin/pee-run"

printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'pkill -f "python3 .*InfinityPortal/portal.py" 2>/dev/null || true' \
'echo "[∞] Killed."' > "$HOME/bin/pee-kill" && chmod +x "$HOME/bin/pee-kill"

# ---------- swap (safe: works only if rooted) ----------
printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'set -e; SW=/data/local/tmp/infinity.swap' \
'if ! command -v su >/dev/null 2>&1; then echo "[!] No su; swap needs root."; exit 1; fi' \
'su -c "fallocate -l 2048M $SW || dd if=/dev/zero of=$SW bs=1M count=2048 status=none"; su -c "chmod 600 $SW"' \
'su -c "mkswap $SW 2>/dev/null || toybox mkswap $SW 2>/dev/null || busybox mkswap $SW 2>/dev/null"' \
'su -c "swapon $SW 2>/dev/null || toybox swapon $SW 2>/dev/null || busybox swapon $SW 2>/dev/null"' \
'echo "[∞] Swap ON: $SW"' > "$HOME/bin/swap-on" && chmod +x "$HOME/bin/swap-on"

printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'SW=/data/local/tmp/infinity.swap' \
'if command -v su >/dev/null 2>&1; then su -c "swapoff $SW 2>/dev/null || toybox swapoff $SW 2>/dev/null || busybox swapoff $SW 2>/dev/null"; su -c "rm -f $SW" || true; echo "[∞] Swap OFF"; else echo "[!] No su"; fi' \
> "$HOME/bin/swap-off" && chmod +x "$HOME/bin/swap-off"

# ---------- sync/backup helpers ----------
# save to /sdcard/InfinitySync (rsync if possible; fallback to cp)
printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'mkdir -p /sdcard/InfinitySync 2>/dev/null || true' \
'if command -v rsync >/dev/null 2>&1; then' \
'  rsync -a --delete "$HOME/InfinityPortal/" /sdcard/InfinitySync/InfinityPortal/' \
'  rsync -a --delete "$HOME/bin/"           /sdcard/InfinitySync/bin/' \
'else' \
'  mkdir -p /sdcard/InfinitySync/InfinityPortal /sdcard/InfinitySync/bin' \
'  cp -a "$HOME/InfinityPortal/." /sdcard/InfinitySync/InfinityPortal/ 2>/dev/null || true' \
'  cp -a "$HOME/bin/."           /sdcard/InfinitySync/bin/            2>/dev/null || true' \
'fi' \
'echo "[∞] Synced → /sdcard/InfinitySync"' > "$HOME/bin/inf-sync-save" && chmod +x "$HOME/bin/inf-sync-save"

printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'if [ -d /sdcard/InfinitySync/InfinityPortal ]; then' \
'  rsync -a /sdcard/InfinitySync/InfinityPortal/ "$HOME/InfinityPortal/" 2>/dev/null || cp -a /sdcard/InfinitySync/InfinityPortal/. "$HOME/InfinityPortal/"' \
'fi' \
'if [ -d /sdcard/InfinitySync/bin ]; then' \
'  rsync -a /sdcard/InfinitySync/bin/ "$HOME/bin/" 2>/dev/null || cp -a /sdcard/InfinitySync/bin/. "$HOME/bin/"' \
'fi' \
'echo "[∞] Loaded ← /sdcard/InfinitySync"' > "$HOME/bin/inf-sync-load" && chmod +x "$HOME/bin/inf-sync-load"

printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'OUT="/sdcard/InfinityPortal-$(date +%Y%m%d-%H%M%S).tar.gz"' \
'tar -C "$HOME" -czf "$OUT" InfinityPortal bin 2>/dev/null || true' \
'echo "[∞] Backup: $OUT"' > "$HOME/bin/inf-backup" && chmod +x "$HOME/bin/inf-backup"

printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash' \
'find "$HOME/InfinityOS/Logs" -type f -name "*.err" -size +10M -print -exec truncate -s 0 {} \;' \
'echo "[∞] Logs trimmed."' > "$HOME/bin/inf-clean-logs" && chmod +x "$HOME/bin/inf-clean-logs"

# ---------- write portal.py without heredocs (python does the file IO) ----------
python3 - "$HOME/InfinityPortal/portal.py" <<'PY'
import sys, textwrap
path = sys.argv[1]
code = textwrap.dedent('''
from flask import Flask, request, Response, jsonify, send_from_directory, abort
import os, re, html, requests

APP_ROOT = os.path.dirname(__file__)
SITE_DIR = os.path.join(APP_ROOT, "site")
DEPLOY_DIR = os.path.join(APP_ROOT, "deploy")
STATIC_DIR = os.path.join(APP_ROOT, "static")

app = Flask(__name__, static_folder=STATIC_DIR)

BASE_CSS = """
body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#0b0f14;color:#e7f1ff;margin:0}
a{color:#a9d1ff;text-decoration:none}
.nav{position:sticky;top:0;background:#0e1520;border-bottom:1px solid #1e2a3a}
.nav .wrap{max-width:980px;margin:0 auto;display:flex;gap:12px;align-items:center;padding:12px 16px}
.nav a{padding:8px 12px;border:1px solid #26354a;border-radius:10px;background:#142033}
.nav a:hover{background:#1a2a42}
.wrap{max-width:980px;margin:22px auto;padding:0 16px}
.card{background:#101723;border:1px solid #1e2a3a;border-radius:18px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
.grid{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:700px){.grid{grid-template-columns:repeat(2,1fr)}}
.hint{opacity:.75;font-size:12px;margin-top:10px}
input,textarea,button{border-radius:14px;border:1px solid #25354b;background:#0f1722;color:#e7f1ff}
input,textarea{padding:12px}
button{padding:12px 16px;font-weight:700;background:#142033}
button:active{transform:translateY(1px)}
.box{height:60vh;overflow:auto}
.msg{margin:10px 0;padding:10px 12px;border-radius:12px;max-width:88%}
.u{background:#17324d;margin-left:auto}
.a{background:#162235;border:1px solid #223146}
small{opacity:.7}
"""

NAV = """
<div class="nav"><div class="wrap">
  <a href="/">Launcher</a>
  <a href="/site">Infinity Site</a>
  <a href="/chat">Rogers Chat</a>
  <a href="/pi">Pi Singer</a>
  <a href="/socializer">Socializer</a>
  <a href="/deploy">Deploy</a>
  <a href="/swap">Swap</a>
</div></div>
"""

def page(title, body):
    return f"""<!doctype html><html><head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>{title}</title><style>{BASE_CSS}</style></head>
<body>{NAV}<div class="wrap">{body}</div></body></html>"""

# -------- Launcher ----------
@app.get("/")
def launcher():
    body = """
    <h1>∞ Infinity Launcher</h1>
    <div class="grid">
      <div class="card"><h3>Rogers Chat</h3><p>No-API lookup chat.</p><p><a href="/chat">Open →</a></p></div>
      <div class="card"><h3>Infinity Site</h3><p>Static hub at <code>~/InfinityPortal/site/</code>.</p><p><a href="/site">Open →</a></p></div>
      <div class="card"><h3>Pi Singer</h3><p>WebAudio π tones (client only).</p><p><a href="/pi">Open →</a></p></div>
      <div class="card"><h3>Socializer</h3><p>Local text cleanup.</p><p><a href="/socializer">Open →</a></p></div>
      <div class="card"><h3>Deploy</h3><p>Browse <code>~/InfinityPortal/deploy/</code>.</p><p><a href="/deploy">Open →</a></p></div>
    </div>
    <p class="hint">Logs → <code>~/InfinityOS/Logs/portal.err</code>. Restart → <code>pee-kill && pee-run</code>.</p>
    """
    return Response(page("Infinity Launcher", body), mimetype="text/html")

# -------- Site (static) ----------
@app.get("/site")
def site():
    idx = os.path.join(SITE_DIR, "index.html")
    if os.path.exists(idx):
        with open(idx, "r", encoding="utf-8", errors="ignore") as f:
            return Response(page("Infinity Site", f.read()), mimetype="text/html")
    else:
        hint = "<p>No <code>site/index.html</code> yet. Drop your existing site files there.</p>"
        return Response(page("Infinity Site (placeholder)", hint), mimetype="text/html")

# -------- Deploy (browse) ----------
@app.get("/deploy")
def deploy_list():
    try:
        names = sorted(os.listdir(DEPLOY_DIR))
        items = "".join(f"<li><a href='/deploy/file/{html.escape(n)}'>{html.escape(n)}</a></li>" for n in names)
    except Exception:
        items = ""
    body = f"<h2>Deploy folder</h2><ul>{items or '<li>(empty)</li>'}</ul><p class='hint'>Put zips/scripts into <code>~/InfinityPortal/deploy/</code>.</p>"
    return Response(page("Deploy", body), mimetype="text/html")

@app.get("/deploy/file/<path:name>")
def deploy_file(name):
    p = os.path.join(DEPLOY_DIR, name)
    if not os.path.isfile(p): abort(404)
    return send_from_directory(DEPLOY_DIR, name, as_attachment=False)

# -------- Chat (no API) ----------
def ddg_html_search(q):
    try:
        r = requests.get("https://duckduckgo.com/html/", params={"q":q}, timeout=10,
                         headers={"User-Agent":"Mozilla/5.0"})
        items = re.findall(r'result__a".*?>(.*?)</a>.*?result__snippet.*?>(.*?)<', r.text, re.S)
        out=[]
        for t,s in items[:5]:
            t = re.sub(r'<.*?>','',t); s = re.sub(r'<.*?>','',s)
            out.append((html.unescape(t).strip(), html.unescape(s).strip()))
        return out
    except Exception:
        return []

def local_reply(q:str)->str:
    q=q.strip()
    if not q: return "Say something and I'll look it up."
    hits = ddg_html_search(q)
    if not hits: return "I couldn't reach the web just now. Quick take: " + q
    lines = [f"Top takeaways for: {q}"] + [f"{i}. {t} — {s}" for i,(t,s) in enumerate(hits,1)]
    lines.append("Source: DuckDuckGo HTML (no API).")
    return "\n".join(lines)

@app.get("/chat")
def chat_page():
    body = """
    <h2>Rogers (No-API)</h2>
    <div id="box" class="card box"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <input id="q" placeholder="Ask anything… (no keys, basic web lookup)" style="flex:1">
      <button onclick="send()">Send</button>
    </div>
    <p class="hint">Local summarizer + DDG HTML.</p>
    <script>
    const box=document.getElementById('box'); const q=document.getElementById('q');
    q.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
    function add(role,text){const d=document.createElement('div'); d.className='msg '+(role==='user'?'u':'a'); d.innerText=text; box.appendChild(d); box.scrollTop=box.scrollHeight;}
    async function send(){const msg=q.value.trim(); if(!msg)return; add('user',msg); q.value='';
      try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({q:msg})});
          add('ai',await r.text());}catch(e){add('ai','Network error.');}}
    </script>
    """
    return Response(page("Rogers Chat", body), mimetype="text/html")

@app.post("/api/chat")
def chat_api():
    return local_reply(request.form.get("q",""))

# -------- Pi Singer ----------
@app.get("/pi")
def pi():
    body = """
    <h2>Pi Singer</h2>
    <div class="card">
      <p>WebAudio oscillator maps digits of π to tones.</p>
      <button id="play">Play</button> <button id="stop">Stop</button>
      <p class="hint">Client-side only.</p>
    </div>
    <script>
    const PI="314159265358979323846264338327950288419716939937510";
    let ctx, osc, i=0, timer;
    function f(d){ return 220 + (parseInt(d)%10)*33; }
    document.getElementById('play').onclick=()=>{ if(timer) return;
      ctx=new (window.AudioContext||window.webkitAudioContext)(); osc=ctx.createOscillator(); osc.type='sine'; osc.connect(ctx.destination); osc.start();
      timer=setInterval(()=>{osc.frequency.value=f(PI[i%PI.length]); i++;},220); };
    document.getElementById('stop').onclick=()=>{ if(timer){clearInterval(timer); timer=null;} if(osc){osc.stop(); osc.disconnect();} if(ctx){ctx.close();} };
    </script>
    """
    return Response(page("Pi Singer", body), mimetype="text/html")

# -------- Socializer ----------
@app.get("/socializer")
def socializer():
    body = """
    <h2>Socializer</h2>
    <div class="card">
      <textarea id="in" rows="7" placeholder="Paste a rough thought..."></textarea>
      <div style="height:8px"></div>
      <button onclick="go()">Rewrite</button>
      <div style="height:12px"></div>
      <pre id="out" class="card" style="white-space:pre-wrap"></pre>
      <p class="hint">Local cleanup only.</p>
    </div>
    <script>
    async function go(){const t=document.getElementById('in').value||''; const r=await fetch('/api/socialize',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({t})}); document.getElementById('out').textContent=await r.text();}
    </script>
    """
    return Response(page("Socializer", body), mimetype="text/html")

@app.post("/api/socialize")
def api_socialize():
    t=(request.form.get("t","") or "").strip()
    t=re.sub(r'\s+',' ',t)
    if t and t[0].islower(): t=t[0].upper()+t[1:]
    if t and t[-1] not in ".!?": t+="."
    return t or "Nothing to rewrite."

# -------- Swap info ----------
@app.get("/swap")
def swap():
    body = """
    <h2>Swap</h2>
    <div class="card">
      <pre>export PATH="$HOME/bin:$PATH"
swap-on     # if rooted
swap-off</pre>
    </div>
    """
    return Response(page("Swap", body), mimetype="text/html")

# -------- Static passthrough & health ----------
@app.get("/static/<path:fn>")
def static_files(fn): return send_from_directory(STATIC_DIR, fn)

@app.get("/healthz")
def health(): return jsonify(ok=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
''')
open(path, "w", encoding="utf-8").write(code)
print("[∞] portal.py written")
PY

# ---------- launch ----------
pee-kill >/dev/null 2>&1 || true
pee-run
echo "[∞] Open → http://127.0.0.1:8080"
echo "[∞] Save/Load later: termux-setup-storage ; inf-sync-save ; inf-sync-load"
