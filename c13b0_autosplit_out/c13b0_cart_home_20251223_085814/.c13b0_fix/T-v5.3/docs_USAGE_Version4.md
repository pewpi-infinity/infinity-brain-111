# Osprey Terminal — Usage

Commands:
- ls                : list files
- cat <file>        : print file
- write <f> <text>  : write a file
- rm <file>         : remove file
- mkdir <path>      : create a directory (virtual)
- node <code|file>  : execute JS or file
- python <code|file>: run Python (requires Pyodide to load)
- run <file>        : execute a saved JS script
- pkg list          : list available packages
- pkg install <pkg> : install a package (preinstalled offline packages)
- edit <file>       : open a simple editor in a new tab/window
- help              : print help

Natural language:
- "show files" => ls
- "open welcome.txt" => cat welcome.txt
- "install hello" => pkg install hello

Persistence:
- Files are stored in localStorage under key `osprey_fs_v5`.

Troubleshooting:
- If page shows 'loading…' for long, try private/incognito tab to bypass cache.
- Pyodide can take time on mobile; wait up to 60s for "Python engine ready." to appear.