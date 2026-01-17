# 🚀 TrustVault - Quick Start Guide (Port 7545)

## Prerequisites

You need **Ganache GUI** running on **port 7545**.

### Start Ganache GUI

1. Open **Ganache Desktop** app
2. Create a new workspace
3. In settings, set **PORT** to `7545`
4. Click "Save and Start"
5. You should see: `Listening on http://127.0.0.1:7545`

---

## Get Your Private Key

1. In Ganache, look at **Account 0** (first account)
2. Click the **key icon** or **"Show Keys"** button
3. Copy the **Private Key** (starts with 0x, 66 characters total)
4. Example: `0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c`

---

## Update backend/.env

Edit `backend/.env` and set:

```bash
# Blockchain Configuration
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000  # Will be updated by script
RPC_URL=http://127.0.0.1:7545                               # Port 7545 for Ganache GUI
PRIVATE_KEY=0x<paste-your-ganache-private-key-here>        # Your Account 0 key

# Google OAuth (optional for now)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Server
NODE_ENV=development
PORT=5001
```

**Example:**
```bash
PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
```

---

## Start Everything

### Option 1: Using start-services.sh (Recommended)

```bash
cd trustvault
bash start-services.sh
```

This will:
- ✅ Verify Ganache is running on 7545
- ✅ Check your backend/.env configuration
- ✅ Start backend on port 5001
- ✅ Start frontend on port 3000
- ✅ Test blockchain connection

### Option 2: Using run.sh

```bash
cd trustvault
bash run.sh
```

Answer `y` when prompted to run blockchain tests.

---

## Access Your Application

Once everything is running:

| Feature | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Dashboard** | http://localhost:3000/dashboard |
| **Blockchain Events** | http://localhost:3000/blockchain-events |
| **Backend API** | http://localhost:5001 |
| **Ganache** | http://localhost:7545 |

---

## Upload Evidence & Track on Blockchain

1. Go to **http://localhost:3000/dashboard**
2. Click **"Add Evidence"**
3. Upload a video file
4. Wait 3-5 seconds
5. Go to **http://localhost:3000/blockchain-events**
6. Click **"Refresh"** 
7. You should see the **UPLOAD event** on the blockchain!

Each event shows:
- **Who**: User address
- **What**: Action (UPLOAD/VIEW/TRANSFER/EXPORT)
- **When**: Exact timestamp
- **Evidence**: File hash & ID
- **Immutable**: Cannot be changed once recorded

---

## Troubleshooting

### Error: "Invalid PRIVATE_KEY: Cannot use dummy/zero value"

**Solution**: Your PRIVATE_KEY in backend/.env is still set to all zeros.

1. Get the real private key from Ganache (see "Get Your Private Key" section)
2. Update `backend/.env`
3. Restart the system: `bash start-services.sh`

### Error: "Cannot read properties of undefined (reading 'toHexString')"

**Solution**: Same as above - PRIVATE_KEY not set correctly.

### Error: "Ganache is NOT running on port 7545"

**Solution**: Start Ganache GUI:
- Open Ganache Desktop app
- Create workspace with port 7545
- Start it

### Error: "Failed to fetch" when uploading

**Solution**: Backend not responding.

```bash
# Check if backend is running
curl http://localhost:5001/health

# If not, restart
pkill -f "node server.js"
cd trustvault/backend
npm start
```

### No blockchain events showing

**Solution**: Events are created when you take actions.

1. Upload evidence at http://localhost:3000/dashboard
2. Wait 3 seconds
3. Go to http://localhost:3000/blockchain-events
4. Click **Refresh**
5. Events should appear

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (Port 3000)                    │
│  React + Dashboard + Blockchain Events Viewer  │
└────────────────────┬────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────┐
│         Backend (Port 5001)                     │
│  Express.js + Upload + Verify + Blockchain API │
└────────────────────┬────────────────────────────┘
                     │ RPC Calls
                     ▼
┌─────────────────────────────────────────────────┐
│  Ganache GUI (Port 7545)                        │
│  Local Ethereum Blockchain                      │
│  - Account 0: 0xcaafc8d49e80307913ef...        │
│  - Contract: 0x...                              │
│  - All events immutable and tracked             │
└─────────────────────────────────────────────────┘
```

---

## What Gets Tracked on Blockchain?

### Every action creates an event:

| Action | Event | Tracked Data |
|--------|-------|--------------|
| Upload evidence | **UPLOAD** | User, Evidence ID, File Hash, Timestamp |
| View evidence | **VIEW** | User, Evidence ID, Timestamp |
| Transfer evidence | **TRANSFER** | From User, To User, Evidence ID, Timestamp |
| Export evidence | **EXPORT** | User, Export Details, Timestamp |

### Immutable Records

- ✅ **Tamper-proof**: Cannot be modified
- ✅ **Audit trail**: Complete history maintained
- ✅ **Cryptographic proof**: Each event has transaction hash
- ✅ **Legal admissibility**: Suitable for court proceedings

---

## Commands Reference

```bash
# Start Ganache GUI (separate terminal)
# Open Ganache Desktop app, create workspace with port 7545

# Deploy contract & start everything
cd trustvault
bash start-services.sh

# Or use run.sh for more features
bash run.sh

# Check backend health
curl http://localhost:5001/health

# Check Ganache connection
curl -X POST http://localhost:7545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get blockchain events for evidence
curl http://localhost:5001/api/blockchain/evidence-events/EV-001

# Stop all services
pkill -f "node\|npm\|streamlit"
```

---

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)
2. Check [BLOCKCHAIN_TRACKING_GUIDE.md](BLOCKCHAIN_TRACKING_GUIDE.md)
3. Review logs in terminal output
4. Ensure Ganache is running on port 7545
5. Verify backend/.env has correct PRIVATE_KEY

---

**Everything configured for port 7545! 🚀**
