# Complete Implementation Guide: Blockchain Event Logging

## ✅ What's Implemented

### 1. Smart Contract (`contracts/EvidenceChain.sol`)
- ✅ **UploadEvent**: Logs when evidence is uploaded
  - Captures: `msg.sender`, `evidenceId`, `hash`, `timestamp`
  - Function: `addEvidence(caseId, evidenceId, hash)`

- ✅ **ViewEvent**: Logs when evidence is accessed
  - Captures: `msg.sender`, `evidenceId`, `hash`, `timestamp`
  - Functions: `getEvidenceHash(evidenceId)`, `getEvidence(evidenceId)`

- ✅ **TransferEvent**: Logs when evidence is shared
  - Captures: `msg.sender`, `recipient`, `evidenceId`, `hash`, `timestamp`
  - Function: `transferEvidence(evidenceId, recipientAddress)`

- ✅ **ExportEvent**: Logs when evidence is exported
  - Captures: `msg.sender`, `evidenceId`, `hash`, `exportFormat`, `timestamp`
  - Function: `exportEvidence(evidenceId, format)`

### 2. Backend Integration (`backend/blockchainEvents.js`)
- ✅ Ethereum provider connection management
- ✅ Google OAuth ID → Blockchain Address mapping
- ✅ Event emission functions for all 4 actions
- ✅ Event history querying by user and by evidence

### 3. Express Routes (`backend/blockchainRoutes.js`)
- ✅ Google OAuth token verification middleware
- ✅ REST endpoints for each event type
- ✅ Event history retrieval endpoints

### 4. Frontend Hook (`frontend/src/hooks/useBlockchainEvents.jsx`)
- ✅ React hook for blockchain event logging
- ✅ React components for integration
- ✅ Example usage patterns

## 📋 Setup Checklist

### Step 1: Install Dependencies
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault/backend
npm install ethers@5.7.2 google-auth-library@9.11.0
```

### Step 2: Environment Configuration
Create `backend/.env`:
```bash
# Blockchain Configuration
CONTRACT_ADDRESS=0xYourContractAddress    # Deploy contract first
RPC_URL=http://127.0.0.1:8545             # Ganache or Hardhat
PRIVATE_KEY=0xYourPrivateKey              # For signing transactions

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server
NODE_ENV=development
PORT=5001
```

### Step 3: Deploy Smart Contract
```bash
# From project root
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract address to .env
```

### Step 4: Update Backend Server
Add to `backend/server.js`:

```javascript
// At the top of the file
const blockchainRoutes = require("./blockchainRoutes");
const blockchainEvents = require("./blockchainEvents");

// After app initialization (app = express())
// Initialize blockchain (call once on startup)
const initializeBlockchain = async () => {
  try {
    blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);
    console.log("✅ Blockchain initialized");
  } catch (error) {
    console.error("❌ Blockchain initialization failed:", error);
    process.exit(1);
  }
};

// Call on startup
initializeBlockchain();

// Add routes (before app.listen)
app.post("/api/auth/verify", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.verifyTokenRoute
);

app.post("/api/blockchain/log-upload", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logUploadRoute
);

app.post("/api/blockchain/log-view", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logViewRoute
);

app.post("/api/blockchain/log-transfer", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logTransferRoute
);

app.post("/api/blockchain/log-export", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logExportRoute
);

app.get("/api/blockchain/user-events", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.getUserEventsRoute
);

app.get("/api/blockchain/evidence-events/:evidenceId", 
  blockchainRoutes.getEvidenceEventsRoute
);
```

### Step 5: Update Frontend
```bash
cd frontend
npm install google-login-component  # If not already installed
```

Add to `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 6: Test the Integration
```bash
# Terminal 1: Start blockchain (Ganache or Hardhat)
npx hardhat node

# Terminal 2: Start backend
cd backend
npm start

# Terminal 3: Start frontend
cd frontend
npm start
```

## 🔍 Testing the System

### Test 1: Upload Evidence with Blockchain Logging
```bash
curl -X POST http://localhost:5001/api/blockchain/log-upload \
  -H "Authorization: Bearer YOUR_GOOGLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "evidenceId": "EV-001",
    "hash": "sha256_hash_here"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Upload event logged to blockchain",
  "event": {
    "event": "UPLOAD",
    "sender": "0x...",
    "evidenceId": "EV-001",
    "hash": "sha256_hash_here",
    "transactionHash": "0x...",
    "blockNumber": 1,
    "timestamp": 1234567890
  }
}
```

### Test 2: View Evidence with Blockchain Logging
```bash
curl -X POST http://localhost:5001/api/blockchain/log-view \
  -H "Authorization: Bearer YOUR_GOOGLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "evidenceId": "EV-001"
  }'
```

### Test 3: Get User Event History
```bash
curl -X GET http://localhost:5001/api/blockchain/user-events \
  -H "Authorization: Bearer YOUR_GOOGLE_TOKEN"
```

### Test 4: Get Evidence Event History
```bash
curl -X GET http://localhost:5001/api/blockchain/evidence-events/EV-001
```

## 🎯 Integration Points in Your Workflow

