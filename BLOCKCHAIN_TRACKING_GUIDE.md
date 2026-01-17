# 🔗 Blockchain Event Logging - Complete Guide

## Overview

Every action in TrustVault creates an **immutable blockchain event** that tracks:
- **Who** accessed the evidence (Ethereum address)
- **What** they did (UPLOAD, VIEW, TRANSFER, EXPORT)
- **When** they did it (timestamp)
- **Evidence Hash** (SHA-256 of the file)

## Events Tracked

### 1. **UPLOAD Event**
- Triggered when new evidence is uploaded
- Records: User address, Evidence ID, File hash
- **Access**: POST `/api/blockchain/log-upload`

### 2. **VIEW Event**
- Triggered when evidence is viewed/accessed
- Records: User address, Evidence ID, Timestamp
- **Access**: POST `/api/blockchain/log-view`

### 3. **TRANSFER Event**
- Triggered when evidence is transferred between users
- Records: From address, To address, Evidence ID
- **Access**: POST `/api/blockchain/log-transfer`

### 4. **EXPORT Event**
- Triggered when evidence is exported
- Records: User address, Evidence ID, Export details
- **Access**: POST `/api/blockchain/log-export`

## How to Access Blockchain Events

### 1. **Frontend Dashboard**
Navigate to: **http://localhost:3000/blockchain-events**

Features:
- View all blockchain events in real-time
- Filter by evidence ID
- View your personal events
- See complete chain of custody for any evidence
- Export event history

### 2. **API Endpoints**

#### Get All Events for an Evidence ID
```bash
curl -X GET "http://localhost:5001/api/blockchain/evidence-events/EV-001" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "events": [
    {
      "eventType": "UploadEvent",
      "sender": "0xcaafc8d49e80307913ef169999ab0c91b9ac5346",
      "evidenceHash": "0x...",
      "timestamp": 1705516800,
      "transactionHash": "0x..."
    },
    {
      "eventType": "ViewEvent",
      "sender": "0x...",
      "timestamp": 1705516900
    }
  ]
}
```

#### Get Your Personal Events
```bash
curl -X GET "http://localhost:5001/api/blockchain/user-events" \
  -H "Authorization: Bearer <YOUR_GOOGLE_TOKEN>" \
  -H "Content-Type: application/json"
```

#### Log an Upload Event
```bash
curl -X POST "http://localhost:5001/api/blockchain/log-upload" \
  -H "Authorization: Bearer <YOUR_GOOGLE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "evidenceId": "EV-001",
    "fileHash": "sha256_hash_of_file",
    "caseId": "CASE-2026-001"
  }'
```

### 3. **Smart Contract Events**

View raw blockchain events using ethers.js:

```javascript
const eventFilter = contract.filters.UploadEvent();
const events = await contract.queryFilter(eventFilter);
events.forEach(event => {
  console.log("Uploader:", event.args.sender);
  console.log("Evidence Hash:", event.args.evidenceHash);
  console.log("Timestamp:", new Date(event.args.timestamp * 1000));
});
```

## Tracking Chain of Custody

### Complete History for One Evidence Item

To see the complete chain of custody for evidence ID "EV-001":

```bash
curl -X GET "http://localhost:5001/api/blockchain/evidence-events/EV-001"
```

This returns **all events** in chronological order:
1. ✅ **UPLOAD** - User A uploaded on Jan 17, 2:00 PM
2. 👁️ **VIEW** - User B viewed on Jan 17, 3:15 PM  
3. 🔄 **TRANSFER** - User B transferred to User C on Jan 17, 4:30 PM
4. 📤 **EXPORT** - User C exported on Jan 17, 5:45 PM

Each event is **immutable** on the blockchain - cannot be modified or deleted.

## Who Accessed What

### By Ethereum Address

The system automatically converts Google IDs to Ethereum addresses:
```
Google ID: "user@gmail.com"  →  Address: "0xcaafc8d49e80307913ef169999ab0c91b9ac5346"
```

