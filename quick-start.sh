#!/bin/bash

# Quick Start Script - Just Frontend & Backend (No Ganache requirement)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TrustVault - Quick Start${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Install dependencies if needed
echo -e "${GREEN}✓${NC} Checking dependencies..."

if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$PROJECT_DIR/backend"
    npm install
    cd "$PROJECT_DIR"
fi

if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend"
    npm install
    cd "$PROJECT_DIR"
fi

echo -e "${GREEN}✓${NC} Dependencies ready"
echo ""

# Step 2: Start Backend
echo -e "${GREEN}✓${NC} Starting Backend on port 5001..."
cd "$PROJECT_DIR/backend"
npm start &
BACKEND_PID=$!
cd "$PROJECT_DIR"
sleep 3

# Step 3: Start Frontend
echo -e "${GREEN}✓${NC} Starting Frontend on port 3000..."
cd "$PROJECT_DIR/frontend"
npm start &
FRONTEND_PID=$!
cd "$PROJECT_DIR"
sleep 8

# Step 4: Open Chrome
echo -e "${GREEN}✓${NC} Opening Chrome..."
sleep 2
open -a "Google Chrome" "http://localhost:3000"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Services Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5001"
echo "Activity Log: http://localhost:3000/activity-log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
