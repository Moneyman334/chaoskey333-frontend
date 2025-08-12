require("dotenv").config();
const express = require('express');
const path = require('path');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

// Initialize Stripe only if keys are available
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized with API keys');
} else {
  console.log('⚠️ Stripe keys not found - Stripe functionality disabled');
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

// Test Stripe connection endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    console.log('🧪 Testing Stripe connection...');

    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not initialized - missing API keys'
      });
    }

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
        error: 'Stripe not initialized - missing API keys'
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
        error: 'Stripe not initialized - missing API keys' 
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
    console.log('❌ Stripe webhook called but Stripe not initialized');
    return res.status(500).send('Stripe not available');
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
const { CosmicReplayTerminal } = require('./cosmic-replay-terminal');

// Initialize Cosmic Replay Terminal v2.0
const cosmicTerminal = new CosmicReplayTerminal();
let terminalInitialized = false;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// 🧪 Test route to check server
app.get("/health", (req, res) => {
  res.send("✅ Server is alive and kickin'");
});

// 🌌 Initialize Cosmic Replay Terminal v2.0
app.post("/api/cosmic-terminal/initialize", async (req, res) => {
  try {
    if (terminalInitialized) {
      return res.json({
        success: true,
        message: "Cosmic Replay Terminal v2.0 already initialized",
        status: cosmicTerminal.getStatus()
      });
    }

    console.log('🚀 Initializing Cosmic Replay Terminal v2.0...');
    const initialized = await cosmicTerminal.initialize();
    
    if (initialized) {
      terminalInitialized = true;
      
      // Add some demonstration hooks
      cosmicTerminal.addPreGenerationHook(async (options) => {
        console.log('🔮 Pre-generation hook triggered:', options);
      });
      
      cosmicTerminal.addPostGenerationHook(async (capsule) => {
        console.log('✨ Post-generation hook triggered for capsule:', capsule.pulseId);
      });
      
      cosmicTerminal.addErrorHook(async (error) => {
        console.error('⚠️ Error hook triggered:', error.message);
      });

      res.json({
        success: true,
        message: "Cosmic Replay Terminal v2.0 initialized successfully",
        status: cosmicTerminal.getStatus()
      });
    } else {
      throw new Error("Failed to initialize terminal");
    }
  } catch (error) {
    console.error('❌ Failed to initialize Cosmic Replay Terminal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔮 Generate replay capsule
app.post("/api/cosmic-terminal/generate-capsule", async (req, res) => {
  try {
    if (!terminalInitialized) {
      return res.status(400).json({
        success: false,
        error: "Cosmic Replay Terminal v2.0 not initialized. Call /api/cosmic-terminal/initialize first."
      });
    }

    const options = req.body || {};
    console.log('🌌 Generating replay capsule with options:', options);
    
    const capsule = await cosmicTerminal.generateReplayCapsule(options);
    
    res.json({
      success: true,
      capsule: capsule,
      message: `Replay capsule ${capsule.pulseId} generated successfully`
    });

  } catch (error) {
    console.error('❌ Failed to generate capsule:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📡 Get terminal status
app.get("/api/cosmic-terminal/status", (req, res) => {
  res.json({
    initialized: terminalInitialized,
    status: terminalInitialized ? cosmicTerminal.getStatus() : null
  });
});

// 🌊 Get recent capsules from vault feed
app.get("/api/cosmic-terminal/recent-capsules", (req, res) => {
  if (!terminalInitialized) {
    return res.status(400).json({
      success: false,
      error: "Cosmic Replay Terminal v2.0 not initialized"
    });
  }

  const count = parseInt(req.query.count) || 10;
  const recentCapsules = cosmicTerminal.vaultFeed.getRecentCapsules(count);
  
  res.json({
    success: true,
    capsules: recentCapsules,
    count: recentCapsules.length
  });
});

// ⏰ Start/stop automatic generation
app.post("/api/cosmic-terminal/schedule", (req, res) => {
  try {
    if (!terminalInitialized) {
      return res.status(400).json({
        success: false,
        error: "Cosmic Replay Terminal v2.0 not initialized"
      });
    }

    const { action, intervalMs } = req.body;
    
    if (action === 'start') {
      const interval = intervalMs || 30000; // Default 30 seconds
      cosmicTerminal.scheduleAutomaticGeneration(interval);
      res.json({
        success: true,
        message: `Automatic capsule generation started with ${interval}ms interval`
      });
    } else if (action === 'stop') {
      if (cosmicTerminal.schedulerInterval) {
        clearInterval(cosmicTerminal.schedulerInterval);
        cosmicTerminal.schedulerInterval = null;
      }
      res.json({
        success: true,
        message: "Automatic capsule generation stopped"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid action. Use 'start' or 'stop'"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🧪 Test complete integration
app.post("/api/cosmic-terminal/test-integration", async (req, res) => {
  try {
    const testResults = {
      initialization: false,
      capsuleGeneration: false,
      multiFormat: false,
      vaultFeed: false,
      hooks: false
    };

    // Test initialization
    if (!terminalInitialized) {
      const initialized = await cosmicTerminal.initialize();
      testResults.initialization = initialized;
      terminalInitialized = initialized;
    } else {
      testResults.initialization = true;
    }

    if (testResults.initialization) {
      // Test capsule generation
      const testCapsule = await cosmicTerminal.generateReplayCapsule({ test: true });
      testResults.capsuleGeneration = !!testCapsule;

      // Test multi-format verification
      testResults.multiFormat = testCapsule.verificationResults && 
        Object.values(testCapsule.verificationResults).every(result => result.valid);

      // Test vault feed
      const feedCapsules = cosmicTerminal.vaultFeed.getRecentCapsules(1);
      testResults.vaultFeed = feedCapsules.length > 0 && feedCapsules[0].pulseId === testCapsule.pulseId;

      // Test hooks
      testResults.hooks = cosmicTerminal.hooks.preGeneration.length > 0 && 
        cosmicTerminal.hooks.postGeneration.length > 0;
    }

    const allPassed = Object.values(testResults).every(result => result === true);

    res.json({
      success: allPassed,
      testResults,
      message: allPassed ? 
        "🎉 All integration tests passed! Cosmic Replay Terminal v2.0 is fully operational." :
        "⚠️ Some tests failed. Check individual test results.",
      status: terminalInitialized ? cosmicTerminal.getStatus() : null
    });

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔐 Stripe checkout endpoint (test)
app.post("/create-checkout-session2", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send('Stripe not initialized - missing API keys');
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
});