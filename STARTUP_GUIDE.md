# Chain of Custody System - Startup & Shutdown Guide

## System Overview
The system has 3 main components:
1. **Ganache** - Local Ethereum blockchain (port 8545)
2. **Backend** - Express.js server (port 5001)
3. **Frontend** - React application (port 3000)

---

## STARTUP INSTRUCTIONS

### Step 1: Open Terminal 1 - Start Ganache (Blockchain)
```bash
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks"
ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 8545
```
**Expected output:**
```
Ganache CLI v7.x.x
...
Listening on 0.0.0.0:8545
```
 **Ganache is running** - Keep this terminal open

---

### Step 2: Open Terminal 2 - Deploy Smart Contract
```bash
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks"
npx truffle migrate --network ganache
```
**Expected output:**
```
Compiling your contracts...
Migrations complete! Summary:
======================
> Total deployments:   1
> Final cost:          0.00X ETH
```
 **Contract deployed** - You can close this terminal after deployment completes

---

### Step 3: Open Terminal 3 - Start Backend Server
```bash
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks/backend"
npm start
```
**Expected output:**
```
 Backend running on http://0.0.0.0:5001
 Access locally: http://localhost:5001
```
 **Backend is running** - Keep this terminal open

---

### Step 4: Open Terminal 4 - Start Frontend
```bash
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks/frontend"
npm start
```
**Expected output:**
```
Compiled successfully!
You can now view Ranchihacks in the browser.
Local:            http://localhost:3000
```
 **Frontend is running** - Browser should open automatically at http://localhost:3000

---

## VERIFICATION CHECKLIST

After all 4 steps, verify everything is working:

- [ ] Ganache running on http://localhost:8545
- [ ] Backend running on http://localhost:5001
- [ ] Frontend running on http://localhost:3000
- [ ] Frontend loads without errors
- [ ] Can navigate to Dashboard, Approach, Add Evidence, etc.

**Quick test:**
```bash
# In a new terminal, test backend health
curl http://localhost:5001/health
# Should return: {"status":"ok","message":"Backend is running"}
```

---

## SHUTDOWN INSTRUCTIONS

### Option 1: Graceful Shutdown (Recommended)

**Terminal 1 (Ganache):** Press `Ctrl + C`
**Terminal 2 (Backend):** Press `Ctrl + C`
**Terminal 3 (Frontend):** Press `Ctrl + C`

---

### Option 2: Force Kill All Services

```bash
# Kill all Node.js processes
killall node

# Or selectively:
pkill -f ganache
pkill -f "node server.js"
pkill -f "react-scripts start"
```

---

## TROUBLESHOOTING

### Frontend not loading?
1. Check backend is running: `curl http://localhost:5001/health`
2. Check browser console for errors (F12)
3. Clear browser cache: Cmd+Shift+R (hard refresh)

### Backend won't start?
1. Check port 5001 is free: `lsof -i :5001`
2. Kill process if needed: `pkill -f "node server.js"`
3. Check Node.js is installed: `node --version`

### Ganache connection error?
1. Verify Ganache is running: `curl http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}'`
2. Should return: `{"id":1,"jsonrpc":"2.0","result":true}`
3. If not, restart Ganache

### Evidence not showing in database?
1. Verify blockchain is connected: Open browser DevTools, check Console
2. Ensure Ganache is running with deterministic accounts
3. Re-deploy contract if needed: `npx truffle migrate --network ganache --reset`

---

## QUICK START SCRIPT

Create a file called `start_all.sh` in the Ranchihacks root directory:

```bash
#!/bin/bash

# Start Ganache
echo "Starting Ganache..."
gnome-terminal -- bash -c "cd '/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks' && ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 8545" &

sleep 3

# Deploy contract
echo "Deploying smart contract..."
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks"
npx truffle migrate --network ganache

sleep 2

# Start backend
echo "Starting backend..."
gnome-terminal -- bash -c "cd '/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks/backend' && npm start" &

sleep 2

# Start frontend
echo "Starting frontend..."
gnome-terminal -- bash -c "cd '/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks/frontend' && npm start" &

echo "All services starting... Check your terminals!"
```

Make it executable and run:
```bash
chmod +x start_all.sh
./start_all.sh
```

---

## KEY PORTS & URLS

| Service | Port | URL |
|---------|------|-----|
| Ganache | 8545 | http://localhost:8545 |
| Backend | 5001 | http://localhost:5001 |
| Frontend | 3000 | http://localhost:3000 |

## Default Ganache Accounts

When running with `--deterministic`, Ganache creates 10 predictable accounts:
- Account 1: `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`
- Account 2: `0xf17f52151EbEF6C7334FAD080C5704DAAB192C63`
- (and 8 more...)

All start with 100 ETH balance for testing.

---

## System Ready!

Once all services are running, you can:
1. Upload evidence videos
2. Add them to blockchain
3. Query and search evidence database
4. Verify evidence authenticity
5. View blockchain transaction history

Happy chain of custody tracking!
