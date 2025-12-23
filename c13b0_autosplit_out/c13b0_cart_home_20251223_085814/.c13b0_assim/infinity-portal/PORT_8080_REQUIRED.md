# ⚠️ PORT 8080 REQUIRED FOR GOOGLE OAUTH

## Why Port 8080?

**Google OAuth authentication only works on port 8080** because:

1. The OAuth Client ID is configured with `http://127.0.0.1:8080` as the authorized redirect URI
2. Google's OAuth system validates the exact URL match (including port)
3. Running on any other port causes authentication to fail with "redirect_uri_mismatch" errors

## All Servers Use Port 8080

Every server in the Infinity Portal repository is pre-configured to run on port 8080:

```
✅ InfinityOS/spa_server.py              → Port 8080
✅ InfinityOS/portal/rogers_paypal_demo.py → Port 8080
✅ InfinityOS/Rogers/rogers_white.py      → Port 8080
✅ InfinityOS/Rogers/rogers_white_nokeys.py → Port 8080
✅ app.py                                → Port 8080
```

## Quick Start Commands

### Start the Main SPA Server
```bash
cd ~/infinity-portal/InfinityOS
python3 spa_server.py
# Opens at http://127.0.0.1:8080
```

### Use the Startup Script
```bash
cd ~/infinity-portal
bash start_infinity.sh
# Automatically starts on port 8080
```

### Run in Background
```bash
cd ~/infinity-portal/InfinityOS
nohup python3 spa_server.py > ../infinity.log 2>&1 &
# Server runs on port 8080 in background
```

## If Port 8080 is Busy

**Stop the conflicting process:**
```bash
# Kill whatever is using port 8080
lsof -ti:8080 | xargs kill -9

# Then start your Infinity Portal server
cd ~/infinity-portal/InfinityOS
python3 spa_server.py
```

**DO NOT** try to run on a different port - it will break Google OAuth!

## Accessing from Browser

✅ **Correct:**  `http://127.0.0.1:8080`  
❌ **Wrong:**    `http://127.0.0.1:5000`  
❌ **Wrong:**    `http://127.0.0.1:8081`  
❌ **Wrong:**    `http://localhost:8080` (may work but 127.0.0.1 is configured)

## Multiple Repositories?

If you have multiple Infinity Portal repositories, they **all share the same Google OAuth configuration** on port 8080. This means:

- Only ONE can run at a time on the same machine
- All use the same Client ID: `16937806382-leqbaginj3igrhei58nsab7tb4hsb435.apps.googleusercontent.com`
- Switching between repos: stop one server, start another

## Troubleshooting

### "This site can't be reached" when trying to access
→ Server isn't running. Start it with: `cd ~/infinity-portal/InfinityOS && python3 spa_server.py`

### "redirect_uri_mismatch" error when signing in with Google
→ Server is running on wrong port. Verify it's on 8080:
```bash
lsof -i:8080
# Should show: python3 spa_server.py
```

### Port 8080 is already in use
→ Another application is using the port:
```bash
# See what's using it:
lsof -i:8080

# Kill it:
lsof -ti:8080 | xargs kill -9
```

---

**Remember:** Port 8080 is non-negotiable for Google OAuth to work across all Infinity Portal applications!
