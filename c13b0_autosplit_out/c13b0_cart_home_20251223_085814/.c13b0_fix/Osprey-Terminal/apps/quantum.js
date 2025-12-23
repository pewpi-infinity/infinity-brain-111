// Quantum Visualizer — Infinity OS (Osprey Terminal)
// Version 1.0 — Kris Watson Architecture

(function() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.background = "black";
  container.style.zIndex = "9999";
  container.style.cursor = "pointer";

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let nodes = [];
  let links = [];

  const NODE_COUNT = 160;
  const LINK_DISTANCE = 130;

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw nodes
    ctx.fillStyle = "#00eaff";
    for (let n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    }

    // Draw links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DISTANCE) {
          const alpha = 1 - dist / LINK_DISTANCE;
          ctx.strokeStyle = `rgba(0,234,255, ${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  // Close the app when clicked
  container.addEventListener("click", () => {
    document.body.removeChild(container);
  });

  // Load
  initNodes();
  animate();
  document.body.appendChild(container);
})();
