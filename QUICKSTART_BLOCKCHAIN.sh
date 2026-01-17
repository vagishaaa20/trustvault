#!/bin/bash
# Quick Start Guide for Blockchain Event Logging

set -e

PROJECT_ROOT="/Users/shanawaz/Desktop/GDG FInal/trustvault"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Blockchain Event Logging - Quick Start"
echo "=========================================="
echo ""

# Step 1: Install Dependencies
echo "📦 Step 1: Installing dependencies..."
cd "$BACKEND_DIR"
npm install ethers@5.7.2 google-auth-library@9.11.0 dotenv
echo "✅ Dependencies installed"
echo ""

# Step 2: Check environment setup
echo "🔐 Step 2: Environment Configuration"
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "⚠️  .env file not found. Creating template..."
  cat > "$BACKEND_DIR/.env.template" << 'EOF'
# Blockchain Configuration
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Server
NODE_ENV=development
PORT=5001
EOF
  echo "📝 Template created at: $BACKEND_DIR/.env.template"
  echo "⚠️  Please copy to .env and fill in your values"
  echo ""
else
  echo "✅ .env file exists"
fi
echo ""

# Step 3: Contract Information
echo "📜 Step 3: Smart Contract Details"
echo ""
echo "The following events are now tracked:"
echo "  1️⃣  UploadEvent - when evidence is added"
echo "  2️⃣  ViewEvent - when evidence is accessed"
echo "  3️⃣  TransferEvent - when evidence is transferred"
echo "  4️⃣  ExportEvent - when evidence is exported"
echo ""
echo "Each event logs:"
echo "  • msg.sender (user's blockchain address)"
echo "  • timestamp (block timestamp)"
echo "  • evidence hash (SHA-256)"
echo "  • transaction hash (for verification)"
echo ""

# Step 4: Backend Integration
echo "🔌 Step 4: Backend Integration"
echo ""
echo "Add to your backend/server.js:"
echo ""
cat << 'EOF'
const blockchainRoutes = require("./blockchainRoutes");
const blockchainEvents = require("./blockchainEvents");

// Initialize blockchain
blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);

// Add routes
app.post("/api/auth/verify", blockchainRoutes.verifyGoogleToken, blockchainRoutes.verifyTokenRoute);
app.post("/api/blockchain/log-upload", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logUploadRoute);
app.post("/api/blockchain/log-view", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logViewRoute);
app.post("/api/blockchain/log-transfer", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logTransferRoute);
app.post("/api/blockchain/log-export", blockchainRoutes.verifyGoogleToken, blockchainRoutes.logExportRoute);
app.get("/api/blockchain/user-events", blockchainRoutes.verifyGoogleToken, blockchainRoutes.getUserEventsRoute);
app.get("/api/blockchain/evidence-events/:evidenceId", blockchainRoutes.getEvidenceEventsRoute);
EOF
echo ""

# Step 5: API Endpoints
echo "🔗 Step 5: Available API Endpoints"
echo ""
echo "Authentication:"
echo "  POST /api/auth/verify"
echo "    Headers: Authorization: Bearer <GOOGLE_TOKEN>"
echo "    Returns: { user: { googleId, email, name, blockchainAddress } }"
echo ""
echo "Event Logging:"
echo "  POST /api/blockchain/log-upload"
echo "    Body: { evidenceId, hash }"
echo ""
echo "  POST /api/blockchain/log-view"
echo "    Body: { evidenceId }"
echo ""
echo "  POST /api/blockchain/log-transfer"
echo "    Body: { evidenceId, toGoogleId }"
echo ""
echo "  POST /api/blockchain/log-export"
echo "    Body: { evidenceId, exportFormat }"
echo ""
echo "Event History:"
echo "  GET /api/blockchain/user-events"
echo "    Headers: Authorization: Bearer <GOOGLE_TOKEN>"
echo ""
echo "  GET /api/blockchain/evidence-events/:evidenceId"
echo ""

# Step 6: Frontend Integration
echo "⚛️  Step 6: Frontend Integration"
echo ""
echo "Use the provided React hook in:"
echo "  frontend/src/hooks/useBlockchainEvents.jsx"
echo ""
echo "Example usage:"
cat << 'EOF'
import { useBlockchainEvents } from './hooks/useBlockchainEvents';

const Component = ({ googleToken }) => {
  const { logUpload, logView, logTransfer, logExport, userAddress } = 
    useBlockchainEvents(googleToken);
  
  // Call these functions when actions happen:
  // logUpload(evidenceId, hash)
  // logView(evidenceId)
  // logTransfer(evidenceId, toGoogleId)
  // logExport(evidenceId, format)
};
EOF
echo ""

# Step 7: Testing
echo "🧪 Step 7: Testing the Integration"
echo ""
echo "1. Start your blockchain:"
echo "   npx hardhat node"
echo ""
echo "2. Deploy the contract:"
echo "   npx hardhat run scripts/deploy.js --network localhost"
echo ""
echo "3. Update CONTRACT_ADDRESS in .env"
echo ""
echo "4. Start the backend:"
echo "   npm start"
echo ""
echo "5. Test with curl:"
echo "   curl -X POST http://localhost:5001/api/blockchain/log-upload \\"
echo "     -H 'Authorization: Bearer YOUR_GOOGLE_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"evidenceId\": \"EV-001\", \"hash\": \"hash-value\"}'"
echo ""

# Step 8: Files Created
echo "📁 Step 8: Files Created"
echo ""
echo "✅ backend/blockchainEvents.js - Core blockchain logic"
echo "✅ backend/blockchainRoutes.js - Express routes"
echo "✅ frontend/src/hooks/useBlockchainEvents.jsx - React integration"
echo "✅ contracts/EvidenceChain.sol - Updated with event logging"
echo "✅ BLOCKCHAIN_EVENTS_INTEGRATION.md - Full documentation"
echo "✅ IMPLEMENTATION_GUIDE.md - Step-by-step guide"
echo ""

echo "🎯 Next Steps:"
echo "1. Update backend/server.js with blockchain routes"
echo "2. Configure .env with your values"
echo "3. Deploy smart contract"
echo "4. Update frontend to use useBlockchainEvents hook"
echo "5. Test the integration"
echo ""

echo "📚 Documentation:"
echo "  • BLOCKCHAIN_EVENTS_INTEGRATION.md - Comprehensive guide"
echo "  • IMPLEMENTATION_GUIDE.md - Quick implementation guide"
echo ""

echo "✨ All done! Your blockchain event logging system is ready!"
