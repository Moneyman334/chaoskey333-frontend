require("dotenv").config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_dummy_key_for_development';

const stripe = STRIPE_SECRET_KEY.includes('dummy') ? null : require('stripe')(STRIPE_SECRET_KEY);

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('dummy'));
console.log('Secret key exists:', !!STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('dummy'));
if (!stripe) {
  console.log('⚠️ Using dummy Stripe keys for development - payment features disabled');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// 🧬 Permanent Relic Evolution Trigger - Backend Support
const mutationBroadcasts = [];
const connectedClients = new Set();

// Broadcast endpoint for global push system
app.post('/api/broadcast', (req, res) => {
  try {
    const broadcast = req.body;
    console.log('📤 Received broadcast:', broadcast.type);
    
    // Store broadcast
    mutationBroadcasts.push({
      ...broadcast,
      serverTimestamp: Date.now()
    });
    
    // Keep only last 1000 broadcasts
    if (mutationBroadcasts.length > 1000) {
      mutationBroadcasts.shift();
    }
    
    // Broadcast to all connected SSE clients
    connectedClients.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(broadcast)}\n\n`);
      } catch (error) {
        console.error('❌ Error broadcasting to client:', error);
        connectedClients.delete(client);
      }
    });
    
    res.json({ 
      success: true, 
      broadcastId: broadcast.id,
      clientCount: connectedClients.size 
    });
    
  } catch (error) {
    console.error('❌ Broadcast error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server-Sent Events endpoint for real-time updates
app.get('/sse/mutations', (req, res) => {
  console.log('📡 SSE client connected');
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Add client to connected set
  connectedClients.add(res);
  
  // Send welcome message
  res.write(`data: ${JSON.stringify({
    type: 'connection_established',
    timestamp: Date.now(),
    clientId: Date.now()
  })}\n\n`);
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('📡 SSE client disconnected');
    connectedClients.delete(res);
  });
  
  req.on('error', (error) => {
    console.error('❌ SSE error:', error);
    connectedClients.delete(res);
  });
});

// Get recent broadcasts
app.get('/api/broadcasts', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recentBroadcasts = mutationBroadcasts.slice(-limit);
  
  res.json({
    broadcasts: recentBroadcasts,
    total: mutationBroadcasts.length,
    connectedClients: connectedClients.size
  });
});

// Mutation system status endpoint
app.get('/api/mutation-status', (req, res) => {
  res.json({
    totalBroadcasts: mutationBroadcasts.length,
    connectedClients: connectedClients.size,
    lastBroadcast: mutationBroadcasts[mutationBroadcasts.length - 1] || null,
    serverUptime: process.uptime(),
    timestamp: Date.now()
  });
});

// WebSocket support (basic implementation)
const WebSocket = require('ws').Server || null;

let wss = null;
if (WebSocket) {
  try {
    wss = new WebSocket({ port: PORT + 1 });
    
    wss.on('connection', (ws) => {
      console.log('🔌 WebSocket client connected');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('📥 WebSocket message:', data);
          
          if (data.action === 'broadcast') {
            // Broadcast to all WebSocket clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data.payload));
              }
            });
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });
    
    console.log(`🔌 WebSocket server running on port ${PORT + 1}`);
  } catch (error) {
    console.warn('⚠️ WebSocket not available:', error.message);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
  console.log(`🧬 Permanent Relic Evolution Trigger backend active`);
  console.log(`📡 SSE endpoint: /sse/mutations`);
  console.log(`📤 Broadcast endpoint: /api/broadcast`);
  if (wss) {
    console.log(`🔌 WebSocket server: ws://localhost:${PORT + 1}`);
  }
});