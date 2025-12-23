Pewpi Dashboard — Drag & Drop Package (v1)

How to deploy (Cloudflare Pages):
1) Go to https://dash.cloudflare.com → Workers & Pages → Create a project → Upload assets
2) Drag this folder (or just index.html) into the uploader
3) Click Deploy — your HTTPS link appears (e.g., https://<name>.pages.dev)

Notes:
• This dashboard is a no-build, single-file app — it runs with mock telemetry by default.
• Press “Run” in the UI to start the simulation.
• You can later wire a live websocket source and keep Pewpi packets on the wire (73:x:∞).
