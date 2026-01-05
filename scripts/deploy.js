const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EvidenceChain contract...");

  const EvidenceChain = await ethers.getContractFactory("EvidenceChain");
  const contract = await EvidenceChain.deploy();

  await contract.deployed(); // ✅ ethers v5 way

  console.log("✅ Contract deployed at:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });
