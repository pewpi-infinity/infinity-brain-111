// Infinity Resonance System - Complete Interactive Application
// Integrates: Electrochemical probes, Theremin interface, Dimensional theory,
// Vibrational healing, and Radionics history

// ============================================================================
// GLOBAL STATE
// ============================================================================
let activeTab = 0;
let audioContext = null;
let oscillators = [];

// Tab Management
function showTab(index) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, i) => {
        if (i === index) {
            tab.classList.add('active');
            contents[i].classList.add('active');
        } else {
            tab.classList.remove('active');
            contents[i].classList.remove('active');
        }
    });
    
    activeTab = index;
}

// ============================================================================
// TAB 1: ELECTROCHEMICAL PROBE SYSTEM
// ============================================================================
let probeCanvas, probeCtx;
let probeAnimationId;
let probeRunning = false;
let probeTime = 0;
let probeSpeed = 1;
let probesMoving = true;

const probes = [
    {
        x: 200, y: 100, baseY: 100,
        layers: [
            {material: 'Li', color: '#C0C0C0', thickness: 0.3, remaining: 1.0},
            {material: 'Cu', color: '#CD7F32', thickness: 0.7, remaining: 1.0}
        ],
        active: true
    },
    {
        x: 400, y: 120, baseY: 120,
        layers: [
            {material: 'Zn', color: '#696969', thickness: 0.5, remaining: 1.0},
            {material: 'Cu', color: '#CD7F32', thickness: 0.5, remaining: 1.0}
        ],
        active: true
    },
    {
        x: 600, y: 90, baseY: 90,
        layers: [
            {material: 'Fe', color: '#B87333', thickness: 0.4, remaining: 1.0},
            {material: 'Au', color: '#FFD700', thickness: 0.6, remaining: 1.0}
        ],
        active: true
    },
    {
        x: 800, y: 110, baseY: 110,
        layers: [
            {material: 'Li', color: '#C0C0C0', thickness: 0.6, remaining: 1.0},
            {material: 'Zn', color: '#696969', thickness: 0.4, remaining: 1.0}
        ],
        active: true
    }
];

const cathode = {x: 1000, y: 100, deposits: []};
const ions = [];

function initProbeSimulation() {
    probeCanvas = document.getElementById('probeCanvas');
    if (!probeCanvas) return;
    
    probeCtx = probeCanvas.getContext('2d');
    
    // Initialize ions
    for (let i = 0; i < 100; i++) {
        ions.push({
            x: Math.random() * probeCanvas.width,
            y: 200 + Math.random() * 300,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            type: Math.random() > 0.5 ? '+' : '-'
        });
    }
}

function drawProbeSystem() {
    if (!probeCanvas || !probeCtx) return;
    
    const w = probeCanvas.width;
    const h = probeCanvas.height;
    
    // Background
    probeCtx.fillStyle = '#000';
    probeCtx.fillRect(0, 0, w, h);
    
    // Electrolyte solution
    probeCtx.fillStyle = 'rgba(100, 150, 255, 0.2)';
    probeCtx.fillRect(0, 180, w, h - 180);
    
    // Draw ions
    ions.forEach(ion => {
        probeCtx.fillStyle = ion.type === '+' ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 0, 255, 0.6)';
        probeCtx.beginPath();
        probeCtx.arc(ion.x, ion.y, 3, 0, Math.PI * 2);
        probeCtx.fill();
        
        // Update position
        ion.x += ion.vx * probeSpeed;
        ion.y += ion.vy * probeSpeed;
        
        if (ion.x < 0 || ion.x > w) ion.vx *= -1;
        if (ion.y < 200 || ion.y > h) ion.vy *= -1;
        
        // Drift toward cathode
        if (ion.type === '+') {
            ion.vx += (cathode.x - ion.x) * 0.0001;
        }
    });
    
    // Draw probes
    probes.forEach((probe, i) => drawProbe(probe, i));
    
    // Draw cathode
    drawCathode();
    
    // Electron flow
    probes.forEach(probe => {
        if (!probe.active) return;
        
        for (let i = 0; i < 5; i++) {
            const progress = ((probeTime * probeSpeed * 2) % 100 + i * 20) / 100;
            const x = probe.x + (cathode.x - probe.x) * progress;
            const y = probe.y + 100 + (cathode.y + 200 - probe.y - 100) * progress;
            
            probeCtx.fillStyle = `rgba(255, 255, 0, ${1 - progress})`;
            probeCtx.beginPath();
            probeCtx.arc(x, y, 4, 0, Math.PI * 2);
            probeCtx.fill();
        }
    });
    
    updateProbeChemistry();
    probeTime++;
}

