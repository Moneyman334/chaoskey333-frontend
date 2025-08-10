require("dotenv").config();
const express = require('express');
const path = require('path');

// Load Watchtower integration
const { WatchtowerEmitters } = require('./lib/watchtower-express.js');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

console.log('🔑 Checking Stripe API keys...');
console.log('Public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Secret key exists:', !!STRIPE_SECRET_KEY);

// Initialize Watchtower
console.log('⚡ Initializing Watchtower Signal Amplifier...');
console.log('Watchtower enabled:', process.env.WATCHTOWER_ENABLED === 'true');

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
    watchtower: { enabled: process.env.WATCHTOWER_ENABLED === 'true', tested: false },
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

  // Test Watchtower
  try {
    const watchtowerTest = await WatchtowerEmitters.glyphAlert(
      'system-test',
      'Express.js server connection test',
      'low'
    );
    results.watchtower.tested = watchtowerTest;
  } catch (error) {
    results.watchtower.error = error.message;
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

// Stripe webhook to handle successful payments - WITH WATCHTOWER INTEGRATION
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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

    // WATCHTOWER INTEGRATION: Emit payment success event
    try {
      await WatchtowerEmitters.paymentSuccess(
        session.id,
        session.amount_total,
        session.metadata.walletAddress
      );
      console.log('⚡ Watchtower payment event emitted');
    } catch (watchtowerError) {
      console.error('⚠️ Watchtower emission failed:', watchtowerError.message);
    }

    // Simulate relic minting process
    setTimeout(async () => {
      const mockTokenId = `relic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const relicType = 'Chaos Key Fragment';
      
      console.log(`🎉 Relic ${mockTokenId} minted for: ${session.metadata.walletAddress}`);
      
      // WATCHTOWER INTEGRATION: Emit relic minted event
      try {
        await WatchtowerEmitters.relicMinted(
          mockTokenId,
          session.metadata.walletAddress,
          relicType
        );
        console.log('⚡ Watchtower relic minted event emitted');
      } catch (watchtowerError) {
        console.error('⚠️ Watchtower emission failed:', watchtowerError.message);
      }

      // Emit vault pulse activity
      try {
        await WatchtowerEmitters.vaultPulse(
          session.metadata.walletAddress,
          'New relic deposited'
        );
      } catch (watchtowerError) {
        console.error('⚠️ Watchtower vault pulse failed:', watchtowerError.message);
      }

    }, 2000); // Simulate 2-second minting delay

    // Here you would typically:
    // 1. Mint the NFT to the user's wallet
    // 2. Store the transaction in your database
    // 3. Send confirmation email
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

// WATCHTOWER TEST ENDPOINT for Express server
app.post('/api/test-watchtower', async (req, res) => {
  try {
    const { eventType = 'glyph' } = req.body;
    
    let result = false;
    
    switch (eventType) {
      case 'payment':
        result = await WatchtowerEmitters.paymentSuccess(
          'test-session-express',
          3300,
          '0x742d35Cc6660C02782c67c81eCf24Fc0A33c1234'
        );
        break;
      
      case 'relic':
        result = await WatchtowerEmitters.relicMinted(
          'express-relic-123',
          '0x742d35Cc6660C02782c67c81eCf24Fc0A33c1234',
          'Express Test Relic'
        );
        break;
        
      case 'glyph':
      default:
        result = await WatchtowerEmitters.glyphAlert(
          'express-test',
          'Test glyph alert from Express.js server',
          'medium'
        );
        break;
    }
    
    res.json({
      success: result,
      eventType,
      timestamp: Date.now(),
      message: result ? 'Watchtower event emitted from Express server' : 'Failed to emit event'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      details: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
  console.log(`⚡ Watchtower Signal Amplifier ${process.env.WATCHTOWER_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
});