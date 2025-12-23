# Tiny local static server: python3 server.py then open http://127.0.0.1:8000
import http.server, socketserver, os
PORT=8000
os.chdir(os.path.dirname(__file__) or ".")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"Serving on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