function drawProbe(probe, index) {
    const width = 40;
    const layerHeight = 150;
    
    // Probe holder
    probeCtx.fillStyle = '#444';
    probeCtx.fillRect(probe.x - width/2 - 5, probe.y - 30, width + 10, 25);
    
    // Draw layers
    let currentY = probe.y;
    probe.layers.forEach((layer, layerIndex) => {
        const height = layerHeight * layer.thickness * layer.remaining;
        
        probeCtx.fillStyle = layer.color;
        probeCtx.fillRect(probe.x - width/2, currentY, width, height);
        
        probeCtx.strokeStyle = '#000';
        probeCtx.lineWidth = 2;
        probeCtx.strokeRect(probe.x - width/2, currentY, width, height);
        
        probeCtx.fillStyle = 'black';
        probeCtx.font = 'bold 14px Arial';
        probeCtx.textAlign = 'center';
        probeCtx.fillText(layer.material, probe.x, currentY + height/2 + 5);
        
        currentY += height;
    });
    
    // Probe movement
    if (probesMoving) {
        probe.y = probe.baseY + Math.sin(probeTime * 0.02 + index) * 20;
    }
}

function drawCathode() {
    const width = 30;
    const height = 400;
    
    probeCtx.fillStyle = '#2F4F4F';
    probeCtx.fillRect(cathode.x - width/2, cathode.y, width, height);
    
    probeCtx.strokeStyle = '#000';
    probeCtx.lineWidth = 2;
    probeCtx.strokeRect(cathode.x - width/2, cathode.y, width, height);
    
    // Deposits
    cathode.deposits.forEach((deposit, i) => {
        probeCtx.fillStyle = deposit.color + '80';
        const y = cathode.y + height - (i + 1) * 5;
        probeCtx.fillRect(cathode.x - width/2, y, width, 4);
    });
    
    probeCtx.fillStyle = '#fff';
    probeCtx.font = 'bold 14px Arial';
    probeCtx.textAlign = 'center';
    probeCtx.fillText('Carbon Cathode', cathode.x, cathode.y - 10);
}

function updateProbeChemistry() {
    let totalVoltage = 0;
    
    probes.forEach((probe, index) => {
        if (!probe.active) return;
        
        for (let i = probe.layers.length - 1; i >= 0; i--) {
            const layer = probe.layers[i];
            if (layer.remaining > 0) {
                layer.remaining -= 0.0002 * probeSpeed;
                
                if (layer.remaining <= 0) {
                    layer.remaining = 0;
                    if (i === 0) probe.active = false;
                }
                
                const voltages = {'Li': 3.04, 'Zn': 0.76, 'Cu': 0.34, 'Fe': 0.44, 'Au': 1.5};
                totalVoltage += (voltages[layer.material] || 1.0) * layer.remaining;
                
                if (Math.random() < 0.01 * probeSpeed && cathode.deposits.length < 50) {
                    cathode.deposits.push({color: layer.color, material: layer.material});
                }
                
                break;
            }
        }
    });
    
    const voltage = totalVoltage;
    const current = voltage * 10;
    const power = voltage * current;
    const efficiency = Math.min(100, (voltage / 10) * 100);
    
    document.getElementById('voltage').textContent = voltage.toFixed(2) + 'V';
    document.getElementById('current').textContent = current.toFixed(1);
    document.getElementById('power').textContent = power.toFixed(1);
    document.getElementById('efficiency').textContent = efficiency.toFixed(0) + '%';
}

function startProbeSimulation() {
    if (!probeRunning) {
        probeRunning = true;
        probeLoop();
    }
}

function pauseProbeSimulation() {
    probeRunning = false;
    if (probeAnimationId) cancelAnimationFrame(probeAnimationId);
}

function resetProbeSimulation() {
    pauseProbeSimulation();
    probeTime = 0;
    cathode.deposits = [];
    
    probes.forEach(probe => {
        probe.active = true;
        probe.y = probe.baseY;
        probe.layers.forEach(layer => layer.remaining = 1.0);
    });
    
    drawProbeSystem();
}

function toggleProbeMovement() {
    probesMoving = !probesMoving;
}

