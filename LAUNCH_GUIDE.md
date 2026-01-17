# 🚀 TrustVault Launch Guide

## Prerequisites
✅ **Ganache GUI** running on port **7545**
✅ **Backend/.env** configured with valid private key
✅ **Node.js** and **npm** installed

## Quick Start

### Option 1: Using run.sh (Recommended)
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash run.sh
```

This will:
1. Validate contract deployment
2. Install dependencies (if needed)
3. Launch **Backend** in a new Terminal window (port 5001)
4. Launch **Frontend** in a new Terminal window (port 3000)
5. Display all available routes and API endpoints

### Option 2: Using start-services.sh
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash start-services.sh
```

## What Happens

1. **New Terminal Window #1**: Backend Express server starts
   - Port: 5001
   - Shows: Blockchain initialization logs
   - Watch for: "Backend initialized successfully"

2. **New Terminal Window #2**: React frontend starts
   - Port: 3000
   - Shows: Webpack compilation logs
   - Watch for: "ready on http://localhost:3000"

3. **Main Terminal**: Shows instructions and endpoint information

## Access Your Application

| Component | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **Dashboard** | http://localhost:3000/dashboard |
| **Blockchain Events** | http://localhost:3000/blockchain-events |
| **Backend API** | http://localhost:5001 |
| **Ganache** | http://localhost:7545 |

## Frontend Routes

```
/                          → Home Page
/login                     → Google OAuth Login
/approach                  → System Approach & Overview
/add-evidence              → Upload Evidence to Blockchain
/verify-evidence           → Verify Evidence Integrity
/view-evidence             → View All Evidence
/deepfake-detection        → Deepfake Detection Tool
/dashboard                 → Evidence Management Dashboard
/blockchain-events         → Immutable Blockchain Event Log
```

## Blockchain Event Logging

Every action creates an immutable event on the blockchain:

### Backend API Endpoints
```
POST /api/blockchain/log-upload      → Log evidence upload
POST /api/blockchain/log-view        → Log evidence view
POST /api/blockchain/log-transfer    → Log evidence transfer
POST /api/blockchain/log-export      → Log evidence export
GET  /api/blockchain/user-events     → Get user's events
GET  /api/blockchain/evidence-events/:id → Get evidence events
```

### Event Data Structure
```json
{
  "action": "UPLOAD|VIEW|TRANSFER|EXPORT",
  "evidenceId": "hash",
  "sender": "0xAddress",
  "timestamp": 1234567890,
  "txHash": "0x..."
}
```

## Stopping Services

### Method 1: Terminal Windows
- Press **Ctrl+C** in each Terminal window

### Method 2: Command Line
```bash
pkill -f "node\|npm"
```

## Troubleshooting

### Backend won't start?
```bash
# Check if port 5001 is in use
lsof -i :5001

# Check .env configuration
cat backend/.env

# View backend logs in its Terminal window
```

### Frontend won't start?
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

### Ganache connection failed?
```bash
# Verify Ganache is running on 7545
nc -zv localhost 7545

# Check backend RPC URL in backend/.env
grep RPC_URL backend/.env
```

## Configuration Files

### Backend Environment (.env)
Location: `backend/.env`
```
CONTRACT_ADDRESS=0x...
RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x...
PORT=5001
NODE_ENV=development
```

### Frontend Proxy
Location: `frontend/package.json`
```json
"proxy": "http://localhost:5001"
```

## System Architecture

```
Frontend (Port 3000)
    ↓ (HTTP Requests via Proxy)
Backend (Port 5001)
    ↓ (Blockchain Transactions)
Smart Contract (Ganache)
    ↓ (Stores Events)
Immutable Event Log
    ↓ (Query via API)
Frontend Blockchain Events View
```

## Testing the Blockchain Integration

1. **Login**: Google OAuth credentials
2. **Upload Evidence**: Add evidence and watch blockchain event
3. **View Evidence**: Browse evidence and trigger VIEW events
4. **Check Blockchain Log**: Visit `/blockchain-events` to see immutable log

## Environment Variables

### Backend (.env)
- `CONTRACT_ADDRESS` - Deployed smart contract address
- `RPC_URL` - Ganache RPC endpoint (http://127.0.0.1:7545)
- `PRIVATE_KEY` - Wallet private key for transactions
- `PORT` - Server port (5001)
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend base URL (http://localhost:5001)
- `REACT_APP_API_URL` - Backend API URL (http://localhost:5001/api)

## Performance Tips

- Keep browser DevTools closed for faster frontend loading
- Monitor Terminal windows for real-time logs
- Check Ganache GUI for transaction confirmations
- Use `/dashboard` for bulk evidence operations

## Support

Check the following for more details:
- `README.md` - Project overview
- `BLOCKCHAIN_TRACKING_GUIDE.md` - Blockchain setup guide
- `backend/blockchainEvents.js` - Implementation details
- `frontend/src/BlockchainEvents.jsx` - Frontend component

---

**Last Updated**: January 17, 2026
**Status**: ✅ Ready to Launch
