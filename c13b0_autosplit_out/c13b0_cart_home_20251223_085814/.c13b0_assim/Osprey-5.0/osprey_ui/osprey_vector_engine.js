// ─────────────────────────────────────────────
// 🪶  OSPREY 4.0  Vector Engine with Offices
// ─────────────────────────────────────────────

const canvas = document.getElementById("osprey-space");
const ctx = canvas.getContext("2d");

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize, { passive: true });
resize();

// ---- Offices registry ----
const offices = [
  { title: "Vice President – Rogers AI", color: "#38bdf8", sector: "Executive Coordination" },
  { title: "Energy & Infrastructure Dept", color: "#ffe84a", sector: "Power, Transport, Resources" },
  { title: "Food & Agriculture Dept", color: "#3ef0a3", sector: "Farms, Supply Chains" },
  { title: "Housing & Urban Development", color: "#ff4a68", sector: "Construction, Land Management" },
  { title: "Health & Human Services", color: "#00b4ff", sector: "Public Health, Care Systems" },
  { title: "Education & Research", color: "#9c6bff", sector: "Schools and Innovation" }
];

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
    const dx = mx - this.x;
    const dy = my - this.y;
    return Math.sqrt(dx * dx + dy * dy) < size / 4;
  }
}

const pages = offices.map((o, i) => new OfficeBubble(o, i));
window.ospreyVector = { canvas, ctx, pages };

// ---- Animation ----
function animate() {
  ctx.fillStyle = "rgba(3,7,18,0.35)";
  ctx.fillRect(0, 0, width, height);
  pages.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

