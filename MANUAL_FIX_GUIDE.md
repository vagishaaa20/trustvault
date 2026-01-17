# 🔧 Manual Fix Guide - PRIVATE_KEY Error

## The Problem

You're seeing this error:
```
❌ Blockchain initialization failed: Invalid PRIVATE_KEY: Cannot use dummy/zero value
```

This means your `backend/.env` file has `PRIVATE_KEY` set to all zeros instead of your real Ganache account private key.

---

## Step-by-Step Manual Fix

### Step 1: Open Ganache GUI and Find Your Private Key

1. **Open Ganache Desktop** (the app running on port 7545)
2. You'll see a list of accounts. Look for **Account 0** (the first one)
3. The address should look like: `0xcaafc8d49e80307913ef169999ab0c91b9ac5346`
4. Next to Account 0, find the **key icon** (🔑) or a **"Show Keys"** button
5. Click it and you'll see the **Private Key**
6. It will look like:
   ```
   0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
   ```
7. **Copy the entire private key** (including the `0x`)

---

### Step 2: Check Current .env File

```bash
# In terminal, go to trustvault directory
cd trustvault

# Look at your current .env
cat backend/.env
```

You'll see something like:
```
# Blockchain Configuration
CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
```

The `PRIVATE_KEY` line is the problem - it's all zeros.

---

### Step 3: Edit the File

#### Option A: Using VS Code (Easiest)

1. Open VS Code
2. File → Open File
3. Navigate to: `trustvault/backend/.env`
4. Find the line:
   ```
   PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
   ```
5. Replace it with your Ganache private key:
   ```
   PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
   ```
6. Save (Cmd+S or Ctrl+S)

#### Option B: Using Terminal

```bash
# Go to trustvault directory
cd trustvault

# Open the file in nano editor
nano backend/.env
```

Once in nano:
1. Use arrow keys to find the PRIVATE_KEY line
2. Move to the start of the value (after the `=`)
3. Select all the zeros using Shift+End
4. Delete them (Ctrl+K in nano)
5. Type your new private key: `0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c`
6. Press Ctrl+X to exit
7. Press Y to save
8. Press Enter to confirm

#### Option C: Using sed (One-liner)

```bash
# Replace the dummy key with your real one
cd trustvault
sed -i '' 's/PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000/PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c/' backend/.env
```

---

### Step 4: Verify the Change

```bash
# Check if it was updated
cat backend/.env | grep PRIVATE_KEY
```

You should see:
```
PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
```

**NOT all zeros!**

---

### Step 5: Restart and Test

```bash
# Go to trustvault directory
cd trustvault

# Kill any old processes
pkill -f "node server.js" 2>/dev/null || true
sleep 2

# Start the services
bash start-services.sh
```

---

## Example: Complete Fix

Here's the exact steps with example values:

### Before:
```bash
cat backend/.env
# Output:
# Blockchain Configuration
# CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
# RPC_URL=http://127.0.0.1:7545
# PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
```

### Fix it:
```bash
nano backend/.env
# Find: PRIVATE_KEY=0x0000...
# Replace with: PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
# Save (Ctrl+X, Y, Enter)
```

### After:
```bash
cat backend/.env
# Output:
# Blockchain Configuration
# CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
# RPC_URL=http://127.0.0.1:7545
# PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
```

### Start:
```bash
bash start-services.sh
```

---

## Common Mistakes to Avoid

❌ **DON'T**: Forget the `0x` at the start
```
WRONG: PRIVATE_KEY=3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
RIGHT: PRIVATE_KEY=0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c
```

❌ **DON'T**: Use someone else's key (each account has a unique key)

❌ **DON'T**: Leave it as all zeros

❌ **DON'T**: Add extra spaces
```
WRONG: PRIVATE_KEY = 0x...
RIGHT: PRIVATE_KEY=0x...
```

---

## How to Get Your Ganache Private Key

If you lost it, no problem:

1. **Ganache GUI**: Account 0 → Key icon → Show Keys
2. **Ganache CLI**: When you start ganache-cli, it prints all keys at startup
3. **Ganache Accounts Tab**: Shows all accounts and their keys

---

## Verify It Works

After updating, you should see:

```
✅ Blockchain initialized
   Provider: http://127.0.0.1:7545
   Contract: 0xD9aC54C760a12487c5C2865Face64a1F2D38445C
   Signer: 0xcaafc8d49e80307913ef169999ab0c91b9ac5346
✅ Blockchain event logging routes initialized
```

**Not:**
```
❌ Blockchain initialization failed: Invalid PRIVATE_KEY
```

---

## Quick Checklist

- [ ] Opened Ganache GUI
- [ ] Found Account 0
- [ ] Copied the Private Key (with 0x)
- [ ] Opened `backend/.env` file
- [ ] Found the PRIVATE_KEY line
- [ ] Replaced all zeros with real key
- [ ] Saved the file
- [ ] Verified with `cat backend/.env | grep PRIVATE_KEY`
- [ ] Restarted with `bash start-services.sh`

**Done! ✅**
