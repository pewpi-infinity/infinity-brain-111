from flask import Flask, request, jsonify
import requests, os
from pathlib import Path

ELEVEN_KEY = "sk_60642d1805237d0b68f03456edfe7d5f86937d9f08b3a2f8"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # or your chosen voice ID

app = Flask(__name__)

def say(text):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {"xi-api-key": ELEVEN_KEY, "Content-Type": "application/json"}
    data = {"text": text, "model_id": "eleven_monolingual_v1"}
    resp = requests.post(url, json=data, headers=headers)
    if resp.status_code == 200:
        with open("reply.mp3", "wb") as f:
            f.write(resp.content)
        os.system("termux-media-player play reply.mp3")
    else:
        print("Error:", resp.text)

@app.route("/chat", methods=["POST"])
def chat():
    user = request.json["prompt"]
    reply = f"Hey {user}, Infinity voice is online and responding."
    say(reply)
    return jsonify({"reply": reply})
@app.route("/")
def home():
    return "Chat Voice Server is running — connection successful ✅"
@app.route("/")
def home():
    return "Chat Voice Server is running — connection successful ✅"

if __name__ == "__main__":
    import sys, socket

    # Default port
    port = 5050

    # Allow override via argument like: python chat_voice.py --port 3000
    if len(sys.argv) > 2 and sys.argv[1] in ("--port", "-p"):
        try:
            port = int(sys.argv[2])
        except ValueError:
            print("Invalid port number. Using default 5050.")
    else:
        # Auto-pick an available port if not specified
        s = socket.socket()
        s.bind(('', 0))
        port = s.getsockname()[1]
        s.close()

    print(f"Starting on port {port}...")
    app.run(host="0.0.0.0", port=port)

