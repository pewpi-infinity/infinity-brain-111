from http.server import BaseHTTPRequestHandler, HTTPServer
import json, datetime, os

CONFIG = json.load(open("config/paypal.json"))

def append(path, record):
    data = json.load(open(path))
    data.append(record)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        payload = json.loads(body.decode())

        # Minimal PayPal-style extraction
        payment_id = payload.get("id", "UNKNOWN")
        amount = float(payload.get("amount", {}).get("value", 0))

        ts = datetime.datetime.utcnow().isoformat() + "Z"
        operator = round(amount * CONFIG["operator_percent"], 2)
        restricted = round(amount * CONFIG["restricted_percent"], 2)

        payment_record = {
            "payment_id": payment_id,
            "timestamp": ts,
            "gross_amount": amount,
            "operator_amount": operator,
            "restricted_amount": restricted,
            "currency": CONFIG["currency"]
        }

        append("ledger/PAYMENTS_APPEND.json", payment_record)
        append("ledger/OPERATOR_LEDGER.json", {
            "payment_id": payment_id,
            "amount": operator,
            "timestamp": ts
        })
        append("ledger/RESTRICTED_LEDGER.json", {
            "payment_id": payment_id,
            "amount": restricted,
            "timestamp": ts
        })

        os.system("python3 reports/export_csv.py")

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

server = HTTPServer(("0.0.0.0", 8080), Handler)
print("🧱 Listening for PayPal webhooks on port 8080")
server.serve_forever()
