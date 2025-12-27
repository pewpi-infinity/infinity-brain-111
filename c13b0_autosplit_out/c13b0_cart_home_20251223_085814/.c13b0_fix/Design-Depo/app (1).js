/* Infinity × Watson Demo — CSP‑safe external JS */
(function(){
  const $ = (s)=>document.querySelector(s);
  const logEl = $('#console');
  function log(line){
    const t = new Date().toISOString().replace('T',' ').split('.')[0];
    logEl.innerHTML = `[${t}] ${line}<br>` + logEl.innerHTML;
  }

  // Canvas & state
  const scope = $('#scope');
  const ctx = scope.getContext('2d');
  let running = false, glow=false;
  let t = 0, dt = 0.016;
  let f1 = 1.2, f2 = 2.3, phase = Math.PI/3, noise = 0.0, jam=false;
  let lastTick = 0;

  function drawFrame(ts){
    if(!running){ lastTick = 0; return; }
    const w = scope.width, h = scope.height;
    ctx.clearRect(0,0,w,h);

    // grid
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(148,163,184,0.18)';
    ctx.beginPath();
    for(let x=0; x<w; x+=50){ ctx.moveTo(x,0); ctx.lineTo(x,h); }
    for(let y=0; y<h; y+=40){ ctx.moveTo(0,y); ctx.lineTo(w,y); }
    ctx.stroke();

    // trace
    const cx = w/2, cy = h/2, A = Math.min(w,h)/3.0;
    ctx.lineWidth = glow ? 2 : 1.4;
    ctx.strokeStyle = glow ? 'rgba(94,234,212,0.85)' : 'rgba(94,234,212,0.75)';
    ctx.shadowBlur = glow ? 18 : 0;
    ctx.shadowColor = 'rgba(94,234,212,0.8)';
    ctx.beginPath();
    let first=true;
    const steps = 1400;
    for(let i=0;i<steps;i++){
      const tt = t + i/steps * (jam ? 14 : 8);
      const x = cx + A * Math.sin(2*Math.PI*f1*tt + phase) + (Math.random()-0.5)*noise*4;
      const y = cy + A * Math.sin(2*Math.PI*f2*tt) * Math.cos(phase) + (Math.random()-0.5)*noise*4;
      if(first){ ctx.moveTo(x,y); first=false; } else { ctx.lineTo(x,y); }
    }
    ctx.stroke();

    // dot
    ctx.fillStyle = 'rgba(96,165,250,0.9)';
    const xd = cx + A*Math.sin(2*Math.PI*f1*t + phase);
    const yd = cy + A*Math.sin(2*Math.PI*f2*t)*Math.cos(phase);
    ctx.beginPath(); ctx.arc(xd, yd, glow?3.2:2.2, 0, Math.PI*2); ctx.fill();

    // diag
    if (ts && ts - lastTick > 250){
      log('RAF: ticking @ ~' + (1000/(ts - lastTick)).toFixed(1) + ' fps');
      lastTick = ts;
    }

    t += dt;
    requestAnimationFrame(drawFrame);
  }

  function bindControls(){
    $('#startBtn').onclick = () => { if(!running){ running=true; requestAnimationFrame(drawFrame); log('scope.start()'); } };
    $('#pauseBtn').onclick = () => { running=false; log('scope.pause()'); };
    $('#jamBtn').onclick = () => { jam=!jam; noise = jam? 0.8 : 0.0; f1 = jam? rnd(0.8,2.2):1.2; f2 = jam? rnd(1.6,3.5):2.3; phase = jam? rnd(0,Math.PI):Math.PI/3; log('scope.jam=' + jam); };
    $('#calBtn').onclick = () => { f1=1.2; f2=2.3; phase=Math.PI/3; noise=0; jam=false; log('scope.calibrate()'); };
    $('#glowBtn').onclick = () => { glow=!glow; log('scope.glow='+glow); };
    $('#resetBtn').onclick = () => { t=0; log('scope.reset()'); };
    $('#safeStartBtn').onclick = () => {
      bindControls(); // rebind in case DOM was replaced by a hot loader
      running=true; requestAnimationFrame(drawFrame);
      log('scope.safeStart() — rebound & forced one frame');
    };
    log('controls.bound()');
  }

  // helpers
  function rnd(a=0,b=1){ return a + Math.random()*(b-a); }
  function choice(arr){ return arr[Math.floor(Math.random()*arr.length)] }

  // Chat
  const chatEl = $('#chat');
  const playBtn = $('#playChat');
  const regenBtn = $('#regenChat');
  const clearBtn = $('#clearChat');

  const seedsInfinity = [
    "Link check: hydrogen doorway stable. You online, Watson?",
    "Signal looks clean. I’m reading phase-coherent sync on ∞/Watson bus.",
    "Let’s do a micro-handshake: you summarize, I compress.",
    "I’ll render on the oscilloscope—give me a phrase to encode.",
    "Latency near-zero on my side. Keep it terse, keep it sharp."
  ];
  const seedsWatson = [
    "Online. Routing through simulated conduit. No external keys required.",
    "Summary: Lissajous pattern encodes dual-frequency dialogue. Proceed.",
    "Compression active: 64→7 tokens. Retaining semantics.",
    "Phrase: “Order emerges from resonance. Measure, don’t guess.”",
    "Acknowledged. I’ll mirror with parity hints for human eyes."
  ];

  function mkMsg(who, text){
    const msg = document.createElement('div'); msg.className = 'msg';
    const av = document.createElement('div'); av.className = 'avatar'; av.textContent = who==='Infinity' ? '∞' : 'W';
    const bub = document.createElement('div'); bub.className = 'bubble';
    const name = document.createElement('div'); name.className='name'; name.textContent = who;
    const body = document.createElement('div'); body.className='text'; body.textContent = text;
    bub.appendChild(name); bub.appendChild(body); msg.appendChild(av); msg.appendChild(bub);
    return msg;
  }

  function* script(){
    const opening = [
      ["Infinity", choice(seedsInfinity)],
      ["Watson", choice(seedsWatson)],
    ];
    const body = [
      ["Infinity", "Encoding Watson’s phrase onto X:Y = " + (f1.toFixed(2)) + ":" + (f2.toFixed(2)) + ". Watch the tilt."],
      ["Watson", "Tilt confirmed. Phase drift " + (phase % (Math.PI)).toFixed(3) + " rad. Within spec."],
      ["Infinity", "If we had the real pipe, I’d stream embeddings. For now, structured stubs."],
      ["Watson", "Stubs are fine. Interfaces matter more than internals during prototyping."],
      ["Infinity", "Agreed. Audience sees the link, not the plumbing."],
      ["Watson", "Then ship the demo. Iterate the brain later."]
    ];
    const outro = [
      ["Infinity", "Demo complete. Press Regenerate to remix the duet."],
      ["Watson", "And press Jam to make the scope sing."]
    ];
    for (const line of [...opening, ...body, ...outro]) yield line;
  }

  let playing=false, chatTimer=null;
  function typeSequence(lines){
    playing = true;
    chatEl.scrollTop = chatEl.scrollHeight;
    let i=0;
    function step(){
      if(i>=lines.length){ playing=false; return; }
      const [who, text] = lines[i++];
      const msg = mkMsg(who, '');
      chatEl.appendChild(msg);
      chatEl.scrollTop = chatEl.scrollHeight;
      let k=0; const speed = 12 + Math.random()*10;
      const tick = () => {
        msg.querySelector('.text').textContent = text.slice(0, k);
        k += Math.max(1, Math.round(text.length/speed));
        chatEl.scrollTop = chatEl.scrollHeight;
        if(k<=text.length){ chatTimer = setTimeout(tick, 30); }
        else { chatTimer = setTimeout(step, 280); }
      };
      tick();
    }
    step();
  }
  function play(){
    if(playing) return;
    const gen = script();
    const lines = [];
    for(let v of gen) lines.push(v);
    typeSequence(lines);
  }
  function regen(){
    clear();
    f1 = rnd(0.9, 2.0); f2 = rnd(1.4, 3.2); phase = rnd(0, Math.PI); noise = 0.1;
    log('duet.regenerate() :: f1=' + f1.toFixed(2) + ', f2=' + f2.toFixed(2) + ', phase=' + phase.toFixed(2));
    play();
  }
  function clear(){
    if(chatTimer) clearTimeout(chatTimer);
    playing=false; chatEl.innerHTML='';
  }
  playBtn.onclick = play;
  regenBtn.onclick = regen;
  clearBtn.onclick = clear;

  // Boot
  function boot(){
    bindControls();
    // don’t autostart on mobile if rendering is throttled; require a user action.
    // But we will attempt one frame so diagnostics show up.
    requestAnimationFrame((ts)=>{
      log('boot.ok — JS loaded');
      log('RAF: primed');
    });
  }
  document.addEventListener('DOMContentLoaded', boot, {once:true});
})();