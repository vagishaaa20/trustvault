#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TrustVault - Complete Unified Startup Script
# Launches: Backend, Frontend, and Opens Website
# ═══════════════════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_port() {
    nc -z localhost $1 2>/dev/null
}

wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    print_info "Waiting for $service to start..."
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            print_step "$service is ready on port $port"
            return 0
        fi
        echo -ne "."
        sleep 1
        ((attempt++))
    done
    
    print_error "$service failed to start on port $port"
    return 1
}

cleanup() {
    print_header "Shutting Down Services"
    echo "Killing all services..."
    
    pkill -f "node.*backend" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    
    print_step "Services stopped"
}

trap cleanup EXIT INT TERM

# ═══════════════════════════════════════════════════════════════════════════
# STARTUP PROCESS
# ═══════════════════════════════════════════════════════════════════════════

print_header "TrustVault - Complete System Launcher"
echo "Starting all services and opening website..."
echo ""

# Step 1: Verify environment
print_header "STEP 1: Environment Setup"

if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found at $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

print_step "Project directories verified"

# Step 2: Setup backend environment
print_header "STEP 2: Backend Configuration"

# Create/verify .env file
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning "Creating .env file..."
    cat > "$BACKEND_DIR/.env" << 'EOF'
# Blockchain Configuration
CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Google OAuth (set with your actual values)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Server
NODE_ENV=development
PORT=5001
EOF
    print_step "Created .env file"
else
    print_step ".env file exists"
fi

# Install backend dependencies
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    print_warning "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install --silent > /dev/null 2>&1
    cd "$PROJECT_DIR"
    print_step "Backend dependencies installed"
else
    print_step "Backend dependencies already installed"
fi

# Step 3: Setup frontend environment
print_header "STEP 3: Frontend Configuration"

# Create/verify .env file
if [ ! -f "$FRONTEND_DIR/.env" ]; then
    print_warning "Creating .env file..."
    cat > "$FRONTEND_DIR/.env" << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001/api
HOST=localhost
PORT=3000
SKIP_PREFLIGHT_CHECK=true
EOF
    print_step "Created .env file"
else
    print_step ".env file exists"
fi

# Install frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install --silent > /dev/null 2>&1
    cd "$PROJECT_DIR"
    print_step "Frontend dependencies installed"
else
    # Ensure express is installed (needed for production server)
    if [ ! -d "$FRONTEND_DIR/node_modules/express" ]; then
        print_warning "Installing express server..."
        cd "$FRONTEND_DIR"
        npm install express --silent > /dev/null 2>&1
        cd "$PROJECT_DIR"
    fi
    print_step "Frontend dependencies ready"
fi

# Step 3B: Build frontend for production
print_step "Building frontend for production (one-time)..."
cd "$FRONTEND_DIR"
if [ ! -d "build" ] || [ -z "$(find build -type f 2>/dev/null)" ]; then
    print_info "First build - this takes 10-15 seconds..."
    CI=false npm run build --silent > /dev/null 2>&1
    print_step "Frontend built successfully"
else
    print_step "Frontend build already exists"
fi
cd "$PROJECT_DIR"

# Step 4: Create logs directory
print_header "STEP 4: Logging Setup"

if [ ! -d "$PROJECT_DIR/logs" ]; then
    mkdir -p "$PROJECT_DIR/logs"
    print_step "Created logs directory"
else
    print_step "Logs directory ready"
fi

# Step 5: Start services
print_header "STEP 5: Starting Services"

# Start backend
print_step "Launching Backend on port 5001..."
cd "$BACKEND_DIR"
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_DIR"
echo "  Process ID: $BACKEND_PID"

# Wait for backend to be ready
if ! wait_for_service 5001 "Backend"; then
    print_error "Backend startup failed"
    tail -20 /tmp/backend.log
    exit 1
fi

sleep 1

# Start frontend production server
print_step "Launching Frontend on port 3000..."
cd "$FRONTEND_DIR"
PORT=3000 node server.js > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_DIR"
echo "  Process ID: $FRONTEND_PID"

# Wait for frontend to be ready
if wait_for_service 3000 "Frontend"; then
    sleep 1
else
    print_error "Frontend failed to start"
    echo "------- Frontend Error Log -------"
    tail -20 /tmp/frontend.log
    exit 1
fi

# Step 6: Open website
print_header "STEP 6: Opening Website"

sleep 2

if command -v open &> /dev/null; then
    open -a "Google Chrome" "http://localhost:3000" 2>/dev/null || \
    open "http://localhost:3000"
    print_step "Chrome browser opened"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"
    print_step "Browser opened"
else
    print_warning "Please manually open: http://localhost:3000"
fi

# Step 7: Display final status
print_header "✅ System Successfully Started"

cat << EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 RUNNING SERVICES:

  Frontend Application:    http://localhost:3000
  Backend API:             http://localhost:5001
  Activity Log Dashboard:  http://localhost:3000/activity-log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 AVAILABLE ROUTES:

  /                    - Home Page
  /login               - Google OAuth Login
  /add-evidence        - Upload Evidence (tracks: EVIDENCE_UPLOAD)
  /verify-evidence     - Verify Evidence (tracks: EVIDENCE_VERIFY)
  /view-evidence       - View Evidence (tracks: EVIDENCE_VIEW)
  /activity-log        - User Activity Dashboard ⭐
  /user-activity       - Activity Log (alias)
  /dashboard           - Evidence Dashboard
  /blockchain-events   - Blockchain Event Log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ QUICK START:

  1. Chrome should open automatically at http://localhost:3000
  2. Click "Login" and authenticate with Google OAuth
  3. Activity tracking will start automatically
  4. Visit http://localhost:3000/activity-log to see your activities
  5. Perform actions: upload, verify, or navigate pages
  6. All actions are tracked with timestamps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ACTIVITY LOGGING:

  • Page visits tracked
  • Clicks logged
  • File uploads tracked
  • Evidence actions recorded
  • Errors captured
  • All logged to: trustvault/logs/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 TO STOP SERVICES:

  Press Ctrl+C in this terminal to stop all services gracefully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

# Keep the script running
wait