function probeLoop() {
    if (probeRunning) {
        drawProbeSystem();
        probeAnimationId = requestAnimationFrame(probeLoop);
    }
}

// ============================================================================
// TAB 2: THEREMIN INTERFACE
// ============================================================================
let thereminCanvas, thereminCtx;
let thereminRunning = false;
let thereminOscillator = null;
let thereminGain = null;
let waveformType = 0;
const waveforms = ['sine', 'triangle', 'sawtooth', 'square'];

function initTheremin() {
    thereminCanvas = document.getElementById('thereminCanvas');
    if (!thereminCanvas) return;
    
    thereminCtx = thereminCanvas.getContext('2d');
    
    thereminCanvas.addEventListener('mousemove', handleThereminMove);
    thereminCanvas.addEventListener('mouseenter', () => {
        if (thereminRunning && audioContext) {
            if (thereminGain) thereminGain.gain.setValueAtTime(0, audioContext.currentTime);
        }
    });
    thereminCanvas.addEventListener('mouseleave', () => {
        if (thereminGain) thereminGain.gain.setValueAtTime(0, audioContext.currentTime);
    });
    
    drawThereminCanvas();
}

function handleThereminMove(e) {
    if (!thereminRunning || !audioContext) return;
    
    const rect = thereminCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // X controls frequency (200-2000 Hz)
    const frequency = 200 + (x / thereminCanvas.width) * 1800;
    
    // Y controls volume (inverted - top is loud)
    const volume = 1 - (y / thereminCanvas.height);
    
    if (thereminOscillator && thereminGain) {
        thereminOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        thereminGain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    }
    
    drawThereminCanvas(x, y, frequency, volume);
}

function drawThereminCanvas(mouseX = null, mouseY = null, freq = 0, vol = 0) {
    if (!thereminCanvas || !thereminCtx) return;
    
    const w = thereminCanvas.width;
    const h = thereminCanvas.height;
    
    // Background
    const gradient = thereminCtx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    thereminCtx.fillStyle = gradient;
    thereminCtx.fillRect(0, 0, w, h);
    
    // Frequency zones
    for (let i = 0; i < 5; i++) {
        thereminCtx.strokeStyle = `rgba(102, 126, 234, ${0.2 + i * 0.1})`;
        thereminCtx.lineWidth = 2;
        thereminCtx.beginPath();
        thereminCtx.moveTo(i * w / 5, 0);
        thereminCtx.lineTo(i * w / 5, h);
        thereminCtx.stroke();
        
        thereminCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        thereminCtx.font = '12px Arial';
        thereminCtx.fillText(`${200 + i * 360} Hz`, i * w / 5 + 10, 20);
    }
    
    // Volume zones
    for (let i = 0; i < 5; i++) {
        thereminCtx.strokeStyle = `rgba(118, 75, 162, ${0.2 + i * 0.1})`;
        thereminCtx.lineWidth = 1;
        thereminCtx.beginPath();
        thereminCtx.moveTo(0, i * h / 5);
        thereminCtx.lineTo(w, i * h / 5);
        thereminCtx.stroke();
    }
    
    // Mouse position indicator
    if (mouseX !== null && mouseY !== null) {
        // Crosshair
        thereminCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        thereminCtx.lineWidth = 2;
        thereminCtx.setLineDash([5, 5]);
        thereminCtx.beginPath();
        thereminCtx.moveTo(mouseX, 0);
        thereminCtx.lineTo(mouseX, h);
        thereminCtx.moveTo(0, mouseY);
        thereminCtx.lineTo(w, mouseY);
        thereminCtx.stroke();
        thereminCtx.setLineDash([]);
        
        // Center circle
        thereminCtx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        thereminCtx.beginPath();
        thereminCtx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        thereminCtx.fill();
        
        // Info text
        thereminCtx.fillStyle = 'white';
        thereminCtx.font = 'bold 16px Arial';
        thereminCtx.fillText(`${freq.toFixed(1)} Hz`, mouseX + 30, mouseY - 10);
        thereminCtx.fillText(`Vol: ${(vol * 100).toFixed(0)}%`, mouseX + 30, mouseY + 10);
    }
    
    // Instructions
    if (!thereminRunning) {
        thereminCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        thereminCtx.font = 'bold 24px Arial';
        thereminCtx.textAlign = 'center';
        thereminCtx.fillText('Click "Start Theremin" to begin', w / 2, h / 2);
    }
}

