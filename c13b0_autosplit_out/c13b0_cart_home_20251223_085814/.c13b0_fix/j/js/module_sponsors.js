/* ===========================
   INFINITY OS — SPONSOR TILE MODULE
   Auto-inserts sponsor tiles into index.html
=========================== */

(function() {

  // Wait for page to load
  document.addEventListener("DOMContentLoaded", () => {

    // 1. Find the terminal-inner element
    const container = document.querySelector(".terminal-inner");
    if (!container) return;

    // 2. Create the sponsor block
    const block = document.createElement("div");
    block.className = "footer-sponsors";
    block.innerHTML = `
      <div style="margin-top:18px; text-align:center; opacity:0.75; font-size:11px;">
        <div style="margin-bottom:6px;">Powered by:</div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">

          <a href="https://github.com/" target="_blank" class="sponsor-tile">GitHub</a>
          <a href="https://x.com/" target="_blank" class="sponsor-tile">X</a>
          <a href="https://archive.org/" target="_blank" class="sponsor-tile">Internet Archive</a>
          <a href="https://api.ipify.org?format=json" target="_blank" class="sponsor-tile">IP Engine</a>
          <a href="https://pewpi-infinity.github.io/k/" target="_blank" class="sponsor-tile">Infinity K</a>
          <a href="https://paypal.com/" target="_blank" class="sponsor-tile">PayPal</a>
          <a href="https://ebay.com/" target="_blank" class="sponsor-tile">eBay</a>

        </div>
      </div>
    `;

    // 3. Insert sponsor block BEFORE closing </div> of terminal-inner
    container.appendChild(block);


    /* ========== AUTO-INJECT CSS ========== */
    const style = document.createElement("style");
    style.textContent = `
      .sponsor-tile {
        padding:6px 12px;
        border-radius:12px;
        background:rgba(0, 200, 255, 0.12);
        border:1px solid rgba(0, 200, 255, 0.35);
        text-decoration:none;
        color:#aee6ff;
        font-weight:600;
        font-size:12px;
        backdrop-filter:blur(4px);
        transition: all 0.2s ease;
      }
      .sponsor-tile:hover {
        background:rgba(0, 200, 255, 0.25);
        border-color:#29d9ff;
        color:#ffffff;
        box-shadow:0 0 12px rgba(41,217,255,0.65);
      }
    `;
    document.head.appendChild(style);

  });

})();
