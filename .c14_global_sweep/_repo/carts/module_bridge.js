// module_bridge.js
// Bridges SPA actions to backend carts (040–043), logging every step.

import { Bus, Log } from "./Infinity_utils.js";
import { Writer } from "./writer.js";
import { Reader } from "./reader.js";

export const ModuleBridge = {
  async dnaBrick(zerosLen = 16, meta = {}) {
    Writer.writeAction("dnaBrick", { zerosLen, meta });
    Log.info("Bridge: DNA brick requested", { zerosLen });
    // Backend call is out-of-scope; we log intention and rely on artifacts being pushed server-side.
    Bus.emit("bridge/dnaBrick", { zerosLen, meta });
  },
  async dnaPacketize(brickId, text) {
    Writer.writeAction("dnaPacketize", { brickId, textLen: text.length });
    Log.info("Bridge: packetize requested", { brickId });
    Bus.emit("bridge/dnaPacketize", { brickId, text });
  },
  async shellAttach(shellName, brickId) {
    Writer.writeAction("shellAttach", { shellName, brickId });
    Log.info("Bridge: shell attach", { shellName, brickId });
    Bus.emit("bridge/shellAttach", { shellName, brickId });
  },
  async expansionPlan(profile, baseKWh, stretch = 0.0, shrink = 0.0) {
    Writer.writeAction("expansionPlan", { profile, baseKWh, stretch, shrink });
    Log.info("Bridge: expansion plan", { profile });
    Bus.emit("bridge/expansionPlan", { profile, baseKWh, stretch, shrink });
  },
  async logDiscourse(text, tags = []) {
    Writer.writeNote(text, tags);
    Log.info("Bridge: discourse logged", { tags });
    Bus.emit("bridge/discourse", { text, tags });
  },
  async fetchArtifact(path) {
    const data = await Reader.fetchArtifact(path);
    Log.info("Bridge: artifact fetched", { path });
    return data;
  }
};