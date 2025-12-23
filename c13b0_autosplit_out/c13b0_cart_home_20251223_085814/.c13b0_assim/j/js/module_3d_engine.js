/* ====================================================
   INFINITY OS — 3D VECTOR PANEL ENGINE
==================================================== */

(function(){

    document.addEventListener("DOMContentLoaded", ()=>{

        const panel = document.createElement("div");
        panel.id = "vec3Box";
        panel.innerHTML = `
            <div id="cube">
                <div class="face f1"></div>
                <div class="face f2"></div>
                <div class="face f3"></div>
                <div class="face f4"></div>
                <div class="face f5"></div>
                <div class="face f6"></div>
            </div>
        `;
        document.body.appendChild(panel);

        const s = document.createElement("style");
        s.textContent = `
            #vec3Box {
                width:180px; height:180px;
                position:fixed; top:80px; right:20px;
                perspective:600px; z-index:9997;
            }
            #cube {
                width:100%; height:100%; position:relative;
                transform-style:preserve-3d;
                animation:spin 10s linear infinite;
            }
            .face {
                position:absolute; width:100%; height:100%;
                border:1px solid #29d9ff88;
                background:rgba(41,217,255,0.05);
            }
            .f1 { transform:rotateY(0deg) translateZ(90px); }
            .f2 { transform:rotateY(90deg) translateZ(90px); }
            .f3 { transform:rotateY(180deg) translateZ(90px); }
            .f4 { transform:rotateY(270deg) translateZ(90px); }
            .f5 { transform:rotateX(90deg) translateZ(90px); }
            .f6 { transform:rotateX(-90deg) translateZ(90px); }

            @keyframes spin {
                from { transform:rotateX(0deg) rotateY(0deg); }
                to { transform:rotateX(360deg) rotateY(360deg); }
            }
        `;
        document.head.appendChild(s);

    });

})();
