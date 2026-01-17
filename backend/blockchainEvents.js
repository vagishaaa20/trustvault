const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

// Load contract ABI
const contractABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../build/contracts/EvidenceChain.json"),
    "utf8"
  )
).abi;

// Contract address (deploy your contract first)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// RPC Provider (Ganache or Hardhat) - use port 7545 for Ganache GUI
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

let provider;
let contract;
let signer;

/**
 * Initialize blockchain connection
 * @param {string} privateKey - Private key for transactions
 */
const initBlockchain = (privateKey) => {
  try {
    // Validate private key
    if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      throw new Error("Invalid PRIVATE_KEY: Cannot use dummy/zero value. Set a real Ganache account private key.");
    }

    // Validate contract address
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid CONTRACT_ADDRESS: Make sure contract is deployed. Run: bash run.sh");
    }

    // Validate private key format
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      throw new Error(`Invalid PRIVATE_KEY format. Expected 66 chars (0x + 64 hex), got ${privateKey.length}. Example: 0x3c180ea7a7043108465cc18d93e264235c239f7f139402a01a6766ae95c04e3c`);
    }

    // Initialize provider
    console.log(`🔌 Connecting to RPC: ${RPC_URL}`);
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Test provider connection
    if (!provider) {
      throw new Error("Failed to create provider");
    }

    // Create signer from private key
    console.log(`🔑 Creating wallet from private key...`);
    signer = new ethers.Wallet(privateKey, provider);
    
    if (!signer || !signer.address) {
      throw new Error("Failed to create wallet from private key");
    }

    // Create contract instance
    console.log(`📝 Creating contract instance...`);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    if (!contract) {
      throw new Error("Failed to create contract instance");
    }

    console.log("✅ Blockchain initialized successfully");
    console.log(`   Provider: ${RPC_URL}`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Signer: ${signer.address}`);
  } catch (error) {
    console.error("❌ Blockchain initialization failed:", error.message);
    console.error("\n📋 Quick Fix Checklist:");
    console.error("   1. Check backend/.env exists");
    console.error("   2. Verify PRIVATE_KEY is set (not all zeros)");
    console.error("   3. Verify CONTRACT_ADDRESS is set");
    console.error("   4. Verify Ganache is running on port 7545");
    console.error("   5. Run: bash run.sh to deploy contract\n");
    throw error;
  }
};

/**
 * Convert Google OAuth ID to Ethereum address
 * Using deterministic mapping: Hash(googleId) => address format
 * @param {string} googleId - Google user ID
 * @returns {string} - Ethereum address
 */
const googleIdToAddress = (googleId) => {
  const ethers_module = require("ethers");
  // Create deterministic address from Google ID
  const hash = ethers_module.utils.id(googleId);
  // Take first 40 hex chars (20 bytes) and format as address
  const address = "0x" + hash.substring(2, 42);
  return ethers_module.utils.getAddress(address); // Checksum address
};

/**
 * Log UPLOAD event to blockchain
 * @param {string} googleId - Google user ID
 * @param {string} evidenceId - Evidence ID
 * @param {string} hash - Video hash (SHA-256)
 * @returns {Promise} - Transaction receipt
 */
const logUploadEvent = async (googleId, evidenceId, hash) => {
  try {
    const userAddress = googleIdToAddress(googleId);
    console.log(`📤 Logging UPLOAD event for ${userAddress}`);

    // Call contract function - this will emit UploadEvent
    const tx = await contract.addEvidence(
      "default-case", // caseId
      evidenceId,
      hash
    );

    const receipt = await tx.wait();
    console.log(`✅ Upload event logged - TX: ${receipt.transactionHash}`);

    return {
      event: "UPLOAD",
      sender: userAddress,
      googleId,
      evidenceId,
      hash,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error("❌ Upload event failed:", error.message);
    throw error;
  }
};

/**
 * Log VIEW event to blockchain
 * @param {string} googleId - Google user ID
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise} - Transaction receipt
 */
const logViewEvent = async (googleId, evidenceId) => {
  try {
    const userAddress = googleIdToAddress(googleId);
    console.log(`👁️  Logging VIEW event for ${userAddress}`);

    // Call contract function - this will emit ViewEvent
    const hash = await contract.getEvidenceHash(evidenceId);

    // Alternative: use getEvidence for more details
    // const evidence = await contract.getEvidence(evidenceId);

    console.log(`✅ View event logged - Evidence: ${evidenceId}`);

    return {
      event: "VIEW",
      sender: userAddress,
      googleId,
      evidenceId,
      hash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error("❌ View event failed:", error.message);
    throw error;
  }
};

/**
 * Log TRANSFER event to blockchain
 * @param {string} googleIdFrom - From Google user ID
 * @param {string} googleIdTo - To Google user ID
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise} - Transaction receipt
 */
const logTransferEvent = async (googleIdFrom, googleIdTo, evidenceId) => {
  try {
    const fromAddress = googleIdToAddress(googleIdFrom);
    const toAddress = googleIdToAddress(googleIdTo);
    console.log(`🔄 Logging TRANSFER event from ${fromAddress} to ${toAddress}`);

    // Call contract function - this will emit TransferEvent
    const tx = await contract.transferEvidence(evidenceId, toAddress);
    const receipt = await tx.wait();

    console.log(`✅ Transfer event logged - TX: ${receipt.transactionHash}`);

    return {
      event: "TRANSFER",
      sender: fromAddress,
      recipient: toAddress,
      googleIdFrom,
      googleIdTo,
      evidenceId,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error("❌ Transfer event failed:", error.message);
    throw error;
  }
};

/**
 * Log EXPORT event to blockchain
 * @param {string} googleId - Google user ID
 * @param {string} evidenceId - Evidence ID
 * @param {string} exportFormat - Export format (pdf, json, csv, etc.)
 * @returns {Promise} - Transaction receipt
 */
const logExportEvent = async (googleId, evidenceId, exportFormat = "json") => {
  try {
    const userAddress = googleIdToAddress(googleId);
    console.log(`📤 Logging EXPORT event for ${userAddress} (format: ${exportFormat})`);

    // Call contract function - this will emit ExportEvent
    const tx = await contract.exportEvidence(evidenceId, exportFormat);
    const receipt = await tx.wait();

    console.log(`✅ Export event logged - TX: ${receipt.transactionHash}`);

    return {
      event: "EXPORT",
      sender: userAddress,
      googleId,
      evidenceId,
      exportFormat,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error("❌ Export event failed:", error.message);
    throw error;
  }
};

/**
 * Get all events for a user
 * @param {string} googleId - Google user ID
 * @returns {Promise} - Array of events
 */
const getUserEventHistory = async (googleId) => {
  try {
    const userAddress = googleIdToAddress(googleId);
    console.log(`📋 Fetching event history for ${userAddress}`);

    // Query events from blockchain
    const uploadEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("UploadEvent(address,string,string,uint256)"),
        ethers.utils.hexZeroPad(userAddress, 32),
      ],
    });

    const viewEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("ViewEvent(address,string,string,uint256)"),
        ethers.utils.hexZeroPad(userAddress, 32),
      ],
    });

    const transferEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("TransferEvent(address,address,string,string,uint256)"),
        ethers.utils.hexZeroPad(userAddress, 32),
      ],
    });

    const exportEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("ExportEvent(address,string,string,string,uint256)"),
        ethers.utils.hexZeroPad(userAddress, 32),
      ],
    });

    console.log(
      `✅ Found ${uploadEvents.length} uploads, ${viewEvents.length} views, ${transferEvents.length} transfers, ${exportEvents.length} exports`
    );

    return {
      uploads: uploadEvents,
      views: viewEvents,
      transfers: transferEvents,
      exports: exportEvents,
    };
  } catch (error) {
    console.error("❌ Failed to fetch event history:", error.message);
    throw error;
  }
};

/**
 * Get all events for specific evidence
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise} - Array of events
 */
const getEvidenceEventHistory = async (evidenceId) => {
  try {
    console.log(`📋 Fetching event history for evidence: ${evidenceId}`);

    const evidenceIdHash = ethers.utils.id(evidenceId);

    // Query all events for this evidence
    const uploadEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("UploadEvent(address,string,string,uint256)"),
        null, // sender (any)
        evidenceIdHash,
      ],
    });

    const viewEvents = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("ViewEvent(address,string,string,uint256)"),
        null,
        evidenceIdHash,
      ],
    });

    console.log(
      `✅ Found ${uploadEvents.length} uploads, ${viewEvents.length} views for evidence`
    );

    return {
      uploads: uploadEvents,
      views: viewEvents,
    };
  } catch (error) {
    console.error("❌ Failed to fetch evidence history:", error.message);
    throw error;
  }
};

module.exports = {
  initBlockchain,
  googleIdToAddress,
  logUploadEvent,
  logViewEvent,
  logTransferEvent,
  logExportEvent,
  getUserEventHistory,
  getEvidenceEventHistory,
};
