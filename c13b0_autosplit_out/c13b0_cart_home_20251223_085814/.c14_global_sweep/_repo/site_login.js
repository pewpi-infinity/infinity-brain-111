// site_login.js
// Minimal login/session manager tied to everything you do.
// Integrates with Ai_watcher_login (cart025) conceptually via Bus events.

import { Bus, Log, Storage } from "./Infinity_utils.js";

export const SiteLogin = (() => {
  function startSession(user) {
    const sess = { user, start: new Date().toISOString(), end: null };
    Storage.set("session", sess);
    Log.info("Login: session started", { user });
    Bus.emit("session/start", sess);
    return sess;
  }
  function endSession() {
    const sess = Storage.get("session", null);
    if (sess) {
      sess.end = new Date().toISOString();
      Storage.set("session", sess);
      Log.info("Login: session ended", { user: sess.user });
      Bus.emit("session/end", sess);
    }
    return sess;
  }
  function current() {
    return Storage.get("session", null);
  }
  return { startSession, endSession, current };
})();