import json, csv

with open("../ledger/PAYMENTS_APPEND.json") as f:
    payments = json.load(f)

rows = []
for p in payments:
    rows.append({
        "payment_id": p["payment_id"],
        "timestamp": p["timestamp"],
        "gross": p["gross_amount"],
        "operator_8_percent": p["operator_amount"],
        "restricted_92_percent": p["restricted_amount"],
        "currency": p["currency"],
        "source": "PayPal"
    })

with open("latest_report.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys() if rows else [])
    writer.writeheader()
    writer.writerows(rows)

print("✔ CSV updated")
