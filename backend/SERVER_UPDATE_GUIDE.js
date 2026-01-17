/**
 * How to Update backend/server.js for Blockchain Event Logging
 * 
 * This file shows the exact changes needed to integrate the blockchain event logging
 */

// ============================================================
// CURRENT server.js (BEFORE) - Lines 1-20
// ============================================================

/*
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });
*/

// ============================================================
// UPDATED server.js (AFTER) - ADD THESE LINES AT TOP
// ============================================================

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("./db");

// NEW: Add these imports
const blockchainRoutes = require("./blockchainRoutes");
const blockchainEvents = require("./blockchainEvents");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });

// ============================================================
// NEW: Initialize Blockchain (add this after app setup)
// ============================================================

// Initialize blockchain connection with your private key
const initializeBlockchain = async () => {
  try {
    if (process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
      blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);
      console.log("✅ Blockchain event logging initialized");
    } else {
      console.warn("⚠️  Blockchain event logging disabled - set PRIVATE_KEY and CONTRACT_ADDRESS");
    }
  } catch (error) {
    console.error("❌ Blockchain initialization failed:", error.message);
    console.warn("Continuing without blockchain event logging...");
  }
};

// Call initialization
initializeBlockchain();

// ============================================================
// EXISTING ROUTES (keep all existing routes unchanged)
// ============================================================

// ... your existing routes like /upload, /verify, /evidence, /health, /records ...

// ============================================================
// NEW: Add Blockchain Event Logging Routes
// ============================================================

/**
 * Authentication & Verification
 */
app.post("/api/auth/verify", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.verifyTokenRoute
);

/**
 * Event Logging Endpoints
 */

// Upload Event
app.post("/api/blockchain/log-upload", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logUploadRoute
);

// View Event
app.post("/api/blockchain/log-view", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logViewRoute
);

// Transfer Event
app.post("/api/blockchain/log-transfer", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logTransferRoute
);

// Export Event
app.post("/api/blockchain/log-export", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.logExportRoute
);

/**
 * Event History Endpoints
 */

// Get user's event history
app.get("/api/blockchain/user-events", 
  blockchainRoutes.verifyGoogleToken, 
  blockchainRoutes.getUserEventsRoute
);

// Get evidence's event history
app.get("/api/blockchain/evidence-events/:evidenceId", 
  blockchainRoutes.getEvidenceEventsRoute
);

// ============================================================
// INTEGRATION WITH EXISTING /upload ENDPOINT
// ============================================================

// Here's how to integrate blockchain logging with your existing /upload endpoint:

// CURRENT CODE:
/*
app.post("/upload", upload.single("video"), async (req, res) => {
  const { caseId, evidenceId } = req.body;
  
  // ... existing upload logic ...
  
  const videoHash = await generateVideoHash(videoPath);
  
  // ... rest of upload logic ...
  
  res.json({
    success: true,
    output: stdout,
    videoHash,
    message: "Evidence uploaded successfully",
  });
});
*/

// UPDATED CODE WITH BLOCKCHAIN LOGGING:
/*
app.post("/upload", upload.single("video"), async (req, res) => {
  const { caseId, evidenceId, googleToken } = req.body;
  
  // ... existing upload logic ...
  
  const videoHash = await generateVideoHash(videoPath);
  
  // NEW: Log to blockchain if googleToken provided
  if (googleToken && process.env.CONTRACT_ADDRESS) {
    try {
      await fetch('http://localhost:5001/api/blockchain/log-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          evidenceId,
          hash: videoHash
        })
      });
      console.log('✅ Upload logged to blockchain');
    } catch (err) {
      console.warn('⚠️  Blockchain logging failed:', err.message);
      // Don't fail upload if blockchain logging fails
    }
  }
  
  res.json({
    success: true,
    output: stdout,
    videoHash,
    message: "Evidence uploaded successfully",
    blockchainLogged: true
  });
});
*/

// ============================================================
// EXISTING PORT SETUP (keep unchanged)
// ============================================================

