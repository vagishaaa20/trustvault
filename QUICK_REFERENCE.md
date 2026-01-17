# Blockchain Event Logging - Quick Reference Card

## 📌 One-Page Reference

### Events Tracked
| Action | Event Name | Data Captured | Purpose |
|--------|-----------|---------------|---------|
| Upload | `UploadEvent` | sender, evidenceId, hash, timestamp | Track who uploaded what |
| View | `ViewEvent` | sender, evidenceId, hash, timestamp | Track who accessed evidence |
| Transfer | `TransferEvent` | sender, recipient, evidenceId, hash, timestamp | Track evidence transfers |
| Export | `ExportEvent` | sender, evidenceId, hash, format, timestamp | Track evidence exports |

### Setup Quick Start
```bash
# 1. Install dependencies
cd backend && npm install

# 2. Create .env file
cat > .env << EOF
CONTRACT_ADDRESS=0x...
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EOF

# 3. Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# 4. Update CONTRACT_ADDRESS in .env

# 5. Start backend
npm start
```

### API Endpoints Cheat Sheet

#### Get User's Blockchain Address
```bash
curl -X POST http://localhost:5001/api/auth/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

#### Log Upload
```bash
curl -X POST http://localhost:5001/api/blockchain/log-upload \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-001","hash":"abc123"}'
```

#### Log View
```bash
curl -X POST http://localhost:5001/api/blockchain/log-view \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-001"}'
```

#### Log Transfer
```bash
curl -X POST http://localhost:5001/api/blockchain/log-transfer \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-001","toGoogleId":"user@gmail.com"}'
```

#### Log Export
```bash
curl -X POST http://localhost:5001/api/blockchain/log-export \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-001","exportFormat":"pdf"}'
```

#### Get User's Event History
```bash
curl -X GET http://localhost:5001/api/blockchain/user-events \
  -H "Authorization: Bearer TOKEN"
```

#### Get Evidence's Event History
```bash
curl -X GET http://localhost:5001/api/blockchain/evidence-events/EV-001
```

### Frontend Integration Snippet
```javascript
import { useBlockchainEvents } from './hooks/useBlockchainEvents';

function MyComponent({ googleToken }) {
  const { 
    userAddress,           // User's blockchain address
    logUpload,            // Log upload event
    logView,              // Log view event
    logTransfer,          // Log transfer event
    logExport,            // Log export event
    getUserEvents,        // Get user's event history
    getEvidenceEvents,    // Get evidence's event history
    loading,              // Loading state
    error                 // Error messages
  } = useBlockchainEvents(googleToken);

  const handleUpload = async (evidenceId, hash) => {
    try {
      const result = await logUpload(evidenceId, hash);
      console.log('✅ Logged to blockchain:', result.event.transactionHash);
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  };

  return <div>{/* Your UI */}</div>;
}
```

### Environment Variables
```bash
# Blockchain
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234

# Google OAuth
GOOGLE_CLIENT_ID=xxx-xxx-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# Server
NODE_ENV=development
PORT=5001
```

### File Structure
```
backend/
├── blockchainEvents.js      ← Core blockchain logic
├── blockchainRoutes.js      ← Express routes
├── blockchainTests.js       ← Test suite
└── server.js                ← Add routes here

contracts/
└── EvidenceChain.sol        ← Smart contract with events

frontend/
└── src/hooks/
    └── useBlockchainEvents.jsx  ← React hook
```

### Smart Contract Functions

#### addEvidence (Upload)
```solidity
function addEvidence(
  string memory _caseId,
  string memory _evidenceId,
  string memory _hash
) public
```

#### getEvidenceHash (View)
```solidity
function getEvidenceHash(
  string memory _evidenceId
) public returns (string memory)
```

#### transferEvidence (Transfer)
```solidity
function transferEvidence(
  string memory _evidenceId,
  address _recipient
) public
```

#### exportEvidence (Export)
```solidity
function exportEvidence(
  string memory _evidenceId,
  string memory _exportFormat
) public returns (string memory)
```

### Useful Commands

```bash
# Run tests
node backend/blockchainTests.js

# View contract ABI
cat build/contracts/EvidenceChain.json | jq '.abi'

# Check blockchain connection
curl http://127.0.0.1:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get contract code
curl http://127.0.0.1:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x...","latest"],"id":1}'
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Contract not found" | Check CONTRACT_ADDRESS in .env |
| "Token verification failed" | Verify GOOGLE_CLIENT_ID matches frontend |
| "Connection refused" | Start blockchain with `npx hardhat node` |
| "Insufficient balance" | Fund wallet from faucet or Hardhat |
| "Invalid address format" | Ensure Google OAuth token is valid |

### Key Features Summary

✅ **Immutable Events**
- Once logged, cannot be changed
- Permanent blockchain record
- Provides audit trail

✅ **User Privacy**
- Google OAuth integration
- Deterministic address generation
- No user database needed

✅ **All Actions Tracked**
- Upload, View, Transfer, Export
- Complete event coverage
- Queryable by user or evidence

✅ **Easy Frontend Integration**
- React hook provided
- Simple async functions
- Built-in error handling

### Response Structure
```javascript
{
  "success": true,
  "message": "Event logged to blockchain",
  "event": {
    "event": "UPLOAD",
    "sender": "0x...",
    "evidenceId": "EV-001",
    "hash": "sha256...",
    "transactionHash": "0x...",
    "blockNumber": 123,
    "timestamp": 1234567890
  }
}
```

### Gas Cost Considerations
- Upload: ~100,000 gas
- View: ~50,000 gas (state change to emit event)
- Transfer: ~80,000 gas
- Export: ~90,000 gas

At 20 Gwei gas price: ~$2-4 per action

### Next Steps After Setup
1. ✅ Deploy contract
2. ✅ Set environment variables
3. ✅ Add routes to server.js
4. ✅ Update frontend components
5. ✅ Run tests
6. ✅ Monitor gas usage

---

For full documentation, see:
- `BLOCKCHAIN_EVENTS_INTEGRATION.md` - Comprehensive guide
- `IMPLEMENTATION_GUIDE.md` - Step-by-step setup
- `BLOCKCHAIN_EVENTS_SUMMARY.md` - Feature overview
