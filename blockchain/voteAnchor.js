"use strict";

const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

//  Config 
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const ABI_PATH = path.resolve(__dirname, "../artifacts/contracts/UniversityVote.sol/UniversityVote.json");

// Lazy singletons 
let _provider = null;
let _wallet = null;
let _contract = null;

function getProvider() {
  // Ethers v5 syntax: ethers.providers
  if (!_provider) _provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  return _provider;
}

function getWallet() {
  if (!_wallet) {
    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY env var not set in .env");
    _wallet = new ethers.Wallet(PRIVATE_KEY, getProvider());
  }
  return _wallet;
}

function getContract() {
  if (!_contract) {
    if (!fs.existsSync(ABI_PATH)) {
      throw new Error(`ABI not found. Run: npx hardhat compile`);
    }
    
    const address = process.env.CONTRACT_ADDRESS;
    if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");

    const { abi } = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));
    _contract = new ethers.Contract(address, abi, getWallet());
  }
  return _contract;
}

//  Core helpers

function computeVoteHash({ voterId, candidateId, electionId, timestamp }) {
 
  return ethers.utils.solidityKeccak256(
    ["string", "uint256", "uint256", "uint256"],
    [voterId, candidateId, electionId, timestamp]
  );
}

//  Public API

async function anchorVote(vote) {
  const { candidateId, electionId } = vote;
  const voteHash = computeVoteHash(vote);
  const contract = getContract();

  try {
    // Calling the anchorVote function in your Solidity contract
    const tx = await contract.anchorVote(voteHash); 
    const receipt = await tx.wait();
    console.log(`[voteAnchor] ✅ Anchored | tx: ${receipt.transactionHash}`);
    return { txHash: receipt.transactionHash, voteHash };
  } catch (err) {
    console.error(`[voteAnchor] ⚠️ Anchor failed:`, err.message);
    return { txHash: null, voteHash, error: err.message };
  }
}

async function verifyVote(vote) {
  const voteHash = computeVoteHash(vote);
  const contract = getContract();
  return contract.verifyVote(voteHash);
}

module.exports = {
  computeVoteHash,
  anchorVote,
  verifyVote
};