const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Basic route for config (without Stripe for demo)
app.get('/config', (req, res) => {
  res.json({ 
    publicKey: 'demo_key_placeholder',
    message: 'Demo mode - Stripe not configured' 
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the vault ignition simulation
app.get('/vault-ignition-simulation', (req, res) => {
  res.sendFile(path.join(__dirname, 'vault-ignition-simulation.html'));
});

app.listen(PORT, () => {
  console.log(`🔥 Vault server running on http://localhost:${PORT}`);
  console.log(`🚀 Ignition simulation available at http://localhost:${PORT}/vault-ignition-simulation.html`);
});