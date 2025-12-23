const fs = require('fs');

let html = fs.readFileSync('index.html','utf8');

// --- ensure Signal Generator routes to the right file ---
html = html.replace(/signal_generator_react\.html|signal_demo\.html/g, 'signal_generator.html');

// --- ensure Quantum Visualizer button exists right after the Signal Generator button ---
const sigBtnRe = /(<button[^>]*id=["']signalBtn["'][^>]*>[\s\S]*?<\/button>)/i;
if (sigBtnRe.test(html) && !/id=["']quantumBtn["']/.test(html)) {
  html = html.replace(sigBtnRe, `$1\n  <button id="quantumBtn">Quantum Visualizer</button>`);
}

// Fallback: if the Signal button pattern wasn’t found, drop QV button before the closing of the button grid
if (!/id=["']quantumBtn["']/.test(html)) {
  html = html.replace(/(<\/div>\s*<\/section>|<\/div>\s*<\/div>)/i,
    `  <button id="quantumBtn">Quantum Visualizer</button>\n$1`);
}

// --- remove any old inline handlers that mention quantumBtn to avoid duplicates ---
html = html.replace(/<script>[\s\S]*?quantumBtn[\s\S]*?<\/script>/gi, '');

// --- inject a clean handler right before </body> ---
const handler = `
<!-- QV-HANDLER START -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  const s = document.getElementById('signalBtn');
  if (s) s.onclick = () => { window.location.href = 'signal_generator.html'; };

  const q = document.getElementById('quantumBtn');
  if (q) q.onclick = () => { window.location.href = 'quantum_visualizer.html'; };
});
</script>
<!-- QV-HANDLER END -->
`;
if (html.includes('<!-- QV-HANDLER START -->')) {
  html = html.replace(/<!-- QV-HANDLER START -->([\s\S]*?)<!-- QV-HANDLER END -->/, handler);
} else {
  html = html.replace(/<\/body>/i, handler + '\n</body>');
}

fs.writeFileSync('index.html', html);
console.log('✅ Portal wired: Signal Generator + Quantum Visualizer buttons ready.');
