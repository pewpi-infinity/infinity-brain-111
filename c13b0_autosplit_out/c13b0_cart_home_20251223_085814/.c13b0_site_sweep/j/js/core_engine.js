/* 
   Infinity OS — Core Engine
   Mode Routing, Ledger, Posting, Tokens
   ------------------------------------
   Author: Kris Watson + Infinity AI
*/

window.InfinityCore = (() => {

    // -------------------------
    // LEDGER: the Infinity brain
    // -------------------------
    const Ledger = {
        user: {
            id: null,
            passphrase: null
        },
        tokens: 0,
        conversations: [],
        posts: [],
        secrets: [],
        builderDrafts: []
    };

    // Create a user identity if missing
    function ensureUser() {
        if (!Ledger.user.id) {
            Ledger.user.id = "USR-" + Math.random().toString(36).substring(2, 12).toUpperCase();
        }
    }

    // -------------------------------------
    // TOKEN SYSTEM — earn for every action
    // -------------------------------------
    function awardTokens(amount) {
        Ledger.tokens += amount;
        InfinityUI.updateWallet(Ledger.tokens);
    }

    // -------------------------
    // MODE: Conversation
    // -------------------------
    function sendMessage(text) {
        ensureUser();

        Ledger.conversations.push({
            id: Date.now(),
            text,
            time: new Date().toISOString()
        });

        awardTokens(1); // 1 token per message

        InfinityUI.printToTerminal("You: " + text);
        InfinityAI.respond(text);
    }

    // -------------------------
    // MODE: Secret Message
    // -------------------------
    function encodeSecret(text) {
        ensureUser();

        const pass = "PW-" + Math.random().toString(36).substring(2, 10);
        const encoded = btoa(text);

        Ledger.secrets.push({
            id: Date.now(),
            passphrase: pass,
            encoded
        });

        awardTokens(5); // secrets worth more

        InfinityUI.printToTerminal(
            "Secret encoded.\nPassphrase: " + pass + "\nShare this key."
        );
    }

    // Retrieve a secret using a passphrase
    function retrieveSecret(passphrase) {
        const item = Ledger.secrets.find(s => s.passphrase === passphrase);

        if (!item) {
            InfinityUI.printToTerminal("No secret found for that passphrase.");
            return;
        }

        InfinityUI.printToTerminal("Decoded Secret: " + atob(item.encoded));
    }

    // ---------------------------------------
    // MODE: POST — Route Selection (Option C)
    // ---------------------------------------
    function openPostMenu() {
        InfinityUI.showPostSelector();
    }

    function publish(text, route) {
        ensureUser();

        // Save to ledger
        Ledger.posts.push({
            id: Date.now(),
            text,
            route,
            time: new Date().toISOString()
        });

        // Route-specific token award
        const awards = {
            "market": 25,
            "social": 15,
            "page": 10,
            "secret": 5,
            "builder": 20
        };

        awardTokens(awards[route] || 3);

        InfinityUI.printToTerminal(
            `Posted to ${route.toUpperCase()}.\nContent saved.`
        );
    }

    // ---------------------------------------
    // MODE: Builder — app/script generator
    // ---------------------------------------
    function builderStart(prompt) {
        ensureUser();

        InfinityUI.printToTerminal("Building package…");

        const draft = {
            id: Date.now(),
            input: prompt,
            result: "// code package generated…"
        };

        Ledger.builderDrafts.push(draft);
        awardTokens(50);

        InfinityUI.printToTerminal("Draft saved with 50 tokens.");
    }

    // Expose API
    return {
        sendMessage,
        encodeSecret,
        retrieveSecret,
        openPostMenu,
        publish,
        builderStart,
        _debug: () => Ledger
    };

})();
