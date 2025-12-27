import json, csv, datetime

with open("../ledger/PAYMENTS_APPEND.json") as f:
    payments = json.load(f)

rows = []
for p in payments:
    rows.append({
        "payment_id": p["payment_id"],
        "timestamp": p["timestamp"],
        "gross": p["gross_amount"],
        "operator_8_percent": round(p["gross_amount"] * 0.08, 2),
        "restricted_92_percent": round(p["gross_amount"] * 0.92, 2),
        "currency": p["currency"],
        "source": p["source"]
    })

with open("latest_report.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys() if rows else [])
    writer.writeheader()
    writer.writerows(rows)

print("✔ CSV report written")