function startTheremin() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (!thereminRunning) {
        thereminOscillator = audioContext.createOscillator();
        thereminGain = audioContext.createGain();
        
        thereminOscillator.type = waveforms[waveformType];
        thereminOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        thereminGain.gain.setValueAtTime(0, audioContext.currentTime);
        
        thereminOscillator.connect(thereminGain);
        thereminGain.connect(audioContext.destination);
        thereminOscillator.start();
        
        thereminRunning = true;
    }
}

function stopTheremin() {
    if (thereminOscillator) {
        thereminOscillator.stop();
        thereminOscillator = null;
    }
    thereminRunning = false;
    drawThereminCanvas();
}

function toggleWaveform() {
    waveformType = (waveformType + 1) % waveforms.length;
    if (thereminOscillator) {
        thereminOscillator.type = waveforms[waveformType];
    }
    alert(`Waveform changed to: ${waveforms[waveformType]}`);
}

// ============================================================================
// TAB 3: DIMENSIONAL WATER VISUALIZATION
// ============================================================================
let dimensionalCanvas, dimensionalCtx;
let dimensionalRunning = false;
let dimensionalTime = 0;

function initDimensional() {
    dimensionalCanvas = document.getElementById('dimensionalCanvas');
    if (!dimensionalCanvas) return;
    
    dimensionalCtx = dimensionalCanvas.getContext('2d');
    drawDimensionalViz();
}

function drawDimensionalViz() {
    if (!dimensionalCanvas || !dimensionalCtx) return;
    
    const w = dimensionalCanvas.width;
    const h = dimensionalCanvas.height;
    
    dimensionalCtx.fillStyle = '#000';
    dimensionalCtx.fillRect(0, 0, w, h);
    
    // Three dimensions
    const dims = [
        {x: w * 0.2, y: h / 2, label: 'Dimension A\n(Our Reality)', color: '#667eea'},
        {x: w * 0.5, y: h / 2, label: 'Water Exchange\nLayer', color: '#4caf50'},
        {x: w * 0.8, y: h / 2, label: 'Dimension B\n(Other Reality)', color: '#764ba2'}
    ];
    
    // Draw dimensions
    dims.forEach(dim => {
        dimensionalCtx.fillStyle = dim.color + '40';
        dimensionalCtx.beginPath();
        dimensionalCtx.arc(dim.x, dim.y, 80, 0, Math.PI * 2);
        dimensionalCtx.fill();
        
        dimensionalCtx.strokeStyle = dim.color;
        dimensionalCtx.lineWidth = 3;
        dimensionalCtx.stroke();
        
        dimensionalCtx.fillStyle = 'white';
        dimensionalCtx.font = 'bold 14px Arial';
        dimensionalCtx.textAlign = 'center';
        const lines = dim.label.split('\n');
        lines.forEach((line, i) => {
            dimensionalCtx.fillText(line, dim.x, dim.y - 10 + i * 20);
        });
    });
    
    // Flowing particles (water molecules)
    if (dimensionalRunning) {
        for (let i = 0; i < 20; i++) {
            const progress = ((dimensionalTime * 2 + i * 5) % 100) / 100;
            
            // A to B (our waste to their fuel)
            const x1 = dims[0].x + (dims[2].x - dims[0].x) * progress;
            const y1 = dims[0].y + Math.sin(progress * Math.PI * 4) * 30;
            
            dimensionalCtx.fillStyle = `rgba(100, 150, 255, ${1 - progress})`;
            dimensionalCtx.beginPath();
            dimensionalCtx.arc(x1, y1, 5, 0, Math.PI * 2);
            dimensionalCtx.fill();
            
            dimensionalCtx.fillStyle = 'white';
            dimensionalCtx.font = '10px Arial';
            dimensionalCtx.textAlign = 'center';
            dimensionalCtx.fillText('H₂O', x1, y1 + 3);
            
            // B to A (their waste to our fuel)
            const x2 = dims[2].x - (dims[2].x - dims[0].x) * progress;
            const y2 = dims[2].y - Math.sin(progress * Math.PI * 4) * 30;
            
            dimensionalCtx.fillStyle = `rgba(255, 100, 150, ${1 - progress})`;
            dimensionalCtx.beginPath();
            dimensionalCtx.arc(x2, y2, 5, 0, Math.PI * 2);
            dimensionalCtx.fill();
            
            dimensionalCtx.fillStyle = 'white';
            dimensionalCtx.fillText('Energy', x2, y2 + 3);
        }
        
        dimensionalTime++;
    }
    
    // Arrows
    dimensionalCtx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
    dimensionalCtx.lineWidth = 2;
    dimensionalCtx.setLineDash([5, 5]);
    dimensionalCtx.beginPath();
    dimensionalCtx.moveTo(dims[0].x + 80, dims[0].y - 20);
    dimensionalCtx.lineTo(dims[2].x - 80, dims[2].y - 20);
    dimensionalCtx.stroke();
    
    dimensionalCtx.strokeStyle = 'rgba(255, 100, 150, 0.6)';
    dimensionalCtx.beginPath();
    dimensionalCtx.moveTo(dims[2].x - 80, dims[2].y + 20);
    dimensionalCtx.lineTo(dims[0].x + 80, dims[0].y + 20);
    dimensionalCtx.stroke();
    dimensionalCtx.setLineDash([]);
}

