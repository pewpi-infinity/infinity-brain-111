// Infinity_utils.js
// Core bus, logger, and storage helpers for Infinity SPA.
// Replaceable and extensible. Works with other modules below.

export const Bus = (() => {
  const subscribers = {};
  return {
    on(topic, fn) {
      (subscribers[topic] ||= []).push(fn);
    },
    emit(topic, payload) {
      (subscribers[topic] || []).forEach(fn => {
        try { fn(payload); } catch (err) { console.error(`Bus error on ${topic}:`, err); }
      });
    }
  };
})();

export const Log = (() => {
  const history = [];
  return {
    info(msg, ctx = {}) {
      const entry = { level: "info", msg, ctx, t: new Date().toISOString() };
      history.push(entry);
      console.log("[Infinity]", msg, ctx);
      Bus.emit("log", entry);
      return entry;
    },
    warn(msg, ctx = {}) {
      const entry = { level: "warn", msg, ctx, t: new Date().toISOString() };
      history.push(entry);
      console.warn("[Infinity]", msg, ctx);
      Bus.emit("log", entry);
      return entry;
    },
    getHistory() { return history.slice(-500); }
  };
})();

export const Storage = {
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  get(key, def = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
  },
  remove(key) { localStorage.removeItem(key); }
};

export function linkArtifact(path) {
  // Simple helper to resolve artifact path; in real SPA adapt to your server paths.
  return path.startsWith("artifacts/") ? path : `artifacts/${path}`;
}