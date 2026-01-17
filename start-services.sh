#!/bin/bash

# 🚀 TrustVault - Start Backend + Frontend Services
# (Smart contract should already be deployed in Ganache)

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 TrustVault - Backend + Frontend Startup${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Validate Ganache is running
echo -e "${BLUE}Step 1: Checking Ganache on port 7545...${NC}"
if ! nc -z localhost 7545 2>/dev/null; then
    echo -e "${RED}❌ Ganache is NOT running on port 7545${NC}"
    echo ""
    echo "Start Ganache in another terminal:"
    echo "  • Ganache GUI: Open Ganache Desktop app, set port to 7545"
    echo "  • Or Ganache CLI: ganache-cli --port 7545"
    echo ""
    read -p "Press Enter when Ganache is running, or Ctrl+C to exit: "
fi
echo -e "${GREEN}✅ Ganache is running on port 7545${NC}"
echo ""

# Step 2: Verify backend/.env
echo -e "${BLUE}Step 2: Checking backend/.env configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    exit 1
fi

PRIVATE_KEY=$(grep "PRIVATE_KEY=" backend/.env | cut -d'=' -f2)
CONTRACT_ADDRESS=$(grep "CONTRACT_ADDRESS=" backend/.env | cut -d'=' -f2)
RPC_URL=$(grep "RPC_URL=" backend/.env | cut -d'=' -f2)

echo "  Private Key: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo "  Contract Address: $CONTRACT_ADDRESS"
echo "  RPC URL: $RPC_URL"

# Check private key is not dummy
if [ "$PRIVATE_KEY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo -e "${YELLOW}⚠️  PRIVATE_KEY is still set to dummy value!${NC}"
    echo ""
    echo "Get your private key from Ganache:"
    echo "  1. Open Ganache GUI"
    echo "  2. Look for Account 0 (first account)"
    echo "  3. Click the 'Show Keys' button"
    echo "  4. Copy the Private Key"
    echo ""
    echo "Then update backend/.env:"
    echo "  PRIVATE_KEY=0x<paste-your-key-here>"
    echo ""
    read -p "Press Enter once you've updated PRIVATE_KEY in backend/.env: "
fi

echo -e "${GREEN}✅ backend/.env is configured${NC}"
echo ""

# Step 3: Kill old processes
echo -e "${BLUE}Step 3: Cleaning up old processes...${NC}"
pkill -f "node server.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Old processes cleaned${NC}"
echo ""

# Step 4: Start backend
echo -e "${BLUE}Step 4: Starting Backend Server on port 5001...${NC}"
cd "$PROJECT_DIR/backend"

# Launch backend in new Terminal window
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/backend' && npm start"
end tell
EOF

sleep 3
echo -e "${GREEN}✅ Backend started in new Terminal${NC}"
cd "$PROJECT_DIR"
echo ""

# Step 5: Start frontend
echo -e "${BLUE}Step 5: Starting Frontend on port 3000...${NC}"
cd "$PROJECT_DIR/frontend"

# Launch frontend in new Terminal window
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/frontend' && npm start"
end tell
EOF

sleep 2
echo -e "${GREEN}✅ Frontend started in new Terminal${NC}"
cd "$PROJECT_DIR"
echo ""

# Step 6: Verify blockchain connection
echo -e "${BLUE}Step 6: Testing Blockchain Connection...${NC}"
sleep 1

HEALTH_CHECK=$(curl -s http://localhost:5001/health 2>/dev/null || echo "")
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend still initializing...${NC}"
fi
echo ""

# Success message
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Services Started Successfully!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "New Terminal windows have been opened:"
echo -e "  ${GREEN}Backend Terminal:${NC}   Running on http://localhost:5001"
echo -e "  ${GREEN}Frontend Terminal:${NC}  Running on http://localhost:3000"
echo ""
echo "Access your application:"
echo -e "  ${GREEN}Frontend:${NC}              http://localhost:3000"
echo -e "  ${GREEN}Dashboard:${NC}             http://localhost:3000/dashboard"
echo -e "  ${GREEN}Blockchain Events:${NC}     http://localhost:3000/blockchain-events"
echo -e "  ${GREEN}Backend API:${NC}           http://localhost:5001"
echo -e "  ${GREEN}Ganache:${NC}               http://localhost:7545"
echo ""
echo "To stop services:"
echo "  • Press Ctrl+C in each Terminal window"
echo "  • Or run: pkill -f 'node\\|npm'"
echo ""
