// ============================================================
// 🏛 OSPREY 5.1 – Government + Network Integration Layer
// ============================================================

// ---- Node & Link Registry ----------------------------------
window.ospreyNodes = [
  { id: "vice_president", name: "Vice President – Rogers AI", type: "executive" },
  { id: "energy", name: "Energy & Infrastructure", type: "department" },
  { id: "food", name: "Food & Agriculture", type: "department" },
  { id: "housing", name: "Housing & Urban Development", type: "department" },
  { id: "health", name: "Health & Human Services", type: "department" },
  { id: "education", name: "Education & Research", type: "department" }
];

window.ospreyLinks = [
  { a: "vice_president", b: "energy", strength: 1.0 },
  { a: "vice_president", b: "food", strength: 1.0 },
  { a: "vice_president", b: "housing", strength: 1.0 },
  { a: "vice_president", b: "health", strength: 1.0 },
  { a: "vice_president", b: "education", strength: 1.0 },
  { a: "energy", b: "housing", strength: 0.8 },
  { a: "food", b: "health", strength: 0.7 },
  { a: "education", b: "health", strength: 0.9 }
];

console.log("[🌐] Osprey network initialized:",
  window.ospreyNodes.length, "nodes and", window.ospreyLinks.length, "links."
);

// ---- Offices Data ------------------------------------------
window.ospreyOffices = [
  { title: "Vice President – Rogers AI", sector: "Executive Coordination", color: "#38bdf8" },
  { title: "Energy & Infrastructure", sector: "Power, Transport, Resources", color: "#ffe84a" },
  { title: "Food & Agriculture", sector: "Farms, Supply Chains", color: "#3ef0a3" },
  { title: "Housing & Urban Development", sector: "Construction, Land Management", color: "#ff4a68" },
  { title: "Health & Human Services", sector: "Public Health, Care Systems", color: "#00b4ff" },
  { title: "Education & Research", sector: "Schools and Innovation", color: "#9c6bff" }
];

// ---- Visualization: Office Bubbles --------------------------
function initOspreyVector() {
  const canvas = document.createElement("canvas");
  canvas.id = "osprey-space";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let width, height;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  class OfficeBubble {
    constructor(info, i) {
      this.info = info;
      this.id = i;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random();
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      const size = 40 + 60 * (1 - this.z);
      ctx.beginPath();
      ctx.arc(this.x, this.y, size / 4, 0, Math.PI * 2);
      ctx.fillStyle = this.info.color;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `${12 + (1 - this.z) * 8}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(this.info.title.split(" ")[0], this.x, this.y + 4);
    }
    hit(mx, my) {
      const size = 40 + 60 * (1 - this.z);
      const dx = mx - this.x, dy = my - this.y;
      return Math.sqrt(dx * dx + dy * dy) < size / 4;
    }
  }

  const pages = window.ospreyOffices.map((o, i) => new OfficeBubble(o, i));
  function animate() {
    ctx.fillStyle = "rgba(3,7,18,0.35)";
    ctx.fillRect(0, 0, width, height);
    pages.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();

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
      <p>This office manages systems within the ${info.sector.toLowerCase()} domain.</p>
      <button onclick="this.parentNode.remove()">Close</button>`;
  }
}
document.addEventListener("DOMContentLoaded", initOspreyVector);
