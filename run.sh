
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

print_header "🔐 TrustVault - Chain of Custody System"
echo "Master Startup & Deployment Script"
echo ""

# ========================================
# STEP 1: CONTRACT DEPLOYMENT & UPDATE
# ========================================

print_header "STEP 1: Deploying Smart Contract"

echo "Checking prerequisites..."

# Check if Ganache is running
if ! nc -z localhost 8545 2>/dev/null; then
    print_warning "Ganache is not running on port 8545"
    echo "Please start Ganache before continuing (port 8545 required for deployment)"
    read -p "Press Enter once Ganache is running, or Ctrl+C to exit: "
fi

cd "$PROJECT_DIR"

print_step "Deploying smart contract to Ganache..."
DEPLOY_OUTPUT=$(npx truffle migrate --network ganache 2>&1)

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contract address:" | tail -1 | grep -oE '0x[a-fA-F0-9]+')

if [ -z "$CONTRACT_ADDRESS" ]; then
    print_error "Failed to extract contract address from deployment"
    print_error "Deployment output:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

print_step "Contract deployed at: $CONTRACT_ADDRESS"

# Update all Python scripts with the new contract address
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

# ========================================
# STEP 2: INSTALL DEPENDENCIES
# ========================================

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

print_header "STEP 3: Starting All Services"

# Trap cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend server
print_step "Starting backend server on port 5001..."
cd "$PROJECT_DIR/backend"
npm start &
BACKEND_PID=$!
sleep 3

# Start deepfake detection service (Streamlit)
print_step "Starting deepfake detection service on port 8501..."
cd "$PROJECT_DIR/deepfake"
source venv/bin/activate
streamlit run streamlit_app.py --server.port 8501 &
DEEPFAKE_PID=$!
deactivate
sleep 3

# Start frontend
print_step "Starting frontend on port 3000..."
cd "$PROJECT_DIR/frontend"
npm start &
FRONTEND_PID=$!

# ========================================
# SUMMARY
# ========================================

print_header "🚀 All Services Started Successfully"

echo "Services are running:"
echo ""
echo -e "  ${BLUE}Ganache (Blockchain)${NC}        http://localhost:7545"
echo -e "  ${BLUE}Backend API${NC}                http://localhost:5001"
echo -e "  ${BLUE}Deepfake Detection${NC}         http://localhost:8501"
echo -e "  ${BLUE}Frontend Application${NC}       http://localhost:3000"
echo ""
echo -e "  ${BLUE}Contract Address${NC}           $CONTRACT_ADDRESS"
echo ""
echo "Process IDs:"
echo "  Backend PID:    $BACKEND_PID"
echo "  Deepfake PID:   $DEEPFAKE_PID"
echo "  Frontend PID:   $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for all background processes
wait
