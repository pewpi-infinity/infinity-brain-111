/* ==========================================================
   E2 — STYLE LAYER
   Injected into <script id="E2_STYLE">
   ----------------------------------------------------------
   Purpose:
   - Establish Infinity E global look
   - Responsive layout
   - Constellation-friendly dark backdrop
   - Neon pulse text rules
   - Styles for upcoming E3–E8 attachments
   ========================================================== */

(function(){
    const css = `
        body {
            background:#000;
            margin:0;
            padding:0;
            font-family: Arial, sans-serif;
            overflow:hidden;
        }

        #infinity-core h1 {
            color:#0ff;
            text-shadow:0 0 12px #0ff;
        }

        #infinity-core p {
            color:#7ff;
        }

        /* Base Panel Style for E6 */
        #inf-panel {
            position:fixed;
            bottom:0;
            left:0;
            width:100vw;
            height:38vh;
            background:rgba(0,0,0,0.85);
            backdrop-filter:blur(6px);
            border-top:2px solid #0ff;
            color:#0ff;
            padding:12px;
            display:none;
            overflow-y:auto;
            font-size:16px;
        }

        /* Future interactive nodes (E3 Engine) */
        .node {
            position:absolute;
            width:8px;
            height:8px;
            border-radius:50%;
            background:#0ff;
            box-shadow:0 0 6px #0ff;
        }

        /* Buttons for E7 Modes */
        .mode-btn {
            position:fixed;
            bottom:20px;
            right:20px;
            padding:12px 18px;
            font-size:16px;
            border:2px solid #0ff;
            border-radius:8px;
            color:#0ff;
            background:transparent;
            text-shadow:0 0 6px #0ff;
        }
        .mode-btn:active {
            transform:scale(0.96);
        }
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

})();
