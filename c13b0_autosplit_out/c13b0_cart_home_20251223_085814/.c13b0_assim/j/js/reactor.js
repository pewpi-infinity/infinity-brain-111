cat << 'EOF' > reactor.js
// Infinity Reactor — Spiral Rings Event Engine

import { quantumSpiral, Vec } from "./vectors.js";
import { HydrogenDoorway } from "./hydrogen.js";

export class InfinityReactor {
    constructor() {
        this.theta = 0;
        this.inner = 0;
        this.middle = 0;
        this.outer = 0;
        this.h = new HydrogenDoorway();
    }

    pulse() {
        this.theta += 0.03;

        this.inner = quantumSpiral(0.3, 0.11, this.theta);
        this.middle = quantumSpiral(0.5, 0.08, this.theta);
        this.outer = quantumSpiral(0.7, 0.06, this.theta);

        return {
            inner: this.inner,
            middle: this.middle,
            outer: this.outer
        };
    }

    sortVector(inputVec) {
        let cleaned = this.h.bind(inputVec);
        return cleaned;
    }
}
EOF
