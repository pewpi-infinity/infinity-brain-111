// writer.js
// Writes actions and notes to the bus and stores them for provenance.

import { Bus, Log, Storage } from "./Infinity_utils.js";

export const Writer = {
  writeNote(text, tags = []) {
    const entry = { text, tags, t: new Date().toISOString() };
    const notes = Storage.get("notes", []);
    notes.push(entry);
    Storage.set("notes", notes);
    Log.info("Writer: note saved", { tags, length: text.length });
    Bus.emit("writer/note", entry);
    return entry;
  },
  writeAction(action, meta = {}) {
    const entry = { action, meta, t: new Date().toISOString() };
    const acts = Storage.get("actions", []);
    acts.push(entry);
    Storage.set("actions", acts);
    Log.info("Writer: action recorded", { action });
    Bus.emit("writer/action", entry);
    return entry;
  }
};