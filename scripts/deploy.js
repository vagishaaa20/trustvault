import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Deploying EvidenceChain contract...");

  // Get the contract factory
  const EvidenceChain = await hre.ethers.getContractFactory("EvidenceChain");

  // Deploy the contract
  const contract = await EvidenceChain.deploy();

  // Wait for deployment
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ EvidenceChain deployed to:", contractAddress);

  // Save the contract address for later use
  const config = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./contracts_config.json",
    JSON.stringify(config, null, 2)
  );
  console.log("📝 Contract config saved to contracts_config.json");

  return contractAddress;
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });
