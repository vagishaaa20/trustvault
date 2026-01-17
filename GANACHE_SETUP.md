# Ganache Setup for Blockchain Integration

## The Problem
The blockchain events feature requires a valid Ganache private key to sign transactions. The current `.env` has a dummy key that doesn't work.

## Solution: Use Ganache's Default Account

### Step 1: Start Ganache
```bash
ganache-cli
```

You'll see output like:
```
Ganache CLI v6.x.x (ganache-core: 2.x.x)

Available Accounts
==================
(0) 0x0000...0000 (100 ETH)
(1) 0x1111...1111 (100 ETH)
...

Private Keys
==================
(0) 0x0000000000000000000000000000000000000000000000000000000000000001
(1) 0x0000000000000000000000000000000000000000000000000000000000000002
...
```

### Step 2: Copy Account 0's Private Key
The first account's private key (0) is shown. For default Ganache, it's typically:
```
0x0000000000000000000000000000000000000000000000000000000000000001
```

But **check your actual Ganache output** - it may be different.

### Step 3: Update backend/.env
Edit `backend/.env` and replace the PRIVATE_KEY line:
```bash
# Before (dummy):
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# After (use Ganache account 0's actual key):
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
```

### Step 4: Get Contract Address
After running `bash run.sh`, it will deploy the contract and output the address:
```
Contract deployed at: 0x...
```

Update `backend/.env` with this address:
```bash
CONTRACT_ADDRESS=0x...
```

### Step 5: Verify
Restart the backend and test:
```bash
bash test-api.sh
```

Should now show:
```
2️⃣  Testing Evidence Events History (EV-001)...
{
  "success": true,
  "events": []
}
```

## Troubleshooting

**Q: Where do I find the private key?**
A: When you run `ganache-cli`, it prints all accounts and their private keys at startup.

**Q: Can I use a different account?**
A: Yes! Use any account's private key, but make sure the account has ETH (all Ganache accounts start with 100 ETH).

**Q: Error: "invalid sender"**
A: The private key doesn't match an account in Ganache. Copy the exact key from Ganache output.

**Q: Error: "contract not found"**
A: Run `bash run.sh` to deploy the contract and get its address.
