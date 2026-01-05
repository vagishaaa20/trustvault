# Fix 400 Error - Complete Setup Guide

## The Problem
Error 400 occurs when uploading evidence because:
1. Ganache blockchain is not running
2. Smart contract is not deployed
3. Python scripts can't connect to the blockchain

## The Solution - Step by Step

### Step 1: Start Ganache
Open Ganache.app and wait until you see:
```
Server is listening on port 8545
```

### Step 2: Deploy Smart Contract
In terminal, run:
```bash
cd "/Users/shanawaz/Desktop/c files/ranchi gdc/Ranchihacks"
npx truffle migrate --network ganache
```

Wait for output like:
```
Compiling your contracts...
Migrations complete! Summary:
> Total deployments:   1
> Final cost:          0.00X ETH
```

### Step 3: Start Backend & Frontend
Run:
```bash
./script.sh
```

This will:
- Deploy contract
- Start backend on port 5001
- Start frontend on port 3000

### Step 4: Test Upload
1. Open http://localhost:3000
2. Go to "Dashboard" or "Add Evidence"
3. Fill in Case ID and Evidence ID
4. Select a video file
5. Click "Upload Evidence"

 Should work now!

---

## Troubleshooting

**Still getting 400 error?**

Check these:
1. Is Ganache running? (port 8545)
   ```bash
   curl http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}'
   ```
   Should return: `{"id":1,"jsonrpc":"2.0","result":true}`

2. Is contract deployed?
   ```bash
   npx truffle migrate --network ganache --reset
   ```

3. Is backend running? (port 5001)
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"ok","message":"Backend is running"}`

4. Check backend logs for Python errors
   Look at the terminal where backend is running for error messages

---

## Quick Checklist
- [ ] Ganache.app is running
- [ ] `npx truffle migrate --network ganache` completed successfully
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 3000
- [ ] All ports are accessible

Once all are running, upload should work!
