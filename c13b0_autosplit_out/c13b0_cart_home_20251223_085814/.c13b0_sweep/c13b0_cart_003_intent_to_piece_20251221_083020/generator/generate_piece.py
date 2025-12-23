import json, time, pathlib

intent_file = "intent/example.intent.json"
out_dir = pathlib.Path("pieces")
out_dir.mkdir(exist_ok=True)

with open(intent_file) as f:
    intent = json.load(f)

ts = time.strftime("%Y%m%d_%H%M%S")
name = f"piece_{intent['action']}_{intent['target']}_{ts}.py"
path = out_dir / name

code = f'''
# AUTO-GENERATED C13B0 PIECE
# Action: {intent["action"]}
# Target: {intent["target"]}
# Generated: {ts}

def run():
    print("Executing intent:")
    print({json.dumps(intent, indent=2)})

if __name__ == "__main__":
    run()
'''

path.write_text(code.strip())
print(f"✅ Generated piece: {path}")
