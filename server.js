const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Health check route to test if server is alive
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// PAGE ROUTES
// =======================

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Registration
app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

// Admin results (only if session user is admin)
app.get('/admin_results', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin_results.html'));
});

// Vote page (not needed here but retained)
app.get('/vote', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'vote.html'));
});

// =======================
// FORCED LOGIN (Admin Only)
// =======================
app.post('/api/login', (req, res) => {
  // Always login as admin
  req.session.user = {
    username: 'admin',
    isAdmin: true
  };

  return res.json({
    success: true,
    isAdmin: true,
    message: 'Forced admin login successful.'
  });
});

// =======================
// VOTING API (Optional)
// =======================
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./votes.db');

db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    username TEXT PRIMARY KEY,
    party TEXT
  )
`);

app.post('/api/vote', (req, res) => {
  const { username, party } = req.body;

  if (!username || !party) {
    return res.json({ success: false, message: 'Missing username or party.' });
  }

  db.get('SELECT * FROM votes WHERE username = ?', [username], (err, row) => {
    if (err) return res.json({ success: false, message: 'Server error.' });
    if (row) return res.json({ success: false, message: 'You have already voted.' });

    db.run('INSERT INTO votes (username, party) VALUES (?, ?)', [username, party], (err) => {
      if (err) return res.json({ success: false, message: 'Vote failed.' });
      return res.json({ success: true });
    });
  });
});

// =======================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

