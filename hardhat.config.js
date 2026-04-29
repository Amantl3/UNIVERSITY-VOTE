require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // THIS IS THE CRITICAL PART:
      evmVersion: "paris" 
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};