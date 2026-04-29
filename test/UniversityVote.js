

const axios = require('axios');

async function testVotingFlow() {
    console.log("🧪 Testing Voting API...");
    
    const testVote = {
        voterId: "STUDENT_101",
        candidateId: 1,
        electionId: 2025
    };

    try {
        // Test 1: Casting a vote
        const res = await axios.post('http://localhost:3000/api/vote', testVote);
        console.log("✅ Vote 1 Successful. TxHash:", res.data.txHash);

        // Test 2: Preventing duplicates
        console.log("🧪 Testing Duplicate Prevention...");
        await axios.post('http://localhost:3000/api/vote', testVote);
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log("✅ Duplicate Prevention Working: Received 'Already Voted' error.");
        } else {
            console.error("❌ Test Failed:", error.message);
        }
    }
}

testVotingFlow();