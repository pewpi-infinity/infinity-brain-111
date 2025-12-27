const canvas = document.getElementById("quantumCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ==== QUANTUM SETTINGS (affected by commands) ====
let speedMultiplier = 1;
let spreadForce = 0;
let collapseForce = 0;
let pulseEnergy = 0;
let model = "v1";      // visualizer behavior profile
let mode = "none";     // behavior mode

// ==== NODE CLASS ====
class Node {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;

    this.baseSize = 2 + Math.random() * 3;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    // core motion
    this.x += this.vx * speedMultiplier;
    this.y += this.vy * speedMultiplier;

    // spread or collapse force
    if (spreadForce > 0) {
      this.x += (this.x - canvas.width / 2) * 0.002 * spreadForce;
      this.y += (this.y - canvas.height / 2) * 0.002 * spreadForce;
    }
    if (collapseForce > 0) {
      this.x -= (this.x - canvas.width / 2) * 0.003 * collapseForce;
      this.y -= (this.y - canvas.height / 2) * 0.003 * collapseForce;
    }

    // pulse behavior
    if (pulseEnergy > 0) {
      this.pulse += 0.2;
    } else {
      this.pulse += 0.02;
    }

    // boundaries
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    const glow = (Math.sin(this.pulse) + 1) * 0.5;

    let size = this.baseSize;

    // modes modify visual emphasis
    if (mode === "thinking") size += glow * 1.8;
    if (mode === "exploring") size += glow * 1.2;
    if (mode === "filtering") size *= 0.7;
    if (mode === "doorway_seek") size += Math.sin(this.pulse * 2) * 1.5;
    if (mode === "barrier_detect") size *= 0.5;

    // models modify energy appearance
    let color = "#7cc5ff";
    if (model === "v2") color = "#9ad8ff";
    if (model === "v3") color = "#b2f0ff";

    ctx.beginPath();
    ctx.arc(this.x, this.y, size + glow * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(142, 223, 255, ${0.15 + glow * 0.3})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// ==== INIT NODES ====
const NODES = [];
for (let i = 0; i < 120; i++) NODES.push(new Node());

// ==== COMMAND LISTENER ====
setInterval(() => {
  const cmd = localStorage.getItem("Q_Command");
  const newMode = localStorage.getItem("Q_Mode");
  const newModel = localStorage.getItem("Q_Model");

  if (cmd) {
    handleCommand(cmd);
    localStorage.removeItem("Q_Command");
  }

  if (newMode) mode = newMode;
  if (newModel) model = newModel;

}, 150);

// ==== COMMAND HANDLER ====
function handleCommand(cmd) {
  switch (cmd) {
    case "pulse":
      pulseEnergy = 5;
      setTimeout(() => (pulseEnergy = 0), 600);
      break;

    case "expand":
      spreadForce = 8;
      setTimeout(() => (spreadForce = 0), 600);
      break;

    case "collapse":
      collapseForce = 8;
      setTimeout(() => (collapseForce = 0), 600);
      break;

    case "speed_up":
      speedMultiplier += 0.3;
      break;

    case "slow_down":
      speedMultiplier = Math.max(0.2, speedMultiplier - 0.3);
      break;

    case "spike":
      pulseEnergy = 12;
      spreadForce = 5;
      setTimeout(() => { pulseEnergy = 0; spreadForce = 0; }, 900);
      break;

    case "reset":
      speedMultiplier = 1;
      spreadForce = 0;
      collapseForce = 0;
      pulseEnergy = 0;
      break;
  }
}

// ==== DRAW CONNECTIONS ====
function drawConnections() {
  for (let a = 0; a < NODES.length; a++) {
    for (let b = a + 1; b < NODES.length; b++) {
      let dx = NODES[a].x - NODES[b].x;
      let dy = NODES[a].y - NODES[b].y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        ctx.strokeStyle = `rgba(70,150,255,${(1 - dist / 150) * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(NODES[a].x, NODES[a].y);
        ctx.lineTo(NODES[b].x, NODES[b].y);
        ctx.stroke();
      }
    }
  }
}

// ==== MAIN LOOP ====
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawConnections();

  for (let node of NODES) {
    node.update();
    node.draw();
  }

  requestAnimationFrame(animate);
}

animate();
