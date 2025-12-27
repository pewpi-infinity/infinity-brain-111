// reader.js
// Reads artifacts and local storage; emits events for UI panels.

import { Bus, Log, Storage, linkArtifact } from "./Infinity_utils.js";

export const Reader = {
  async fetchArtifact(path) {
    const url = linkArtifact(path);
    Log.info("Reader: fetching artifact", { url });
    const res = await fetch(url);
    const data = await res.json();
    Bus.emit("reader/artifact", { path: url, data });
    return data;
  },
  getNotes(limit = 50) {
    const notes = Storage.get("notes", []);
    return notes.slice(-limit);
  },
  getActions(limit = 50) {
    const acts = Storage.get("actions", []);
    return acts.slice(-limit);
  }
};