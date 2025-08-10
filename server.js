require("dotenv").config();
const express = require('express');
const path = require('path');
const CoinbaseCommerce = require('./lib/coinbase-commerce');

// Load environment variables from Replit Secrets
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

const stripe = require('stripe')(STRIPE_SECRET_KEY || 'dummy_key');

// Initialize Coinbase Commerce only if API key is provided
let coinbaseCommerce = null;
if (COINBASE_API_KEY && COINBASE_WEBHOOK_SECRET) {
  coinbaseCommerce = new CoinbaseCommerce(COINBASE_API_KEY, COINBASE_WEBHOOK_SECRET);
}

console.log('🔑 Checking API keys...');
console.log('Stripe public key exists:', !!STRIPE_PUBLIC_KEY);
console.log('Stripe secret key exists:', !!STRIPE_SECRET_KEY);
console.log('Coinbase API key exists:', !!COINBASE_API_KEY);
console.log('Coinbase webhook secret exists:', !!COINBASE_WEBHOOK_SECRET);

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

// Create Coinbase Commerce charge
app.post('/api/commerce/create-charge', async (req, res) => {
  try {
    if (!coinbaseCommerce) {
      return res.status(500).json({ 
        error: 'Coinbase Commerce not configured. Please set COINBASE_API_KEY and COINBASE_WEBHOOK_SECRET environment variables.' 
      });
    }

    const { walletAddress, amount, currency, productName } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'Wallet address is required for metadata' 
      });
    }

    console.log('🪙 Creating Coinbase Commerce charge for wallet:', walletAddress);

    const charge = await coinbaseCommerce.createCharge({
      walletAddress,
      amount: amount || '19.99',
      currency: currency || 'USD',
      productName: productName || 'Superman Relic',
      successUrl: `${req.headers.origin}/store/success`,
      cancelUrl: `${req.headers.origin}/store/cancel`
    });

    console.log('✅ Coinbase Commerce charge created:', charge.id);
    res.json({ 
      charge: charge,
      hostedUrl: charge.hosted_url 
    });

  } catch (error) {
    console.error('❌ Error creating Coinbase Commerce charge:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create charge' 
    });
  }
});

// Coinbase Commerce webhook handler
app.post('/api/commerce/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!coinbaseCommerce) {
      return res.status(500).json({ 
        error: 'Coinbase Commerce not configured' 
      });
    }

    const signature = req.headers['x-cc-webhook-signature'];
    const body = req.body.toString();

    // Verify webhook signature
    if (!coinbaseCommerce.verifyWebhookSignature(body, signature)) {
      console.log('❌ Invalid Coinbase Commerce webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(body);
    console.log('📡 Received Coinbase Commerce webhook:', event.type);

    // Process the webhook
    const result = await coinbaseCommerce.processWebhook(event);
    console.log('✅ Webhook processed:', result);

    res.json({ received: true, result });

  } catch (error) {
    console.error('❌ Error processing Coinbase Commerce webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frankenstein Vault server running on port ${PORT}`);
  console.log(`💳 Stripe integration ready for payments`);
});