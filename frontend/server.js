/**
 * Frontend Express Server
 * Serves the IPL Auction System frontend on port 8000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.FRONTEND_PORT || 8000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🏏 IPL AUCTION FRONTEND                                  ║`);
  console.log(`║  ✅ Frontend running on http://localhost:${PORT}${' '.repeat(18 - String(PORT).length)}║`);
  console.log(`║  🔗 Backend URL: ${BACKEND_URL}${' '.repeat(31 - BACKEND_URL.length)}║`);
  console.log(`║                                                            ║`);
  console.log(`║  Open browser: http://localhost:${PORT}${' '.repeat(29 - String(PORT).length)}║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);
});
