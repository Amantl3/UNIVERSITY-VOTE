const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy UniversityVote
 * Compatible with Node 14 and Ethers v5
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log(`\n🚀 Deploying with: ${deployer.address}`);
  
  // Ethers v5 syntax for balance and formatting
  const balance = await deployer.getBalance();
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH\n`);

  // ── Deploy ─────────────────────────────────────
  const Factory = await ethers.getContractFactory("UniversityVote");
  const contract = await Factory.deploy();

  // Ethers v5 uses .deployed()
  await contract.deployed();

  const address = contract.address;
  console.log(`✅ UniversityVote deployed to: ${address}`);

  // ── Save deployment info ───────────────────────
  const info = {
    network: "localhost",
    address: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.resolve(deploymentsDir, "latest.json"),
    JSON.stringify(info, null, 2)
  );
  console.log(`\n📁 Deployment info saved to deployments/latest.json`);
  console.log(`\n💡 IMPORTANT: Copy the address ${address} into your .env file!`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});