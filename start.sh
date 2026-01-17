#!/bin/bash

# Simple startup script - no smart contract deployment
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 TrustVault - Starting Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Kill existing processes on ports
echo "Cleaning up existing processes..."
lsof -ti :5001 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :8501 | xargs kill -9 2>/dev/null

sleep 2

# Start Backend
echo -e "${GREEN}✓${NC} Starting Backend on port 5001..."
cd "$PROJECT_DIR/backend"
npm start > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Start Frontend
echo -e "${GREEN}✓${NC} Starting Frontend on port 3000..."
cd "$PROJECT_DIR/frontend"
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Start Deepfake (Optional)
echo -e "${GREEN}✓${NC} Starting Deepfake Detection on port 8501..."
cd "$PROJECT_DIR/deepfake"
if [ -d "venv" ]; then
  source venv/bin/activate
  streamlit run streamlit_app.py --server.port 8501 > deepfake.log 2>&1 &
  DEEPFAKE_PID=$!
  deactivate
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All Services Started!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "📍 Frontend:     http://localhost:3000"
echo "📍 Backend:      http://localhost:5001"
echo "📍 Deepfake:     http://localhost:8501"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo "  Deepfake: $DEEPFAKE_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Cleanup on exit
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID $DEEPFAKE_PID 2>/dev/null; exit 0' SIGINT

wait