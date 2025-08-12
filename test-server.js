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

// Mock endpoints for testing
app.get('/config', (req, res) => {
  res.json({
    publicKey: 'test_key_mock'
  });
});

app.get('/api/test-stripe', (req, res) => {
  res.json({
    success: false,
    error: 'Stripe not configured in test mode'
  });
});

app.get('/api/test-all', (req, res) => {
  res.json({
    server: { status: 'running', timestamp: new Date().toISOString() },
    stripe: { connected: false, error: 'Test mode - Stripe disabled' },
    environment: {
      publicKey: false,
      secretKey: false,
      port: PORT
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌌 Chained Ignition System ready for testing`);
});