### When User Uploads Evidence
```javascript
// In AddEvidence.jsx
const handleUpload = async (file, caseId, evidenceId) => {
  // 1. Upload to backend
  const uploadResponse = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  const { videoHash } = await uploadResponse.json();

  // 2. Log to blockchain
  const blockchainResponse = await fetch('/api/blockchain/log-upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${googleToken}` },
    body: JSON.stringify({ evidenceId, hash: videoHash })
  });

  console.log('Evidence uploaded and logged:', blockchainResponse);
};
```

### When User Views Evidence
```javascript
// In CheckEvidence.jsx or VerifyEvidence.jsx
const handleViewEvidence = async (evidenceId) => {
  // 1. Fetch evidence data
  const evidence = await fetchEvidence(evidenceId);

  // 2. Log view to blockchain
  const blockchainResponse = await fetch('/api/blockchain/log-view', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${googleToken}` },
    body: JSON.stringify({ evidenceId })
  });

  console.log('Evidence viewed and logged:', blockchainResponse);
};
```

### When User Exports Evidence
```javascript
// In any export handler
const handleExport = async (evidenceId, format = 'pdf') => {
  // 1. Generate export
  const exportData = await generateExport(evidenceId, format);

  // 2. Log export to blockchain
  const blockchainResponse = await fetch('/api/blockchain/log-export', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${googleToken}` },
    body: JSON.stringify({ evidenceId, exportFormat: format })
  });

  // 3. Download export
  downloadFile(exportData, `evidence-${evidenceId}.${format}`);
};
```

## 📊 Database Schema for Event Tracking (Optional)

If you want to store events locally as well:

```sql
CREATE TABLE blockchain_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(50),        -- UPLOAD, VIEW, TRANSFER, EXPORT
  user_id VARCHAR(255),          -- Google ID
  user_address VARCHAR(255),     -- Ethereum address
  evidence_id VARCHAR(255),
  evidence_hash VARCHAR(255),
  transaction_hash VARCHAR(255),
  block_number INT,
  export_format VARCHAR(50),     -- For EXPORT events
  recipient_address VARCHAR(255), -- For TRANSFER events
  timestamp BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(evidence_id),
  INDEX(user_id),
  INDEX(user_address)
);
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use production secrets management
   - Rotate keys regularly

2. **Token Validation**
   ```javascript
   // Always verify server-side
   const ticket = await googleClient.verifyIdToken({
     idToken: token,
     audience: process.env.GOOGLE_CLIENT_ID
   });
   ```

3. **Gas Optimization**
   - Monitor transaction costs
   - Batch events for high volume
   - Use event logs for querying (not storage)

4. **Access Control**
   - Verify user owns evidence before transfer
   - Log all access attempts
   - Rate limit endpoints

## 📈 Querying Blockchain Events

### Get All Uploads by User
```javascript
const blockchainEvents = require('./backend/blockchainEvents');
const events = await blockchainEvents.getUserEventHistory(googleId);
console.log(events.uploads);
```

### Get All Accesses to Evidence
```javascript
const events = await blockchainEvents.getEvidenceEventHistory(evidenceId);
console.log(events.uploads);  // Who uploaded
console.log(events.views);    // Who viewed
```

## 🚀 Performance Considerations

1. **Event Indexing**: Events are indexed on:
   - `msg.sender` (indexed address)
   - `evidenceId` (indexed string hash)
   - Timestamp (blockchain block timestamp)

2. **Query Patterns**:
   ```javascript
   // Fast: Query by sender
   provider.getLogs({
     topics: [eventTopic, userAddressHash]
   });

   // Slower: Scan all events
   provider.getLogs({ topics: [eventTopic] });
   ```

3. **Caching**:
   - Cache user events for frequently accessed users
   - Update cache on new events
   - Set cache TTL to 5-10 minutes

## ✨ Key Features

✅ **Immutable Audit Trail**
- Every action recorded permanently
- Cannot be modified or deleted
- Queryable forever

✅ **User Privacy**
- Google OAuth integration
- Deterministic address generation
- No separate user database needed

✅ **Complete Coverage**
- Upload, View, Transfer, Export all logged
- Timestamps from blockchain
- User identification via msg.sender

✅ **Easy Integration**
- Drop-in React hooks
- REST API endpoints
- Comprehensive documentation

## 📚 Files Created/Modified

```
backend/
├── blockchainEvents.js (NEW)        - Core blockchain logic
├── blockchainRoutes.js (NEW)        - Express routes
├── server.js (READY FOR UPDATE)    - Add routes
└── package.json (UPDATED)          - Added dependencies

contracts/
└── EvidenceChain.sol (UPDATED)     - Added 4 events + functions

frontend/
└── src/hooks/useBlockchainEvents.jsx (NEW) - React integration

docs/
└── BLOCKCHAIN_EVENTS_INTEGRATION.md (NEW)  - Full documentation
```

## 🐛 Debugging Tips

Enable logging:
```javascript
// In blockchainEvents.js
console.log(`📤 Logging UPLOAD event for ${userAddress}`);
console.log(`✅ Upload event logged - TX: ${receipt.transactionHash}`);
```

Check contract was deployed:
```bash
npx hardhat run -e scripts/check-contract.js --network localhost
```

Verify token:
```bash
# Use jwt.io to decode Google token
# Check audience and expiration
```

## 🎓 Next Steps

1. Deploy contract to testnet (Sepolia, Mumbai)
2. Add event filtering UI
3. Implement event analytics dashboard
4. Add batch event querying
5. Implement event replay for audit reports

---

**Status**: ✅ Complete - Ready to integrate with frontend and backend
