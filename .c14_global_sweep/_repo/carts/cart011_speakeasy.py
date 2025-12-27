# cart011_speakeasy.py
"""
Cart 011: Speakeasy Module
Voice on command: synthesize any type of singer/speaker, any language (routing layer).
Purpose in Infinity:
- Give users a voice by routing text-to-speech (TTS) requests through configurable backends
- Provide a prompt library for persona styles (speaker, singer, narrator)
- Log provenance for every synthesized phrase (even if using mocked output)
- Keep it safe: no impersonation targets; purely creative/neutral voices

Capabilities:
- Backends: pyttsx3 (local), gTTS (MP3), mock (fallback)
- Styles: speaker, singer, narrator with adjustable tempo, pitch labels (meta only)
- Languages: pass-through codes (e.g., 'en', 'es', 'fr', 'de', 'ja'); backend must support it
- Artifacts: writes JSON manifests and audio file references
- Audit logging: JSONL

CLI:
  python cart011_speakeasy.py voices
  python cart011_speakeasy.py say "Hello Infinity" --style speaker --lang en --backend mock
  python cart011_speakeasy.py sing "Stars are born" --lang en --tempo 90 --backend mock
  python cart011_speakeasy.py persona add "Warm narrator" --style narrator --lang en
"""

import sys, os, json, time, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
DATA = os.path.join(ROOT, "data")
AUDIO = os.path.join(ART, "audio")
os.makedirs(LOGS, exist_ok=True); os.makedirs(ART, exist_ok=True); os.makedirs(DATA, exist_ok=True); os.makedirs(AUDIO, exist_ok=True)

AUDIT = os.path.join(LOGS, "speakeasy_audit.jsonl")
PERSONAS = os.path.join(DATA, "speakeasy_personas.json")

DEFAULT_PERSONAS = {"personas": [
    {"name": "Neutral speaker", "style": "speaker", "lang": "en", "tempo": 120, "pitch_tag": "A4=440"},
    {"name": "Warm narrator", "style": "narrator", "lang": "en", "tempo": 110, "pitch_tag": "A4=440"},
    {"name": "Light singer", "style": "singer", "lang": "en", "tempo": 90, "pitch_tag": "A4=440"}
]}

def audit(entry: dict):
    entry = dict(entry); entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f: f.write(json.dumps(entry) + "\n")

def load_personas() -> dict:
    if not os.path.exists(PERSONAS): return DEFAULT_PERSONAS.copy()
    try:
        with open(PERSONAS, "r", encoding="utf-8") as f: return json.load(f)
    except: return DEFAULT_PERSONAS.copy()

def save_personas(p: dict):
    with open(PERSONAS, "w", encoding="utf-8") as f: json.dump(p, f, indent=2)

def hash_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]

# -------- Backends (safe routing) --------
def backend_mock(text: str, lang: str, style: str, tempo: int, pitch_tag: str) -> dict:
    """
    Mock backend: writes a .txt ‘audio note’ explaining synthesis request.
    Real audio generation can be added with pyttsx3/gTTS, but keep it optional.
    """
    fname = f"mock_{hash_text(text)}.txt"
    fpath = os.path.join(AUDIO, fname)
    payload = {
        "kind": "mock-tts-note",
        "text": text,
        "lang": lang,
        "style": style,
        "tempo": tempo,
        "pitch_tag": pitch_tag
    }
    with open(fpath, "w", encoding="utf-8") as f: f.write(json.dumps(payload, indent=2))
    return {"ok": True, "file": fpath, "backend": "mock"}

def synth(text: str, lang: str, style: str, tempo: int, pitch_tag: str, backend: str) -> dict:
    if backend == "mock":
        return backend_mock(text, lang, style, tempo, pitch_tag)
    # Optional: uncomment and install libraries to enable real audio
    # elif backend == "pyttsx3":
    #     import pyttsx3
    #     engine = pyttsx3.init()
    #     engine.setProperty('rate', tempo)
    #     engine.save_to_file(text, os.path.join(AUDIO, f"pyttsx3_{hash_text(text)}.wav"))
    #     engine.runAndWait()
    #     return {"ok": True, "file": os.path.join(AUDIO, f"pyttsx3_{hash_text(text)}.wav"), "backend": "pyttsx3"}
    # elif backend == "gtts":
    #     from gtts import gTTS
    #     mp3_path = os.path.join(AUDIO, f"gtts_{hash_text(text)}.mp3")
    #     gTTS(text=text, lang=lang).save(mp3_path)
    #     return {"ok": True, "file": mp3_path, "backend": "gtts"}
    else:
        return {"ok": False, "error": f"Unknown backend: {backend}"}

