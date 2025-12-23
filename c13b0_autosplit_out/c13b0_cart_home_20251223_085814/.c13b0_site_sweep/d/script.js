// =====================================================
// INFINITY CONSTELLATION BRAIN — CART D
// 73 Nodes • Particle Clouds • Semantic Gravity • Φ Spiral
// Listening → Thinking → Calculating → Readout
// =====================================================

// CANVAS SETUP
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// =====================================================
// NODE STRUCTURE
// =====================================================
const NODE_COUNT = 73;

class Node {
  constructor(word) {
    this.word = word;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.state = "FREE"; // FREE, ORBIT, ANCHOR, CORE
    this.importance = Math.random() * 0.2;

    // micro particle cloud
    this.particles = [];
    let pcount = 5 + Math.floor(Math.random() * 7);
    for (let i = 0; i < pcount; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 6 + Math.random() * 12,
        speed: 0.005 + Math.random() * 0.015
      });
    }
  }

  update(mode) {
    // base drift
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // particle microcloud behavior
    for (let p of this.particles) {
      let mult = 1;
      if (mode === "LISTEN") mult = 1.2;
      if (mode === "THINK") mult = 2.0;
      if (mode === "CALC") mult = 3.4;

      p.angle += p.speed * mult;
    }
  }

  draw() {
    // particle cloud
    for (let p of this.particles) {
      let px = this.x + Math.cos(p.angle) * p.radius;
      let py = this.y + Math.sin(p.angle) * p.radius;
      ctx.fillStyle = "rgba(150,200,255,0.6)";
      ctx.beginPath();
      ctx.arc(px, py, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // node glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4 + this.importance * 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(170,220,255,0.85)";
    ctx.fill();

    // optional labels on strong nodes
    if (this.importance > 0.25) {
      ctx.fillStyle = "#9edcff";
      ctx.font = "12px Segoe UI";
      ctx.fillText(this.word, this.x + 10, this.y + 4);
    }
  }
}

let nodes = [];

// =====================================================
// TEXT PROCESSING / PARSER
// =====================================================
function extractConcepts(text) {
  text = text.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  let words = text.split(/\s+/).filter(w => w.length > 3);

  let freq = {};
  for (let w of words) freq[w] = (freq[w] || 0) + 1;

  let sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, NODE_COUNT)
    .map(a => a[0]);

  return sorted;
}

// =====================================================
// SUMMARY GENERATOR
// =====================================================
function summarize(text) {
  let words = extractConcepts(text);
  let top = words.slice(0, 8);

  return `
MAIN THEMES:
- ${top.join(", ")}

CONCEPT DENSITY: ${text.length} chars

SUMMARY:
This text primarily focuses on: ${top[0]}, supported by related
concepts forming constellation clusters. Semantic gravity pulls related
terms together, forming identifiable ideas.`;
}

// =====================================================
// UI ELEMENTS
// =====================================================
const listenBtn = document.getElementById("listenBtn");
const thinkBtn = document.getElementById("thinkBtn");
const calcBtn = document.getElementById("calcBtn");

const orb = document.getElementById("orb");
const summaryPanel = document.getElementById("summaryPanel");
const summaryText = document.getElementById("summaryText");

let currentText = "";
let mode = "LISTEN";

// =====================================================
// MODE BUTTONS
// =====================================================
listenBtn.onclick = () => {
  currentText = document.getElementById("inputText").value;
  spawnNodes(currentText);
  mode = "LISTEN";
};

thinkBtn.onclick = () => {
  mode = "THINK";
};

calcBtn.onclick = () => {
  mode = "CALC";
  setTimeout(() => {
    summaryText.textContent = summarize(currentText);
    summaryPanel.classList.add("open");
  }, 1200);
};

// ORB → SUMMARY TRANSFORM
orb.onclick = () => {
  summaryPanel.classList.toggle("open");
};

// =====================================================
// SPAWN NODES
// =====================================================
function spawnNodes(text) {
  let list = extractConcepts(text);
  nodes = [];
  for (let word of list) {
    nodes.push(new Node(word));
  }
}

// =====================================================
// MAIN LOOP
// =====================================================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let n of nodes) {
    n.update(mode);
  }
  for (let n of nodes) {
    n.draw();
  }

  requestAnimationFrame(animate);
}

animate();
