#!/bin/bash

# Chain of Custody System - Automatic Startup Script
# This script starts Backend and Frontend in separate terminal windows
# NOTE: Make sure Ganache is already running (using Ganache.app)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "Chain of Custody System - Starting..."
echo "=========================================="
echo ""
echo "Make sure Ganache is running on port 8545!"
echo ""

# Deploy smart contract
echo "1. Deploying smart contract..."
cd "$PROJECT_DIR"
npx truffle migrate --network ganache 2>/dev/null || true
sleep 2

# Start Backend in a new terminal window
echo "2. Starting Backend on port 5001..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/backend' && npm start"
end tell
EOF

sleep 3

# Start Frontend in a new terminal window
echo "3. Starting Frontend on port 3000..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/frontend' && npm start"
end tell
EOF

echo ""
echo "=========================================="
echo "All services starting!"
echo "=========================================="
echo ""
echo "Services will be available at:"
echo "  - Ganache:   http://localhost:8545 (must be running)"
echo "  - Backend:   http://localhost:5001"
echo "  - Frontend:  http://localhost:3000"
echo ""
echo "Check individual terminal windows for status."
echo "Press Ctrl+C in each window to stop."
echo ""
