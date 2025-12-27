#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱 C13B0 CART 017 — PayPal Webhook Ledger"

mkdir -p server ledger reports config

# init ledgers if missing
[ -f ledger/PAYMENTS_APPEND.json ] || echo "[]" > ledger/PAYMENTS_APPEND.json
[ -f ledger/OPERATOR_LEDGER.json ] || echo "[]" > ledger/OPERATOR_LEDGER.json
[ -f ledger/RESTRICTED_LEDGER.json ] || echo "[]" > ledger/RESTRICTED_LEDGER.json

# config
cat << 'JSON' > config/paypal.json
{
  "currency": "USD",
  "operator_percent": 0.08,
  "restricted_percent": 0.92
}
JSON

# CSV exporter
cat << 'PY' > reports/export_csv.py
import json, csv

with open("ledger/PAYMENTS_APPEND.json") as f:
    payments = json.load(f)

rows = []
for p in payments:
    rows.append({
        "payment_id": p["payment_id"],
        "timestamp": p["timestamp"],
        "gross": p["gross_amount"],
        "operator_8_percent": p["operator_amount"],
        "restricted_92_percent": p["restricted_amount"],
        "currency": p["currency"]
    })

with open("reports/latest_report.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys() if rows else [])
    writer.writeheader()
    writer.writerows(rows)

print("✔ CSV updated")
PY

# webhook server
cat << 'PY' > server/webhook_server.py
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
        self.end_headers()
        self.wfile.write(b"OK")

print("🧱 Listening on port 8080")
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
PY

chmod +x server/webhook_server.py

echo "✅ Cart 017 ready"
echo "Run: ./run.sh"
