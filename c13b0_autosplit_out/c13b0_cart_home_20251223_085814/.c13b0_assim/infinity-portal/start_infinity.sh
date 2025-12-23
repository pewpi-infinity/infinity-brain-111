#!/bin/bash
# Infinity Portal Startup Script
# This script starts the Infinity Portal SPA server on port 8080

set -e

echo "🚀 Starting Infinity Portal..."
echo "================================"

# Navigate to the repository directory
cd "$(dirname "$0")"

# Check and install dependencies
echo "📦 Checking dependencies..."
python3 -m pip install --quiet --upgrade pip 2>/dev/null || true
python3 -m pip install --quiet flask flask-cors requests beautifulsoup4 lxml 2>/dev/null || true

# Kill any existing process on port 8080
echo "🔍 Checking port 8080..."
if lsof -ti:8080 >/dev/null 2>&1; then
    echo "⚠️  Port 8080 is in use. Stopping existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start the server
echo "🌐 Starting server on http://127.0.0.1:8080"
echo "================================"
echo ""
echo "✅ Server is running!"
echo "📱 Open in browser: http://127.0.0.1:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the server (this will keep running)
cd InfinityOS
python3 spa_server.py
