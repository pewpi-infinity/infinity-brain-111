#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱🍄🧱 C13B0 ZERO — FINISH PIXIE INDEX (ASSEMBLER)"

# Locate Pixie repo automatically
PIXIE="$(find "$HOME" -maxdepth 6 -type d -name "infinity-brain-111" 2>/dev/null | head -n 1)"
[ -n "$PIXIE" ] || { echo "❌ Pixie repo not found"; exit 1; }
cd "$PIXIE"

TS=$(date +%Y%m%d_%H%M%S)
cp index.html "index_backup_finish_${TS}.html"

# Remove prior ZERO blocks (idempotent)
sed -i '/C13B0_ZERO_START/,/C13B0_ZERO_END/d' index.html

# Append assembled upgrades
cat << 'HTML' >> index.html

<!-- C13B0_ZERO_START -->
<style>
/* Layout stabilization */
html, body { overflow-x: hidden; }
.container, .wrap, main { max-width: 820px; margin: 0 auto; }

/* Header tighten */
.pixie-header { margin: 8px auto 6px; text-align:center; }
.pixie-brand { font-size: 14px; opacity:.75; letter-spacing:.04em; }

/* Admin gate */
.admin-only { display:none; }
.pewpi-admin .admin-only { display:block; }

/* Cards */
.card { border-radius: 16px; padding: 14px; margin: 12px 0; }

/* Spinner placeholder (non-broken) */
.spinner-wrap { display:flex; justify-content:center; }
.spinner { width:140px; height:140px; border-radius:50%; border:6px solid #f3c; 
  animation: spin 4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<section class="pixie-header">
  <div class="pixie-brand">Notionique &nbsp;•&nbsp; SparklePixie</div>
</section>

<section class="card admin-only">
  <strong>🧱👰🧱 Admin Panel</strong>
  <div style="margin-top:8px">
    <button onclick="alert('Admin active')">Admin Active</button>
    <button onclick="alert('Background upload coming next')">Background</button>
    <button onclick="alert('Layouts coming next')">Layouts</button>
  </div>
</section>

<section class="card">
  <strong>🎰 Spinner (Preview)</strong>
  <div class="spinner-wrap">
    <div class="spinner" title="Real reels coming next"></div>
  </div>
  <small>Preview only — real reels wired next.</small>
</section>

<section class="card">
  <strong>🧱🎟️🧱 Public Tickets (Audit)</strong>
  <p>Public, lawful reporting pages. Evidence logs, traffic summaries, timestamps.</p>
  <ul>
    <li><a href="tickets.html">Tickets Index</a></li>
    <li><a href="tokens.html">Tokens Index</a></li>
  </ul>
</section>

<script>
/* Admin flag (local to Pixie) */
try {
  if (localStorage.getItem("pewpi_admin_logged")==="true") {
    document.documentElement.classList.add("pewpi-admin");
  }
} catch(e){}
</script>
<!-- C13B0_ZERO_END -->

HTML

# Create simple public pages (lawful audit)
cat << 'HTML' > tickets.html
<!doctype html><meta charset="utf-8">
<title>Public Tickets</title>
<h1>Public Tickets (Audit)</h1>
<p>Evidence-based reports. No harassment. No calls to harm.</p>
<ul><li>Ticket feed will render here.</li></ul>
HTML

cat << 'HTML' > tokens.html
<!doctype html><meta charset="utf-8">
<title>Tokens</title>
<h1>Tokens</h1>
<p>Growth and accountability tokens.</p>
<ul><li>Token feed will render here.</li></ul>
HTML

git add index.html tickets.html tokens.html index_backup_finish_*.html
git commit -m "🧱🍄🧱 Finish Pixie index: layout, branding, admin gate, spinner preview, public tickets" || true
git pull --rebase origin main || true
git push origin main || git push --force-with-lease origin main

echo "🧱🍄🧱 DONE"
echo "Open: https://pewpi-infinity.github.io/infinity-brain-111/?finish=$TS"
