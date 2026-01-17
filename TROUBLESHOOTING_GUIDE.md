# 🔧 Troubleshooting - Upload & Blockchain Features

## Issue: "Failed to fetch" when uploading

### Step 1: Check if Backend is Running

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok","message":"Backend is running"}
```

If **no response**, the backend crashed. See "Backend Won't Start" section.

### Step 2: Check CORS Settings

The backend should have CORS enabled. Check server.js:

```javascript
app.use(cors()); // Should be there
```

If missing, add this line after `const app = express();`

### Step 3: Verify Upload Endpoint

```bash
curl -X POST http://localhost:5001/upload \
  -F "caseId=test" \
  -F "evidenceId=test123" \
  -F "video=@/path/to/test.mp4"
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Check for errors (red text)
4. Look for network errors in **Network** tab

---

## Issue: Backend Won't Start

### Check Error Messages

```bash
cd trustvault/backend
npm start
```

Look for error message. Common issues:

#### Error: `Cannot find module 'dotenv'`
**Solution**: Install dotenv
```bash
npm install dotenv
```

#### Error: `Port 5001 already in use`
**Solution**: Kill the process using port 5001
```bash
lsof -i :5001  # Check what's using it
kill -9 <PID>  # Kill the process
```

#### Error: `Cannot read properties of undefined (reading 'toHexString')`
**Solution**: PRIVATE_KEY not set correctly
```bash
# Check backend/.env
grep PRIVATE_KEY backend/.env

# Should show a real private key like:
# PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c

# If it's all zeros, update it from Ganache
```

#### Error: `connect ECONNREFUSED 127.0.0.1:7545`
**Solution**: Ganache not running
```bash
# Start Ganache GUI or CLI:
ganache-cli --port 7545

# Or if using Ganache GUI, ensure port is set to 7545
```

---

## Issue: Ganache Not Running

### If Using Ganache CLI

```bash
ganache-cli --port 7545
```

Check output for:
```
Listening on http://127.0.0.1:7545
```

### If Using Ganache GUI

1. Open Ganache Desktop app
2. Check port setting (should be 7545)
3. Ensure "Server" tab shows "Running"
4. Note the private key shown for Account 0

---

## Issue: Blockchain Events Not Showing

### Step 1: Check if Event API is Responding

```bash
curl http://localhost:5001/api/blockchain/evidence-events/test
```

Expected response:
```json
{"success":true,"events":[]}
```

If **error**, check backend logs.

### Step 2: Create an Event First

Upload evidence to create an event:
1. Go to http://localhost:3000/dashboard
2. Upload a video file
3. Wait 3-5 seconds for processing
4. Go to http://localhost:3000/blockchain-events
5. Refresh page
6. Event should appear

### Step 3: Check Blockchain Connection

Verify blockchain initialized:
```bash
grep "✅ Blockchain initialized" <(tail -100 /tmp/backend.log)
```

Should see:
```
✅ Blockchain initialized
   Provider: http://127.0.0.1:7545
   Contract: 0x...
   Signer: 0xcaafc8d49e80307913ef169999ab0c91b9ac5346
```

---

## Issue: Can't Access Frontend at localhost:3000

### Check if Frontend is Running

```bash
curl http://localhost:3000
```

Should return HTML (not an error).

### Kill Old Processes and Restart

```bash
pkill -f "npm start"
sleep 2
cd trustvault/frontend
npm start
```

### Check Port 3000 is Free

```bash
lsof -i :3000
```

If something is using it:
```bash
kill -9 <PID>
```

---

## Issue: Upload Shows Success But No Events Created

### Check if Event Logging is Enabled

In backend logs:
```bash
# Should show:
✅ Blockchain initialized
✅ Blockchain event logging routes initialized
```

If not, PRIVATE_KEY is probably wrong.

### Manually Test Event Creation

```bash
curl -X POST http://localhost:5001/api/blockchain/log-upload \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "test-user@gmail.com",
    "evidenceId": "TEST-001",
    "fileHash": "abc123def456"
  }'
```

---

## Complete System Health Check

Run this script to verify everything:

```bash
#!/bin/bash

echo "🔍 TrustVault System Health Check"
echo "================================"
echo ""

# 1. Ganache
echo -n "Ganache (7545):      "
if curl -s http://localhost:7545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' &>/dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
fi

# 2. Backend
echo -n "Backend (5001):      "
if curl -s http://localhost:5001/health &>/dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
fi

# 3. Frontend
echo -n "Frontend (3000):     "
if curl -s http://localhost:3000 &>/dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
fi

# 4. Blockchain Routes
echo -n "Blockchain API:      "
if curl -s http://localhost:5001/api/blockchain/evidence-events/test &>/dev/null; then
  echo "✅ Responding"
else
  echo "❌ Not responding"
fi

echo ""
echo "Access Points:"
echo "  Frontend:              http://localhost:3000"
echo "  Dashboard:             http://localhost:3000/dashboard"
echo "  Blockchain Events:     http://localhost:3000/blockchain-events"
echo "  Backend API:           http://localhost:5001"
echo "  Ganache:               http://localhost:7545"
```

Save as `health-check.sh` and run:
```bash
bash health-check.sh
```

---

## Quick Recovery Steps

If everything breaks:

```bash
# 1. Kill all services
pkill -f "node server.js"
pkill -f "npm start"
pkill -f "streamlit"

# 2. Start Ganache
ganache-cli --port 7545 &

# 3. Wait for Ganache to start
sleep 5

# 4. Run the system
cd trustvault
bash run.sh

# 5. Answer 'y' when prompted for blockchain tests

# 6. Access frontend
open http://localhost:3000
```

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch` | Backend not responding | Restart backend |
| `ECONNREFUSED 7545` | Ganache not running | Start Ganache GUI or CLI |
| `EADDRINUSE :5001` | Port in use | Kill process using 5001 |
| `Cannot read properties of undefined (reading 'getLogs')` | PRIVATE_KEY not set | Update with Ganache key |
| `No events found` | Events not created yet | Upload evidence first |
| `404 Not Found /blockchain-events` | Route not added | Restart frontend |
| `TypeError: process.env is not defined` | Dotenv not loaded | Restart backend |
| `Cannot find module 'dotenv'` | Package not installed | Run `npm install dotenv` |

---

## Support Info

**Blockchain Events Available at:**
- Dashboard: http://localhost:3000/blockchain-events
- API: http://localhost:5001/api/blockchain/*
- Smart Contract: Check `CONTRACT_ADDRESS` in `backend/.env`

**Documentation:**
- [BLOCKCHAIN_TRACKING_GUIDE.md](BLOCKCHAIN_TRACKING_GUIDE.md) - Complete tracking guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference
- [README_BLOCKCHAIN.md](README_BLOCKCHAIN.md) - Full overview
