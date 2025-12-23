#!/usr/bin/env python3
# cart_PCLA_full_public_dossier_EN_JP.py
# Public-record OSINT dossier builder (EN/JP). No private family history. No guessing.

import os, re, json, hashlib
from datetime import datetime

OUT_DIR = "research_cards"
os.makedirs(OUT_DIR, exist_ok=True)

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8", errors="ignore")).hexdigest()

def now_utc():
    return datetime.utcnow().isoformat()

def prompt_urls():
    print("\n[∞] Paste SEC filing URLs (one per line).")
    print("[∞] Include 20-F / 6-K / F-1. When done, enter a blank line.\n")
    urls = []
    while True:
        line = input().strip()
        if not line:
            break
        urls.append(line)
    return urls

def prompt_notes():
    print("\n[∞] Optional: paste any extra public notes/links (press releases, Nasdaq notices, IR pages).")
    print("[∞] One per line. Blank line to finish.\n")
    notes = []
    while True:
        line = input().strip()
        if not line:
            break
        notes.append(line)
    return notes

def build_dossier(urls, notes):
    dossier = {
        "entity": "PicoCELA Inc (PCLA)",
        "created_utc": now_utc(),
        "scope": "PUBLIC RECORDS ONLY (SEC filings + public sources user provides).",
        "inputs": {
            "sec_filing_urls": urls,
            "public_notes_links": notes
        },
        "extraction_targets": {
            "financials": [
                "revenue", "net income / net loss", "cash flow", "going concern (if any)",
                "share count / dilution", "risk factors"
            ],
            "governance": [
                "officers", "directors", "subsidiaries", "related-party transactions (if disclosed)"
            ],
            "market_events": [
                "nasdaq deficiency notices", "share issuances", "registered offerings"
            ]
        },
        "claims": [],
        "unknowns": [],
        "red_flags_to_check": [],
        "integrity_rules": [
            "No private family history.",
            "No doxxing.",
            "No assumptions — only what is in the sources.",
            "If not found in sources, mark as UNKNOWN."
        ]
    }
    return dossier

def make_markdown(dossier):
    h = sha256(json.dumps(dossier, sort_keys=True))
    md = []

    md.append(f"# ∞ PCLA Public-Record Dossier (EN/JP)\n")
    md.append(f"**Entity:** {dossier['entity']}  \n")
    md.append(f"**Created (UTC):** {dossier['created_utc']}  \n")
    md.append(f"**Dossier Hash:** `{h}`  \n")
    md.append("\n---\n")

    # EN
    md.append("## English — What this dossier is\n")
    md.append("This file is a **public-record-only** research dossier. It does **not** guess, and it does **not** include private personal/family history.\n")
    md.append("If something matters but is not present in the sources, it will be written as **UNKNOWN**.\n")

    md.append("\n### Sources provided\n")
    if dossier["inputs"]["sec_filing_urls"]:
        md.append("- SEC Filings:\n")
        for u in dossier["inputs"]["sec_filing_urls"]:
            md.append(f"  - {u}\n")
    else:
        md.append("- SEC Filings: **NONE PROVIDED YET**\n")

    if dossier["inputs"]["public_notes_links"]:
        md.append("- Other public links:\n")
        for n in dossier["inputs"]["public_notes_links"]:
            md.append(f"  - {n}\n")

    md.append("\n### What you should extract from the filings (checklist)\n")
    for k, items in dossier["extraction_targets"].items():
        md.append(f"- **{k}**\n")
        for it in items:
            md.append(f"  - {it}\n")

    md.append("\n### Strong questions (evidence-first)\n")
    md.append("- Do audited statements show **net profit**, or **net loss**? If loss, is it shrinking?  \n")
    md.append("- Is revenue growth coming from **product sales**, **licensing**, or **services**?  \n")
    md.append("- Any disclosed **related-party transactions**?  \n")
    md.append("- Any events indicating **dilution** (new shares/ADS, restricted shares, offerings)?  \n")
    md.append("- Any **Nasdaq compliance** issues (minimum bid price, etc.)?  \n")

    md.append("\n### Unknowns (must not be assumed)\n")
    md.append("- True profitability by segment (unless segmented in filings)\n")
    md.append("- Private contracts not disclosed\n")
    md.append("- Family history or private affiliations (not allowed, not relevant to filings)\n")

    # JP
    md.append("\n---\n")
    md.append("## 日本語 — このドシエの目的\n")
    md.append("このファイルは **公開情報のみ**（SEC提出書類＋あなたが提示する公開リンク）で作る調査ドシエです。推測や誇張はしません。\n")
    md.append("重要でも資料に出ていないものは **UNKNOWN（不明）** として記録します。\n")

    md.append("\n### 提示された情報源\n")
    if dossier["inputs"]["sec_filing_urls"]:
        md.append("- SEC提出書類:\n")
        for u in dossier["inputs"]["sec_filing_urls"]:
            md.append(f"  - {u}\n")
    else:
        md.append("- SEC提出書類: **まだ未入力**\n")

    if dossier["inputs"]["public_notes_links"]:
        md.append("- その他の公開リンク:\n")
        for n in dossier["inputs"]["public_notes_links"]:
            md.append(f"  - {n}\n")

    md.append("\n### 提出書類から抜き出すべき項目（チェックリスト）\n")
    for k, items in dossier["extraction_targets"].items():
        md.append(f"- **{k}**\n")
        for it in items:
            md.append(f"  - {it}\n")

    md.append("\n### 重要な検証質問（証拠優先）\n")
    md.append("- 監査済み財務諸表は **黒字**か **赤字**か？赤字なら改善傾向か？  \n")
    md.append("- 売上の源泉は **製品**・**ライセンス**・**サービス**のどれか？  \n")
    md.append("- **関連当事者取引**は開示されているか？  \n")
    md.append("- **希薄化**（新株/ADS/制限株式/増資など）の兆候はあるか？  \n")
    md.append("- **Nasdaq適合性**（最低株価など）の問題はあるか？  \n")

    md.append("\n### 不明点（推測禁止）\n")
    md.append("- 事業セグメント別の本当の利益（開示されていなければ不明）\n")
    md.append("- 非開示の民間契約\n")
    md.append("- 家系図や私人情報（禁止・不要）\n")

    md.append("\n---\n")
    md.append("## Next Step\n")
    md.append("Paste the SEC filing URLs into this cart when you run it. Then you (or another cart) can read/parse those filings locally and fill the CLAIMS section with quoted line evidence.\n")

    return "".join(md), h

def main():
    print("\n[∞] PCLA Full Public Dossier Builder (EN/JP)")
    urls = prompt_urls()
    notes = prompt_notes()

    dossier = build_dossier(urls, notes)
    md, h = make_markdown(dossier)

    md_path = os.path.join(OUT_DIR, "PCLA_DOSSIER_EN_JP.md")
    js_path = os.path.join(OUT_DIR, "PCLA_DOSSIER.json")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)
    with open(js_path, "w", encoding="utf-8") as f:
        json.dump(dossier, f, indent=2, ensure_ascii=False)

    print("\n[∞] Dossier created:")
    print(f"[∞] Markdown: {md_path}")
    print(f"[∞] JSON:     {js_path}")
    print(f"[∞] Hash:     {h}\n")

if __name__ == "__main__":
    main()
