// Simple test server for testing Vault Pulse Archives
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'vault-pulse-archives.html'));
});

// Test route for archives
app.get('/vault-pulse-archives', (req, res) => {
  res.sendFile(path.join(__dirname, 'vault-pulse-archives.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vault Pulse Archives Test Server Running' });
});

app.listen(PORT, () => {
  console.log(`🌀 Vault Pulse Archives Test Server running on port ${PORT}`);
  console.log(`📍 Access archives at: http://localhost:${PORT}/vault-pulse-archives.html`);
});