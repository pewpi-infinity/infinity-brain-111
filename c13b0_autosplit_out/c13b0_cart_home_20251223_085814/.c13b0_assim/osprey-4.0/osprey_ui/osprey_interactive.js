// ─────────────────────────────────────────────
// 🪶  OSPREY 4.0 Interactive Layer with Info Panels
// ─────────────────────────────────────────────
const { canvas, pages } = window.ospreyVector;
let dragging = false, lastX = 0, lastY = 0;

function pull(dx, dy) {
  pages.forEach(p => {
    const pullFactor = (1 - p.z) * 0.9 + 0.1;
    p.x += dx * pullFactor;
    p.y += dy * pullFactor;
  });
}

// mouse & touch drag
canvas.addEventListener("mousedown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  pull(e.clientX - lastX, e.clientY - lastY);
  lastX = e.clientX; lastY = e.clientY;
});
canvas.addEventListener("touchstart", e => {
  if (!e.touches?.[0]) return;
  dragging = true;
  lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener("touchmove", e => {
  if (!dragging || !e.touches?.[0]) return;
  const t = e.touches[0];
  pull(t.clientX - lastX, t.clientY - lastY);
  lastX = t.clientX; lastY = t.clientY;
}, { passive: true });
window.addEventListener("touchend", () => dragging = false, { passive: true });

// zoom
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const delta = Math.sign(e.deltaY);
  pages.forEach(p => {
    p.z += delta * 0.05;
    if (p.z < 0) p.z = 0;
    if (p.z > 1) p.z = 1;
  });
}, { passive: false });

// ---- Click to open info panel ----
canvas.addEventListener("click", e => {
  const mx = e.clientX, my = e.clientY;
  const hit = pages.find(p => p.hit(mx, my));
  if (hit) showPanel(hit.info);
});

function showPanel(info) {
  let panel = document.getElementById("info-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "info-panel";
    panel.style.cssText = `
      position:fixed;top:20px;right:20px;max-width:280px;
      background:rgba(15,23,42,.9);color:#e2e8f0;
      padding:12px 16px;border:1px solid #38bdf8;
      border-radius:12px;font-family:system-ui;
      box-shadow:0 0 12px #0ff;z-index:1000;`;
    document.body.appendChild(panel);
  }
  panel.innerHTML = `
    <b style="color:${info.color}">${info.title}</b><br/>
    <small>${info.sector}</small><br/><br/>
    <p>This office manages systems within the ${info.sector.toLowerCase()} domain.
    Data channels and controls will appear here as we expand Osprey.</p>
    <button onclick="this.parentNode.remove()">Close</button>`;
}

