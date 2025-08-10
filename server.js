require("dotenv").config();
const express = require('express');
const path = require('path');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    console.log('🧪 Testing Stripe connection...');

    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve();

    console.log('✅ Stripe connection successful');
    console.log('Account ID:', account.id);
    console.log('Default currency:', account.default_currency);

    res.json({
      success: true,
      accountId: account.id,
      currency: account.default_currency,
      message: 'Stripe connection successful'
    });

  } catch (error) {
    console.error('❌ Stripe connection test failed:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Stripe connection failed'
    });
  }
});

// Comprehensive test endpoint for all connections
app.get('/api/test-all', async (req, res) => {
  const results = {
    server: { status: 'running', timestamp: new Date().toISOString() },
    stripe: { connected: false, error: null },
    environment: {
      publicKey: !!process.env.STRIPE_PUBLIC_KEY,
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      port: PORT
    }
  };

  // Test Stripe
  try {
    const account = await stripe.accounts.retrieve();
    results.stripe = {
      connected: true,
      accountId: account.id,
      currency: account.default_currency
    };
  } catch (error) {
    results.stripe = {
      connected: false,
      error: error.message
    };
  }

  console.log('🔄 Full system test results:', results);
  res.json(results);
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { walletAddress, connectedWalletType } = req.body;
    const amount = req.body.amount || 1000; // Default to $10.00 if amount is not provided
    const currency = req.body.currency || 'usd'; // Default currency
    const productName = req.body.productName || 'ChaosKey333 Relic'; // Default product name

    console.log('🔄 Creating checkout session for wallet:', walletAddress);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: `Frankenstein Vault Relic for ${connectedWalletType} wallet: ${walletAddress}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
      metadata: {
        walletAddress: walletAddress,
        connectedWalletType: connectedWalletType,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    res.json({ sessionId: session.id });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook to handle successful payments
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Payment successful for wallet:', session.metadata.walletAddress);
    console.log('🧿 Ready to mint relic to vault...');

    // Here you would typically:
    // 1. Mint the NFT to the user's wallet
    // 2. Store the transaction in your database
    // 3. Send confirmation email

    // For now, we'll just log it
    console.log('🎉 Relic minting process initiated for:', session.metadata.walletAddress);
  }

  res.json({ received: true });
});

// Config endpoint to provide Stripe public key
app.get('/config', (req, res) => {
  console.log('🔑 Checking Stripe API keys...');
  console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
  console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

  if (!STRIPE_PUBLIC_KEY) {
    console.error('❌ STRIPE_PUBLIC_KEY not found in environment variables');
    return res.status(500).json({ error: 'Stripe public key not configured' });
  }

  res.json({
    publicKey: STRIPE_PUBLIC_KEY
  });
});

const cors = require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// 🧪 Test route to check server
app.get("/health", (req, res) => {
  res.send("✅ Server is alive and kickin'");
});

// 🔐 Stripe checkout endpoint (test)
app.post("/create-checkout-session2", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ChaosKey333 Relic Mint",
              description: "Unlock your VIP relic drop 🔐",
            },
            unit_amount: 33300,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://chaoskey333.web.app/vault?success=true",
      cancel_url: "https://chaoskey333.web.app/vault?canceled=true",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).send("Something went wrong");
  }
});

// 🔄 Recursion Monitor + Trigger Package - SSE and Admin Endpoints
// Part of PR #42 integration

// Store for SSE connections and monitor state
const sseConnections = new Set();
const monitorState = {
  isActive: false,
  pulseCount: 0,
  evolutionCycles: 0,
  lastPulseTime: null,
  sseConnections: 0
};
const eventLog = [];

// SSE endpoint for pulse stream
app.get('/api/pulse-stream', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add connection to set
  sseConnections.add(res);
  monitorState.sseConnections = sseConnections.size;
  
  console.log(`🔄 SSE connection established. Total connections: ${sseConnections.size}`);
  
  // Send initial pulse
  res.write(`data: ${JSON.stringify({
    type: 'CONNECTED',
    timestamp: new Date().toISOString(),
    pulseCount: monitorState.pulseCount,
    evolutionCycles: monitorState.evolutionCycles
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseConnections.delete(res);
    monitorState.sseConnections = sseConnections.size;
    console.log(`🔄 SSE connection closed. Total connections: ${sseConnections.size}`);
  });
});

// Broadcast pulse to all SSE connections
function broadcastPulse(pulseData) {
  const message = `data: ${JSON.stringify(pulseData)}\n\n`;
  
  sseConnections.forEach(res => {
    try {
      res.write(message);
    } catch (error) {
      console.warn('Failed to send pulse to SSE connection:', error);
      sseConnections.delete(res);
    }
  });
  
  monitorState.sseConnections = sseConnections.size;
}

// API endpoint to receive pulse broadcasts
app.post('/api/broadcast-pulse', (req, res) => {
  try {
    const pulseData = req.body;
    
    // Update monitor state
    monitorState.pulseCount = pulseData.count || monitorState.pulseCount;
    monitorState.lastPulseTime = pulseData.timestamp;
    
    // Log the event
    logEvent('PULSE_BROADCAST', `Pulse #${pulseData.count} broadcasted`, pulseData);
    
    // Broadcast to all SSE connections
    broadcastPulse(pulseData);
    
    console.log(`🔊 Broadcasting pulse #${pulseData.count} to ${sseConnections.size} connections`);
    res.json({ success: true, connections: sseConnections.size });
    
  } catch (error) {
    console.error('❌ Pulse broadcast failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API endpoints
app.post('/api/admin/kill-switch', (req, res) => {
  try {
    console.log('🚨 EMERGENCY KILL SWITCH ACTIVATED');
    
    // Stop all monitors
    monitorState.isActive = false;
    
    // Close all SSE connections
    sseConnections.forEach(connection => {
      try {
        connection.write(`data: ${JSON.stringify({
          type: 'KILL_SWITCH',
          message: 'Emergency shutdown activated',
          timestamp: new Date().toISOString()
        })}\n\n`);
        connection.end();
      } catch (error) {
        console.warn('Error closing SSE connection:', error);
      }
    });
    sseConnections.clear();
    monitorState.sseConnections = 0;
    
    // Reset state
    monitorState.pulseCount = 0;
    monitorState.evolutionCycles = 0;
    monitorState.lastPulseTime = null;
    
    // Log the event
    logEvent('KILL_SWITCH_EXECUTED', 'Emergency kill switch activated by admin', {
      reason: req.body.reason || 'ADMIN_SHUTDOWN',
      timestamp: req.body.timestamp
    });
    
    res.json({ 
      success: true, 
      message: 'Emergency shutdown completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Kill switch failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin system status endpoint
app.get('/api/admin/system-status', (req, res) => {
  try {
    const status = {
      activeMonitors: monitorState.isActive ? 1 : 0,
      totalPulses: monitorState.pulseCount,
      evolutionCycles: monitorState.evolutionCycles,
      sseConnections: sseConnections.size,
      monitorActive: monitorState.isActive,
      pulseStreamActive: sseConnections.size > 0,
      serverHealthy: true,
      lastPulseTime: monitorState.lastPulseTime,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    console.error('❌ System status failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin event log endpoint
app.get('/api/admin/event-log', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = eventLog.slice(0, limit);
    res.json(events);
  } catch (error) {
    console.error('❌ Event log retrieval failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin monitor control endpoints
app.post('/api/admin/monitors/start', (req, res) => {
  try {
    monitorState.isActive = true;
    logEvent('MONITOR_STARTED', 'Monitors started by admin');
    res.json({ success: true, message: 'Monitors started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/monitors/stop', (req, res) => {
  try {
    monitorState.isActive = false;
    logEvent('MONITOR_STOPPED', 'Monitors stopped by admin');
    res.json({ success: true, message: 'Monitors stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/monitors/reset', (req, res) => {
  try {
    monitorState.isActive = false;
    monitorState.pulseCount = 0;
    monitorState.evolutionCycles = 0;
    monitorState.lastPulseTime = null;
    logEvent('MONITOR_RESET', 'Monitors reset by admin');
    res.json({ success: true, message: 'Monitors reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/trigger-pulse', (req, res) => {
  try {
    if (!monitorState.isActive) {
      return res.status(400).json({ error: 'Monitor not active' });
    }
    
    monitorState.pulseCount++;
    const pulseData = {
      id: Date.now(),
      count: monitorState.pulseCount,
      timestamp: new Date().toISOString(),
      type: 'ADMIN_MANUAL_PULSE'
    };
    
    monitorState.lastPulseTime = pulseData.timestamp;
    broadcastPulse(pulseData);
    logEvent('ADMIN_PULSE_TRIGGERED', `Manual pulse #${pulseData.count} triggered by admin`);
    
    res.json({ success: true, pulse: pulseData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/force-evolution', (req, res) => {
  try {
    monitorState.evolutionCycles++;
    const evolutionData = {
      cycle: monitorState.evolutionCycles,
      timestamp: new Date().toISOString(),
      type: 'ADMIN_FORCED_EVOLUTION'
    };
    
    broadcastPulse({
      type: 'EVOLUTION_CYCLE',
      ...evolutionData
    });
    
    logEvent('ADMIN_EVOLUTION_FORCED', `Evolution cycle #${evolutionData.cycle} forced by admin`);
    res.json({ success: true, evolution: evolutionData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/pulse-interval', (req, res) => {
  try {
    const interval = req.body.interval;
    if (interval < 1000 || interval > 30000) {
      return res.status(400).json({ error: 'Interval must be between 1000-30000ms' });
    }
    
    // In a real implementation, this would update the monitor's pulse interval
    logEvent('ADMIN_INTERVAL_UPDATE', `Pulse interval updated to ${interval}ms by admin`);
    res.json({ success: true, interval });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Event imprint storage endpoint
app.post('/api/event-imprint', (req, res) => {
  try {
    const imprint = req.body;
    
    // Store in server-side log
    logEvent('EVENT_IMPRINT_STORED', `Event imprint stored: ${imprint.eventType}`, imprint);
    
    // In a real implementation, this would store in a database
    console.log('📝 Event imprint stored:', imprint.eventId);
    res.json({ success: true, stored: imprint.eventId });
  } catch (error) {
    console.error('❌ Event imprint storage failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin log event endpoint
app.post('/api/admin/log-event', (req, res) => {
  try {
    const event = req.body;
    logEvent(event.type, event.message, event);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test pulse stream endpoint (for staging tests)
app.get('/api/test-pulse-stream', (req, res) => {
  res.json({ 
    available: true, 
    message: 'Pulse stream endpoint available',
    timestamp: new Date().toISOString()
  });
});

// Internal event logging function
function logEvent(type, message, data = {}) {
  const event = {
    type,
    message,
    timestamp: new Date().toISOString(),
    data,
    level: type.includes('ERROR') ? 'error' : type.includes('WARN') ? 'warning' : 'info'
  };
  
  eventLog.unshift(event);
  
  // Keep only last 1000 events
  if (eventLog.length > 1000) {
    eventLog.splice(1000);
  }
  
  console.log(`📝 ${event.type}: ${event.message}`);
}

// Initialize server
logEvent('SERVER_STARTED', 'Frankenstein Vault server with Recursion Monitor started');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
  console.log(`🔄 Recursion Monitor + SSE streaming enabled`);
  console.log(`🛡️ Admin panel available at /admin-panel.html`);
});