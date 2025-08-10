require("dotenv").config();
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and WebSocket server for real-time updates
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store for health telemetry data and archived states
let currentTelemetry = {
  status: 'stable',
  timestamp: Date.now(),
  cpu_usage: 0,
  memory_usage: 0,
  active_connections: 0,
  vault_integrity: 100,
  cosmic_load: 'minimal',
  sentinel_state: 'gold',
  anomaly_frequency: 0
};

let archivedStates = [];

// WebSocket connection handling for real-time dashboard updates
wss.on('connection', (ws) => {
  console.log('🔮 Watchtower client connected to Sentinel feed');
  
  // Send current telemetry immediately
  ws.send(JSON.stringify({
    type: 'telemetry_update',
    data: currentTelemetry
  }));
  
  ws.on('close', () => {
    console.log('🌌 Watchtower client disconnected from Sentinel feed');
  });
});

// Function to broadcast telemetry updates to all connected clients
function broadcastTelemetry(telemetryData) {
  const message = JSON.stringify({
    type: 'telemetry_update',
    data: telemetryData
  });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Function to determine sentinel state based on telemetry
function calculateSentinelState(telemetry) {
  if (telemetry.cpu_usage > 80 || telemetry.memory_usage > 85 || telemetry.anomaly_frequency > 5) {
    return 'crimson'; // anomaly detected
  } else if (telemetry.cpu_usage > 60 || telemetry.memory_usage > 70 || telemetry.active_connections > 100) {
    return 'indigo'; // under cosmic load
  } else {
    return 'gold'; // stable
  }
}

// Function to generate lore narrative based on system state
function generateLoreNarrative(telemetry) {
  const narratives = {
    crimson: [
      "⚠️ Sentinel's core approaches stellar ignition. Anomaly protocols activated.",
      "🔥 Cosmic disturbance detected in the vault matrix. Emergency containment engaged.",
      "⚡ Sentinel's essence flickers between dimensions. Reality anchor stabilizing."
    ],
    indigo: [
      "🌀 Sentinel channels increased cosmic energies. Load balancers harmonizing.",
      "💫 Watchtower detects elevated dimensional traffic. Scaling protocols engaged.",
      "🔮 Sentinel's awareness expands across multiple vault layers. Processing..."
    ],
    gold: [
      "✨ Sentinel maintains perfect cosmic equilibrium. All vault systems optimal.",
      "🌟 Watchtower reports stable dimensional resonance. Vault immortality secured.",
      "💛 Sentinel's golden aura illuminates all connected realms. Peace reigns."
    ]
  };
  
  const stateNarratives = narratives[telemetry.sentinel_state];
  return stateNarratives[Math.floor(Math.random() * stateNarratives.length)];
}

// Auto-update telemetry every 5 seconds with realistic fluctuations
setInterval(() => {
  // Simulate realistic system metrics with some randomness
  currentTelemetry = {
    status: 'active',
    timestamp: Date.now(),
    cpu_usage: Math.max(5, Math.min(95, currentTelemetry.cpu_usage + (Math.random() - 0.5) * 10)),
    memory_usage: Math.max(10, Math.min(90, currentTelemetry.memory_usage + (Math.random() - 0.5) * 8)),
    active_connections: Math.max(0, currentTelemetry.active_connections + Math.floor((Math.random() - 0.5) * 10)),
    vault_integrity: Math.max(85, Math.min(100, currentTelemetry.vault_integrity + (Math.random() - 0.5) * 2)),
    cosmic_load: currentTelemetry.cpu_usage > 70 ? 'heavy' : currentTelemetry.cpu_usage > 40 ? 'moderate' : 'minimal',
    anomaly_frequency: Math.max(0, Math.min(10, currentTelemetry.anomaly_frequency + (Math.random() - 0.5) * 2))
  };
  
  currentTelemetry.sentinel_state = calculateSentinelState(currentTelemetry);
  currentTelemetry.lore_narrative = generateLoreNarrative(currentTelemetry);
  
  // Archive state for vault immortality
  archivedStates.push({
    ...currentTelemetry,
    id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
  
  // Keep only last 100 archived states to prevent memory overflow
  if (archivedStates.length > 100) {
    archivedStates = archivedStates.slice(-100);
  }
  
  // Broadcast to connected watchtower clients
  broadcastTelemetry(currentTelemetry);
}, 5000);

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

// 🧪 Enhanced Sentinel health endpoint with detailed telemetry
app.get("/health", (req, res) => {
  res.json({
    message: "✅ Sentinel Watchtower operational",
    telemetry: currentTelemetry,
    vault_status: "immortal",
    last_updated: new Date().toISOString()
  });
});

// 🔍 Debug environment endpoint for vault diagnostics
app.get("/debug/env", (req, res) => {
  // Only expose safe environment info, never secrets
  const safeEnvInfo = {
    node_version: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    env_type: process.env.NODE_ENV || 'development',
    port: PORT,
    vault_config: {
      stripe_configured: !!process.env.STRIPE_PUBLIC_KEY,
      websocket_enabled: true,
      telemetry_active: true,
      archive_enabled: true
    },
    sentinel_diagnostics: {
      total_archived_states: archivedStates.length,
      connected_watchtowers: wss.clients.size,
      last_telemetry_update: currentTelemetry.timestamp
    }
  };
  
  res.json({
    message: "🔮 Sentinel diagnostics compiled",
    environment: safeEnvInfo,
    cosmic_signature: `VAULT_${Date.now()}_SENTINEL`,
    timestamp: new Date().toISOString()
  });
});

// 🏛️ Vault immortality endpoint - retrieve archived states
app.get("/api/vault/archive", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const recentStates = archivedStates.slice(-limit);
  
  res.json({
    message: "📜 Vault archive accessed",
    total_states: archivedStates.length,
    returned_states: recentStates.length,
    archive: recentStates,
    vault_integrity: "immortal"
  });
});

// 🎭 Lore broadcast endpoint for narrative integration
app.get("/api/sentinel/lore", (req, res) => {
  res.json({
    current_narrative: currentTelemetry.lore_narrative,
    sentinel_state: currentTelemetry.sentinel_state,
    cosmic_frequency: currentTelemetry.anomaly_frequency,
    timestamp: currentTelemetry.timestamp
  });
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
  console.log(`🔮 Sentinel Watchtower telemetry active`);
  console.log(`🌐 WebSocket server ready for real-time updates`);
});