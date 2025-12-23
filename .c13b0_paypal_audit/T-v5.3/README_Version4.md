# Osprey Terminal v5.3

Osprey is a browser-based terminal environment inspired by Termux, designed to run on phones and desktops. It includes:
- Virtual filesystem persisted to localStorage
- JS execution and Python (Pyodide) runtime
- Natural-language conduit (Rogers + IntelligenceCore)
- A lightweight package manager and core tools
- Visible debugger/status for mobile

Quick start:
1. Create a new GitHub repo and add these files.
2. Serve with GitHub Pages or open index.html in a browser.
3. Wait up to 60s for Pyodide to load on mobile; status bar shows progress.

Try commands:
- write hello.txt Hello world
- ls
- cat hello.txt
- node console.log("hi")
- python print(2+2)
- pkg list
- edit hello.txt

See docs/USAGE.md for details.