def voices():
    p = load_personas()
    audit({"action": "voices"})
    print(json.dumps(p["personas"], indent=2))

def persona_add(name: str, style: str, lang: str, tempo: int = 110, pitch_tag: str = "A4=440"):
    p = load_personas()
    p["personas"].append({"name": name, "style": style, "lang": lang, "tempo": tempo, "pitch_tag": pitch_tag})
    save_personas(p)
    audit({"action": "persona.add", "name": name})
    print(json.dumps({"ok": True, "persona": name}, indent=2))

def say(text: str, style: str = "speaker", lang: str = "en", tempo: int = 110, backend: str = "mock", pitch_tag: str = "A4=440"):
    audit({"action": "say", "style": style, "lang": lang, "backend": backend})
    res = synth(text, lang, style, tempo, pitch_tag, backend)
    manifest = {
        "kind": "speakeasy-say",
        "text": text, "style": style, "lang": lang, "tempo": tempo, "pitch_tag": pitch_tag, "backend": backend, "result": res
    }
    mpath = os.path.join(ART, f"speakeasy_say_{hash_text(text)}.json")
    with open(mpath, "w", encoding="utf-8") as f: json.dump(manifest, f, indent=2)
    print(json.dumps({"ok": res.get("ok"), "artifact": mpath, "file": res.get("file")}, indent=2))

def sing(text: str, lang: str = "en", tempo: int = 90, backend: str = "mock", pitch_tag: str = "A4=440"):
    # Treat singing as a stylistic variation; leave melody to Octave modules.
    say(text, style="singer", lang=lang, tempo=tempo, backend=backend, pitch_tag=pitch_tag)

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: voices | say <text> [--style speaker|narrator|singer --lang en --tempo 110 --backend mock] | sing <text> [--lang en --tempo 90 --backend mock] | persona add <name> --style ... --lang ...")
        return
    cmd = args[0]
    if cmd == "voices":
        voices(); return
    if cmd == "persona" and len(args) >= 3 and args[1] == "add":
        name = args[2]; style="narrator"; lang="en"; tempo=110; pitch="A4=440"
        for i,a in enumerate(args):
            if a == "--style" and i+1 < len(args): style = args[i+1]
            if a == "--lang" and i+1 < len(args): lang = args[i+1]
            if a == "--tempo" and i+1 < len(args): tempo = int(args[i+1])
            if a == "--pitch" and i+1 < len(args): pitch = args[i+1]
        persona_add(name, style, lang, tempo, pitch); return
    if cmd == "say":
        text = args[1] if len(args) > 1 else "Hello"
        style="speaker"; lang="en"; tempo=110; backend="mock"; pitch="A4=440"
        for i,a in enumerate(args):
            if a == "--style" and i+1 < len(args): style = args[i+1]
            if a == "--lang" and i+1 < len(args): lang = args[i+1]
            if a == "--tempo" and i+1 < len(args): tempo = int(args[i+1])
            if a == "--backend" and i+1 < len(args): backend = args[i+1]
            if a == "--pitch" and i+1 < len(args): pitch = args[i+1]
        say(text, style, lang, tempo, backend, pitch); return
    if cmd == "sing":
        text = args[1] if len(args) > 1 else "La la la"
        lang="en"; tempo=90; backend="mock"; pitch="A4=440"
        for i,a in enumerate(args):
            if a == "--lang" and i+1 < len(args): lang = args[i+1]
            if a == "--tempo" and i+1 < len(args): tempo = int(args[i+1])
            if a == "--backend" and i+1 < len(args): backend = args[i+1]
            if a == "--pitch" and i+1 < len(args): pitch = args[i+1]
        sing(text, lang, tempo, backend, pitch); return
    print("Unknown command.")

if __name__ == "__main__":
    main()