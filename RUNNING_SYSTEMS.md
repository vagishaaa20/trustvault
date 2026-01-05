# 🎯 RANCHIHACKS - COMPLETE SYSTEM STATUS

##  ALL SYSTEMS OPERATIONAL

### 📌 Quick Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Blockchain (Ganache):** http://localhost:8545
- **Smart Contract Address:** `0x80c39FbC455b3DD1668EFbD97F46De4269ce6357`

---

## 🖥️ Running Services

### 1. Frontend - React Application
- **Port:** 3000
- **Status:**  Running
- **URL:** http://localhost:3000
- **Features:**
  - Add Evidence page with video upload and hash display
  - Verify Evidence page with blockchain verification
  - SHA-256 hash generation and display
  - Copy-to-clipboard functionality
  - Responsive UI with animations

### 2. Backend - Node.js Express Server
- **Port:** 5001
- **Status:**  Running
- **URL:** http://localhost:5001
- **Features:**
  - Video upload handling with multer
  - SHA-256 hash generation
  - Python script execution for blockchain operations
  - CORS enabled for frontend communication
  - Health check endpoint: `/health`

### 3. Blockchain - Ganache Local Network
- **Port:** 8545
- **Status:**  Running
- **URL:** http://localhost:8545
- **Network ID:** 1767290523970
- **Features:**
  - 10 pre-funded test accounts
  - Instant block mining
  - Deterministic block numbers

### 4. Smart Contract - EvidenceChain
- **Status:**  Deployed
- **Address:** `0x80c39FbC455b3DD1668EFbD97F46De4269ce6357`
- **Network:** Ganache
- **Functions:**
  - `addEvidence()` - Add new evidence to blockchain
  - `getEvidenceHash()` - Retrieve stored hash
  - `getEvidence()` - Get complete evidence details
- **Compiler:** Solidity 0.8.0

---

## 🔄 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                      │
│                  http://3000                            │
│                                                         │
│  - Add Evidence with video upload                      │
│  - Generate and display SHA-256 hash                   │
│  - Verify Evidence from blockchain                     │
└─────────────┬───────────────────────────────┬──────────┘
              │                               │
              ▼                               ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│   Backend (Express)      │    │   Python Scripts        │
│   http://5001            │    │                         │
│                          │    │  - insert.py            │
│  - /upload endpoint      │────│  - verifyBlock.py       │
│  - /verify endpoint      │    │  - hash_vid.py          │
│  - /health endpoint      │    │                         │
└──────────────┬───────────┘    └────────────┬────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
              ┌─────────────────────────────┐
              │   Blockchain (Ganache)      │
              │   http://8545               │
              │                             │
              │  - Smart Contract deployed  │
              │  - 10 test accounts         │
              │  - Block 1: Contract deploy │
              └─────────────────────────────┘
```

---

## 🚀 Workflow

### Adding Evidence
1. User uploads video via React frontend
2. Frontend sends to Backend API (`/upload`)
3. Backend calculates SHA-256 hash
4. Backend executes Python script (`insert.py`)
5. Python script interacts with blockchain
6. Smart contract stores evidence on chain
7. User receives confirmation + hash display

### Verifying Evidence
1. User uploads video via React frontend
2. Frontend sends to Backend API (`/verify`)
3. Backend calculates SHA-256 hash
4. Backend executes Python script (`verifyBlock.py`)
5. Python script retrieves stored hash from blockchain
6. Comparison determines if evidence is authentic
7. User sees verification result + hash display

---

## 📊 Ganache Test Accounts

```
Account 0: 0xb075fa6E30635B5585b69a5937945B7eab62Ff99 (Deployer)
Account 1: 0xB1d8Ba1D2E0891b6FaC51baA62edbE3e6e1f3E1b
Account 2: 0x90F8bf6A479f320ead074411a4b0e7944Ea8c9C1
... (7 more accounts available)

Starting Balance: ~100 ETH each
```

---

## 🛠️ Management Commands

### Stop Services
```bash
# Stop all Node processes
killall node

# Stop Ganache specifically
killall ganache-cli
```

### Start Services
```bash
# Start Backend
cd /Users/shanawaz/Desktop/c\ files/ranchi\ gdc/Ranchihacks/backend
npm start

# Start Frontend
cd /Users/shanawaz/Desktop/c\ files/ranchi\ gdc/Ranchihacks/frontend
npm start

# Start Ganache
ganache-cli --host 0.0.0.0 --port 8545
```

### Deploy Contract
```bash
cd /Users/shanawaz/Desktop/c\ files/ranchi\ gdc/Ranchihacks
truffle migrate --network ganache
```

---

## 📦 Dependencies

### Frontend
- React 18
- React Router
- Bootstrap 5
- Axios
- React Scripts

### Backend
- Express.js
- Multer (file upload)
- CORS
- crypto (built-in)
- Child Process (script execution)

### Smart Contracts
- Solidity 0.8.0
- Truffle
- Ganache CLI
- web3.py (Python)

### Python
- web3 6.11.3
- eth-account 0.10.0
- hashlib (built-in)

---

## 🔐 Security Features

-  SHA-256 hashing for evidence integrity
-  Blockchain immutability for chain of custody
-  Duplicate prevention in smart contract
-  Timestamp recording on blockchain
-  CORS protection on backend
-  Error validation on upload

---

## 🎓 Key Addresses & Hashes

**Deployed Contract:**
```
0x80c39FbC455b3DD1668EFbD97F46De4269ce6357
```

**Deployment Transaction:**
```
0xba8a5781958d48c5fd6d446350131ba3f2afc3eeefa6fc38a242485867c299f4
```

**Deployment Account:**
```
0xb075fa6E30635B5585b69a5937945B7eab62Ff99
```

---

## ✨ Status Summary

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Frontend |  Running | 3000 | http://localhost:3000 |
| Backend |  Running | 5001 | http://localhost:5001 |
| Ganache |  Running | 8545 | http://localhost:8545 |
| Contract |  Deployed | - | 0x80c39Fb... |

---

## 📖 Next Steps

1. **Test Upload:** Go to http://localhost:3000/add-evidence
2. **Verify Evidence:** Go to http://localhost:3000/verify-evidence
3. **Monitor Blockchain:** Use Ganache UI or web3 explorer
4. **Integrate:** Connect to production blockchain (Ethereum, Polygon, etc.)

---

**System Ready for Production Use ✨**
