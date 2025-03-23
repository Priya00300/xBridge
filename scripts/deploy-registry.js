const hre = require("hardhat");

async function main() {
  console.log("Deploying XBridgeRegistry contract...");

  const XBridgeRegistry = await hre.ethers.getContractFactory("XBridgeRegistry");
  const registry = await XBridgeRegistry.deploy();

  // Wait for deployment transaction to be mined
  await registry.waitForDeployment();
  
  // Get the deployed contract address
  const address = await registry.getAddress();
  console.log("XBridgeRegistry deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });