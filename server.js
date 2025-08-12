require("dotenv").config();
const express = require('express');
const path = require('path');

// Initialize KV only if available (Vercel environment)
let kv;
try {
  kv = require('@vercel/kv').kv;
  console.log('🔑 KV storage initialized');
} catch (error) {
  console.log('⚠️ KV storage not available - using mock for local development');
  // Mock KV for local development
  kv = {
    set: async (key, value) => {
      console.log(`Mock KV set: ${key} = ${JSON.stringify(value)}`);
      return 'OK';
    },
    get: async (key) => {
      console.log(`Mock KV get: ${key}`);
      return { timestamp: new Date().toISOString(), test: true, mock: true };
    }
  };
}

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

// Initialize Stripe only if secret key is available
let stripe;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('🔑 Stripe initialized with provided API key');
} else {
  console.log('⚠️ STRIPE_SECRET_KEY not found - Stripe functionality disabled');
}

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

// Replay marker page for smoke testing
app.get('/replay', (req, res) => {
  res.sendFile(path.join(__dirname, 'replay.html'));
});

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY environment variable not set'
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

  // Test Stripe only if it's available
  if (stripe) {
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
  } else {
    results.stripe = {
      connected: false,
      error: 'Stripe not configured (STRIPE_SECRET_KEY missing)'
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

// 🏥 Enhanced Health Check Route with metadata
app.get("/api/health", (req, res) => {
  const healthData = {
    status: "healthy",
    service: "chaoskey333-frontend",
    timestamp: new Date().toISOString(),
    commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA || "unknown",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  };
  
  res.json(healthData);
});

// 🔑 KV Sanity Route - confirms KV storage read/write permissions
app.get("/api/kv-ping", async (req, res) => {
  try {
    const testKey = 'kv-ping-test';
    const testValue = {
      timestamp: new Date().toISOString(),
      test: true
    };
    
    // Test write operation
    await kv.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds
    
    // Test read operation
    const retrievedValue = await kv.get(testKey);
    
    if (retrievedValue && retrievedValue.test === true) {
      res.json({
        status: "success",
        message: "KV storage read/write operations successful",
        kv_connected: true,
        test_data: retrievedValue
      });
    } else {
      throw new Error("Read operation failed or data mismatch");
    }
    
  } catch (error) {
    console.error('❌ KV Ping test failed:', error.message);
    
    res.status(500).json({
      status: "error",
      message: "KV storage test failed",
      kv_connected: false,
      error: error.message
    });
  }
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
});