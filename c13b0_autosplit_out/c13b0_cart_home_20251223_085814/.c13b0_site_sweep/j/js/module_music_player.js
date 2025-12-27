(function(){

document.addEventListener("DOMContentLoaded", ()=> {

  const mp = document.createElement("div");
  mp.id = "musicBox";
  mp.innerHTML = `
    <div class="mp-header">🎵 Music</div>
    <audio id="mp-audio" controls></audio>
    <input type="file" id="mp-upload" accept="audio/*" multiple />
  `;
  document.body.appendChild(mp);

  const audio = mp.querySelector("#mp-audio");
  const upload = mp.querySelector("#mp-upload");

  upload.addEventListener("change", () => {
    const f = upload.files[0];
    if (!f) return;
    audio.src = URL.createObjectURL(f);
    audio.play();
  });

  // STYLE
  const s = document.createElement("style");
  s.textContent = `
    #musicBox {
      position:fixed; bottom:20px; left:20px;
      width:220px; background:#0008;
      border:1px solid #29d9ff88;
      padding:10px; border-radius:12px;
      backdrop-filter:blur(6px);
      z-index:9999; color:#89d8ff;
    }
    .mp-header { font-weight:700; margin-bottom:8px; }
    audio { width:100%; }
  `;
  document.head.appendChild(s);
});

})();
