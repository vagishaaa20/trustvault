# Blockchain Event Logging Integration Guide

## Overview

This system logs every user action to the blockchain with immutable event logs:
- **Upload**: When evidence is added
- **View**: When evidence is accessed
- **Transfer**: When evidence is shared
- **Export**: When evidence is exported

Each event records:
- `msg.sender` (user's blockchain address derived from Google OAuth ID)
- `timestamp` (blockchain block timestamp)
- `evidenceHash` (SHA-256 hash of the evidence)
- Transaction hash and block number for immutability

## Architecture

### Smart Contract Events
File: [`contracts/EvidenceChain.sol`](../contracts/EvidenceChain.sol)

Four indexed events:
```solidity
event UploadEvent(indexed address sender, indexed string evidenceId, string hash, uint256 timestamp);
event ViewEvent(indexed address sender, indexed string evidenceId, string hash, uint256 timestamp);
event TransferEvent(indexed address sender, indexed address recipient, indexed string evidenceId, string hash, uint256 timestamp);
event ExportEvent(indexed address sender, indexed string evidenceId, string hash, string exportFormat, uint256 timestamp);
```

### Backend Modules

#### 1. `blockchainEvents.js`
Core blockchain integration:
- Manages Ethereum provider connection
- Converts Google OAuth IDs to Ethereum addresses (deterministic mapping)
- Emits events to smart contract
- Queries event history

**Key Functions:**
```javascript
initBlockchain(privateKey)           // Initialize connection
googleIdToAddress(googleId)          // Convert Google ID to address
logUploadEvent(googleId, evidenceId, hash)
logViewEvent(googleId, evidenceId)
logTransferEvent(googleIdFrom, googleIdTo, evidenceId)
logExportEvent(googleId, evidenceId, format)
getUserEventHistory(googleId)        // Get all events for user
getEvidenceEventHistory(evidenceId)  // Get all events for evidence
```

#### 2. `blockchainRoutes.js`
Express middleware and route handlers:
- Google OAuth token verification
- REST API endpoints for event logging
- Event history queries

**Middleware:**
```javascript
verifyGoogleToken  // Validates Google OAuth token, extracts user info
```

**Routes:**
```
POST   /api/auth/verify                    - Verify token and get blockchain address
POST   /api/blockchain/log-upload          - Log upload event
POST   /api/blockchain/log-view            - Log view event
POST   /api/blockchain/log-transfer        - Log transfer event
POST   /api/blockchain/log-export          - Log export event
GET    /api/blockchain/user-events         - Get user's event history
GET    /api/blockchain/evidence-events/:id - Get evidence's event history
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install ethers google-auth-library
```

### 2. Set Environment Variables
Create `.env` file:
```bash
# Blockchain
CONTRACT_ADDRESS=0x...              # Deploy contract first
RPC_URL=http://127.0.0.1:8545      # Ganache, Hardhat, or Infura

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Server
NODE_ENV=development
PORT=5001
```

### 3. Deploy Smart Contract
```bash
# Compile
npx hardhat compile

# Deploy (update migrations/2_deploy_contracts.js)
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Integrate Routes in Server

Update `server.js`:
```javascript
const blockchainRoutes = require("./blockchainRoutes");
const blockchainEvents = require("./blockchainEvents");

// Initialize blockchain (call once on startup)
blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);

// Add middleware and routes
app.post("/api/auth/verify", blockchainRoutes.verifyGoogleToken, blockchainRoutes.verifyTokenRoute);
app.post("/api/blockchain/log-upload", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logUploadRoute);
app.post("/api/blockchain/log-view", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logViewRoute);
app.post("/api/blockchain/log-transfer", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logTransferRoute);
app.post("/api/blockchain/log-export", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logExportRoute);
app.get("/api/blockchain/user-events", blockchainRoutes.verifyGoogleToken, blockchainRoutes.getUserEventsRoute);
app.get("/api/blockchain/evidence-events/:evidenceId", blockchainRoutes.getEvidenceEventsRoute);
```

## Usage Examples

### Frontend Integration

#### 1. Get User's Blockchain Address
```javascript
const token = getGoogleOAuthToken(); // From Google Sign-In

