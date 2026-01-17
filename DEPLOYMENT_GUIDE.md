# 📋 How to Deploy Smart Contract (If Needed)

## Current Situation

The `run.sh` has been updated to **skip the problematic truffle deployment** and instead:
1. Uses the existing contract address from `backend/.env`
2. Only tries to deploy if no valid address is found
3. Falls back gracefully if deployment fails

## When You Need to Deploy

You only need to manually deploy if:
- ❌ `CONTRACT_ADDRESS` in `backend/.env` is all zeros (0x0000...)
- ❌ You want to redeploy with fresh state

## How to Deploy Using Truffle

### Option 1: Using Truffle (If No Node Compatibility Issues)

```bash
cd trustvault
npx truffle migrate --network ganache-gui
```

The contract address will be printed in the output. Update `backend/.env`:

```bash
CONTRACT_ADDRESS=0x<paste-contract-address-here>
```

### Option 2: Using Hardhat

```bash
cd trustvault
npx hardhat run scripts/deploy.js --network ganache-gui
```

### Option 3: Manual Deployment via Ganache Console

1. Open Ganache GUI
2. Go to **Contracts** tab
3. Compile and deploy `EvidenceChain.sol` manually
4. Copy the contract address
5. Update `backend/.env`:

```bash
CONTRACT_ADDRESS=0x<your-contract-address>
```

---

## Quick Check: Is Your Contract Deployed?

```bash
# Check if contract address is valid
grep CONTRACT_ADDRESS backend/.env

# If output is all zeros, you need to deploy:
# CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# If it's a real address, you're good:
# CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
```

---

## After Deployment

Once you have a valid contract address in `backend/.env`:

```bash
# Start the system
bash start-services.sh

# Or deploy and start:
bash run.sh
```

---

## If Truffle Deployment Fails

The error you saw was about Node.js binary compatibility. To work around:

1. **Skip truffle deployment** - Just use `start-services.sh` which doesn't require deployment
2. **Manually deploy** - Use Ganache GUI's built-in compiler
3. **Use Hardhat** - May have better Node.js compatibility

The system will work fine without redeployment as long as you keep the same contract address in `backend/.env`.

---

## Current Setup Status

✅ Ganache running on port 7545
✅ `backend/.env` has valid contract address  
✅ `run.sh` will skip deployment if contract already exists
✅ `start-services.sh` just starts services (no deployment)

**You can now just run: `bash start-services.sh`** 🚀
