# TrustVault Master Startup Script - Quick Start Guide

## Overview

The `run.sh` script is a comprehensive master script that combines all the functionality of:
- `script.sh` (service startup)
- `deploy_and_update.sh` (smart contract deployment)
- `start_all_services.sh` (backend, frontend, deepfake service)

It automates the entire deployment and startup process in a single command.

## What the Script Does

1. **Checks Prerequisites** - Verifies Ganache is running on port 8545
2. **Deploys Smart Contract** - Deploys EvidenceChain.sol to Ganache
3. **Updates Configuration** - Updates all Python scripts with the new contract address
4. **Installs Dependencies** - Ensures all npm and pip packages are installed
5. **Starts All Services**:
   - Backend API (port 5001)
   - Deepfake Detection Service (port 8501)
   - React Frontend (port 3000)
6. **Displays Summary** - Shows all running services and PIDs

## Quick Start

### Prerequisites

Before running the script, ensure you have:

1. **Node.js & npm** - [Install Node.js](https://nodejs.org/)
2. **Python 3.7+** - With pip installed
3. **Ganache** - Running on port 8545
   ```bash
   ganache-cli --port 8545
   # or use Ganache GUI and configure it to use port 8545
   ```
4. **Truffle** - Install globally
   ```bash
   npm install -g truffle
   ```

### Basic Usage

```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash run.sh
```

Or simply:
```bash
./run.sh
```

## Step-by-Step Process

### Step 1: Smart Contract Deployment
```
✓ Checking if Ganache is running...
✓ Deploying smart contract to Ganache...
✓ Contract deployed at: 0x1234567890abcdef...
✓ Updated insert.py
✓ Updated verifyBlock.py
✓ Updated queryEvidence.py
```

### Step 2: Dependencies
```
✓ Backend dependencies installed
✓ Frontend dependencies installed
✓ Python dependencies verified
```

### Step 3: Services Started
```
✓ Starting backend server on port 5001...
✓ Starting deepfake detection service on port 8501...
✓ Starting frontend on port 3000...
```

## Accessing Services

Once all services are running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main web interface |
| **Backend API** | http://localhost:5001 | REST API endpoints |
| **Deepfake Detection** | http://localhost:8501 | Streamlit deepfake analysis |
| **Ganache** | http://localhost:7545 | Blockchain explorer |

## Features

### ✅ Color-Coded Output
- 🟢 **Green** - Successful operations
- 🔵 **Blue** - Section headers and info
- 🟡 **Yellow** - Warnings
- 🔴 **Red** - Errors

### ✅ Automatic Cleanup
- Press `Ctrl+C` to gracefully stop all services
- All background processes are cleanly terminated
- No zombie processes left running

### ✅ Comprehensive Error Handling
- Validates contract address extraction
- Checks for missing files before updating
- Verifies Ganache is running before deployment
- Provides helpful error messages

### ✅ Process Tracking
- Displays PID for each service
- Easy to monitor or manually kill processes if needed

## Troubleshooting

### Ganache Not Running
```
⚠ Ganache is not running on port 8545
Please start Ganache before continuing (port 8545 required for deployment)
```

**Solution:** Start Ganache in a separate terminal:
```bash
ganache-cli --port 8545
```

### Contract Deployment Fails
**Issue:** Contract address extraction failed

**Solutions:**
1. Check that Ganache is running and accepting connections
2. Verify Truffle is installed: `npm install -g truffle`
3. Check `contracts/EvidenceChain.sol` exists

### Backend/Frontend Won't Start
**Issue:** Port already in use

**Solutions:**
```bash
# Find process using port 5001 (backend)
lsof -i :5001
kill -9 <PID>

# Find process using port 3000 (frontend)
lsof -i :3000
kill -9 <PID>

# Find process using port 8501 (deepfake)
lsof -i :8501
kill -9 <PID>
```

### Python Dependencies Error
**Issue:** `ModuleNotFoundError` or similar

**Solution:**
```bash
cd deepfake
pip install -r requirements_simple.txt
```

## Advanced Usage

### Run with Fresh Dependencies
```bash
# Remove old dependencies and reinstall
rm -rf backend/node_modules frontend/node_modules
bash run.sh
```

### Manual Service Control

If you need to manage services manually:

**Backend only:**
```bash
cd backend
npm start
```

**Frontend only:**
```bash
cd frontend
npm start
```

**Deepfake service only:**
```bash
cd deepfake
streamlit run streamlit_app.py --server.port 8501
```

### Check Running Processes
```bash
ps aux | grep -E "npm|streamlit|node"
```

### Stop Individual Services
```bash
# Kill by PID (shown when script starts)
kill <PID>

# Or find and kill by port
lsof -i :<PORT>
kill -9 <PID>
```

## File Locations

The script assumes the following structure:
```
trustvault/
├── run.sh (this script)
├── contracts/
│   └── EvidenceChain.sol
├── insert.py
├── verifyBlock.py
├── queryEvidence.py
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
│   └── src/
└── deepfake/
    ├── streamlit_app.py
    ├── requirements_simple.txt
    └── weights/
```

## What Gets Updated

### Python Files Updated with Contract Address
- `insert.py` - Evidence insertion logic
- `verifyBlock.py` - Block verification logic
- `queryEvidence.py` - Evidence query logic

### Pattern Matched
```python
CONTRACT_ADDRESS = "0x[a-fA-F0-9]*"  # Old address
CONTRACT_ADDRESS = "0xNEW_ADDRESS"   # Updated
```

## Performance Tips

1. **First Run** - Takes longer (dependencies installed)
2. **Subsequent Runs** - Much faster (dependencies cached)
3. **Monitor Resources** - Watch CPU/memory for 4 services running
4. **Use SSD** - Faster npm installs and operations

## Logs & Debugging

Output logs appear directly in terminal. To save logs:

```bash
bash run.sh > deployment.log 2>&1
```

To monitor specific services:
```bash
# Watch backend logs
tail -f deployment.log | grep "Backend"

# Watch deepfake logs
tail -f deployment.log | grep "Deepfake"
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Port already in use | Service already running | Kill existing process or use different port |
| Contract address not extracted | Deployment failed | Check Ganache is running and mining blocks |
| npm install slow | Network issue | Run with `npm ci --legacy-peer-deps` |
| Python module errors | Missing dependencies | Run `pip install -r requirements_simple.txt` |
| Streamlit not starting | Port 8501 in use | Change port in script or kill existing process |

## Updates & Modifications

To customize the script:

1. **Change ports:**
   - Edit the port numbers in the script
   - Update frontend `.env` if needed

2. **Add new services:**
   - Add new `cd` and service start commands
   - Store PID for cleanup
   - Add to cleanup function

3. **Modify deployment:**
   - Edit contract deployment network (ganache/ropsten/etc)
   - Add more Python files to update

## Support

If you encounter issues:

1. Check all prerequisites are installed
2. Ensure Ganache is running before starting script
3. Check individual service logs
4. Verify all files exist in expected locations
5. Run with `bash -x run.sh` for debugging output

## Scripts Replaced

This master script replaces:
- ✅ `script.sh` - Original startup script
- ✅ `deploy_and_update.sh` - Deployment script
- ✅ `start_all_services.sh` - Multi-service startup

You can still use these individual scripts if needed, but `run.sh` is recommended as it combines all functionality and adds error handling.
