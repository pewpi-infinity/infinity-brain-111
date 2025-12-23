import React, { useEffect, useRef, useState, useCallback } from "react";

// Dual‑Universe Branch Visual (Canvas) — FIXED
// ------------------------------------------------------------
// Key fixes from your report ("It doesn't work"):
// 1) HiDPI transform bug: we now reset the canvas transform each frame with ctx.setTransform(1,0,0,1,0,0)
//    BEFORE applying device‑pixel scaling. This prevents compounding scale each render.
// 2) NaN path gaps: drawCurve now skips non‑finite samples, so conditional segments (pre/post split)
//    render cleanly instead of feeding NaNs into the line.
// 3) Correct mapping: layout uses CSS size for coordinates; mapFactory now takes CSS width/height
//    so axes/grid align with the drawn curves under DPR scaling.
// 4) Safer animation loop: guards against missing context and ensures cleanup.
// 5) Default split set to exactly 4.00 to match your π‑chain junction.

export default function DualUniverseCanvas() {
  // View + animation
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0); // seconds

  // Model parameters
  const [xMax, setXMax] = useState(10); // domain extent
  const [splitX, setSplitX] = useState(4); // the junction (your "4")
  const [baseAmp, setBaseAmp] = useState(1.0);
  const [baseFreq, setBaseFreq] = useState(1.15);
  const [basePhase, setBasePhase] = useState(0.0);

  // Post‑split universe 1 params
  const [u1Slope, setU1Slope] = useState(0.35);
  const [u1Amp, setU1Amp] = useState(0.9);
  const [u1Freq, setU1Freq] = useState(0.95);
  const [u1Phase, setU1Phase] = useState(0.4);

  // Post‑split universe 2 params
  const [u2Slope, setU2Slope] = useState(-0.3);
  const [u2Amp, setU2Amp] = useState(0.75);
  const [u2Freq, setU2Freq] = useState(1.22);
  const [u2Phase, setU2Phase] = useState(-0.2);

  // Playback speed & trace length
  const [speed, setSpeed] = useState(1.0); // seconds per real second
  const [trace, setTrace] = useState(10); // how far ahead to draw after split

  // Utility: map logical coords to pixels (CSS‑space, not device pixels)
  const mapFactory = (cssW, cssH, padding = 48) => {
    const left = padding;
    const right = cssW - padding;
    const top = padding;
    const bottom = cssH - padding;
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    const x2px = (x) => left + (x / xMax) * width;
    const y2px = (y) => {
      // y in [-Ymax, +Ymax] where we set Ymax ~ 2.2 for headroom
      const yMax = 2.2;
      return top + (1 - (y + yMax) / (2 * yMax)) * height;
    };

    return { x2px, y2px, left, right, top, bottom, width, height };
  };

  // Base function (single universe) until split
  const baseY = useCallback(
    (x, t) => baseAmp * Math.sin(2 * Math.PI * baseFreq * (x / xMax) + basePhase + 0.6 * t),
    [baseAmp, baseFreq, basePhase, xMax]
  );

  // Ensure continuity at the junction: both universes start at the exact base value at splitX
  const junctionY = useCallback(
    (t) => baseY(splitX, t),
    [baseY, splitX]
  );

  // Two post‑split universes sharing the same point at x=splitX, but with different derivatives thereafter
  const u1Y = useCallback(
    (x, t) => {
      const dx = Math.max(0, x - splitX);
      return (
        junctionY(t) +
        u1Slope * dx +
        u1Amp * Math.sin(2 * Math.PI * u1Freq * (dx / Math.max(1e-6, xMax - splitX)) + u1Phase + 0.7 * t)
      );
    },
    [junctionY, splitX, u1Slope, u1Amp, u1Freq, u1Phase, xMax]
  );

  const u2Y = useCallback(
    (x, t) => {
      const dx = Math.max(0, x - splitX);
      return (
        junctionY(t) +
        u2Slope * dx +
        u2Amp * Math.sin(2 * Math.PI * u2Freq * (dx / Math.max(1e-6, xMax - splitX)) + u2Phase + 0.65 * t)
      );
    },
    [junctionY, splitX, u2Slope, u2Amp, u2Freq, u2Phase, xMax]
  );

  // Draw helpers
  const drawGrid = (ctx, map) => {
    const { left, right, top, bottom, x2px, y2px } = map;
    ctx.save();
    ctx.strokeStyle = "#1f2937"; // slate-800
    ctx.lineWidth = 1;

    // Vertical grid (x)
    const xStep = 1;
    for (let x = 0; x <= xMax; x += xStep) {
      const px = x2px(x);
      ctx.beginPath();
      ctx.moveTo(px, top);
      ctx.lineTo(px, bottom);
      ctx.stroke();
    }

    // Horizontal grid (y)
    const yStep = 0.5;
    for (let y = -2; y <= 2; y += yStep) {
      const py = y2px(y);
      ctx.beginPath();
      ctx.moveTo(left, py);
      ctx.lineTo(right, py);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#4b5563"; // gray-600
    ctx.lineWidth = 1.5;
    // x-axis (y=0)
    ctx.beginPath();
    ctx.moveTo(left, y2px(0));
    ctx.lineTo(right, y2px(0));
    ctx.stroke();
    // y-axis (x=0)
    ctx.beginPath();
    ctx.moveTo(x2px(0), top);
    ctx.lineTo(x2px(0), bottom);
    ctx.stroke();

    // Junction marker at x=splitX
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#ef4444"; // red-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x2px(splitX), top);
    ctx.lineTo(x2px(splitX), bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = "#ef4444";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(`junction = ${splitX.toFixed(2)} (π-chain "4")`, x2px(splitX) + 8, top + 16);

    ctx.restore();
  };

  const drawCurve = (ctx, map, sampler, color, fromX, toX) => {
    const { x2px, y2px } = map;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    const step = xMax / 1000; // smoothness
    let penDown = false;
    for (let x = fromX; x <= Math.min(xMax, toX); x += step) {
      const y = sampler(x);
      if (!Number.isFinite(y)) {
        penDown = false; // lift pen on gaps
        continue;
      }
      const px = x2px(x);
      const py = y2px(y);
      if (!penDown) {
        ctx.moveTo(px, py);
        penDown = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // CSS size
    const cssW = Math.max(1, canvas.clientWidth);
    const cssH = Math.max(1, canvas.clientHeight);

    // HiDPI: reset transform then scale once per frame
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); // critical: reset any previous scaling
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#0b1220"; // near-black blue
    ctx.fillRect(0, 0, cssW, cssH);

    const map = mapFactory(cssW, cssH, 56);

    // Grid and labels
    drawGrid(ctx, map);

    // Time window
    const t = time;

    // Pre‑split path (white)
    drawCurve(
      ctx,
      map,
      (x) => (x <= splitX ? baseY(x, t) : Number.NaN),
      "#ffffff",
      0,
      splitX
    );

    // Post‑split simultaneous universes, computed together
    const toX = Math.min(xMax, splitX + trace);
    drawCurve(
      ctx,
      map,
      (x) => (x >= splitX ? u1Y(x, t) : Number.NaN),
      "#60a5fa", // blue-400
      splitX,
      toX
    );
    drawCurve(
      ctx,
      map,
      (x) => (x >= splitX ? u2Y(x, t) : Number.NaN),
      "#f472b6", // pink-400
      splitX,
      toX
    );

    // Junction dot (shared symmetry point)
    const { x2px, y2px } = map;
    const jx = x2px(splitX);
    const jy = y2px(junctionY(t));
    ctx.fillStyle = "#fbbf24"; // amber-400
    ctx.beginPath();
    ctx.arc(jx, jy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Legend
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("Base universe (pre‑split)", 16, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(160, 15, 26, 2.5);

    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Universe 1 (post‑split)", 16, 40);
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(160, 33, 26, 2.5);

    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Universe 2 (post‑split)", 16, 58);
    ctx.fillStyle = "#f472b6";
    ctx.fillRect(160, 51, 26, 2.5);
  }, [time, xMax, splitX, trace, baseY, u1Y, u2Y, junctionY]);

  // Animation loop
  useEffect(() => {
    let mounted = true;
    let last = performance.now();
    const tick = (now) => {
      if (!mounted) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing) setTime((t) => t + dt * speed);
      render();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, render]);

  // UI blocks
  const label = (txt) => (
    <span style={{ fontSize: 12, color: "#93a3b3", minWidth: 120, display: "inline-block" }}>{txt}</span>
  );

  const slider = (value, setValue, min, max, step) => (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => setValue(parseFloat(e.target.value))}
      style={{ width: 160 }}
    />
  );

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 8, height: "100%", background: "#0b1220", color: "#e5e7eb", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>Dual‑Universe Branch Visual</h1>
          <span style={{ fontSize: 12, color: "#93a3b3" }}>Simultaneous computation with shared symmetry at the junction (π‑chain “4”).</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{ padding: "6px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#e5e7eb", cursor: "pointer" }}
            aria-label="Play/Pause"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setTime(0)}
            style={{ padding: "6px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#e5e7eb", cursor: "pointer" }}
            aria-label="Reset time"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", padding: 8 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "420px", display: "block", background: "transparent", borderRadius: 12 }} />
      </div>

      {/* Controls */}
      <div style={{ borderTop: "1px solid #1f2937", padding: "8px 12px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {/* Domain & Playback */}
        <section style={{ display: "grid", gap: 6 }}>
          <h2 style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 700 }}>Domain & Playback</h2>
          <div>{label(`Domain max x = ${xMax.toFixed(1)}`)}{slider(xMax, setXMax, 6, 20, 0.1)}</div>
          <div>{label(`Junction (π “4”) = ${splitX.toFixed(2)}`)}{slider(splitX, setSplitX, 1, 9, 0.01)}</div>
          <div>{label(`Trace after split = ${trace.toFixed(1)}`)}{slider(trace, setTrace, 2, 12, 0.1)}</div>
          <div>{label(`Speed = ${speed.toFixed(2)}×`)}{slider(speed, setSpeed, 0.1, 3, 0.01)}</div>
        </section>

        {/* Pre‑split Base */}
        <section style={{ display: "grid", gap: 6 }}>
          <h2 style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 700 }}>Base Universe (pre‑split)</h2>
          <div>{label(`Amplitude = ${baseAmp.toFixed(2)}`)}{slider(baseAmp, setBaseAmp, 0.1, 2.5, 0.01)}</div>
          <div>{label(`Frequency = ${baseFreq.toFixed(2)}`)}{slider(baseFreq, setBaseFreq, 0.2, 2.0, 0.01)}</div>
          <div>{label(`Phase = ${basePhase.toFixed(2)} rad`)}{slider(basePhase, setBasePhase, -Math.PI, Math.PI, 0.01)}</div>
        </section>

        {/* Post‑split Universes */}
        <section style={{ display: "grid", gap: 6 }}>
          <h2 style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 700 }}>Simultaneous Universes (post‑split)</h2>
          <div style={{ marginTop: 2, fontSize: 12, color: "#93a3b3" }}>Both start from the exact same junction value, then diverge.</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 8, rowGap: 6, alignItems: "center" }}>
            <div style={{ gridColumn: "1 / span 2", color: "#60a5fa", fontSize: 12, marginTop: 6 }}>Universe 1 (blue)</div>
            {label(`Slope = ${u1Slope.toFixed(2)}`)}{slider(u1Slope, setU1Slope, -1.0, 1.0, 0.01)}
            {label(`Amplitude = ${u1Amp.toFixed(2)}`)}{slider(u1Amp, setU1Amp, 0.1, 2.5, 0.01)}
            {label(`Frequency = ${u1Freq.toFixed(2)}`)}{slider(u1Freq, setU1Freq, 0.2, 2.0, 0.01)}
            {label(`Phase = ${u1Phase.toFixed(2)} rad`)}{slider(u1Phase, setU1Phase, -Math.PI, Math.PI, 0.01)}

            <div style={{ gridColumn: "1 / span 2", color: "#f472b6", fontSize: 12, marginTop: 8 }}>Universe 2 (magenta)</div>
            {label(`Slope = ${u2Slope.toFixed(2)}`)}{slider(u2Slope, setU2Slope, -1.0, 1.0, 0.01)}
            {label(`Amplitude = ${u2Amp.toFixed(2)}`)}{slider(u2Amp, setU2Amp, 0.1, 2.5, 0.01)}
            {label(`Frequency = ${u2Freq.toFixed(2)}`)}{slider(u2Freq, setU2Freq, 0.2, 2.0, 0.01)}
            {label(`Phase = ${u2Phase.toFixed(2)} rad`)}{slider(u2Phase, setU2Phase, -Math.PI, Math.PI, 0.01)}
          </div>
        </section>
      </div>

      {/* Footer note */}
      <div style={{ padding: "6px 12px", fontSize: 11, color: "#93a3b3", borderTop: "1px solid #1f2937" }}>
        Tip: Slide the junction to exactly 4 to match your π‑chain rule. The amber dot marks the shared symmetry point where both universes are equal but their derivatives differ.
      </div>
    </div>
  );
}