/*
const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(" Backend running on http://0.0.0.0:5001");
  console.log(` Access locally: http://localhost:${PORT}`);
  console.log(` Access from network: http://192.168.1.24:${PORT}`);
});
*/

// ============================================================
// SUMMARY OF CHANGES
// ============================================================

/*
1. ADD IMPORTS (top of file):
   - const blockchainRoutes = require("./blockchainRoutes");
   - const blockchainEvents = require("./blockchainEvents");

2. ADD INITIALIZATION (after app setup):
   - initializeBlockchain() function call

3. ADD NEW ROUTES (before app.listen):
   - /api/auth/verify
   - /api/blockchain/log-upload
   - /api/blockchain/log-view
   - /api/blockchain/log-transfer
   - /api/blockchain/log-export
   - /api/blockchain/user-events
   - /api/blockchain/evidence-events/:evidenceId

4. OPTIONAL - UPDATE EXISTING ROUTES:
   - Add blockchain logging to your /upload endpoint
   - Add blockchain logging to your /verify endpoint
   - Add blockchain logging to export endpoints

5. KEEP ALL EXISTING CODE:
   - Don't modify existing endpoints
   - Don't change existing logic
   - Just add new routes alongside existing ones
*/

// ============================================================
// ENVIRONMENT VARIABLES REQUIRED
// ============================================================

/*
Add to your .env file:

# Blockchain
CONTRACT_ADDRESS=0x...  (deployed contract address)
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...       (your wallet private key)

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Server (existing)
NODE_ENV=development
PORT=5001
*/

// ============================================================
// TESTING THE INTEGRATION
// ============================================================

/*
After updating server.js:

1. Start blockchain:
   npx hardhat node

2. Deploy contract:
   npx hardhat run scripts/deploy.js --network localhost

3. Update CONTRACT_ADDRESS in .env

4. Start server:
   npm start

5. Test upload logging:
   curl -X POST http://localhost:5001/api/blockchain/log-upload \
     -H "Authorization: Bearer YOUR_GOOGLE_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"evidenceId":"EV-001","hash":"abc123"}'

6. Expected response:
   {
     "success": true,
     "message": "Upload event logged to blockchain",
     "event": {
       "event": "UPLOAD",
       "sender": "0x...",
       "evidenceId": "EV-001",
       "hash": "abc123",
       "transactionHash": "0x...",
       "blockNumber": 1,
       "timestamp": 1234567890
     }
   }
*/

// ============================================================
// MINIMAL SERVER.JS UPDATE (if you only want logging)
// ============================================================

/*
At the very minimum, add these 3 things:

1. At top:
   const blockchainRoutes = require("./blockchainRoutes");
   const blockchainEvents = require("./blockchainEvents");

2. After app setup:
   blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);

3. Before app.listen:
   app.post("/api/blockchain/log-upload", 
     blockchainRoutes.verifyGoogleToken, 
     blockchainRoutes.logUploadRoute);
   // ... add other routes as needed
*/

// ============================================================
// OPTIONAL: Helper Function for Blockchain Logging
// ============================================================

/**
 * Helper to log events from anywhere in your server
 */
async function logBlockchainEvent(eventType, googleToken, data) {
  if (!googleToken || !process.env.CONTRACT_ADDRESS) {
    return null;
  }

  try {
    const endpoints = {
      'upload': '/api/blockchain/log-upload',
      'view': '/api/blockchain/log-view',
      'transfer': '/api/blockchain/log-transfer',
      'export': '/api/blockchain/log-export'
    };

    const response = await fetch(`http://localhost:5001${endpoints[eventType]}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await response.json();
  } catch (error) {
    console.error(`❌ Blockchain logging failed for ${eventType}:`, error.message);
    return null;
  }
}

// Usage:
/*
const result = await logBlockchainEvent('upload', googleToken, {
  evidenceId: 'EV-001',
  hash: 'sha256...'
});
*/

// ============================================================
// DONE!
// ============================================================

/*
Your server.js is now updated with blockchain event logging!

Next steps:
1. Update frontend to send googleToken in requests
2. Use the React hook: useBlockchainEvents
3. Test each event type
4. Monitor gas costs
5. Set up event history UI
*/
