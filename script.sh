PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "Chain of Custody System - Starting..."
echo "=========================================="
echo ""
echo "Make sure Ganache is running on port 7545!"
echo ""

# Deploy smart contract and update Python files with new address
echo "1. Deploying smart contract and updating config..."
cd "$PROJECT_DIR"
bash "$PROJECT_DIR/deploy_and_update.sh"
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
echo "  - Ganache:   http://localhost:7545 (must be running)"
echo "  - Backend:   http://localhost:5001"
echo "  - Frontend:  http://localhost:3000"
echo ""
echo "Check individual terminal windows for status."
echo "Press Ctrl+C in each window to stop."
echo ""
