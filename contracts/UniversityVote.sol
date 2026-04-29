// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UniversityVote {
    address public admin;
    
    // This mapping acts as our "Digital Audit Trail"
    // It stores the hash of every vote to prove it hasn't been tampered with
    mapping(bytes32 => bool) public voteHashes;

    event VoteAnchored(bytes32 indexed voteHash);

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Anchors a vote hash on the blockchain.
     * In the interview, explain that we store the HASH, not the raw vote,
     * to ensure privacy while maintaining integrity.
     */
    function anchorVote(bytes32 _voteHash) public {
        require(!voteHashes[_voteHash], "Vote already anchored");
        voteHashes[_voteHash] = true;
        emit VoteAnchored(_voteHash);
    }

    /**
     * @dev Checks if a specific vote exists on the blockchain.
     */
    function verifyVote(bytes32 _voteHash) public view returns (bool) {
        return voteHashes[_voteHash];
    }
}