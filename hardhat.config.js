require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.8.28",
      }
    ]
  },
  networks: {
    "educhain-testnet": {
      url: process.env.EDUCHAIN_TESTNET_RPC_URL || "https://devnet-api.educhain.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 656476
    },
    educhain: {
      url: process.env.EDUCHAIN_RPC_URL || "https://api.blockchainedu.xyz/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 9899
    }
  }
};