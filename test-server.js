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

// Mock config endpoint for testing
app.get('/config', (req, res) => {
  res.json({
    publicKey: 'pk_test_mock_key_for_testing'
  });
});

// Mock test endpoints
app.get('/api/test-all', (req, res) => {
  res.json({
    server: { status: 'operational', timestamp: new Date().toISOString() },
    environment: { publicKey: true, secretKey: true, port: PORT },
    stripe: { connected: false, error: 'Mock mode - Stripe disabled for testing' }
  });
});

console.log(`🚀 Test server starting on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running at http://localhost:${PORT}`);
  console.log('🌌 Omniverse Graph available at /omniverse-graph.html');
});