const response = await fetch('http://localhost:5001/api/auth/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { user } = await response.json();
console.log('Blockchain Address:', user.blockchainAddress);
```

#### 2. Log Upload Event
```javascript
const logUpload = async (token, evidenceId, videoHash) => {
  const response = await fetch('http://localhost:5001/api/blockchain/log-upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      evidenceId,
      hash: videoHash
    })
  });
  
  return await response.json();
};
```

#### 3. Log View Event
```javascript
const logView = async (token, evidenceId) => {
  const response = await fetch('http://localhost:5001/api/blockchain/log-view', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ evidenceId })
  });
  
  return await response.json();
};
```

#### 4. Log Transfer Event
```javascript
const logTransfer = async (token, evidenceId, toGoogleId) => {
  const response = await fetch('http://localhost:5001/api/blockchain/log-transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      evidenceId,
      toGoogleId
    })
  });
  
  return await response.json();
};
```

#### 5. Log Export Event
```javascript
const logExport = async (token, evidenceId, format = 'pdf') => {
  const response = await fetch('http://localhost:5001/api/blockchain/log-export', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      evidenceId,
      exportFormat: format
    })
  });
  
  return await response.json();
};
```

#### 6. Get User's Event History
```javascript
const getUserEvents = async (token) => {
  const response = await fetch('http://localhost:5001/api/blockchain/user-events', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
};
```

#### 7. Get Evidence Event History
```javascript
const getEvidenceEvents = async (evidenceId) => {
  const response = await fetch(`http://localhost:5001/api/blockchain/evidence-events/${evidenceId}`, {
    method: 'GET'
  });
  
  return await response.json();
};
```

## Google OAuth to Blockchain Address Mapping

The system uses **deterministic mapping** from Google IDs to Ethereum addresses:

```javascript
// Hash the Google ID and format as Ethereum address
const address = "0x" + keccak256(googleId).substring(2, 42);
```

This ensures:
- ✅ Same user always gets same blockchain address
- ✅ No separate database needed for user→address mapping
- ✅ Privacy: address is derived, not stored
- ✅ Auditable: anyone can verify address from Google ID

## Event Querying

### Query by User Address
```javascript
const logs = await provider.getLogs({
  address: CONTRACT_ADDRESS,
  topics: [
    ethers.utils.id("UploadEvent(address,string,string,uint256)"),
    ethers.utils.hexZeroPad(userAddress, 32)  // Filter by sender
  ]
});
```

### Query by Evidence ID
```javascript
const evidenceIdHash = ethers.utils.id(evidenceId);
const logs = await provider.getLogs({
  address: CONTRACT_ADDRESS,
  topics: [
    ethers.utils.id("ViewEvent(address,string,string,uint256)"),
    null,  // Any sender
    evidenceIdHash  // Filter by evidence
  ]
});
```

### Query by Time Range
```javascript
const logs = await provider.getLogs({
  address: CONTRACT_ADDRESS,
  fromBlock: startBlockNumber,
  toBlock: endBlockNumber,
  topics: [eventTopic]
});
```

## Security Considerations

1. **Private Key Management**
   - Never commit `.env` file with private key
   - Use environment variables or secure key management service
   - Rotate keys periodically

2. **Token Validation**
   - Always verify Google OAuth tokens server-side
   - Check token expiration
   - Validate audience claim

3. **Gas Costs**
   - Each event costs gas
   - Consider batching events for high-volume scenarios
   - Monitor Ethereum gas prices

4. **Event Immutability**
   - Events cannot be modified once emitted
   - Provides tamper-proof audit trail
   - Queryable forever on blockchain

## Troubleshooting

### Connection Issues
```javascript
// Check provider connection
console.log(await provider.getNetwork());

// Test contract read
console.log(await contract.getEvidenceHash(testId));
```

### Token Verification Fails
- Verify `GOOGLE_CLIENT_ID` matches frontend configuration
- Check token is not expired
- Ensure audience claim matches

### Gas Issues
- Check account has sufficient balance
- Verify correct RPC endpoint
- Check network gas price settings

### Event Not Found
- Ensure contract is deployed at correct address
- Verify event topics are correct
- Check block range in query

## Advanced: Batch Event Logging

For high-volume scenarios, consider:

```javascript
const logEventBatch = async (events) => {
  const tx = await contract.batchLogEvents(events);
  await tx.wait();
};

// Would require custom smart contract implementation
```

## References

- [Solidity Events](https://docs.soliditylang.org/en/latest/contracts.html#events)
- [ethers.js Documentation](https://docs.ethers.io/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Ethereum RPC Specification](https://ethereum.org/en/developers/docs/apis/json-rpc/)

## Files Modified/Created

```
backend/
  ├── blockchainEvents.js       (NEW) - Core blockchain integration
  ├── blockchainRoutes.js       (NEW) - Express routes and middleware
  ├── server.js                 (READY FOR INTEGRATION)
  └── package.json              (UPDATED - added ethers, google-auth-library)

contracts/
  └── EvidenceChain.sol         (UPDATED) - Added event logging functions
```
