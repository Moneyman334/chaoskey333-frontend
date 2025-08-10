require("dotenv").config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Config endpoint for frontend (mock)
app.get('/config', (req, res) => {
  res.json({
    publicKey: 'pk_test_mock_key'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ChaosKey333 server running on port ${PORT}`);
  console.log(`🎬 Eternal Fusion Core Cinematic available at /eternal-fusion-core-cinematic.html`);
});