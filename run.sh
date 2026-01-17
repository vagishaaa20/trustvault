#!/bin/bash

# ========================================
# TRUSTVAULT - Master Startup & Deployment Script
# Combines: script.sh, deploy_and_update.sh, and start_all_services.sh
# ========================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$PROJECT_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# FUNCTIONS
# ========================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

cleanup() {
    print_header "Shutting Down Services"
    echo "Killing all background processes..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_step "Backend stopped (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$DEEPFAKE_PID" ]; then
        kill $DEEPFAKE_PID 2>/dev/null
        print_step "Deepfake detection service stopped (PID: $DEEPFAKE_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_step "Frontend stopped (PID: $FRONTEND_PID)"
    fi
    
    print_step "All services stopped"
    exit 0
}

# ========================================
# MAIN SCRIPT
# ========================================

print_header "TrustVault - Chain of Custody System"
echo "Master Startup & Deployment Script"
echo ""

# ========================================
# STEP 1: CONTRACT DEPLOYMENT & UPDATE
# ========================================

print_header "STEP 1: Deploying Smart Contract"

echo "Checking prerequisites..."

# Check if Ganache is running
if ! nc -z localhost 7545 2>/dev/null; then
    print_warning "Ganache is not running on port 7545"
    echo "Please start Ganache before continuing (port 7545 required)"
    read -p "Press Enter once Ganache is running, or Ctrl+C to exit: "
fi

cd "$PROJECT_DIR"

# Use existing contract address or deploy new one
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    EXISTING_ADDRESS=$(grep "CONTRACT_ADDRESS=" "$PROJECT_DIR/backend/.env" | cut -d'=' -f2)
    if [ ! -z "$EXISTING_ADDRESS" ] && [ "$EXISTING_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then
        CONTRACT_ADDRESS="$EXISTING_ADDRESS"
        print_step "Using existing contract at: $CONTRACT_ADDRESS"
    fi
fi

# If no contract address, try to deploy (skip if truffle fails)
if [ -z "$CONTRACT_ADDRESS" ] || [ "$CONTRACT_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    print_step "Deploying smart contract to Ganache..."
    
    # Try truffle deployment (may fail due to Node.js compatibility)
    DEPLOY_OUTPUT=$(npx truffle migrate --network ganache-gui 2>&1 || echo "Truffle deployment skipped")
    
    # Extract contract address from deployment output
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contract address:" | tail -1 | grep -oE '0x[a-fA-F0-9]+')
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        # Fallback: use a default contract address (user must deploy manually if needed)
        print_warning "Could not deploy contract automatically"
        print_warning "Make sure to deploy the contract manually or ensure it exists in your .env"
        CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000"
    else
        print_step "Contract deployed at: $CONTRACT_ADDRESS"
    fi
fi

# Update Python scripts if we have a valid contract address
if [ "$CONTRACT_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then
    print_step "Updating Python scripts with contract address..."
    
    # Update insert.py
    if [ -f "$PROJECT_DIR/insert.py" ]; then
        sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/insert.py"
        print_step "Updated insert.py"
    fi

    # Update verifyBlock.py
    if [ -f "$PROJECT_DIR/verifyBlock.py" ]; then
        sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/verifyBlock.py"
        print_step "Updated verifyBlock.py"
    fi

    # Update queryEvidence.py
    if [ -f "$PROJECT_DIR/queryEvidence.py" ]; then
        sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/queryEvidence.py"
        print_step "Updated queryEvidence.py"
    fi

    print_step "All Python scripts updated with contract address: $CONTRACT_ADDRESS"
fi

# ========================================


# STEP 1B: Setup Blockchain Event Logging
# ========================================

print_header "STEP 1B: Setting Up Blockchain Event Logging"

# Check if .env exists, if not create from template
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    print_step "Creating .env file for blockchain configuration..."
    cat > "$PROJECT_DIR/backend/.env" << EOF
# Blockchain Configuration
CONTRACT_ADDRESS=$CONTRACT_ADDRESS
RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Google OAuth (set these with your actual values)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Server
NODE_ENV=development
PORT=5001
EOF
    print_step "Created .env file at $PROJECT_DIR/backend/.env"
    print_warning "IMPORTANT: Update .env with your:"
    print_warning "  - PRIVATE_KEY (Ganache wallet private key)"
    print_warning "  - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
else
    # Update CONTRACT_ADDRESS in existing .env
    if grep -q "CONTRACT_ADDRESS=" "$PROJECT_DIR/backend/.env"; then
        sed -i '' "s|CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDRESS|g" "$PROJECT_DIR/backend/.env"
        print_step "Updated CONTRACT_ADDRESS in .env to: $CONTRACT_ADDRESS"
    fi
fi

print_step "Blockchain event logging configured"

print_header "STEP 2: Installing Dependencies"

# Check and install Node modules for backend
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
    print_step "Installing backend dependencies..."
    cd "$PROJECT_DIR/backend"
    npm install
    cd "$PROJECT_DIR"
    print_step "Backend dependencies installed"
else
    print_step "Backend dependencies already installed"
fi

# Install blockchain event logging dependencies
print_step "Installing blockchain event logging dependencies..."
cd "$PROJECT_DIR/backend"
npm install ethers@5.7.2 google-auth-library@9.11.0 --save
cd "$PROJECT_DIR"
print_step "Blockchain event logging dependencies installed"

# Check and install Node modules for frontend
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    print_step "Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend"
    npm install
    cd "$PROJECT_DIR"
    print_step "Frontend dependencies installed"
else
    print_step "Frontend dependencies already installed"
fi

# Check and install Python dependencies for deepfake
print_step "Checking Python dependencies for deepfake service..."
cd "$PROJECT_DIR/deepfake"

# Create or use existing virtual environment with Python 3.10 for TensorFlow compatibility
if [ ! -d "venv" ]; then
    if command -v python3.10 &> /dev/null; then
        python3.10 -m venv venv
        print_step "Created Python 3.10 virtual environment"
    else
        python3 -m venv venv
        print_step "Created Python 3 virtual environment"
    fi
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
python3 -m pip install --upgrade pip -q
python3 -m pip install -r requirements_simple.txt -q
deactivate
cd "$PROJECT_DIR"
print_step "Python dependencies verified"

# ========================================
# STEP 3: START ALL SERVICES
# ========================================

print_header "STEP 3: Starting All Services in New Terminal Windows"

# Start backend server in new Terminal window
print_step "Launching backend server on port 5001 (new Terminal)..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/backend' && npm start"
end tell
EOF
sleep 3

# Start frontend (React) in new Terminal window
print_step "Launching frontend application on port 3000 (new Terminal)..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_DIR/frontend' && npm start"
end tell
EOF
sleep 3

print_step "Services launching in separate Terminal windows..."
sleep 3

# ========================================
# STEP 4: WAIT FOR SERVICES TO BE READY
# ========================================

print_step "Waiting for services to fully initialize..."

# Check backend health
BACKEND_READY=0
for i in {1..30}; do
    if curl -s http://localhost:5001/health 2>/dev/null | grep -q "ok"; then
        BACKEND_READY=1
        print_step "Backend is ready"
        break
    fi
    echo -ne "."
    sleep 1
done

if [ $BACKEND_READY -eq 0 ]; then
    print_warning "Backend may still be initializing, proceeding anyway..."
fi

# Wait for frontend to compile (longer wait needed)
print_step "Waiting for frontend to compile (this may take 10-15 seconds)..."
sleep 8

# ========================================
# STEP 5: OPEN IN CHROME
# ========================================

print_step "Opening website in Chrome..."
open -a "Google Chrome" "http://localhost:3000" 2>/dev/null || {
    print_warning "Chrome not found. Opening with default browser..."
    open "http://localhost:3000"
}
sleep 1

# ========================================
# STEP 6: BLOCKCHAIN EVENT LOGGING STATUS
# ========================================

print_header "🚀 All Services Started Successfully"

echo ""
echo -e "${GREEN}✓ Services are running in separate Terminal windows:${NC}"
echo ""
echo -e "  ${BLUE}Frontend Application${NC}       http://localhost:3000"
echo -e "  ${BLUE}Backend API${NC}                http://localhost:5001"
echo -e "  ${BLUE}Ganache (Blockchain)${NC}       http://localhost:7545"
echo ""

echo -e "${GREEN}✓ Frontend Routes Available:${NC}"
echo ""
echo "  / - Home Page"
echo "  /login - Google OAuth Login"
echo "  /approach - System Approach"
echo "  /add-evidence - Upload Evidence"
echo "  /verify-evidence - Verify Evidence"
echo "  /view-evidence - View Evidence"
echo "  /deepfake-detection - Deepfake Detection"
echo "  /dashboard - Evidence Dashboard"
echo "  /blockchain-events - Blockchain Event Log"
echo ""

echo -e "${GREEN}✓ Blockchain Event Logging:${NC}"
echo ""
echo "  POST /api/blockchain/log-upload - Log upload events"
echo "  POST /api/blockchain/log-view - Log view events"
echo "  POST /api/blockchain/log-transfer - Log transfer events"
echo "  POST /api/blockchain/log-export - Log export events"
echo "  GET /api/blockchain/user-events - Get user's events"
echo "  GET /api/blockchain/evidence-events/:id - Get evidence events"
echo ""

echo -e "${BLUE}Contract Address:${NC} $CONTRACT_ADDRESS"
echo ""

echo -e "${YELLOW}⚠️  Management:${NC}"
echo "  • Check individual Terminal windows for logs"
echo "  • Press Ctrl+C in each window to stop services"
echo "  • Or run: pkill -f 'node\\|npm'"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "  1. Wait for both Terminal windows to show 'ready on' message"
echo "  2. Open http://localhost:3000 in your browser"
echo "  3. Login with Google OAuth"
echo "  4. Upload evidence to test blockchain event logging"
echo "  5. View /blockchain-events to see immutable event log"
echo ""
