/* 
   Infinity Octave OS – Token Engine (C3)
   --------------------------------------
   - Generates 1 token every 30 minutes of activity
   - Tracks earned tokens
   - Tracks spent tokens
   - Tracks last-earn timestamp
   - Hard cap: 48 free tokens per day
   - CoreWriter connection point
*/

window.TokenEngine = {

    dailyCap: 48,
    rewardMinutes: 30,

    state: {
        earnedToday: 0,
        spent: 0,
        lastEarn: null,
        balance: 0
    },

    init() {
        this.load();
        this.startCycle();
    },

    load() {
        const raw = localStorage.getItem("octave_tokens");
        if (raw) {
            this.state = JSON.parse(raw);
        }
    },

    save() {
        localStorage.setItem("octave_tokens", JSON.stringify(this.state));
    },

    canEarn() {
        return this.state.earnedToday < this.dailyCap;
    },

    minutesSinceLastEarn() {
        if (!this.state.lastEarn) return 9999;
        const then = new Date(this.state.lastEarn).getTime();
        const now = Date.now();
        return (now - then) / 60000;
    },

    tryEarn() {
        if (!this.canEarn()) return false;
        if (this.minutesSinceLastEarn() < this.rewardMinutes) return false;

        this.state.balance += 1;
        this.state.earnedToday += 1;
        this.state.lastEarn = new Date().toISOString();
        this.save();

        if (window.CoreWriter) {
            CoreWriter.addTokens(1);
            CoreWriter.saveLog("Token +1 earned", "system");
        }

        return true;
    },

    startCycle() {
        setInterval(() => {
            this.tryEarn();
            this.updateUI();
        }, 60000); // check every minute
    },

    spend(num) {
        if (this.state.balance < num) return false;

        this.state.balance -= num;
        this.state.spent += num;
        this.save();

        if (window.CoreWriter) {
            CoreWriter.saveLog(`Token spent: -${num}`, "system");
        }

        return true;
    },

    getBalance() {
        return this.state.balance;
    },

    updateUI() {
        const el = document.getElementById("tokenDisplay");
        if (el) el.textContent = `∞ ${this.state.balance}`;
    }
};

// Startup
setTimeout(() => TokenEngine.init(), 300);
