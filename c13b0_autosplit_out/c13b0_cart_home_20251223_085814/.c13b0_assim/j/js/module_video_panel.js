(function(){

document.addEventListener("DOMContentLoaded", ()=> {
  const vp = document.createElement("div");
  vp.id = "videoPanel";
  vp.innerHTML = `
    <div class="vp-header">📺 Video</div>
    <video id="vp-video" controls></video>
    <input type="file" id="vp-upload" accept="video/*" />
  `;
  document.body.appendChild(vp);

  const v = vp.querySelector("#vp-video");
  const up = vp.querySelector("#vp-upload");

  up.addEventListener("change", ()=>{
    const f = up.files[0];
    if (!f) return;
    v.src = URL.createObjectURL(f);
    v.play();
  });

  // style
  const s = document.createElement("style");
  s.textContent = `
    #videoPanel {
      position:fixed; bottom:20px; right:20px;
      width:240px; background:#0008;
      border:1px solid #29d9ff88;
      padding:10px; border-radius:12px;
      backdrop-filter:blur(6px);
      z-index:9999; color:#89d8ff;
    }
    .vp-header { font-weight:700; margin-bottom:8px; }
    video { width:100%; border-radius:8px; }
  `;
  document.head.appendChild(s);
});

})();
