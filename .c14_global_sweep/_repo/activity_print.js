// activity_print.js
// Prints what the system is doing; subscribes to bus and renders to console/ui.

import { Bus, Log } from "./Infinity_utils.js";

export const ActivityPrint = {
  start() {
    Bus.on("log", entry => {
      // Could render to a UI terminal; for now console is loud.
      console.log("[Terminal]", entry.level, entry.msg, entry.ctx);
    });
    Bus.on("writer/action", entry => {
      console.log("[Action]", entry.action, entry.meta);
    });
    Bus.on("writer/note", entry => {
      console.log("[Note]", entry.text, entry.tags);
    });
    Bus.on("reader/artifact", payload => {
      console.log("[Artifact]", payload.path, payload.data?.summary || payload.data);
    });
    Log.info("ActivityPrint: started");
  }
};