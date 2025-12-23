from http.server import BaseHTTPRequestHandler, HTTPServer
import json, datetime, os, traceback

CONFIG = json.load(open("config/paypal.json"))

os.makedirs("ledger", exist_ok=True)
os.makedirs("reports", exist_ok=True)

def append(path, record):
    if not os.path.exists(path):
        data = []
    else:
        with open(path) as f:
            data = json.load(f)
    data.append(record)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length).decode())

            payment_id = payload.get("id", "UNKNOWN")
            amount = float(payload.get("amount", {}).get("value", 0))

            ts = datetime.datetime.utcnow().isoformat() + "Z"
            operator = round(amount * CONFIG["operator_percent"], 2)
            restricted = round(amount * CONFIG["restricted_percent"], 2)

            record = {
                "payment_id": payment_id,
                "timestamp": ts,
                "gross_amount": amount,
                "operator_amount": operator,
                "restricted_amount": restricted,
                "currency": CONFIG["currency"]
            }

            append("ledger/PAYMENTS_APPEND.json", record)
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
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

        except Exception as e:
            traceback.print_exc()
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"error")

print("🧱 Listening for PayPal webhooks on port 8080")
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
