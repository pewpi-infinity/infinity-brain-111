cat << 'EOF' > gameplug.js
// Game Builder Plug-in — Mario/Excitebike Style Infinity Editor

export class GamePlug {
    constructor() {
        this.tiles = [];
        this.objects = [];
    }

    addTile(x, y, type) {
        this.tiles.push({ x, y, type });
    }

    addPortal(x, y, destination) {
        this.objects.push({
            type: "hydrogen_portal",
            x, y, destination
        });
    }

    addVectorZone(x, y, width, height, vector) {
        this.objects.push({
            type: "vector_field",
            x, y, width, height, vector
        });
    }
}
EOF
