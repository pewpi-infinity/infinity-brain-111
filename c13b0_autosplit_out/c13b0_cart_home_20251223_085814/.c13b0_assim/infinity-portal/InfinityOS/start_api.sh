#!/bin/bash
# Infinity Portal API Server Startup Script
# Starts the FastAPI backend on port 8000

echo "========================================"
echo "🚀 Infinity Portal API Backend Startup"
echo "========================================"

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Installing..."
    pkg install python -y || sudo apt-get install python3 -y || brew install python3
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
pip install -r api_requirements.txt

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use"
    echo "🔧 Stopping existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the API server
echo "🚀 Starting Infinity Portal API on port 8000..."
echo ""
python3 api_server.py
