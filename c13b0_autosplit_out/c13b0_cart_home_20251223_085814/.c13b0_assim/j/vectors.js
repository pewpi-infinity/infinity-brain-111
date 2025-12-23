cat << 'EOF' > vectors.js
// Infinity Reactor — Vector Math Module

export class Vec {
    constructor(x=0, y=0, z=0, t=0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = t; // time-vector dimension
    }

    add(v) {
        return new Vec(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.t + v.t
        );
    }

    sub(v) {
        return new Vec(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
            this.t - v.t
        );
    }

    scale(k) {
        return new Vec(
            this.x * k,
            this.y * k,
            this.z * k,
            this.t * k
        );
    }

    dot(v) {
        return this.x*v.x + this.y*v.y + this.z*v.z + this.t*v.t;
    }

    mag() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2 + this.t**2);
    }
}

// Hydrogen-shell spiral
export function quantumSpiral(a, b, theta) {
    return a * Math.exp(b * theta);
}
EOF
