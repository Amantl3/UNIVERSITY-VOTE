"use strict";

require("dotenv").config();
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { anchorVote } = require("./blockchain/voteAnchor");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database Setup ──────────────────────────────────────────────────────────
const db = new sqlite3.Database("./votes.db", (err) => {
  if (err) console.error("Database connection error:", err.message);
  else console.log("Connected to the SQLite database.");
});

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voterId TEXT UNIQUE,
    candidateId INTEGER,
    electionId INTEGER,
    timestamp INTEGER,
    txHash TEXT
)`);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Routes ──────────────────────────────────────────────────────────────────

// 1. Submit a Vote
app.post("/api/vote", async (req, res) => {
  const { voterId, candidateId, electionId } = req.body;
  const timestamp = Math.floor(Date.now() / 1000);

  // Step A: Save to SQLite (Immediate feedback for UI)
  const sql = `INSERT INTO votes (voterId, candidateId, electionId, timestamp) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [voterId, candidateId, electionId, timestamp], async function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "You have already voted!" });
      }
      return res.status(500).json({ error: "Database error." });
    }

    const rowId = this.lastID;

    // Step B: Anchor to Blockchain (The Immutable Proof)
    console.log(`[Server] Anchoring vote for ${voterId} to blockchain...`);
    const result = await anchorVote({ voterId, candidateId, electionId, timestamp });

    // Step C: Update DB with the Transaction Hash
    if (result.txHash) {
      db.run(`UPDATE votes SET txHash = ? WHERE id = ?`, [result.txHash, rowId]);
    }

    res.json({
      message: "Vote cast successfully!",
      txHash: result.txHash,
      voteHash: result.voteHash
    });
  });
});

// 2. Get Results (Fast count from SQLite)
app.get("/api/results", (req, res) => {
  const sql = `SELECT candidateId, COUNT(*) as count FROM votes GROUP BY candidateId`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});