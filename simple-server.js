const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Mock API endpoints for testing
app.get('/api/test-stripe', (req, res) => {
  res.json({ success: true, message: 'Mock Stripe connection' });
});

app.get('/config', (req, res) => {
  res.json({ publicKey: 'pk_test_demo_key' });
});

app.listen(PORT, () => {
  console.log(`🚀 Static server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from ${__dirname}`);
});