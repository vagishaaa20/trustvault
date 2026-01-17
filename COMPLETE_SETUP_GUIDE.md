# TrustVault - Complete Setup Guide

A blockchain-based evidence management system with deepfake detection. This guide covers setting up the entire stack from scratch on any machine.

---

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Database Setup](#database-setup)
5. [Smart Contract Deployment](#smart-contract-deployment)
6. [Running the System](#running-the-system)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

- **OS**: macOS, Linux, or Windows (with WSL2)
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 5GB free
- **Internet**: Required for npm/pip package downloads

---

## Prerequisites Installation

### 1. Install Node.js (v16 or higher)

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (WSL2):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:
```bash
node --version  # Should show v16+
npm --version   # Should show 7+
```

---

### 2. Install Python 3.10

> **Important**: Use Python 3.10 specifically for TensorFlow compatibility. Python 3.14+ will have package conflicts.

**macOS:**
```bash
brew install python@3.10
brew link python@3.10 --force
python3 --version  # Should show 3.10.x
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y python3.10 python3.10-venv python3.10-dev
python3.10 --version
```

**Windows (WSL2):**
```bash
sudo apt-get install -y python3.10 python3.10-venv python3.10-dev
python3.10 --version
```

---

### 3. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

Verify:
```bash
psql --version  # Should show PostgreSQL 15+
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows (WSL2):**
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo service postgresql start
```

---

### 4. Install Ganache CLI (Blockchain)

```bash
npm install -g ganache-cli
```

Verify:
```bash
ganache-cli --version
```

---

### 5. Install Truffle (Smart Contract Tools)

```bash
npm install -g truffle
```

Verify:
```bash
truffle version
```

---

## Project Setup

### 1. Clone/Extract Project

```bash
cd /path/to/your/workspace
# If you have a git repo:
# git clone <repo-url>
# Otherwise, extract the project folder
cd trustvault
```

---

### 2. Install Node Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Root (if applicable):**
```bash
npm install
```

---

### 3. Create Python Virtual Environment

```bash
# Create venv with Python 3.10
python3.10 -m venv venv

# Activate venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Verify Python version
python --version  # Should show 3.10.x
```

---

### 4. Install Python Dependencies

```bash
# Make sure venv is activated
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Verify TensorFlow installed
python -c "import tensorflow; print(f'TensorFlow {tensorflow.__version__} installed')"
```

Expected output:
```
TensorFlow 2.17.0 installed
```

---

## Database Setup

### 1. Start PostgreSQL

**macOS/Linux:**
```bash
sudo service postgresql start
# or
brew services start postgresql@15
```

**Windows (WSL2):**
```bash
sudo service postgresql start
```

### 2. Create Database and Tables

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql shell, run:
CREATE DATABASE postgres;
\c postgres

# Exit and run SQL file
\q
```

Then run the database schema:
```bash
psql -U postgres -d postgres -f database.sql
```

### 3. Verify Connection

```bash
psql -U postgres -h localhost -d postgres -c "SELECT 1;"
```

Should output:
```
 ?column?
----------
        1
(1 row)
```

---

## Smart Contract Deployment

### 1. Start Ganache

Open a **new terminal** and run:

```bash
ganache-cli --deterministic --host 127.0.0.1 --port 7545
```

Keep this terminal open. You should see:
```
Ganache CLI v6.x.x
...
Listening on 127.0.0.1:7545
```

---

### 2. Compile Smart Contracts

In the main project directory:

```bash
truffle compile
```

Output should show:
```
Compiling your contracts...
> Compiling ./contracts/EvidenceChain.sol
✓ Artifacts written to ./build/contracts
```

---

### 3. Deploy to Ganache

```bash
truffle migrate --network ganache
```

**Important**: Save the contract address from the output. It should look like:
```
EvidenceChain deployed at: 0x1234567890abcdef...
```

---

### 4. Update Contract Address in Code

Copy the deployed contract address and update these files:

**File: `insert.py`**
```python
CONTRACT_ADDRESS = "0xyour_contract_address_here"
```

**File: `verifyBlock.py`** (same change)
```python
CONTRACT_ADDRESS = "0xyour_contract_address_here"
```

---

## Running the System

### Option A: Using the Master Script (Recommended)

```bash
cd /path/to/trustvault

# Make script executable
chmod +x run.sh

# Run the master script
bash run.sh
```

This will automatically:
- Detect Python 3.10
- Create/activate venv
- Deploy smart contract
- Start all services

### Option B: Manual Service Startup

Open multiple terminals and run each in sequence:

**Terminal 1: Ganache**
```bash
ganache-cli --deterministic --host 127.0.0.1 --port 7545
```

**Terminal 2: Backend**
```bash
cd backend
npm start
# Listens on http://localhost:5001
```

**Terminal 3: Deepfake Service (Streamlit)**
```bash
source venv/bin/activate  # Activate Python venv
cd deepfake
streamlit run streamlit_app.py
# Listens on http://localhost:8501
```

**Terminal 4: Frontend**
```bash
cd frontend
npm start
# Listens on http://localhost:3000
```

---

## Verification Steps

### 1. Check Ganache Connection

```bash
curl http://127.0.0.1:7545
```

### 2. Check Backend Health

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok","message":"Backend is running"}
```

### 3. Check PostgreSQL Connection

```bash
psql -U postgres -h localhost -d postgres -c "\dt"
```

Should show tables including `evidence_metadata`.

### 4. Access Frontend

Open browser: `http://localhost:3000`

You should see:
- Landing page with navigation menu
- "Deepfake Detection" button
- "Evidence Database" button
- "Add Evidence" button

---

## Full Service URLs

Once running:

| Service | URL | Port |
|---------|-----|------|
| Frontend (React) | http://localhost:3000 | 3000 |
| Backend (Node.js) | http://localhost:5001 | 5001 |
| Deepfake (Streamlit) | http://localhost:8501 | 8501 |
| Ganache (Blockchain) | http://127.0.0.1:7545 | 7545 |
| PostgreSQL | localhost | 5432 |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              Port 3000 - User Interface                  │
└────────┬──────────────────────────────────┬──────────────┘
         │                                  │
    ┌────▼────────────────┐      ┌─────────▼──────────┐
    │  Backend (Express)  │      │ Deepfake Detection │
    │   Port 5001         │      │   (Streamlit)      │
    │  - Upload/Verify    │      │    Port 8501       │
    │  - Database         │      │  - ML Model        │
    │  - Blockchain       │      │  - Analysis        │
    └────┬────────────────┘      └────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │         Smart Contract Layer              │
    ├───────────────────────────────────────────┤
    │  Ganache (Local Blockchain)               │
    │  Port 7545                                │
    │  - Evidence Storage                       │
    │  - Immutable Records                      │
    └────┬──────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │       PostgreSQL Database                 │
    │       Port 5432                           │
    │  - Evidence Metadata                      │
    │  - User Sessions                          │
    └───────────────────────────────────────────┘
```

---

## Troubleshooting

### Port Already in Use

If a port is already in use:

```bash
# Find process using port (macOS/Linux)
lsof -i :3000   # Replace 3000 with your port

# Kill the process
kill -9 <PID>
```

### PostgreSQL Connection Refused

```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL if not running
brew services start postgresql@15  # macOS
sudo service postgresql start      # Linux
```

### Python Venv Issues

```bash
# Remove old venv and recreate
rm -rf venv
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Ganache Connection Error

Ensure Ganache is running on port 7545:
```bash
ganache-cli --deterministic --host 127.0.0.1 --port 7545
```

### TensorFlow Import Error

```bash
# Verify Python version (must be 3.10)
python --version

# Reinstall TensorFlow
pip uninstall tensorflow keras -y
pip install tensorflow==2.17.0 keras==3.12.0
```

### Streamlit Not Found

```bash
# Activate venv and verify installation
source venv/bin/activate
pip install streamlit==1.28.0
streamlit run deepfake/streamlit_app.py
```

### Contract Address Issues

1. Check `compiled_code.json` has valid ABI
2. Verify contract address is correct in `insert.py` and `verifyBlock.py`
3. Redeploy contract if needed:
   ```bash
   truffle migrate --network ganache --reset
   ```

---

## Cleanup/Reset

### Reset Everything

```bash
# Stop all services (Ctrl+C in each terminal)

# Clean build artifacts
rm -rf build/ cache/

# Reset database
psql -U postgres -c "DROP DATABASE postgres;"
psql -U postgres -c "CREATE DATABASE postgres;"
psql -U postgres -d postgres -f database.sql

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +

# Remove node_modules (optional, to free space)
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall everything and redeploy
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
truffle migrate --network ganache
```

---

## Next Steps After Setup

1. **Add Evidence**: Use the "Add Evidence" page to upload videos
2. **Verify Evidence**: Use "Verify Evidence" to check integrity
3. **View Records**: Browse the "Evidence Database"
4. **Detect Deepfakes**: Use "Deepfake Detection" tab
5. **Check Blockchain**: Query blockchain records via API

---

## Security Notes

⚠️ **This is for development only. For production:**

1. Use proper database credentials (not default `postgres/vvss`)
2. Deploy Ganache as a proper Ethereum testnet (Sepolia/Goerli)
3. Use environment variables for sensitive configs
4. Enable HTTPS/TLS for all connections
5. Implement proper authentication
6. Add rate limiting and input validation
7. Conduct security audit of smart contract

---

## Support & Debugging

For detailed logs:

**Backend:**
```bash
cd backend
DEBUG=* npm start
```

**Frontend:**
Open browser DevTools (F12) → Console tab

**Python Scripts:**
```bash
python insert.py "case1" "evidence1" "path/to/video.mp4"
```

---

## Summary

You now have:
- ✅ Local blockchain (Ganache)
- ✅ Smart contracts deployed
- ✅ PostgreSQL database
- ✅ Node.js backend API
- ✅ React frontend UI
- ✅ Deepfake detection service
- ✅ Evidence management system

**Happy blockchain evidence tracking! 🔗**
