require("dotenv").config();
const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const DeploymentOrchestrator = require('./deployment-manager');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

// Initialize Stripe only if keys are available
let stripe = null;
if (STRIPE_SECRET_KEY) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
    console.log('🔑 Stripe integration enabled');
} else {
    console.log('⚠️ Stripe keys not found - Stripe features disabled');
}

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket server for live vault broadcast
const wss = new WebSocketServer({ server });

// Initialize Deployment Orchestrator
const deploymentOrchestrator = new DeploymentOrchestrator();

// Store connected WebSocket clients
const connectedClients = new Set();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve your frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve Cosmic Replay Terminal
app.get('/cosmic-terminal', (req, res) => {
  res.sendFile(path.join(__dirname, 'cosmic-terminal.html'));
});

// Serve Rollback Demo
app.get('/rollback-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'rollback-demo.html'));
});

// WebSocket connection handling for live vault broadcast
wss.on('connection', (ws) => {
  console.log('🌌 New client connected to vault broadcast');
  connectedClients.add(ws);
  
  // Send initial vault status
  ws.send(JSON.stringify({
    type: 'vault_status',
    data: deploymentOrchestrator.getVaultStatus()
  }));
  
  ws.on('close', () => {
    console.log('👋 Client disconnected from vault broadcast');
    connectedClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    connectedClients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  connectedClients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// Listen to deployment orchestrator events
deploymentOrchestrator.addEventListener('deployment.started', (event) => {
  broadcastToClients({ type: 'deployment_started', data: event.detail });
});

deploymentOrchestrator.addEventListener('deployment.completed', (event) => {
  broadcastToClients({ type: 'deployment_completed', data: event.detail });
});

deploymentOrchestrator.addEventListener('deployment.failed', (event) => {
  broadcastToClients({ type: 'deployment_failed', data: event.detail });
});

deploymentOrchestrator.addEventListener('pr.deployment.started', (event) => {
  broadcastToClients({ type: 'pr_deployment_started', data: event.detail });
});

deploymentOrchestrator.addEventListener('pr.deployment.completed', (event) => {
  broadcastToClients({ type: 'pr_deployment_completed', data: event.detail });
});

deploymentOrchestrator.addEventListener('rollback.started', (event) => {
  broadcastToClients({ type: 'rollback_started', data: event.detail });
});

deploymentOrchestrator.addEventListener('rollback.completed', (event) => {
  broadcastToClients({ type: 'rollback_completed', data: event.detail });
});

deploymentOrchestrator.addEventListener('log', (event) => {
  broadcastToClients({ type: 'log', data: event.detail });
});

// API Endpoints for Cosmic Replay Terminal

// Start Ascension Deployment Sequence
app.post('/api/deploy/ascension', async (req, res) => {
  try {
    console.log('🚀 Starting Ascension deployment sequence...');
    
    const result = await deploymentOrchestrator.initiateAscensionSequence();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Ascension sequence initiated successfully',
        vaultStatus: deploymentOrchestrator.getVaultStatus()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        vaultStatus: deploymentOrchestrator.getVaultStatus()
      });
    }
    
  } catch (error) {
    console.error('❌ Ascension deployment failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Emergency Rollback
app.post('/api/deploy/rollback', async (req, res) => {
  try {
    console.log('🛡️ Initiating emergency rollback...');
    
    const result = await deploymentOrchestrator.initiateEmergencyRollback();
    
    res.json({
      success: result.success,
      message: result.success ? 'Emergency rollback completed' : 'Rollback failed',
      error: result.error || null,
      vaultStatus: deploymentOrchestrator.getVaultStatus()
    });
    
  } catch (error) {
    console.error('❌ Emergency rollback failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current vault status
app.get('/api/vault/status', (req, res) => {
  res.json({
    success: true,
    vaultStatus: deploymentOrchestrator.getVaultStatus(),
    timestamp: new Date()
  });
});

// Run vault diagnostics
app.post('/api/vault/diagnostics', async (req, res) => {
  try {
    console.log('🔍 Running vault diagnostics...');
    
    // Simulate diagnostic checks
    const diagnostics = {
      vaultIntegrity: deploymentOrchestrator.getVaultStatus().integrity,
      sentinelNetwork: 'SYNCHRONIZED',
      cosmicResonance: 'HARMONIZED',
      realityMatrix: 'STABLE',
      broadcastStatus: 'ACTIVE',
      timestamp: new Date()
    };
    
    // Broadcast diagnostics to connected clients
    broadcastToClients({
      type: 'diagnostics_completed',
      data: diagnostics
    });
    
    res.json({
      success: true,
      diagnostics,
      message: 'Vault diagnostics completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Vault diagnostics failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not configured',
        message: 'Stripe API keys not found in environment variables'
      });
    }
    
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
    if (stripe) {
      const account = await stripe.accounts.retrieve();
      results.stripe = {
        connected: true,
        accountId: account.id,
        currency: account.default_currency
      };
    } else {
      results.stripe = {
        connected: false,
        error: 'Stripe not configured - API keys missing'
      };
    }
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
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe not configured - API keys missing'
      });
    }
    
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
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  
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
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌌 Cosmic Replay Terminal v2.0 - Ascension Edition`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket vault broadcast active`);
  console.log(`⚡ Deployment orchestration ready`);
  console.log(`🛡️ Fail-safe mechanisms armed`);
  if (stripe) {
    console.log(`💳 Stripe integration ready for payments`);
  } else {
    console.log(`⚠️ Stripe integration disabled (keys not configured)`);
  }
  console.log('');
  console.log(`Visit: http://localhost:${PORT}/cosmic-terminal`);
  console.log(`Original Vault: http://localhost:${PORT}/`);
});