/* ====================================================
   INFINITY OS — MICRO-APP BUTTON BAR
==================================================== */

(function(){

    document.addEventListener("DOMContentLoaded", ()=>{

        const bar = document.createElement("div");
        bar.id = "microBar";

        const apps = [
            "Equation Lab","Music Player","Video Panel","Builder",
            "IP Login","3D Viewer","Hydrogen Port","Token Mint",
            "Infinity Value","Document Tools","Vector Sheet",
            "Quantum Tiles","PayPal Ads","Gem Analyzer",
            "Coin Scanner","Arrowhead DB","Portal Sync",
            "Infinity Ledger","AI Memory","Auto-Coder"
        ];

        bar.innerHTML = apps.map(a=>`<button>${a}</button>`).join("");

        document.body.appendChild(bar);

        const style = document.createElement("style");
        style.textContent = `
            #microBar {
                position:fixed; bottom:0; left:0; right:0;
                padding:8px; background:#000a;
                display:flex; overflow-x:auto;
                gap:6px; z-index:9998;
                backdrop-filter:blur(6px);
            }
            #microBar button {
                padding:6px 12px; border-radius:8px;
                background:#07132b; border:1px solid #29d9ff66;
                color:#cbeaff; white-space:nowrap;
            }
        `;
        document.head.appendChild(style);

    });

})();
