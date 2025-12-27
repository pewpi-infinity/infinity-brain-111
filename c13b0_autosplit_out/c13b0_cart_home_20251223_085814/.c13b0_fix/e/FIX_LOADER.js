(function() {
    const modules = [
        ["E2_STYLE", "E2_STYLE.js"],
        ["E3_ENGINE", "E3_ENGINE.js"],
        ["E4_INTELLIGENCE", "E4_INTELLIGENCE.js"],
        ["E5_SCRAPER", "E5_SCRAPER.js"],
        ["E6_PANEL", "E6_PANEL.js"],
        ["E7_MODES", "E7_MODES.js"],
        ["E8_EXPANSION", "E8_EXPANSION.js"]
    ];

    for (const [id, file] of modules) {
        const tag = document.getElementById(id);
        if (tag && !tag.src) {
            tag.src = file;
            console.log("Loaded:", file);
        }
    }
})();
