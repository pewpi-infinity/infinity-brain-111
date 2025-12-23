from flask import Flask, Response
app = Flask(__name__)
HTML = """<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<title>Infinity Portal</title>
<style>body{font-family:system-ui,Arial;background:#0b0f14;color:#e7f1ff;margin:0}
.wrap{max-width:860px;margin:28px auto;padding:16px}
.row{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.row{grid-template-columns:repeat(3,1fr)}}
.card{background:#101723;border:1px solid #1e2a3a;border-radius:18px;padding:18px;text-align:center;font-weight:600}
.card a{color:inherit;text-decoration:none;display:block}
.card:hover{background:#18263a}
.foot{opacity:.7;font-size:12px;margin-top:16px}</style>
<div class=wrap>
  <h1>∞ Infinity Portal</h1>
  <div class=row>
    <div class=card><a href="http://127.0.0.1:5050">Rogers Chat (no-API)</a></div>
    <div class=card><a href="#" onclick="alert('In Termux run: swap-on')">Swap ON</a></div>
    <div class=card><a href="#" onclick="alert('In Termux run: swap-off')">Swap OFF</a></div>
  </div>
  <div class=foot>Logs → ~/InfinityOS/Logs</div>
</div>"""
@app.get("/")
def index(): return Response(HTML, mimetype="text/html")
if __name__ == "__main__": app.run(host="0.0.0.0", port=8080)
