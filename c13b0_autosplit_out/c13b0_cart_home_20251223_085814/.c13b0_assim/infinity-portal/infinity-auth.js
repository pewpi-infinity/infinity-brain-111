(function () {
  const STORAGE_KEY = "infinityUser";   // the name we'll use everywhere
  const api = {
    getUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    setUser(userObj) { localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj)); },
    require(targetEl) {
      const user = this.getUser();
      if (!user) { if (targetEl) targetEl.textContent = "Guest (not signed in)"; return null; }
      if (targetEl) targetEl.textContent = user.name || user.email || "Infinity user";
      return user;
    }
  };
  window.infinityAuth = api;
})();