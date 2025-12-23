// -------------------------------------------------------
//  Infinity OS — Core Writer Engine
//  (C2 Module for /j/)
// -------------------------------------------------------

window.INF = window.INF || {};

INF.Writer = {

    // Local shadow DB (temporary)
    db: {
        logs: [],
        tokens: 0,
        mode: "normal"
    },

    // Save a conversation line
    saveLog(text, type="user") {
        const entry = {
            text,
            type,
            timestamp: Date.now()
        };
        this.db.logs.push(entry);
        console.log("Saved:", entry);
        return entry;
    },

    // Retrieve all logs
    getLogs() {
        return this.db.logs;
    },

    // Add tokens
    addTokens(amount) {
        this.db.tokens += amount;
        console.log("Tokens:", this.db.tokens);
        return this.db.tokens;
    },

    // Get token count
    getTokens() {
        return this.db.tokens;
    },

    // Switch modes (conversate, secret, builder)
    setMode(mode) {
        this.db.mode = mode;
        console.log("Mode set to:", mode);
        return mode;
    },

    // Get mode
    getMode() {
        return this.db.mode;
    },

    // --- Future backend tie-in ---
    // sendToServer(payload) {
    //     return fetch("/api/write", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload)
    //     });
    // }
};

// Expose globally
window.CoreWriter = INF.Writer;

console.log("Core Writer Loaded");
