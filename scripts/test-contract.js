import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("📋 Testing EvidenceChain Contract\n");
  console.log("=".repeat(50));

  // Get contract address from config
  let contractAddress;
  if (fs.existsSync("./contracts_config.json")) {
    const config = JSON.parse(fs.readFileSync("./contracts_config.json"));
    contractAddress = config.contractAddress;
    console.log("📍 Using deployed contract at:", contractAddress);
  } else {
    console.error("❌ Contract not deployed. Run 'npx hardhat run scripts/deploy.js' first");
    process.exit(1);
  }

  // Get the contract instance
  const EvidenceChain = await hre.ethers.getContractFactory("EvidenceChain");
  const contract = EvidenceChain.attach(contractAddress);

  // Get signer (first account)
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Signer address:", signer.address);
  console.log("=".repeat(50) + "\n");

  // Test 1: Add evidence
  console.log("📤 Test 1: Adding evidence...");
  const caseId = "550e8400-e29b-41d4-a716-446655440000";
  const evidenceId = "EV-001";
  const hash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

  try {
    const addTx = await contract.addEvidence(caseId, evidenceId, hash);
    await addTx.wait();
    console.log(" Evidence added successfully!");
    console.log("   - Case ID:", caseId);
    console.log("   - Evidence ID:", evidenceId);
    console.log("   - Hash:", hash);
  } catch (error) {
    console.error("❌ Error adding evidence:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Get evidence hash
  console.log("🔍 Test 2: Retrieving evidence hash...");
  try {
    const retrievedHash = await contract.getEvidenceHash(evidenceId);
    console.log(" Retrieved hash:", retrievedHash);
    console.log("   Hash matches:", retrievedHash === hash ? "✓ YES" : "✗ NO");
  } catch (error) {
    console.error("❌ Error retrieving hash:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Get full evidence details
  console.log("📋 Test 3: Retrieving full evidence details...");
  try {
    const evidence = await contract.getEvidence(evidenceId);
    console.log(" Evidence details:");
    console.log("   - Case ID:", evidence[0]);
    console.log("   - Evidence ID:", evidence[1]);
    console.log("   - Hash:", evidence[2]);
    console.log("   - Timestamp:", new Date(Number(evidence[3]) * 1000).toISOString());
  } catch (error) {
    console.error("❌ Error retrieving evidence:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 4: Try adding duplicate (should fail)
  console.log("⚠️  Test 4: Attempting to add duplicate evidence...");
  try {
    const dupTx = await contract.addEvidence(caseId, evidenceId, hash);
    await dupTx.wait();
    console.log("❌ ERROR: Should have prevented duplicate!");
  } catch (error) {
    console.log(" Correctly prevented duplicate:", error.reason || error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ All tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test error:", error);
    process.exit(1);
  });