function startDimensionalViz() {
    if (!dimensionalRunning) {
        dimensionalRunning = true;
        dimensionalLoop();
    }
}

function dimensionalLoop() {
    if (dimensionalRunning) {
        drawDimensionalViz();
        requestAnimationFrame(dimensionalLoop);
    }
}

// ============================================================================
// TAB 4: VIBRATIONAL HEALING
// ============================================================================
let healingCanvas, healingCtx;
let healingTime = 0;
let healingActive = false;

function initHealing() {
    healingCanvas = document.getElementById('healingCanvas');
    if (!healingCanvas) return;
    
    healingCtx = healingCanvas.getContext('2d');
    drawHealingViz();
}

function drawHealingViz() {
    if (!healingCanvas || !healingCtx) return;
    
    const w = healingCanvas.width;
    const h = healingCanvas.height;
    
    healingCtx.fillStyle = '#000';
    healingCtx.fillRect(0, 0, w, h);
    
    const centerY = h / 2;
    const frequency = 5; // Hz for visualization
    const amplitude = 50;
    
    // Original "bad" vibration
    healingCtx.strokeStyle = '#ff4444';
    healingCtx.lineWidth = 3;
    healingCtx.beginPath();
    for (let x = 0; x < w; x++) {
        const y = centerY + Math.sin((x / w) * Math.PI * frequency + healingTime * 0.1) * amplitude;
        if (x === 0) healingCtx.moveTo(x, y);
        else healingCtx.lineTo(x, y);
    }
    healingCtx.stroke();
    
    // Label
    healingCtx.fillStyle = '#ff4444';
    healingCtx.font = 'bold 14px Arial';
    healingCtx.fillText('Original "Bad" Vibration', 20, 30);
    
    if (healingActive) {
        // Inverted vibration
        healingCtx.strokeStyle = '#44ff44';
        healingCtx.lineWidth = 3;
        healingCtx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = centerY - Math.sin((x / w) * Math.PI * frequency + healingTime * 0.1) * amplitude;
            if (x === 0) healingCtx.moveTo(x, y);
            else healingCtx.lineTo(x, y);
        }
        healingCtx.stroke();
        
        healingCtx.fillStyle = '#44ff44';
        healingCtx.fillText('Inverted "Healing" Signal', 20, 60);
        
        // Result (cancellation)
        healingCtx.strokeStyle = '#ffffff';
        healingCtx.lineWidth = 2;
        healingCtx.setLineDash([5, 5]);
        healingCtx.beginPath();
        healingCtx.moveTo(0, centerY);
        healingCtx.lineTo(w, centerY);
        healingCtx.stroke();
        healingCtx.setLineDash([]);
        
        healingCtx.fillStyle = '#ffffff';
        healingCtx.fillText('Result: CANCELLATION = Healing', w / 2 - 100, h - 20);
    }
    
    healingTime++;
}

function startHealing() {
    healingActive = true;
    healingLoop();
}

function resetHealing() {
    healingActive = false;
    healingTime = 0;
    drawHealingViz();
}

function healingLoop() {
    if (healingActive) {
        drawHealingViz();
        requestAnimationFrame(healingLoop);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
window.addEventListener('load', () => {
    initProbeSimulation();
    initTheremin();
    initDimensional();
    initHealing();
    
    // Start probe simulation by default
    drawProbeSystem();
});
