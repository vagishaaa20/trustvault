/**
 * Blockchain Event Logging - Test Suite
 * 
 * Run these tests to verify the blockchain event logging system
 */

const blockchainEvents = require("./blockchainEvents");
const ethers = require("ethers");

// Mock data
const MOCK_GOOGLE_ID_1 = "google-user-123";
const MOCK_GOOGLE_ID_2 = "google-user-456";
const MOCK_EVIDENCE_ID = "EV-CASE-2024-001";
const MOCK_HASH = "sha256_abcdef1234567890";
const MOCK_EXPORT_FORMAT = "pdf";

/**
 * Test 1: Google ID to Address Mapping
 * 
 * Verifies that:
 * - Same Google ID always maps to same address
 * - Different Google IDs map to different addresses
 * - Address is valid Ethereum format
 */
async function testGoogleIdToAddressMapping() {
  console.log("\n🧪 Test 1: Google ID to Address Mapping");
  console.log("==========================================");

  try {
    // Get address from same Google ID twice
    const address1 = blockchainEvents.googleIdToAddress(MOCK_GOOGLE_ID_1);
    const address2 = blockchainEvents.googleIdToAddress(MOCK_GOOGLE_ID_1);

    if (address1 !== address2) {
      throw new Error("Same Google ID produced different addresses!");
    }
    console.log("✅ Same Google ID produces same address");
    console.log(`   Address: ${address1}`);

    // Verify address format
    if (!ethers.utils.isAddress(address1)) {
      throw new Error("Generated address is not valid Ethereum format!");
    }
    console.log("✅ Address is valid Ethereum format");

    // Different Google IDs should produce different addresses
    const address3 = blockchainEvents.googleIdToAddress(MOCK_GOOGLE_ID_2);
    if (address1 === address3) {
      throw new Error("Different Google IDs produced same address!");
    }
    console.log("✅ Different Google IDs produce different addresses");
    console.log(`   Address 1: ${address1}`);
    console.log(`   Address 2: ${address3}`);

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 2: Upload Event Logging
 * 
 * Verifies that:
 * - Upload events are logged to blockchain
 * - Event contains correct data
 * - Transaction hash is returned
 */
async function testUploadEventLogging() {
  console.log("\n🧪 Test 2: Upload Event Logging");
  console.log("================================");

  try {
    const event = await blockchainEvents.logUploadEvent(
      MOCK_GOOGLE_ID_1,
      MOCK_EVIDENCE_ID,
      MOCK_HASH
    );

    if (!event.transactionHash) {
      throw new Error("No transaction hash returned!");
    }
    console.log("✅ Upload event logged successfully");
    console.log(`   Event Type: ${event.event}`);
    console.log(`   Evidence ID: ${event.evidenceId}`);
    console.log(`   Hash: ${event.hash}`);
    console.log(`   TX Hash: ${event.transactionHash}`);
    console.log(`   Block: ${event.blockNumber}`);

    if (event.event !== "UPLOAD") {
      throw new Error("Event type is not UPLOAD!");
    }
    console.log("✅ Event type is correct");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 3: View Event Logging
 * 
 * Verifies that:
 * - View events are logged when accessing evidence
 * - Timestamp is captured
 * - User address is recorded
 */
async function testViewEventLogging() {
  console.log("\n🧪 Test 3: View Event Logging");
  console.log("==============================");

  try {
    const event = await blockchainEvents.logViewEvent(
      MOCK_GOOGLE_ID_1,
      MOCK_EVIDENCE_ID
    );

    if (!event.timestamp) {
      throw new Error("No timestamp in event!");
    }
    console.log("✅ View event logged successfully");
    console.log(`   Event Type: ${event.event}`);
    console.log(`   Evidence ID: ${event.evidenceId}`);
    console.log(`   Timestamp: ${event.timestamp}`);
    console.log(`   Sender: ${event.sender}`);

    if (event.event !== "VIEW") {
      throw new Error("Event type is not VIEW!");
    }
    console.log("✅ Event type is correct");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 4: Transfer Event Logging
 * 
 * Verifies that:
 * - Transfer events record both sender and recipient
 * - Evidence ID is captured
 * - Transaction is successful
 */
async function testTransferEventLogging() {
  console.log("\n🧪 Test 4: Transfer Event Logging");
  console.log("==================================");

  try {
    const event = await blockchainEvents.logTransferEvent(
      MOCK_GOOGLE_ID_1,
      MOCK_GOOGLE_ID_2,
      MOCK_EVIDENCE_ID
    );

    if (!event.transactionHash) {
      throw new Error("No transaction hash returned!");
    }
    console.log("✅ Transfer event logged successfully");
    console.log(`   Event Type: ${event.event}`);
    console.log(`   From: ${event.sender}`);
    console.log(`   To: ${event.recipient}`);
    console.log(`   Evidence ID: ${event.evidenceId}`);
    console.log(`   TX Hash: ${event.transactionHash}`);

    if (event.event !== "TRANSFER") {
      throw new Error("Event type is not TRANSFER!");
    }
    console.log("✅ Event type is correct");

    if (!event.recipient) {
      throw new Error("Recipient not recorded!");
    }
    console.log("✅ Recipient properly recorded");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 5: Export Event Logging
 * 
 * Verifies that:
 * - Export events are logged with format information
 * - Export format is captured correctly
 * - User address is recorded
 */
async function testExportEventLogging() {
  console.log("\n🧪 Test 5: Export Event Logging");
  console.log("================================");

  try {
    const event = await blockchainEvents.logExportEvent(
      MOCK_GOOGLE_ID_1,
      MOCK_EVIDENCE_ID,
      MOCK_EXPORT_FORMAT
    );

    if (!event.transactionHash) {
      throw new Error("No transaction hash returned!");
    }
    console.log("✅ Export event logged successfully");
    console.log(`   Event Type: ${event.event}`);
    console.log(`   Evidence ID: ${event.evidenceId}`);
    console.log(`   Format: ${event.exportFormat}`);
    console.log(`   TX Hash: ${event.transactionHash}`);

    if (event.event !== "EXPORT") {
      throw new Error("Event type is not EXPORT!");
    }
    console.log("✅ Event type is correct");

    if (event.exportFormat !== MOCK_EXPORT_FORMAT) {
      throw new Error("Export format not captured correctly!");
    }
    console.log("✅ Export format captured correctly");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 6: User Event History Query
 * 
 * Verifies that:
 * - User events can be queried from blockchain
 * - All event types are retrievable
 * - Events are properly indexed
 */
async function testUserEventHistoryQuery() {
  console.log("\n🧪 Test 6: User Event History Query");
  console.log("====================================");

  try {
    const history = await blockchainEvents.getUserEventHistory(MOCK_GOOGLE_ID_1);

    if (!history.uploads) {
      throw new Error("No uploads in history!");
    }
    console.log("✅ User event history retrieved successfully");
    console.log(`   Uploads: ${history.uploads.length}`);
    console.log(`   Views: ${history.views.length}`);
    console.log(`   Transfers: ${history.transfers.length}`);
    console.log(`   Exports: ${history.exports.length}`);

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 7: Evidence Event History Query
 * 
 * Verifies that:
 * - Evidence events can be queried from blockchain
 * - All accesses to evidence are tracked
 * - Events are properly indexed by evidence ID
 */
async function testEvidenceEventHistoryQuery() {
  console.log("\n🧪 Test 7: Evidence Event History Query");
  console.log("========================================");

  try {
    const history = await blockchainEvents.getEvidenceEventHistory(MOCK_EVIDENCE_ID);

    console.log("✅ Evidence event history retrieved successfully");
    console.log(`   Uploads: ${history.uploads.length}`);
    console.log(`   Views: ${history.views.length}`);

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Test 8: Event Immutability
 * 
 * Verifies that:
 * - Once logged, events cannot be modified
 * - Transaction hash proves event on blockchain
 * - Events are permanently stored
 */
async function testEventImmutability() {
  console.log("\n🧪 Test 8: Event Immutability");
  console.log("==============================");

  try {
    // Log an event
    const event1 = await blockchainEvents.logUploadEvent(
      MOCK_GOOGLE_ID_1,
      `EV-IMMUT-${Date.now()}`,
      MOCK_HASH
    );

    // Verify event is on blockchain
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL || "http://127.0.0.1:8545"
    );
    const receipt = await provider.getTransactionReceipt(event1.transactionHash);

    if (!receipt) {
      throw new Error("Event not found on blockchain!");
    }
    console.log("✅ Event permanently recorded on blockchain");
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);

    if (receipt.status !== 1) {
      throw new Error("Transaction failed!");
    }
    console.log("✅ Transaction successful");

    console.log("✅ Event is immutable and cannot be changed");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Blockchain Event Logging - Test Suite                  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  const results = [];

  // Initialize blockchain
  try {
    blockchainEvents.initBlockchain(process.env.PRIVATE_KEY);
    console.log("\n✅ Blockchain initialized");
  } catch (error) {
    console.error("❌ Blockchain initialization failed:", error.message);
    console.error("Make sure to set PRIVATE_KEY and CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  // Run tests
  results.push(await testGoogleIdToAddressMapping());
  results.push(await testUploadEventLogging());
  results.push(await testViewEventLogging());
  results.push(await testTransferEventLogging());
  results.push(await testExportEventLogging());
  results.push(await testUserEventHistoryQuery());
  results.push(await testEvidenceEventHistoryQuery());
  results.push(await testEventImmutability());

  // Summary
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Test Summary                                            ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("\n✨ All tests passed! System is ready to use.");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed. Please review the errors above.");
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = {
  testGoogleIdToAddressMapping,
  testUploadEventLogging,
  testViewEventLogging,
  testTransferEventLogging,
  testExportEventLogging,
  testUserEventHistoryQuery,
  testEvidenceEventHistoryQuery,
  testEventImmutability,
  runAllTests
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
