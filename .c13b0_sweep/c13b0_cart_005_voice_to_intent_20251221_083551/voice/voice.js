const log = document.getElementById("log");

function emit(obj) {
  log.textContent += JSON.stringify(obj, null, 2) + "\n\n";
  window.lastIntent = obj;
}

function start() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    log.textContent += "❌ Speech API not supported\n";
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = false;

  rec.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();

    const intent = {
      action: "unknown",
      target: "unknown",
      raw: text,
      timestamp: new Date().toISOString()
    };

    if (text.includes("add")) intent.action = "add";
    if (text.includes("chat")) intent.target = "chat";
    if (text.includes("feed")) intent.target = "feed";
    if (text.includes("capture")) intent.action = "capture";

    emit(intent);
  };

  rec.start();
  log.textContent += "🎤 listening…\n";
}
