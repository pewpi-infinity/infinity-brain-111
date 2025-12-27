/* ====================================================
   INFINITY OS — PAYPAL AD PANEL
==================================================== */

(function(){

    document.addEventListener("DOMContentLoaded", ()=>{

        const ad = document.createElement("div");
        ad.id = "payAd";
        ad.innerHTML = `
            <div class="title">Advertise on Infinity</div>
            <div class="sub">10 Infinity Tokens</div>
            <div class="price">$1000.00</div>

            <a href="https://www.paypal.com/paypalme/watsonkris611/1000" target="_blank">
                <button>Pay with PayPal</button>
            </a>
        `;
        document.body.appendChild(ad);

        const s = document.createElement("style");
        s.textContent = `
            #payAd {
                position:fixed; top:280px; right:20px;
                background:#000a; padding:14px;
                border:1px solid #29d9ff44;
                border-radius:12px; width:200px;
                backdrop-filter:blur(6px);
                color:#aee6ff;
                z-index:9997;
            }
            #payAd button {
                margin-top:10px; padding:8px; width:100%;
                background:#00ffa3; border-radius:10px;
                border:0; color:#003318; font-weight:bold;
            }
            #payAd .title { font-size:15px; color:#29d9ff; }
            #payAd .sub { margin-top:4px; }
            #payAd .price { margin-top:4px; color:#ffd66b; }
        `;
        document.head.appendChild(s);

    });

})();