### By Time Range

All events include Unix timestamps, making it easy to query:
- "Who accessed evidence between 2:00 PM and 5:00 PM?"
- "What happened to this evidence in the last hour?"

### Audit Log

Every event contains:
- **Sender**: Who performed the action
- **Action**: UPLOAD/VIEW/TRANSFER/EXPORT
- **Evidence**: Which evidence was affected
- **Hash**: File hash (for upload verification)
- **Timestamp**: Exact moment
- **Transaction Hash**: Blockchain transaction ID (immutable proof)

## Data Immutability

Once an event is recorded on the blockchain:

❌ **Cannot be:**
- Deleted
- Modified
- Tampered with
- Hidden from the audit trail

✅ **Can be:**
- Viewed by anyone (transparent)
- Verified cryptographically
- Audited at any time
- Used as evidence in court (immutable record)

## Frontend Features

### BlockchainEvents Component

Located at: `frontend/src/BlockchainEvents.jsx`

**Features:**
- Real-time event display
- Filter by evidence ID
- Search by event type
- Statistics dashboard
- Clickable addresses (shows full address on hover)
- Color-coded event types
- Responsive design

**Usage:**
```jsx
import BlockchainEvents from "./BlockchainEvents";

// In your component:
<BlockchainEvents />
```

## Integration with TrustVault Flow

### Upload Flow
1. User uploads evidence at `/upload`
2. Backend generates file hash
3. **Automatically creates UploadEvent** on blockchain
4. Records: User, Evidence ID, Hash, Timestamp

### Verify Flow
1. User uploads file to verify
2. Backend compares hash with blockchain
3. **Creates ViewEvent** to track access
4. Returns: Authentic/Tampered result

### Transfer Flow
1. User transfers evidence to colleague
2. **Creates TransferEvent** on blockchain
3. Records: From, To, Evidence ID
4. Permission system updated

### Export Flow
1. User exports evidence report
2. **Creates ExportEvent** on blockchain
3. Records: User, Export details, Timestamp
4. For audit trail compliance

## Troubleshooting

### "Cannot read properties of undefined (reading 'getLogs')"
**Solution**: Backend PRIVATE_KEY not set correctly
```bash
# Check backend/.env
cat backend/.env | grep PRIVATE_KEY

# Should show a real private key from Ganache, not all zeros
```

### "Failed to fetch blockchain events"
**Solution**: Check backend is running
```bash
curl http://localhost:5001/health
```

### "No events showing"
**Solution**: Events are created when actions happen
1. Upload some evidence
2. Wait 2-3 seconds
3. Refresh blockchain events page
4. New events should appear

## Best Practices

1. **Always check blockchain events before signing off** on evidence transfer
2. **Screenshot or export event logs** for critical cases
3. **Use timestamps** to establish chain of custody
4. **Verify addresses** match expected team members
5. **Audit regularly** - check blockchain tab weekly

## Legal/Compliance

- **Tamper-evident**: Events cannot be modified
- **Non-repudiation**: Sender cannot deny their action
- **Audit trail**: Complete history maintained
- **Timestamps**: Cryptographically secured
- **Legal admissibility**: Suitable for court proceedings

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/blockchain/evidence-events/:id` | GET | Get all events for evidence |
| `/api/blockchain/user-events` | GET | Get your personal events |
| `/api/blockchain/log-upload` | POST | Create upload event |
| `/api/blockchain/log-view` | POST | Create view event |
| `/api/blockchain/log-transfer` | POST | Create transfer event |
| `/api/blockchain/log-export` | POST | Create export event |

## URLs to Access

| Feature | URL |
|---------|-----|
| **Blockchain Events Dashboard** | http://localhost:3000/blockchain-events |
| **Backend API** | http://localhost:5001/api/blockchain/* |
| **Ganache Blockchain** | http://localhost:7545 |
| **Smart Contract** | Deployed at: `CONTRACT_ADDRESS` in `.env` |
