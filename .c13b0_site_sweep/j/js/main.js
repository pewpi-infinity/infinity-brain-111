cat << 'EOF' > main.js
// Main entry — tie everything together

import { PortalModule } from "./portal.js";

const portal = new PortalModule();

function loop() {
    let pulse = portal.tick();

    document.getElementById("inner").style.width = pulse.inner * 200 + "px";
    document.getElementById("middle").style.width = pulse.middle * 200 + "px";
    document.getElementById("outer").style.width = pulse.outer * 200 + "px";

    requestAnimationFrame(loop);
}

loop();
EOF
